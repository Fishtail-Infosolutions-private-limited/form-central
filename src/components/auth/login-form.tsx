"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { loginAdminAction } from "@/server/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, AlertCircle, Loader2, ArrowLeft, ArrowRight } from "lucide-react";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAdminAction, undefined);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center p-4 text-zinc-900 selection:bg-emerald-600 selection:text-white">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-zinc-900 tracking-tight">Form Central</span>
          </Link>
        </div>

        {/* Login Card */}
        <Card className="border-zinc-200 bg-white shadow-xs rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-zinc-100">
            <CardTitle className="text-xl font-bold text-zinc-900">
              Sign In
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {state?.error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="font-medium">{state.error}</span>
              </div>
            )}

            <form action={formAction} className="space-y-4">
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
                  required
                  error={Boolean(state?.fieldErrors?.email)}
                  className="h-10 text-sm border-zinc-300 focus:border-emerald-600 focus:ring-emerald-600 bg-white"
                />
                {state?.fieldErrors?.email && (
                  <p className="text-xs text-red-600 font-medium">{state.fieldErrors.email[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" required className="text-xs font-bold text-zinc-800">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  required
                  error={Boolean(state?.fieldErrors?.password)}
                  className="h-10 text-sm border-zinc-300 focus:border-emerald-600 focus:ring-emerald-600 bg-white font-mono"
                />
                {state?.fieldErrors?.password && (
                  <p className="text-xs text-red-600 font-medium">{state.fieldErrors.password[0]}</p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-10 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs gap-2"
                >
                  {isPending ? (
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
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Form Central Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
