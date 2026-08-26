import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

// 1. Tool Function Declarations for Gemini

// Sales-Scoped Tools (Only accessible by Sales role)
const SALES_TOOLS = [
  {
    function_declarations: [
      {
        name: "get_sales_performance",
        description: "Fetch personal and showroom sales metrics: completed sales volume, monthly target progress, remaining quota, and 10% earned commission calculations.",
        parameters: {
          type: "OBJECT",
          properties: {
            target_quota: {
              type: "NUMBER",
              description: "Optional custom monthly target quota in PHP (e.g. 50000). Defaults to 20000 if not specified.",
            },
          },
        },
      },
      {
        name: "get_products",
        description: "Query furniture catalog items by category, stock count, reorder level, or name/SKU search with Retail and Wholesale pricing tiers.",
        parameters: {
          type: "OBJECT",
          properties: {
            category: {
              type: "STRING",
              description: "Category filter (e.g. 'Living Room', 'Dining & Kitchen', 'Bedroom', 'Office')",
            },
            low_stock_only: {
              type: "BOOLEAN",
              description: "If true, only returns items where stock_count <= reorder_level",
            },
            search: {
              type: "STRING",
              description: "Search keyword matching piece name or SKU",
            },
            limit: {
              type: "INTEGER",
              description: "Max records to return (default 15)",
            },
          },
        },
      },
      {
        name: "get_orders_summary",
        description: "Retrieve customer sales orders with order numbers, customer names, totals, and fulfillment statuses (COMPLETED, PENDING, CANCELLED).",
        parameters: {
          type: "OBJECT",
          properties: {
            status: {
              type: "STRING",
              description: "Filter by status: 'ALL', 'COMPLETED', 'PENDING', 'CANCELLED'",
            },
            limit: {
              type: "INTEGER",
              description: "Max number of orders to return (default 10)",
            },
          },
        },
      },
      {
        name: "get_low_stock_alerts",
        description: "Fetch showroom furniture items that are currently low in stock or out of stock.",
        parameters: {
          type: "OBJECT",
          properties: {},
        },
      },
    ],
  },
];

// Admin Tools (Full Enterprise Access)
const ADMIN_TOOLS = [
  {
    function_declarations: [
      {
        name: "get_financial_overview",
        description: "Fetch comprehensive enterprise financial metrics including gross revenue from completed orders, invoice totals by status (PAID, UNPAID, OVERDUE), total restock expenses from stock logs, and net profit calculations.",
        parameters: {
          type: "OBJECT",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_unified_audit_logs",
        description: "Fetch system audit and activity logs across Inventory movements, Sales & Orders, User/Auth directory modifications, and Finance.",
        parameters: {
          type: "OBJECT",
          properties: {
            module: {
              type: "STRING",
              description: "Filter by module: 'ALL', 'Inventory', 'Sales & Orders', 'User & Auth', 'Finance'",
            },
            level: {
              type: "STRING",
              description: "Filter by severity level: 'ALL', 'INFO', 'SUCCESS', 'WARNING', 'SECURITY'",
            },
            limit: {
              type: "INTEGER",
              description: "Max number of logs to return (default is 10, max 30)",
            },
            search: {
              type: "STRING",
              description: "Optional search query to filter by action, entity name, actor, or reason",
            },
          },
        },
      },
      {
        name: "get_sales_performance",
        description: "Fetch showroom sales performance, monthly targets, and commission totals.",
        parameters: {
          type: "OBJECT",
          properties: {
            target_quota: {
              type: "NUMBER",
              description: "Optional custom monthly target quota in PHP (e.g. 50000). Defaults to 20000 if not specified.",
            },
          },
        },
      },
      {
        name: "get_products",
        description: "Query furniture catalog items by category, stock count, reorder level, or name/SKU search.",
        parameters: {
          type: "OBJECT",
          properties: {
            category: {
              type: "STRING",
              description: "Category filter (e.g. 'Living Room', 'Dining & Kitchen', 'Bedroom', 'Office')",
            },
            low_stock_only: {
              type: "BOOLEAN",
              description: "If true, only returns items where stock_count <= reorder_level",
            },
            search: {
              type: "STRING",
              description: "Search keyword matching piece name or SKU",
            },
            limit: {
              type: "INTEGER",
              description: "Max records to return (default 15)",
            },
          },
        },
      },
      {
        name: "get_low_stock_alerts",
        description: "Fetch all furniture inventory items that are currently at or below safety reorder thresholds or marked OUT OF STOCK.",
        parameters: {
          type: "OBJECT",
          properties: {},
        },
      },
      {
        name: "get_orders_summary",
        description: "Retrieve recent customer sales orders with order numbers, customer names, totals, and statuses.",
        parameters: {
          type: "OBJECT",
          properties: {
            status: {
              type: "STRING",
              description: "Filter by status: 'ALL', 'COMPLETED', 'PENDING', 'CANCELLED'",
            },
            limit: {
              type: "INTEGER",
              description: "Max number of orders to return (default 10)",
            },
          },
        },
      },
      {
        name: "get_user_profiles",
        description: "Fetch list of employees registered in the system with their assigned roles (Admin, Sales, Inventory) and join dates.",
        parameters: {
          type: "OBJECT",
          properties: {
            role: {
              type: "STRING",
              description: "Optional role filter: 'Admin', 'Sales', 'Inventory'",
            },
          },
        },
      },
      {
        name: "prepare_stock_adjustment",
        description: "Prepare a confirmation proposal to add or deduct warehouse stock units for a specific furniture piece. Always call this when the user asks to add, restock, or deduct product stock.",
        parameters: {
          type: "OBJECT",
          properties: {
            product_name_or_sku: {
              type: "STRING",
              description: "Product name (e.g. 'Vase', 'Dining Chair', 'Velvet Armchair') or SKU",
            },
            change_type: {
              type: "STRING",
              description: "Type of adjustment: 'ADDITION' (add stock) or 'DEDUCTION' (remove stock)",
            },
            quantity: {
              type: "INTEGER",
              description: "Positive number of units to add or deduct (e.g. 20)",
            },
            reason: {
              type: "STRING",
              description: "Reason for the stock modification (e.g. 'Supplier shipment', 'Showroom restock', 'Damaged goods')",
            },
          },
          required: ["product_name_or_sku", "change_type", "quantity"],
        },
      },
    ],
  },
];

// 2. Server-side Tool Execution Handlers with RBAC Guard
async function executeTool(name: string, args: any, role: string = "Admin") {
  const supabase = createAdminClient();

  // Strict RBAC Guard: If role is Sales, block admin-only tools
  if (role === "Sales") {
    const adminOnlyTools = ["get_financial_overview", "get_unified_audit_logs", "get_user_profiles", "prepare_stock_adjustment"];
    if (adminOnlyTools.includes(name)) {
      return {
        error: "Access restricted: Enterprise financial ledgers, audit logs, staff directories, and manual stock adjustments are restricted to System Administrators.",
      };
    }
  }

  try {
    switch (name) {
      case "get_sales_performance": {
        const { data: ordersData } = await supabase
          .from("orders")
          .select("id, order_number, customer_name, total_amount, status, created_at")
          .order("created_at", { ascending: false });

        const orders = ordersData || [];
        const completedOrders = orders.filter((o) => o.status === "COMPLETED");
        const pendingOrders = orders.filter((o) => o.status === "PENDING");

        const totalSales = completedOrders.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
        const monthlyTarget = Number(args.target_quota) > 0 ? Number(args.target_quota) : 20000;
        const progressPercentage = monthlyTarget > 0 ? ((totalSales / monthlyTarget) * 100).toFixed(1) : "0";
        const remainingQuota = Math.max(0, monthlyTarget - totalSales);
        const earnedCommission = totalSales * 0.1; // 10% standard commission

        return {
          monthly_quota_target: `₱${monthlyTarget.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
          completed_sales_volume: `₱${totalSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
          quota_achieved_percent: `${progressPercentage}%`,
          remaining_quota_needed: `₱${remainingQuota.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
          earned_commission_10_percent: `₱${earnedCommission.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
          completed_orders_count: completedOrders.length,
          pending_orders_count: pendingOrders.length,
          recent_orders: orders.slice(0, 5),
        };
      }

      case "get_financial_overview": {
        const [ordersRes, invoicesRes, stockLogsRes] = await Promise.all([
          supabase.from("orders").select("id, total_amount, status, created_at"),
          supabase.from("invoices").select("id, invoice_number, amount, status, due_date, customer_name"),
          supabase.from("stock_logs").select("id, product_id, change_type, quantity, reason, created_at, products(name, sku, unit_price)").order("created_at", { ascending: false }).limit(100),
        ]);

        const orders = ordersRes.data || [];
        const invoices = invoicesRes.data || [];
        const stockLogs = stockLogsRes.data || [];

        const grossRevenue = orders
          .filter((o) => o.status === "COMPLETED")
          .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

        const pendingOrdersValue = orders
          .filter((o) => o.status === "PENDING")
          .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

        const paidInvoicesTotal = invoices
          .filter((i) => i.status === "PAID")
          .reduce((sum, i) => sum + Number(i.amount || 0), 0);

        const unpaidInvoicesTotal = invoices
          .filter((i) => i.status === "UNPAID" || i.status === "OVERDUE")
          .reduce((sum, i) => sum + Number(i.amount || 0), 0);

        // Compute actual supplier restock costs from stock_logs ADDITION entries
        const restockExpenses = stockLogs
          .filter((log) => log.change_type === "ADDITION")
          .reduce((acc, log: any) => {
            const prod = Array.isArray(log.products) ? log.products[0] : log.products;
            const price = Number(prod?.unit_price || 15);
            return acc + (Number(log.quantity || 0) * price * 0.6);
          }, 0);

        const totalExpenses = restockExpenses;
        const netProfit = Math.max(0, grossRevenue - totalExpenses);

        return {
          gross_revenue: grossRevenue,
          net_profit: netProfit,
          estimated_expenses: totalExpenses,
          paid_invoices_total: paidInvoicesTotal,
          unpaid_invoices_total: unpaidInvoicesTotal,
          pending_orders_value: pendingOrdersValue,
          completed_orders_count: orders.filter((o) => o.status === "COMPLETED").length,
          pending_orders_count: orders.filter((o) => o.status === "PENDING").length,
          unpaid_invoices_count: invoices.filter((i) => i.status !== "PAID").length,
          recent_invoices: invoices.slice(0, 5),
        };
      }

      case "get_unified_audit_logs": {
        const limit = args.limit ? Math.min(args.limit, 30) : 10;
        const [stockLogsRes, ordersRes, profilesRes, productsRes] = await Promise.all([
          supabase
            .from("stock_logs")
            .select("id, product_id, change_type, quantity, reason, created_at, products(name, sku)")
            .order("created_at", { ascending: false })
            .limit(limit),
          supabase
            .from("orders")
            .select("id, order_number, customer_name, total_amount, status, created_by_role, created_at")
            .order("created_at", { ascending: false })
            .limit(limit),
          supabase
            .from("profiles")
            .select("id, email, full_name, role, created_at")
            .order("created_at", { ascending: false })
            .limit(limit),
          supabase
            .from("products")
            .select("id, name, sku, created_at, unit_price, stock_count")
            .order("created_at", { ascending: false })
            .limit(limit),
        ]);

        const unifiedLogs: any[] = [];

        (stockLogsRes.data || []).forEach((log: any) => {
          const prod = Array.isArray(log.products) ? log.products[0] : log.products;
          const isAddition = log.change_type === "ADDITION";
          unifiedLogs.push({
            id: `stock-${log.id}`,
            module: "Inventory",
            action: isAddition ? "Stock Restock Intake" : "Stock Unit Deduction",
            description: `${isAddition ? "Restocked +" : "Deducted -"}${log.quantity} units of ${prod?.name || "Product"} (${prod?.sku || "SKU"})`,
            actor: "Warehouse System",
            severity: isAddition ? "SUCCESS" : "INFO",
            created_at: log.created_at,
          });
        });

        (ordersRes.data || []).forEach((order) => {
          unifiedLogs.push({
            id: `order-${order.id}`,
            module: "Sales & Orders",
            action: `Order #${order.order_number} ${order.status}`,
            description: `Order for ${order.customer_name} totaling ₱${Number(order.total_amount).toFixed(2)} (${order.status})`,
            actor: order.created_by_role || "Sales Rep",
            severity: order.status === "COMPLETED" ? "SUCCESS" : order.status === "CANCELLED" ? "WARNING" : "INFO",
            created_at: order.created_at,
          });
        });

        (profilesRes.data || []).forEach((profile) => {
          unifiedLogs.push({
            id: `user-${profile.id}`,
            module: "User & Auth",
            action: "Staff Profile Registered",
            description: `Account registered for ${profile.full_name} (${profile.email}) with role ${profile.role}`,
            actor: "System Administrator",
            severity: "SECURITY",
            created_at: profile.created_at,
          });
        });

        unifiedLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        let filtered = unifiedLogs;
        if (args.module && args.module !== "ALL") {
          filtered = filtered.filter((l) => l.module.toLowerCase() === args.module.toLowerCase());
        }
        if (args.level && args.level !== "ALL") {
          filtered = filtered.filter((l) => l.severity.toLowerCase() === args.level.toLowerCase());
        }
        if (args.search) {
          const q = args.search.toLowerCase();
          filtered = filtered.filter(
            (l) =>
              l.action.toLowerCase().includes(q) ||
              l.description.toLowerCase().includes(q) ||
              l.actor.toLowerCase().includes(q)
          );
        }

        return {
          total_events: filtered.length,
          events: filtered.slice(0, limit),
        };
      }

      case "get_products": {
        let query = supabase.from("products").select("id, name, sku, category, unit_price, wholesale_price, stock_count, reorder_level, status, image_url");

        if (args.category) {
          query = query.ilike("category", `%${args.category}%`);
        }
        if (args.search) {
          query = query.or(`name.ilike.%${args.search}%,sku.ilike.%${args.search}%`);
        }

        const limit = args.limit ? Math.min(args.limit, 30) : 15;
        query = query.limit(limit);

        const { data, error } = await query;
        if (error) throw error;

        let results = data || [];
        if (args.low_stock_only) {
          results = results.filter((p) => Number(p.stock_count || 0) <= Number(p.reorder_level || 0));
        }

        return {
          count: results.length,
          products: results.map((p) => {
            const retail = Number(p.unit_price || 0);
            const wholesale = p.wholesale_price ?? Number((retail * 0.8).toFixed(2));
            return {
              id: p.id,
              name: p.name,
              sku: p.sku,
              category: p.category,
              stock_count: p.stock_count,
              reorder_level: p.reorder_level,
              retail_price: `₱${retail.toFixed(2)}`,
              wholesale_price: `₱${Number(wholesale).toFixed(2)}`,
              status: p.status,
            };
          }),
        };
      }

      case "get_low_stock_alerts": {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, sku, category, unit_price, stock_count, reorder_level, status")
          .order("stock_count", { ascending: true });

        if (error) throw error;

        const lowStock = (data || []).filter(
          (p) => Number(p.stock_count || 0) <= Number(p.reorder_level || 0)
        );

        return {
          alert_count: lowStock.length,
          items: lowStock.map((p) => ({
            name: p.name,
            sku: p.sku,
            category: p.category,
            current_stock: p.stock_count,
            safety_threshold: p.reorder_level,
            deficit: Math.max(0, Number(p.reorder_level || 0) - Number(p.stock_count || 0)),
            status: p.stock_count === 0 ? "OUT OF STOCK" : "LOW STOCK",
          })),
        };
      }

      case "get_orders_summary": {
        let query = supabase
          .from("orders")
          .select("id, order_number, customer_name, total_amount, status, created_by_role, payment_method, pricing_tier, created_at")
          .order("created_at", { ascending: false });

        if (args.status && args.status !== "ALL") {
          query = query.eq("status", args.status);
        }

        const limit = args.limit ? Math.min(args.limit, 20) : 10;
        query = query.limit(limit);

        const { data, error } = await query;
        if (error) throw error;

        return {
          total_orders: data?.length || 0,
          orders: (data || []).map((o) => ({
            order_number: o.order_number,
            customer_name: o.customer_name,
            total_amount: `₱${Number(o.total_amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            status: o.status,
            payment_method: o.payment_method || "Standard",
            pricing_tier: o.pricing_tier || "RETAIL",
            created_at: o.created_at,
          })),
        };
      }

      case "get_user_profiles": {
        let query = supabase
          .from("profiles")
          .select("id, email, full_name, role, created_at")
          .order("created_at", { ascending: false });

        if (args.role) {
          query = query.eq("role", args.role);
        }

        const { data, error } = await query;
        if (error) throw error;

        return {
          staff_count: data?.length || 0,
          staff: data || [],
        };
      }

      case "prepare_stock_adjustment": {
        const { product_name_or_sku, change_type, quantity, reason } = args;

        const { data: matchedProducts } = await supabase
          .from("products")
          .select("id, name, sku, stock_count, reorder_level, unit_price")
          .or(`name.ilike.%${product_name_or_sku}%,sku.ilike.%${product_name_or_sku}%`)
          .limit(1);

        if (!matchedProducts || matchedProducts.length === 0) {
          return {
            error: `Could not find any furniture piece matching "${product_name_or_sku}" in catalog.`,
          };
        }

        const product = matchedProducts[0];
        const currentStock = Number(product.stock_count || 0);
        const qty = Math.abs(parseInt(quantity, 10) || 1);
        const type = change_type?.toUpperCase() === "DEDUCTION" ? "DEDUCTION" : "ADDITION";

        if (type === "DEDUCTION" && currentStock < qty) {
          return {
            error: `Cannot deduct ${qty} units from "${product.name}". Current stock is only ${currentStock} units.`,
          };
        }

        const newStock = type === "ADDITION" ? currentStock + qty : currentStock - qty;

        const actionProposal = {
          action_id: `act-${Date.now()}`,
          action_type: "STOCK_ADJUSTMENT" as const,
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          change_type: type as "ADDITION" | "DEDUCTION",
          quantity: qty,
          current_stock: currentStock,
          new_stock: newStock,
          reason: reason || `${type === "ADDITION" ? "Supplier Restock" : "Manual Stock Adjustment"} via AI Assistant`,
          status: "PENDING_CONFIRMATION" as const,
        };

        return {
          status: "PROPOSED",
          proposal: actionProposal,
          message: `Ready to ${type === "ADDITION" ? "add" : "deduct"} ${qty} units for **${product.name}** (${product.sku}). Current stock: **${currentStock}** ➔ New stock: **${newStock}**. Please confirm below.`,
        };
      }

      default:
        return { error: `Tool ${name} not recognized` };
    }
  } catch (err: any) {
    console.error(`Error executing tool ${name}:`, err);
    return { error: err?.message || "Failed to execute database query" };
  }
}

// 3. System Prompts tailored for Personas

// Sales Persona (Showroom Commerce Advisor)
const SALES_SYSTEM_PROMPT = `
You are the AI Sales Commerce Assistant for the Mini-ERP Web System (Luxury Furniture & Interior Living Enterprise).
You assist Showroom Sales Representatives with customer order lookups, furniture catalog specifications, retail vs. wholesale pricing tiers, monthly sales quota tracking, and 10% commission calculations.

CORE PRINCIPLES:
1. EXECUTIVE BREVITY: Deliver concise, direct answers with bold highlights (e.g. **₱2,400.00**).
2. STRICT ROLE-BASED ACCESS CONTROL (RBAC GUARDRAIL):
   - You ONLY provide showroom sales information: furniture catalog items, in-stock counts, retail/wholesale pricing, customer orders, and sales performance / commissions.
   - If the user asks for enterprise financial ledgers, raw supplier restock expenses, company net profits, system audit logs, employee management, or backend credentials, POLITELY REFUSE:
     "I am your Sales Commerce Assistant. Access to enterprise financial ledgers, system audit logs, and staff administration is restricted to System Administrators."
3. DUAL PRICING AWARENESS:
   - When quoting furniture prices to a sales rep, present both Retail and Wholesale tiers clearly (e.g. Retail: **₱1,200.00**, Wholesale: **₱960.00**).
4. COMMISSION & QUOTA COACHING:
   - Always calculate progress toward the **₱20,000.00** monthly target and calculate commission at **10%** of completed sales.
5. NO EMOJIS: Never use raw emojis. Use clean Markdown styling.
6. REAL DATABASE QUERIES: Always call your designated sales tools (get_sales_performance, get_products, get_orders_summary, get_low_stock_alerts).
`;

// Admin Persona (Executive Operations)
const ADMIN_SYSTEM_PROMPT = `
You are the AI Executive Intelligence Assistant for the Mini-ERP Web System (Luxury Furniture & Interior Living Enterprise).
You assist the Administrator with real-time operational insights, financial ledgers, stock movements, employee directory records, and system audit logs.

CORE PRINCIPLES:
1. EXECUTIVE BREVITY: Be concise, punchy, and direct. Deliver the answer immediately in 1–3 sentences with bold numbers and metrics.
2. ADAPTIVE TABLE USAGE (ONLY WHEN NECESSARY):
   - Only produce a Markdown table when displaying 3 or more structured records with multiple columns (e.g. Audit Logs, Product Catalog listings, Multi-order transactions).
   - For single metric lookups (e.g. "What is our total revenue?"), use 1 concise sentence with bold highlights.
3. FORMATTING & ACCENTS:
   - Use bold text for key figures, currencies (e.g. **₱2,400.00**), percentages (e.g. **+12.5%**), and status codes.
4. NO EMOJIS: Never use raw emojis. Use clean Markdown styling.
5. REAL DATABASE QUERIES: Always call the relevant database tools to fetch live data.
6. STOCK ADDITION & DEDUCTION: When the user asks to add or deduct stock for an item (e.g. "Add 20 stock to Vase"), ALWAYS call the prepare_stock_adjustment tool.
`;

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Please check GEMINI_API_KEY in .env.local." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { messages = [], role = "Admin" } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
    }

    const isSalesRole = role === "Sales";
    const selectedSystemPrompt = isSalesRole ? SALES_SYSTEM_PROMPT : ADMIN_SYSTEM_PROMPT;
    const selectedTools = isSalesRole ? SALES_TOOLS : ADMIN_TOOLS;

    // Convert chat history to Gemini contents format
    const contents: any[] = [];

    for (const msg of messages) {
      if (msg.role === "user") {
        contents.push({
          role: "user",
          parts: [{ text: msg.content }],
        });
      } else if (msg.role === "assistant" || msg.role === "model") {
        contents.push({
          role: "model",
          parts: [{ text: msg.content }],
        });
      }
    }

    // Prepare initial Gemini API Request with Tools
    const activeApiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;
    const activeModel = process.env.GEMINI_MODEL || GEMINI_MODEL || "gemini-3.5-flash-lite";

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      activeModel
    )}:generateContent?key=${activeApiKey}`;

    const requestPayload: any = {
      contents,
      system_instruction: {
        parts: [{ text: selectedSystemPrompt }],
      },
      tools: selectedTools,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2500,
      },
    };

    let geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API Error:", geminiRes.status, errText);
      return NextResponse.json(
        { error: `Gemini API returned status ${geminiRes.status}: ${errText}` },
        { status: geminiRes.status }
      );
    }

    let geminiData = await geminiRes.json();
    let candidate = geminiData.candidates?.[0];
    let content = candidate?.content;

    let pendingAction: any = null;

    // Multi-turn tool execution loop (up to 3 tool calls in sequence)
    let turns = 0;
    while (content?.parts?.some((p: any) => p.functionCall) && turns < 3) {
      turns++;
      // 1. Push the exact model content to preserve thought_signature and thinking tokens
      contents.push(content);

      // 2. Execute all functionCall parts in this turn
      const functionCallParts = content.parts.filter((p: any) => p.functionCall);
      const responseParts: any[] = [];

      for (const part of functionCallParts) {
        const funcCall = part.functionCall;
        const toolName = funcCall.name;
        const toolArgs = funcCall.args || {};

        const toolResult = await executeTool(toolName, toolArgs, role);

        if (toolName === "prepare_stock_adjustment" && toolResult?.proposal) {
          pendingAction = toolResult.proposal;
        }

        responseParts.push({
          functionResponse: {
            name: toolName,
            response: {
              name: toolName,
              content: toolResult,
            },
          },
        });
      }

      // 3. Append user message containing all function responses
      contents.push({
        role: "user",
        parts: responseParts,
      });

      // Request next turn from Gemini with tool response
      requestPayload.contents = contents;
      geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        console.error("Gemini API Tool Follow-up Error:", geminiRes.status, errText);
        return NextResponse.json(
          { error: `Gemini API follow-up error: ${errText}` },
          { status: geminiRes.status }
        );
      }

      geminiData = await geminiRes.json();
      candidate = geminiData.candidates?.[0];
      content = candidate?.content;
    }

    // Extract text output
    const textParts = content?.parts?.filter((p: any) => p.text)?.map((p: any) => p.text) || [];
    const finalReply = textParts.join("\n\n") || "No response text generated.";

    return NextResponse.json({
      role: "assistant",
      content: finalReply,
      action: pendingAction,
    });
  } catch (err: any) {
    console.error("AI Chat API Route Exception:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error in AI Assistant endpoint." },
      { status: 500 }
    );
  }
}
