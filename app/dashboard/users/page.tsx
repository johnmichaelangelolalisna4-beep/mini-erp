"use client";

import React, { useState } from "react";
import { UserPlus, Users, ShieldCheck, ShoppingBag, Package, Search, Filter, MoreHorizontal } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const mockUsers = [
  {
    id: "EMP-001",
    name: "John Miller",
    email: "john.miller@minierp.com",
    role: "Sales",
    department: "Sales & Outbound",
    status: "Active",
    initials: "JM",
  },
  {
    id: "EMP-002",
    name: "Jane Smith",
    email: "jane.smith@minierp.com",
    role: "Admin",
    department: "Executive Management",
    status: "Active",
    initials: "JS",
  },
  {
    id: "EMP-003",
    name: "Robert Fox",
    email: "robert.fox@minierp.com",
    role: "Inventory",
    department: "Warehouse & Logistics",
    status: "Active",
    initials: "RF",
  },
  {
    id: "EMP-004",
    name: "Alice Cooper",
    email: "alice.cooper@minierp.com",
    role: "Sales",
    department: "Sales & Outbound",
    status: "Active",
    initials: "AC",
  },
  {
    id: "EMP-005",
    name: "David Chen",
    email: "david.chen@minierp.com",
    role: "Inventory",
    department: "Warehouse & Logistics",
    status: "Inactive",
    initials: "DC",
  },
];

export function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="border-[#e8decf] shadow-xs rounded-2xl bg-white p-6">
        <CardContent className="p-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#341100] tracking-tight">
              User Management
            </h1>
            <p className="text-xs font-normal text-[#7f5e35] mt-1">
              Account management panel: view active staff, register new employees, and assign roles (Admin, Sales, Inventory).
            </p>
          </div>

          <Button className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] gap-2 rounded-xl text-xs font-semibold px-4 py-2">
            <UserPlus className="w-4 h-4" />
            Register Employee
          </Button>
        </CardContent>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Total Registered Staff</span>
            <Users className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">8</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Active accounts</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Administrators</span>
            <ShieldCheck className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">2</div>
          <span className="text-[11px] text-[#713105] font-semibold">Full system permissions</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Sales Representatives</span>
            <ShoppingBag className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">4</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Orders & invoicing</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Inventory Managers</span>
            <Package className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">2</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Stock & warehouse control</span>
        </Card>
      </div>

      {/* Staff Roster Table */}
      <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-[#e8decf] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-sm font-semibold text-[#4f351c]">
            Employee Directory & Role Assignments
          </CardTitle>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7f5e35]" />
              <Input
                placeholder="Search employee name, email or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl placeholder:text-[#7f5e35]/60"
              />
            </div>
            <Button variant="outline" className="border-[#e8decf] text-[#4f351c] hover:bg-[#fff7e8] gap-1.5 text-xs rounded-xl">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-[#341100]">
            <thead className="bg-[#fff7e8] border-b border-[#e8decf] text-[11px] uppercase tracking-wider text-[#7f5e35] font-semibold">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8decf]/60">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#fcf3e3]/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 border border-[#e8decf]">
                        <AvatarFallback className="bg-[#713105] text-[#fff7e8] text-xs font-semibold">
                          {user.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-[#341100]">{user.name}</div>
                        <div className="text-[10px] text-[#7f5e35]">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#713105]">{user.id}</td>
                  <td className="py-3.5 px-4">
                    {user.role === "Admin" && (
                      <Badge className="bg-[#713105] text-[#fff7e8] text-[11px] uppercase tracking-wide">
                        Admin
                      </Badge>
                    )}
                    {user.role === "Sales" && (
                      <Badge className="bg-[#fcf3e3] text-[#713105] border-[#cfab71] text-[11px] uppercase tracking-wide">
                        Sales
                      </Badge>
                    )}
                    {user.role === "Inventory" && (
                      <Badge className="bg-stone-100 text-[#4f351c] border-stone-300 text-[11px] uppercase tracking-wide">
                        Inventory
                      </Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-[#7f5e35]">{user.department}</td>
                  <td className="py-3.5 px-4">
                    {user.status === "Active" ? (
                      <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[11px] uppercase tracking-wide">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-red-50 text-red-700 border-red-200 text-[11px] uppercase tracking-wide">
                        Inactive
                      </Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[#7f5e35] hover:text-[#341100]">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default UserManagementPage;
