"use client";

import React, { useState } from "react";
import { KeyRound, ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeAdminPasswordAction } from "@/server/actions/auth-actions";
import { toast } from "sonner";

export function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsUpdating(true);
    const res = await changeAdminPasswordAction({
      currentPassword,
      newPassword,
    });
    setIsUpdating(false);

    if (res.success) {
      toast.success("Admin password successfully updated!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(res.error || "Failed to update password.");
    }
  };

  return (
    <Card className="border-[#E2E8F0] shadow-xs bg-[#FFFFFF]">
      <CardHeader>
        <div className="flex items-center justify-between mb-1">
          <div className="w-9 h-9 rounded-md bg-[#F8FAFC] text-[#C5A880] flex items-center justify-center border border-[#C5A880]/30">
            <KeyRound className="w-4 h-4 text-[#A64B36]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880] bg-[#F8FAFC] px-2 py-0.5 rounded border border-[#C5A880]/30">
            Account Security
          </span>
        </div>
        <CardTitle className="text-base font-serif font-bold text-[#0A192F]">
          Change Admin Password
        </CardTitle>
        <CardDescription className="text-xs text-[#0A192F]/70">
          Update your administrator access credentials. Choose a strong, unique password to secure your admin account.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword" required className="text-xs font-bold text-[#0A192F]">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="h-9 text-xs border-[#E2E8F0] pr-9 bg-[#F8FAFC]"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-[#0A192F]"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* New Password */}
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" required className="text-xs font-bold text-[#0A192F]">
                New Password (min 8 chars)
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="h-9 text-xs border-[#E2E8F0] pr-9 bg-[#F8FAFC]"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-[#0A192F]"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" required className="text-xs font-bold text-[#0A192F]">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="h-9 text-xs border-[#E2E8F0] bg-[#F8FAFC]"
              />
            </div>
          </div>

          <div className="pt-1">
            <Button
              type="submit"
              disabled={isUpdating}
              className="bg-[#0A192F] hover:bg-[#1E293B] text-[#F1F5F9] text-xs font-semibold h-9 px-5 gap-2 shadow-xs w-full sm:w-auto border border-[#C5A880]/40"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A880]" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Update Password</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
