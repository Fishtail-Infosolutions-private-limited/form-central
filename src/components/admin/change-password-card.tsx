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
      toast.success("Password successfully updated!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(res.error || "Failed to update password.");
    }
  };

  return (
    <Card className="border-zinc-200 shadow-xs">
      <CardHeader>
        <div className="flex items-center justify-between mb-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Account Security
          </span>
        </div>
        <CardTitle className="text-lg font-bold text-zinc-900">
          Change Admin Password
        </CardTitle>
        <CardDescription className="text-xs text-zinc-500">
          Update your administrator credentials. Default master password is{" "}
          <code className="text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded font-mono text-[11px]">
            fishtailinfosolutions123
          </code>
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword" required className="text-xs font-bold text-zinc-800">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="h-10 text-xs border-zinc-300 pr-9 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* New Password */}
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" required className="text-xs font-bold text-zinc-800">
                New Password (min 8 chars)
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="h-10 text-xs border-zinc-300 pr-9 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" required className="text-xs font-bold text-zinc-800">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="h-10 text-xs border-zinc-300 bg-white"
              />
            </div>
          </div>

          <div className="pt-1">
            <Button
              type="submit"
              disabled={isUpdating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-10 px-6 gap-2 shadow-xs w-full sm:w-auto"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
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

