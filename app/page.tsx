"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShoppingBag, Package, ArrowRight, Lock, Mail, Store, CheckCircle, Sparkles, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

export default function LandingLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // 1. Dynamic Authentication with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      // Strict validation: If credentials are wrong, REJECT and DO NOT REDIRECT
      if (error || !data.user) {
        setErrorMessage(error?.message || "Invalid email or password. Please verify your credentials.");
        setLoading(false);
        return;
      }

      // 2. Fetch Employee's Assigned Role from Supabase Database (profiles table)
      let userRole = data.user.user_metadata?.role;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile?.role) {
        userRole = profile.role;
      } else {
        // Check by email as fallback in profiles table
        const { data: profileByEmail } = await supabase
          .from("profiles")
          .select("role")
          .ilike("email", email.trim())
          .maybeSingle();

        if (profileByEmail?.role) {
          userRole = profileByEmail.role;
        }
      }

      // 3. Dynamic Portal Redirection based on Supabase Role
      if (userRole === "Admin") {
        router.push("/admin/dashboard");
      } else if (userRole === "Sales") {
        router.push("/sales/overview");
      } else if (userRole === "Inventory") {
        router.push("/inventory/overview");
      } else {
        // Default to Admin if role is unspecified
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      console.error("Login dynamic authentication exception:", err);
      setErrorMessage(err.message || "An error occurred during authentication. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff7e8] text-[#341100] flex flex-col justify-between selection:bg-[#cfab71] selection:text-[#341100]">
      {/* 1. Header Navigation Bar */}
      <header className="border-b border-[#e8decf] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#713105] text-[#fff7e8] flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold text-[#341100] tracking-tight block leading-tight">
                MINI-ERP
              </span>
              <span className="text-[10px] font-semibold text-[#7f5e35] uppercase tracking-wider block">
                Furniture & Living Operations
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#fcf3e3] border border-[#cfab71]/50 text-xs font-medium text-[#713105]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Operational</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Hero Section & Login Form */}
      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1 w-full">
        {/* Left Column: Brand Showcase */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#fcf3e3] border border-[#cfab71]/50 text-xs font-bold text-[#713105] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Furniture & Living ERP
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold font-serif text-[#341100] tracking-tight leading-[1.15]">
            Unified ERP Operations for Furniture & Interior Design
          </h1>

          <p className="text-sm sm:text-base text-[#7f5e35] font-normal leading-relaxed max-w-2xl">
            Streamline your furniture business from showroom sales and custom client quotes to warehouse timber stock, SKU tracking, and financial ledgers.
          </p>

          {/* Feature Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-white border border-[#e8decf] shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#713105] text-[#fff7e8] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#341100]">Admin Portal</h3>
              <p className="text-[11px] text-[#7f5e35]">Full showroom KPIs, revenue charts, staff roles & audit trail.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#e8decf] shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#cfab71] text-[#341100] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#341100]">Sales Workspace</h3>
              <p className="text-[11px] text-[#7f5e35]">Interior orders, customer invoicing & sales performance targets.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#e8decf] shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#4f351c] text-[#fff7e8] flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#341100]">Warehouse Hub</h3>
              <p className="text-[11px] text-[#7f5e35]">Furniture SKU catalog, wood/material stock & reorder alerts.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Employee Login Card */}
        <div className="lg:col-span-5">
          <Card className="border-[#e8decf] bg-white shadow-xl rounded-3xl overflow-hidden p-2">
            <CardHeader className="p-6 bg-[#fff7e8]/60 border-b border-[#e8decf] rounded-2xl">
              <div className="flex items-center justify-between">
                <Badge className="bg-[#713105] text-[#fff7e8] text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5">
                  Staff Sign In
                </Badge>
                <Lock className="w-4 h-4 text-[#713105]" />
              </div>
              <CardTitle className="text-xl font-bold font-serif text-[#341100] mt-3">
                Welcome Back
              </CardTitle>
              <p className="text-xs text-[#7f5e35]">
                Enter your registered employee credentials to access your portal.
              </p>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              {/* Dynamic Error Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200/80 flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="font-medium leading-relaxed">{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* 1. Email Address */}
                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Employee Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7f5e35]" />
                    <Input
                      type="email"
                      required
                      disabled={loading}
                      placeholder="e.g. admin@minierp.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="pl-9 bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl focus:bg-white disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* 2. Password */}
                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7f5e35]" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={loading}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="pl-9 pr-10 bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl focus:bg-white disabled:opacity-60"
                    />
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7f5e35] hover:text-[#341100] transition-colors focus:outline-none cursor-pointer disabled:opacity-50"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Sign In Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#713105] text-[#fff7e8] hover:bg-[#341100] text-xs font-semibold py-2.5 rounded-xl gap-2 shadow-xs transition-all mt-2 cursor-pointer disabled:opacity-75"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#fff7e8]" />
                      Authenticating with Supabase...
                    </>
                  ) : (
                    <>
                      Sign In to Portal
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="border-t border-[#e8decf] bg-white py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7f5e35]">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Mini-ERP Furniture & Living System — Warm Espresso Palette</span>
          </div>
          <span>© 2026 Mini-ERP System. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
