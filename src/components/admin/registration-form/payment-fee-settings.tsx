"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  CreditCard,
  Upload,
  Loader2,
  Save,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Building2,
  Wallet,
  Info,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { updateSiteSettingsAction } from "@/server/actions/site-settings-actions";

interface PaymentFeeSettingsProps {
  siteSetting: any;
  onPaymentSettingsSaved?: (newSettings: any) => void;
}

export function PaymentFeeSettings({
  siteSetting,
  onPaymentSettingsSaved,
}: PaymentFeeSettingsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingQr, setIsUploadingQr] = useState(false);

  // Fee
  const [regFee, setRegFee] = useState<string>(
    siteSetting?.registrationFee ? String(siteSetting.registrationFee) : "399"
  );
  const [paymentInstructions, setPaymentInstructions] = useState<string>(
    siteSetting?.paymentInstructions ||
      "Please scan the official payment QR code using eSewa, Khalti, or any Fonepay-compatible banking app. Complete the transfer of NPR 399 and save the screenshot showing the transaction reference code."
  );
  const [paymentReferenceInstructions, setPaymentReferenceInstructions] = useState<string>(
    siteSetting?.paymentReferenceInstructions ||
      "Enter your Full Name and Registered Mobile Number in the payment remarks/description."
  );

  // QR Code (Must be uploaded by organizer; no dummy fallback)
  const [paymentQrUrl, setPaymentQrUrl] = useState<string>(() => {
    const raw = siteSetting?.paymentQrCodeUrl;
    if (!raw || raw === "/assets/brand/origin-foundation-qr.png") return "";
    return raw;
  });

  // Wallet Toggle & Fields
  const [enableWallet, setEnableWallet] = useState<boolean>(
    siteSetting?.enableWalletPayment ?? false
  );
  const [walletProviderName, setWalletProviderName] = useState<string>(
    siteSetting?.walletProviderName || "eSewa"
  );
  const [walletId, setWalletId] = useState<string>(
    siteSetting?.walletId || "9704571941"
  );
  const [walletBeneficiaryName, setWalletBeneficiaryName] = useState<string>(
    siteSetting?.walletBeneficiaryName || "The Origin Foundation"
  );
  const [walletInstructions, setWalletInstructions] = useState<string>(
    siteSetting?.walletInstructions ||
      "Send payment directly to our registered eSewa ID. Mention participant name in remarks."
  );
  const [walletReferenceInstructions, setWalletReferenceInstructions] = useState<string>(
    siteSetting?.walletReferenceInstructions ||
      "Enter your eSewa transaction code/UTR in the reference field."
  );

  // Bank Toggle & Fields
  const [enableBank, setEnableBank] = useState<boolean>(
    siteSetting?.enableBankPayment ?? false
  );
  const [bankName, setBankName] = useState<string>(
    siteSetting?.bankName || "Nepal Bank Limited"
  );
  const [bankBranch, setBankBranch] = useState<string>(
    siteSetting?.bankBranch || "Janakpur Dham Branch"
  );
  const [bankBeneficiaryName, setBankBeneficiaryName] = useState<string>(
    siteSetting?.bankBeneficiaryName || "The Origin Foundation"
  );
  const [bankAccountNumber, setBankAccountNumber] = useState<string>(
    siteSetting?.bankAccountNumber || "01200100000000"
  );
  const [bankInstructions, setBankInstructions] = useState<string>(
    siteSetting?.bankInstructions ||
      "Deposit or transfer via ConnectIPS or Mobile Banking directly to the official Foundation bank account."
  );
  const [bankReferenceInstructions, setBankReferenceInstructions] = useState<string>(
    siteSetting?.bankReferenceInstructions ||
      "Enter your Bank Transfer voucher number or journal reference in the transaction ID field."
  );

  const isDummyQr = paymentQrUrl === "/assets/brand/origin-foundation-qr.png";
  const hasValidQr = Boolean(paymentQrUrl && paymentQrUrl.trim() !== "" && !isDummyQr);

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WebP)");
      return;
    }

    setIsUploadingQr(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fieldKey", "payment_qr");

      const res = await fetch("/api/public/upload/image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setPaymentQrUrl(data.url);
        toast.success("New payment QR uploaded! Remember to save settings to apply.");
      } else {
        toast.error(data.error || "Failed to upload QR image");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setIsUploadingQr(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const numericFee = parseInt(regFee, 10) || 399;

      const payload = {
        registrationFee: numericFee,
        paymentQrCodeUrl: hasValidQr ? paymentQrUrl : null,
        paymentInstructions,
        paymentReferenceInstructions,
        enableWalletPayment: enableWallet,
        walletProviderName: enableWallet ? walletProviderName : null,
        walletId: enableWallet ? walletId : null,
        walletBeneficiaryName: enableWallet ? walletBeneficiaryName : null,
        walletInstructions: enableWallet ? walletInstructions : null,
        walletReferenceInstructions: enableWallet ? walletReferenceInstructions : null,
        enableBankPayment: enableBank,
        bankName: enableBank ? bankName : null,
        bankBranch: enableBank ? bankBranch : null,
        bankBeneficiaryName: enableBank ? bankBeneficiaryName : null,
        bankAccountNumber: enableBank ? bankAccountNumber : null,
        bankInstructions: enableBank ? bankInstructions : null,
        bankReferenceInstructions: enableBank ? bankReferenceInstructions : null,
      };

      const res = await updateSiteSettingsAction(payload);
      if (res.success) {
        toast.success("Payment and fee configuration saved successfully!");
        if (onPaymentSettingsSaved && res.setting) {
          onPaymentSettingsSaved(res.setting);
        }
      } else {
        toast.error(res.error || "Failed to save payment settings");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview & Save Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-[#DCE5ED] bg-white shadow-xs">
        <div>
          <h2 className="text-base font-bold text-[#263238] flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-dark-taupe" />
            <span>Payment &amp; Fee Configuration</span>
          </h2>
          <p className="text-xs text-taupe-grey mt-0.5">
            Configure the official candidate registration fee, mandatory payment QR code, and optional wallet/bank details.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2 bg-dark-taupe hover:bg-dark-taupe-hover text-white text-xs h-9 px-4 font-semibold shadow-xs"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>Save Payment Settings</span>
        </Button>
      </div>

      {/* 1. Official Payment QR Code (Mandatory) */}
      <Card className="border-[#DCE5ED] bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-[#DCE5ED]/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-sm font-bold text-[#263238] flex items-center gap-2">
                <QrCode className="w-4 h-4 text-dark-taupe" />
                <span>Official Payment QR Code</span>
              </CardTitle>
              <CardDescription className="text-xs text-taupe-grey">
                Mandatory for registration publication. Displayed to candidates in Step 7 and on the payment upload screen.
              </CardDescription>
            </div>
            {hasValidQr ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F4F7FA] text-[#263238] border border-warm-stone">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Valid QR Configured</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>QR Required to Publish</span>
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-5 space-y-5">
          <div className="p-4 rounded-xl border border-[#DCE5ED] bg-[#F4F7FA] flex flex-col sm:flex-row items-center gap-6">
            {/* QR Preview Box */}
            <div className="w-36 h-36 bg-white rounded-lg border border-warm-stone p-2 shadow-2xs flex items-center justify-center shrink-0">
              {hasValidQr ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={paymentQrUrl}
                  alt="Official Payment QR"
                  className="w-full h-full object-contain rounded"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-2 space-y-1">
                  <AlertCircle className="w-7 h-7 text-amber-500" />
                  <span className="text-[11px] font-bold text-[#263238] block leading-tight">No QR Uploaded</span>
                  <span className="text-[9px] text-taupe-grey block leading-tight">Required to publish form</span>
                </div>
              )}
            </div>

            {/* Upload & Remove Controls */}
            <div className="flex-1 space-y-2 text-center sm:text-left min-w-0">
              <h4 className="text-xs font-bold text-[#263238]">Official Merchant QR Image</h4>
              <p className="text-xs text-taupe-grey leading-relaxed">
                Upload your official Fonepay, eSewa, or bank merchant QR code image. Candidates will scan this image to pay the NPR {regFee} fee.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleQrUpload}
                    disabled={isUploadingQr}
                    className="hidden"
                  />
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-taupe text-white text-xs font-semibold hover:bg-dark-taupe-hover transition-colors shadow-2xs">
                    {isUploadingQr ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploadingQr ? "Uploading..." : hasValidQr ? "Change QR Image" : "Upload Merchant QR"}</span>
                  </div>
                </label>
                {hasValidQr && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPaymentQrUrl("");
                      toast.info("QR code removed. Save settings to apply.");
                    }}
                    className="h-8 text-xs border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Remove QR</span>
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-taupe-grey font-mono truncate max-w-md pt-0.5">
                Status: {hasValidQr ? `Uploaded (${paymentQrUrl})` : "Not uploaded (Form cannot be published)"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Registration Fee Amount & Instructions */}
      <Card className="border-[#DCE5ED] bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-[#DCE5ED]/50">
          <CardTitle className="text-sm font-bold text-[#263238]">
            Fee &amp; Payment Instructions
          </CardTitle>
          <CardDescription className="text-xs text-taupe-grey">
            Set the candidate registration fee and default instructions shown on the payment screen.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#263238]">
                Registration Fee Amount
              </Label>
              <div className="flex items-center gap-2">
                <div className="px-3 py-2 rounded-lg bg-[#F4F7FA] border border-[#DCE5ED] font-mono text-xs font-bold text-[#263238]">
                  NPR
                </div>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={regFee}
                  onChange={(e) => setRegFee(e.target.value)}
                  className="h-9 text-xs border-[#DCE5ED] bg-white font-mono font-bold max-w-xs"
                  placeholder="399"
                />
              </div>
              <p className="text-[11px] text-taupe-grey">
                Fixed in Nepalese Rupees (Standard: NPR 399).
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#263238]">
              Payment Instructions for Applicants
            </Label>
            <Textarea
              rows={3}
              value={paymentInstructions}
              onChange={(e) => setPaymentInstructions(e.target.value)}
              className="text-xs border-[#DCE5ED] bg-white"
              placeholder="Instructions displayed on Step 7..."
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#263238]">
              Transaction Remarks Instructions
            </Label>
            <Input
              value={paymentReferenceInstructions}
              onChange={(e) => setPaymentReferenceInstructions(e.target.value)}
              className="h-9 text-xs border-[#DCE5ED] bg-white"
              placeholder="e.g. Enter your Full Name and Mobile Number in payment remarks."
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Wallet Payment Details (Toggleable) */}
      <Card className="border-[#DCE5ED] bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-[#DCE5ED]/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-sm font-bold text-[#263238] flex items-center gap-2">
                <Wallet className="w-4 h-4 text-dark-taupe" />
                <span>Wallet Payment Details</span>
              </CardTitle>
              <CardDescription className="text-xs text-taupe-grey">
                Optional digital wallet information (eSewa / Khalti / Fonepay).
              </CardDescription>
            </div>
            {/* Toggle Switch */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-taupe-grey">
                {enableWallet ? "Enabled" : "Disabled"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={enableWallet}
                onClick={() => setEnableWallet(!enableWallet)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  enableWallet ? "bg-dark-taupe" : "bg-warm-stone"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    enableWallet ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </CardHeader>

        {enableWallet && (
          <CardContent className="pt-5 space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#263238]">Wallet Provider Name</Label>
                <Input
                  value={walletProviderName}
                  onChange={(e) => setWalletProviderName(e.target.value)}
                  placeholder="e.g. eSewa / Fonepay"
                  className="h-9 text-xs border-[#DCE5ED] bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#263238]">
                  Official eSewa ID / Merchant Phone
                </Label>
                <Input
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  placeholder="e.g. 9704571941"
                  className="h-9 text-xs border-[#DCE5ED] bg-white font-mono"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-[#263238]">
                  Account Beneficiary Name
                </Label>
                <Input
                  value={walletBeneficiaryName}
                  onChange={(e) => setWalletBeneficiaryName(e.target.value)}
                  placeholder="e.g. The Origin Foundation"
                  className="h-9 text-xs border-[#DCE5ED] bg-white"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-[#263238]">
                  Wallet Payment Instructions
                </Label>
                <Input
                  value={walletInstructions}
                  onChange={(e) => setWalletInstructions(e.target.value)}
                  placeholder="Instructions for wallet payment..."
                  className="h-9 text-xs border-[#DCE5ED] bg-white"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-[#263238]">
                  Transaction Reference Instructions
                </Label>
                <Input
                  value={walletReferenceInstructions}
                  onChange={(e) => setWalletReferenceInstructions(e.target.value)}
                  placeholder="e.g. Enter your eSewa transaction code."
                  className="h-9 text-xs border-[#DCE5ED] bg-white"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 4. Bank Transfer Details (Toggleable) */}
      <Card className="border-[#DCE5ED] bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-[#DCE5ED]/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-sm font-bold text-[#263238] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-dark-taupe" />
                <span>Bank Transfer Details</span>
              </CardTitle>
              <CardDescription className="text-xs text-taupe-grey">
                Optional direct bank account transfer details for corporate or branch deposits.
              </CardDescription>
            </div>
            {/* Toggle Switch */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-taupe-grey">
                {enableBank ? "Enabled" : "Disabled"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={enableBank}
                onClick={() => setEnableBank(!enableBank)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  enableBank ? "bg-dark-taupe" : "bg-warm-stone"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    enableBank ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </CardHeader>

        {enableBank && (
          <CardContent className="pt-5 space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#263238]">Bank Name</Label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Nepal Bank Limited"
                  className="h-9 text-xs border-[#DCE5ED] bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#263238]">Branch</Label>
                <Input
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                  placeholder="e.g. Janakpur Dham Branch"
                  className="h-9 text-xs border-[#DCE5ED] bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#263238]">Account Beneficiary Name</Label>
                <Input
                  value={bankBeneficiaryName}
                  onChange={(e) => setBankBeneficiaryName(e.target.value)}
                  placeholder="e.g. The Origin Foundation"
                  className="h-9 text-xs border-[#DCE5ED] bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#263238]">Bank Account Number</Label>
                <Input
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="e.g. 01200100000000"
                  className="h-9 text-xs border-[#DCE5ED] bg-white font-mono"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-[#263238]">Account Instructions</Label>
                <Input
                  value={bankInstructions}
                  onChange={(e) => setBankInstructions(e.target.value)}
                  placeholder="Instructions for bank transfer..."
                  className="h-9 text-xs border-[#DCE5ED] bg-white"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-[#263238]">Transaction Reference Instructions</Label>
                <Input
                  value={bankReferenceInstructions}
                  onChange={(e) => setBankReferenceInstructions(e.target.value)}
                  placeholder="e.g. Enter your deposit voucher number."
                  className="h-9 text-xs border-[#DCE5ED] bg-white"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}


