"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  admin: {
    name: string;
    email: string;
    role: string;
  };
  children: React.ReactNode;
}

export function AdminShell({ admin, children }: AdminShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("fc_sidebar_collapsed");
    if (saved === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const handleToggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("fc_sidebar_collapsed", next ? "true" : "false");
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col lg:flex-row">
      <AdminSidebar
        admin={admin}
        isCollapsed={isMounted ? isCollapsed : false}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content Area: dynamically adjusts padding based on collapse state */}
      <main
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out",
          isMounted && isCollapsed ? "lg:pl-20" : "lg:pl-72"
        )}
      >
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

