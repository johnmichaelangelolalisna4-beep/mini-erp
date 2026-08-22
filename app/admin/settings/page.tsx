"use client";

import React, { useState } from "react";
import { Save, Store, DollarSign, Bell, Shield, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/ui/custom-select";

export function SettingsPage() {
  const [isSaved, setIsSaved] = useState(false);
  const [currency, setCurrency] = useState("PHP");
  const [fiscalMonth, setFiscalMonth] = useState("January");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="border-[#e8decf] shadow-xs rounded-2xl bg-white p-6">
        <CardContent className="p-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-[#fcf3e3] text-[#713105] border-[#cfab71]/50 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                Administrator Portal
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-[#341100] tracking-tight">
              System Settings
            </h1>
            <p className="text-xs font-normal text-[#7f5e35] mt-1">
              Configure furniture showroom profile, base currency, tax provisions, low-stock craft alerts, and ERP preferences.
            </p>
          </div>

          <Button
            onClick={handleSave}
            className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] gap-2 rounded-xl text-xs font-semibold px-4 py-2 cursor-pointer active:scale-95"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Settings Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: General & Store Settings */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white">
            <CardHeader className="p-5 border-b border-[#e8decf]">
              <CardTitle className="text-sm font-semibold text-[#4f351c] flex items-center gap-2">
                <Store className="w-4 h-4 text-[#713105]" />
                Showroom & Entity Profile
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs text-[#341100]">
              <div>
                <label className="block font-medium text-[#4f351c] mb-1">Business / Brand Name</label>
                <Input
                  defaultValue="Artisan Furniture & Living Systems"
                  className="bg-[#fff7e8] border-[#e8decf] rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#4f351c] mb-1">Support / Sales Email</label>
                  <Input
                    defaultValue="concierge@artisanfurniture.com"
                    className="bg-[#fff7e8] border-[#e8decf] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#4f351c] mb-1">Showroom Phone</label>
                  <Input
                    defaultValue="+1 (800) 450-8822"
                    className="bg-[#fff7e8] border-[#e8decf] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#4f351c] mb-1">Showroom & Warehouse Address</label>
                <Input
                  defaultValue="850 Timberline Boulevard, Suite 400, Design District"
                  className="bg-[#fff7e8] border-[#e8decf] rounded-xl text-xs"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white">
            <CardHeader className="p-5 border-b border-[#e8decf]">
              <CardTitle className="text-sm font-semibold text-[#4f351c] flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#713105]" />
                Financial & Currency Accounting
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs text-[#341100]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#4f351c] mb-1">Default Base Currency</label>
                  <CustomSelect
                    value={currency}
                    onChange={setCurrency}
                    options={[
                      { value: "PHP", label: "PHP (₱) - Philippine Peso" },
                      { value: "USD", label: "USD ($) - US Dollar" },
                      { value: "EUR", label: "EUR (€) - Euro" },
                    ]}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#4f351c] mb-1">Default Tax Provision (%)</label>
                  <Input
                    defaultValue="15.0%"
                    className="bg-[#fff7e8] border-[#e8decf] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#4f351c] mb-1">Invoice Prefix</label>
                  <Input
                    defaultValue="ORD-"
                    className="bg-[#fff7e8] border-[#e8decf] rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#4f351c] mb-1">Fiscal Year Start Month</label>
                  <CustomSelect
                    value={fiscalMonth}
                    onChange={setFiscalMonth}
                    options={[
                      { value: "January", label: "January" },
                      { value: "April", label: "April" },
                      { value: "July", label: "July" },
                    ]}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Notifications & Security */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white">
            <CardHeader className="p-5 border-b border-[#e8decf]">
              <CardTitle className="text-sm font-semibold text-[#4f351c] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#713105]" />
                Operational Alerts & Stock Thresholds
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs text-[#341100]">
              <div>
                <label className="block font-medium text-[#4f351c] mb-1">Global Furniture Restock Threshold</label>
                <Input
                  defaultValue="5 units"
                  className="bg-[#fff7e8] border-[#e8decf] rounded-xl text-xs"
                />
                <span className="text-[10px] text-[#7f5e35] mt-1 block">Triggers low stock warnings when piece inventory drops below this threshold.</span>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-[#e8decf] text-[#713105] focus:ring-[#713105]" />
                  <span className="font-medium text-[#4f351c]">Email notification on low stock furniture</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-[#e8decf] text-[#713105] focus:ring-[#713105]" />
                  <span className="font-medium text-[#4f351c]">Log administrative security actions to audit feed</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-[#e8decf] text-[#713105] focus:ring-[#713105]" />
                  <span className="font-medium text-[#4f351c]">Require admin approval for staff role assignments</span>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white">
            <CardHeader className="p-5 border-b border-[#e8decf]">
              <CardTitle className="text-sm font-semibold text-[#4f351c] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#713105]" />
                System Environment Status
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5 space-y-2 text-xs text-[#7f5e35]">
              <div className="flex justify-between py-1 border-b border-[#e8decf]/60">
                <span>ERP Version</span>
                <span className="font-mono font-bold text-[#341100]">v1.4.2-production</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#e8decf]/60">
                <span>Database Engine</span>
                <span className="font-mono font-bold text-[#341100]">PostgreSQL 16.1</span>
              </div>
              <div className="flex justify-between py-1">
                <span>System Status</span>
                <span className="font-bold text-emerald-700">Operational (100% Uptime)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
