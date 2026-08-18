"use client";

import React, { useState } from "react";
import { Save, Store, DollarSign, Bell, Shield, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SettingsPage() {
  const [isSaved, setIsSaved] = useState(false);

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
              Configure store profile, default currency, tax rates, operational notifications, and ERP preferences.
            </p>
          </div>

          <Button
            onClick={handleSave}
            className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] gap-2 rounded-xl text-xs font-semibold px-4 py-2"
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
                Store & Entity Profile
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs text-[#341100]">
              <div>
                <label className="block font-medium text-[#4f351c] mb-1">Store Name</label>
                <Input
                  defaultValue="Mini-ERP Retail Systems"
                  className="bg-[#fff7e8] border-[#e8decf] rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#4f351c] mb-1">Support Email</label>
                  <Input
                    defaultValue="support@minierp.com"
                    className="bg-[#fff7e8] border-[#e8decf] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#4f351c] mb-1">Phone Contact</label>
                  <Input
                    defaultValue="+1 (800) 555-0199"
                    className="bg-[#fff7e8] border-[#e8decf] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#4f351c] mb-1">Business Address</label>
                <Input
                  defaultValue="100 Enterprise Way, Suite 400, Commerce City"
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
                  <select className="w-full h-9 bg-[#fff7e8] border border-[#e8decf] rounded-xl px-3 text-xs text-[#341100] focus:outline-hidden">
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="PHP">PHP (₱) - Philippine Peso</option>
                  </select>
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
                  <label className="block font-medium text-[#4f351c] mb-1">Order Invoice Prefix</label>
                  <Input
                    defaultValue="ORD-"
                    className="bg-[#fff7e8] border-[#e8decf] rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#4f351c] mb-1">Fiscal Year Start Month</label>
                  <select className="w-full h-9 bg-[#fff7e8] border border-[#e8decf] rounded-xl px-3 text-xs text-[#341100] focus:outline-hidden">
                    <option value="January">January</option>
                    <option value="April">April</option>
                    <option value="July">July</option>
                  </select>
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
                Operational Alerts & Thresholds
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs text-[#341100]">
              <div>
                <label className="block font-medium text-[#4f351c] mb-1">Global Low Stock Threshold</label>
                <Input
                  defaultValue="10 units"
                  className="bg-[#fff7e8] border-[#e8decf] rounded-xl text-xs"
                />
                <span className="text-[10px] text-[#7f5e35] mt-1 block">Triggers low stock warnings on inventory panel when item stock falls below this value.</span>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-[#e8decf] text-[#713105] focus:ring-[#713105]" />
                  <span className="font-medium text-[#4f351c]">Email notification on low stock alerts</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-[#e8decf] text-[#713105] focus:ring-[#713105]" />
                  <span className="font-medium text-[#4f351c]">Log administrative security actions to audit feed</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-[#e8decf] text-[#713105] focus:ring-[#713105]" />
                  <span className="font-medium text-[#4f351c]">Require admin approval for user role changes</span>
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
