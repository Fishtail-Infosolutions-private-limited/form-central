"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  Crown,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  Mail,
} from "lucide-react";
import { logoutAdminAction } from "@/server/actions/auth-actions";
import { cn } from "@/lib/utils";
import { OriginFoundationLogo } from "@/components/brand/brand-logos";

interface AdminSidebarProps {
  admin: {
    name: string;
    email: string;
    role: string;
  };
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({
  admin,
  isCollapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Manage Competition", href: "/admin/forms", icon: Crown },
    { name: "Mithila Queen Applications", href: "/admin/responses", icon: FileText },
    { name: "Communications", href: "/admin/campaigns", icon: Mail },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between bg-[#0A192F] text-white px-4 py-3 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#071324] border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880]">
            <Crown className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight font-serif">The Origin Foundation</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-[#1E293B]"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-xs z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 bg-[#0A192F] text-white flex flex-col border-r border-slate-800 transition-all duration-200 ease-in-out lg:translate-x-0",
          mobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "lg:w-20" : "lg:w-72"
        )}
      >
        {/* Brand & Collapse Toggle */}
        <div
          className={cn(
            "py-5 border-b border-slate-800 flex items-center transition-all",
            isCollapsed ? "px-3 justify-center flex-col gap-2" : "px-5 justify-between"
          )}
        >
          <Link href="/admin/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 shrink-0">
              <OriginFoundationLogo variant="mark" theme="light" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="font-extrabold text-base tracking-tight block leading-tight text-white font-serif truncate">
                  The Origin Foundation
                </span>
                <span className="text-[10px] text-[#C5A880] tracking-wider uppercase font-bold block truncate">
                  Janakpur Dham &bull; Admin
                </span>
              </div>
            )}
          </Link>

          {/* Toggle Sidebar Collapse Button (Hidden on Mobile) */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors shrink-0"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar to icons"}
            >
              {isCollapsed ? (
                <PanelLeft className="w-4 h-4 text-[#C5A880]" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isDashboard = item.href === "/admin/dashboard";
            const isFormsList = item.href === "/admin/forms";

            let isActive = false;
            if (isDashboard) {
              isActive = pathname === "/admin/dashboard";
            } else if (isFormsList) {
              isActive = pathname === "/admin/forms" || pathname.startsWith("/admin/forms/");
            } else {
              isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  "flex items-center rounded-lg text-xs font-medium transition-all duration-150",
                  isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
                  isActive
                    ? "bg-[#071324] text-[#C5A880] font-semibold border border-[#C5A880]/40 shadow-xs"
                    : "text-slate-300 hover:bg-[#162C4E] hover:text-white"
                )}
              >
                <item.icon
                  className={cn("w-4 h-4 shrink-0", isActive ? "text-[#C5A880]" : "text-slate-400")}
                />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className={cn("border-t border-slate-800 bg-[#071324] p-3", isCollapsed && "px-2 text-center")}>
          {!isCollapsed ? (
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="w-8 h-8 rounded bg-[#0A192F] border border-[#C5A880]/40 text-[#C5A880] font-bold flex items-center justify-center text-xs shrink-0">
                {admin.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {admin.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate font-mono">{admin.email}</p>
              </div>
            </div>
          ) : (
            <div className="mb-2 flex justify-center">
              <div
                className="w-8 h-8 rounded bg-[#0A192F] border border-[#C5A880]/40 text-[#C5A880] font-bold flex items-center justify-center text-xs"
                title={`${admin.name} (${admin.email})`}
              >
                {admin.name.slice(0, 1).toUpperCase()}
              </div>
            </div>
          )}

          <form action={logoutAdminAction}>
            <button
              type="submit"
              title={isCollapsed ? "Sign Out" : undefined}
              className={cn(
                "w-full flex items-center justify-center text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#1E293B] rounded border border-slate-700/60 transition-colors",
                isCollapsed ? "p-2" : "gap-2 px-3 py-2"
              )}
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
