import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action_type, product_id, change_type, quantity, reason } = body;

    if (action_type !== "STOCK_ADJUSTMENT") {
      return NextResponse.json({ error: "Unsupported action type" }, { status: 400 });
    }

    if (!product_id || !quantity) {
      return NextResponse.json({ error: "product_id and quantity are required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Fetch current product record
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("id, sku, name, category, stock_count, reorder_level, status")
      .eq("id", product_id)
      .single();

    if (fetchError || !product) {
      return NextResponse.json(
        { error: "Product not found or database query failed" },
        { status: 404 }
      );
    }

    const qty = Math.max(1, Math.abs(Number(quantity) || 1));
    const isAddition = (change_type || "ADDITION").toUpperCase() === "ADDITION";
    const currentStock = Number(product.stock_count || 0);
    const newStock = isAddition ? currentStock + qty : currentStock - qty;

    if (!isAddition && newStock < 0) {
      return NextResponse.json(
        { error: `Cannot deduct ${qty} units. Current stock is only ${currentStock} units.` },
        { status: 400 }
      );
    }

    // 2. Determine updated stock status
    const reorderLevel = Number(product.reorder_level || 10);
    let newStatus = "IN STOCK";
    if (newStock === 0) {
      newStatus = "OUT OF STOCK";
    } else if (newStock <= reorderLevel) {
      newStatus = "LOW STOCK";
    }

    // 3. Update Product Stock in Supabase
    const { error: updateError } = await supabase
      .from("products")
      .update({
        stock_count: newStock,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", product_id);

    if (updateError) {
      console.error("Failed to update product stock:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 4. Log Movement in stock_logs table for audit trail
    const logChangeType = isAddition ? "ADDITION" : "DEDUCTION";
    const signedQty = isAddition ? qty : -qty;

    const { error: logError } = await supabase.from("stock_logs").insert([
      {
        product_id: product.id,
        change_type: logChangeType,
        quantity: signedQty,
        reason: reason || (isAddition ? `Restocked +${qty} units via AI Chatbot` : `Deducted -${qty} units via AI Chatbot`),
        created_at: new Date().toISOString(),
      },
    ]);

    if (logError) {
      console.warn("Stock log insertion notice:", logError);
    }

    return NextResponse.json({
      success: true,
      product_name: product.name,
      sku: product.sku,
      change_type: logChangeType,
      quantity: qty,
      old_stock: currentStock,
      new_stock: newStock,
      status: newStatus,
      message: `Successfully ${isAddition ? "added" : "deducted"} ${qty} units for ${product.name}. Stock updated from ${currentStock} to ${newStock} units.`,
    });
  } catch (err: any) {
    console.error("Action execution exception:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to execute stock adjustment action" },
      { status: 500 }
    );
  }
}
