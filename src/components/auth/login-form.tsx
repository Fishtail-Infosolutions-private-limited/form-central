"use client";

import React, { useState, useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { loginAdminAction, sendAdminPasswordResetOtpAction, verifyAdminPasswordResetOtpAction, resetAdminPasswordAction } from "@/server/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Trophy,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Mail,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Lock,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import { OriginFoundationLogo } from "@/components/brand/brand-logos";

type AuthMode = "LOGIN" | "FORGOT_EMAIL" | "VERIFY_OTP" | "RESET_PASSWORD" | "SUCCESS";

export function LoginForm() {
  const [loginState, formAction, isLoginPending] = useActionState(loginAdminAction, undefined);

  // Controlled Login Form State (preserves email on invalid password)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // When login fails (wrong password or invalid credentials), clear password ONLY and keep email
  useEffect(() => {
    if (loginState?.error || loginState?.fieldErrors) {
      setLoginPassword("");
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 50);
    }
  }, [loginState]);

  // Forgot Password Flow State
  const [mode, setMode] = useState<AuthMode>("LOGIN");
  const [resetEmail, setResetEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [resetSessionId, setResetSessionId] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [maskedEmail, setMaskedEmail] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetEmail.includes("@")) {
      setResetError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setResetError(null);

    const res = await sendAdminPasswordResetOtpAction(resetEmail);
    setIsLoading(false);

    if (res.success && res.resetSessionId) {
      setResetSessionId(res.resetSessionId);
      setMaskedEmail(res.maskedEmail || resetEmail);
      setResendCooldown(60);
      setMode("VERIFY_OTP");
      toast.success("Verification code sent to your connected Google email!");
    } else {
      setResetError(res.error || "Failed to dispatch verification code.");
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setResetError("Please enter the complete 6-digit verification code.");
      return;
    }
    if (!resetSessionId) {
      setResetError("Session expired. Please request a new code.");
      return;
    }

    setIsLoading(true);
    setResetError(null);

    const res = await verifyAdminPasswordResetOtpAction(resetSessionId, otpCode);
    setIsLoading(false);

    if (res.success && res.resetToken) {
      setResetToken(res.resetToken);
      setMode("RESET_PASSWORD");
      toast.success("Code verified successfully! Now set your new password.");
    } else {
      setResetError(res.error || "Invalid verification code.");
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setResetError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }
    if (!resetSessionId || !resetToken) {
      setResetError("Session expired. Please start over.");
      return;
    }

    setIsLoading(true);
    setResetError(null);

    const res = await resetAdminPasswordAction(resetSessionId, resetToken, newPassword);
    setIsLoading(false);

    if (res.success) {
      setMode("SUCCESS");
      toast.success("Password reset successfully!");
    } else {
      setResetError(res.error || "Failed to update password.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex flex-col justify-center items-center p-4 text-[#292821] selection:bg-[#292821] selection:text-[#F5F0E6]">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity mb-2">
            <OriginFoundationLogo variant="stacked" theme="dark" />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8DFD0]/60 border border-[#B69A65]/40 text-[#292821] text-[10.5px] font-bold uppercase tracking-wider mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B69A65]" />
            <span>Executive Admin Portal &bull; Mithila Queen</span>
          </div>
        </div>

        {/* Main Card */}
        <Card className="border-[#E8DFD0] bg-white shadow-xs rounded-md overflow-hidden">
          <CardHeader className="pb-4 border-b border-[#E8DFD0]">
            <CardTitle className="text-xl font-bold text-zinc-900">
              {mode === "LOGIN"
                ? "Sign In"
                : mode === "FORGOT_EMAIL"
                ? "Reset Password"
                : mode === "VERIFY_OTP"
                ? "Verify 6-Digit Code"
                : mode === "RESET_PASSWORD"
                ? "Set New Password"
                : "Password Updated"}
            </CardTitle>
            {mode !== "LOGIN" && (
              <CardDescription className="text-xs text-zinc-500">
                {mode === "FORGOT_EMAIL"
                  ? "Enter your connected Google account to receive a one-time reset code."
                  : mode === "VERIFY_OTP"
                  ? `Enter the 6-digit code sent to ${maskedEmail || "your email"}.`
                  : mode === "RESET_PASSWORD"
                  ? "Choose a new strong password for your administrator account."
                  : "Your password has been changed. You can now log in."}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="p-6">
            {/* Error Banners */}
            {mode === "LOGIN" && loginState?.error && (
              <div className="mb-5 p-3.5 rounded-md bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="font-medium">{loginState.error}</span>
              </div>
            )}

            {mode !== "LOGIN" && resetError && (
              <div className="mb-5 p-3.5 rounded-md bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="font-medium">{resetError}</span>
              </div>
            )}

            {/* 1. LOGIN MODE */}
            {mode === "LOGIN" && (
              <form action={formAction} onReset={(e) => e.preventDefault()} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" required className="text-xs font-bold text-zinc-800">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@formcentral.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    error={Boolean(loginState?.fieldErrors?.email)}
                    className="h-10 text-sm border-zinc-300 focus:border-[#B69A65] focus:ring-[#B69A65] bg-white"
                  />
                  {loginState?.fieldErrors?.email && (
                    <p className="text-xs text-red-600 font-medium">{loginState.fieldErrors.email[0]}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" required className="text-xs font-bold text-zinc-800">
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => {
                        if (loginEmail.trim()) {
                          setResetEmail(loginEmail.trim());
                        }
                        setMode("FORGOT_EMAIL");
                        setResetError(null);
                      }}
                      className="text-xs font-semibold text-[#A64B36] hover:text-[#292821] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <Input
                    ref={passwordInputRef}
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    error={Boolean(loginState?.fieldErrors?.password)}
                    className="h-10 text-sm border-zinc-300 focus:border-[#B69A65] focus:ring-[#B69A65] bg-white font-mono"
                  />
                  {loginState?.fieldErrors?.password && (
                    <p className="text-xs text-red-600 font-medium">{loginState.fieldErrors.password[0]}</p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoginPending}
                    className="w-full h-10 text-xs bg-[#292821] hover:bg-[#292821]/90 border border-[#B69A65]/40 text-[#F5F0E6] text-white font-bold transition-all shadow-xs gap-2"
                  >
                    {isLoginPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* 2. FORGOT PASSWORD: ENTER EMAIL */}
            {mode === "FORGOT_EMAIL" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="resetEmail" required className="text-xs font-bold text-zinc-800">
                    Administrator or Connected Google Email
                  </Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Connected Google account"
                    required
                    className="h-10 text-sm border-zinc-300 bg-white"
                  />
                  <p className="text-[11px] text-zinc-500">
                    Security rule: OTP recovery is delivered only if an internal Google account is connected in Settings.
                  </p>
                </div>

                <div className="pt-2 space-y-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-10 text-xs bg-[#292821] hover:bg-[#292821]/90 border border-[#B69A65]/40 text-[#F5F0E6] text-white font-bold gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Verifying & Sending Code...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Send 6-Digit Code</span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setMode("LOGIN");
                      setResetError(null);
                    }}
                    className="w-full h-9 text-xs text-zinc-600 hover:text-black gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </Button>
                </div>
              </form>
            )}

            {/* 3. VERIFY OTP */}
            {mode === "VERIFY_OTP" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otpCode" required className="text-xs font-bold text-zinc-800">
                    6-Digit Verification Code
                  </Label>
                  <Input
                    id="otpCode"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    className="h-12 text-center text-xl font-mono font-bold tracking-widest border-zinc-300 bg-white"
                  />
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-zinc-500">Didn&apos;t receive code?</span>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || isLoading}
                      onClick={handleSendOtp}
                      className="text-[#A64B36] font-bold hover:underline disabled:text-zinc-400 disabled:no-underline"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                    </button>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <Button
                    type="submit"
                    disabled={isLoading || otpCode.length !== 6}
                    className="w-full h-10 text-xs bg-[#292821] hover:bg-[#292821]/90 border border-[#B69A65]/40 text-[#F5F0E6] text-white font-bold gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify Code</span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setMode("FORGOT_EMAIL");
                      setResetError(null);
                    }}
                    className="w-full h-9 text-xs text-zinc-600 hover:text-black gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Email</span>
                  </Button>
                </div>
              </form>
            )}

            {/* 4. SET NEW PASSWORD */}
            {mode === "RESET_PASSWORD" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="newPass" required className="text-xs font-bold text-zinc-800">
                    New Password (min 8 chars)
                  </Label>
                  <Input
                    id="newPass"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="h-10 text-sm border-zinc-300 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPass" required className="text-xs font-bold text-zinc-800">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPass"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className="h-10 text-sm border-zinc-300 bg-white"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-10 text-xs bg-[#292821] hover:bg-[#292821]/90 border border-[#B69A65]/40 text-[#F5F0E6] text-white font-bold gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Save & Update Password</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* 5. SUCCESS CONFIRMATION */}
            {mode === "SUCCESS" && (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-md bg-[#FAF5EE] text-[#A64B36] mx-auto flex items-center justify-center border border-[#E8DFD0]">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-zinc-900 text-base">
                    Password Reset Complete
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                    Your administrator password has been updated. You can now log in to the command dashboard.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    setMode("LOGIN");
                    setResetError(null);
                    setOtpCode("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setLoginPassword("");
                    if (resetEmail) {
                      setLoginEmail(resetEmail);
                    }
                  }}
                  className="w-full h-10 text-xs bg-[#292821] hover:bg-[#292821]/90 border border-[#B69A65]/40 text-[#F5F0E6] text-white font-bold gap-2"
                >
                  <span>Sign In Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Return Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to The Origin Foundation Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
