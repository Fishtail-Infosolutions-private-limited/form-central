"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Inbox,
  Settings,
  LogOut,
  Trophy,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { logoutAdminAction } from "@/server/actions/auth-actions";
import { cn } from "@/lib/utils";

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
    { name: "Registration Forms", href: "/admin/forms", icon: FileText },
    { name: "Create Form", href: "/admin/forms/new", icon: PlusCircle },
    { name: "All Responses", href: "/admin/responses", icon: Inbox },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between bg-black text-white px-4 py-3 border-b border-zinc-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <Trophy className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight">Form Central</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900"
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
          "fixed top-0 bottom-0 left-0 z-50 bg-black text-white flex flex-col border-r border-zinc-800 transition-all duration-200 ease-in-out lg:translate-x-0",
          mobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "lg:w-20" : "lg:w-72"
        )}
      >
        {/* Brand & Collapse Toggle */}
        <div
          className={cn(
            "py-5 border-b border-zinc-800 flex items-center transition-all",
            isCollapsed ? "px-3 justify-center flex-col gap-2" : "px-5 justify-between"
          )}
        >
          <Link href="/admin/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="font-extrabold text-base tracking-tight block leading-tight text-white truncate">
                  Form Central
                </span>
              </div>
            )}
          </Link>

          {/* Toggle Sidebar Collapse Button (Hidden on Mobile) */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors shrink-0"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar to icons"}
            >
              {isCollapsed ? (
                <PanelLeft className="w-4 h-4 text-emerald-400" />
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
            const isCreateForm = item.href === "/admin/forms/new";

            let isActive = false;
            if (isDashboard) {
              isActive = pathname === "/admin/dashboard";
            } else if (isCreateForm) {
              isActive = pathname === "/admin/forms/new";
            } else if (isFormsList) {
              isActive =
                pathname === "/admin/forms" ||
                (pathname.startsWith("/admin/forms/") && pathname !== "/admin/forms/new");
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
                  "flex items-center rounded-xl text-sm font-medium transition-all duration-150",
                  isCollapsed ? "justify-center p-3" : "gap-3 px-3.5 py-2.5",
                  isActive
                    ? "bg-emerald-600 text-white font-semibold shadow-xs"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                )}
              >
                <item.icon
                  className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-zinc-400")}
                />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className={cn("border-t border-zinc-800 bg-zinc-950 p-3", isCollapsed && "px-2 text-center")}>
          {!isCollapsed ? (
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-xs shadow shrink-0">
                {admin.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {admin.name}
                </p>
                <p className="text-[11px] text-zinc-400 truncate">{admin.email}</p>
              </div>
            </div>
          ) : (
            <div className="mb-2 flex justify-center">
              <div
                className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-xs shadow"
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
                "w-full flex items-center justify-center text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg border border-zinc-800 transition-colors",
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
