"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Download, Copy, Check, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FormQrCardProps {
  formId: string;
  formName: string;
  slug: string;
}

export function FormQrCard({ formId, formName, slug }: FormQrCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [registrationUrl, setRegistrationUrl] = useState<string>("");

  useEffect(() => {
    // Determine public registration URL dynamically on the client
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/register/${slug}`;
    setRegistrationUrl(url);

    // Generate preview QR Data URL
    QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: "#292824",
        light: "#FFFEFC",
      },
      errorCorrectionLevel: "H",
    })
      .then((dataUrl) => {
        setQrDataUrl(dataUrl);
      })
      .catch((err) => {
        console.error("QR Code generation error:", err);
      });
  }, [slug]);

  const handleCopyUrl = async () => {
    if (!registrationUrl) return;
    try {
      await navigator.clipboard.writeText(registrationUrl);
      setIsCopied(true);
      toast.success("Public registration URL copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      toast.error("Failed to copy URL to clipboard");
    }
  };

  const handleDownloadJpg = async () => {
    if (!registrationUrl || isDownloading) return;
    setIsDownloading(true);

    try {
      // 1. Generate high-resolution QR image dataURL
      const highResQrUrl = await QRCode.toDataURL(registrationUrl, {
        width: 800,
        margin: 2,
        color: {
          dark: "#292824",
          light: "#FFFEFC",
        },
        errorCorrectionLevel: "H",
      });

      // 2. Load into Image object
      const qrImage = new Image();
      qrImage.crossOrigin = "anonymous";
      qrImage.src = highResQrUrl;

      await new Promise<void>((resolve, reject) => {
        qrImage.onload = () => resolve();
        qrImage.onerror = (e) => reject(e);
      });

      // 3. Render onto print-ready high-resolution canvas (1000px x 1280px)
      const canvas = document.createElement("canvas");
      canvas.width = 1000;
      canvas.height = 1280;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Unable to create canvas rendering context");
      }

      // Background: Warm White
      ctx.fillStyle = "#FFFEFC";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Top Header Banner
      ctx.fillStyle = "#5C5751";
      ctx.fillRect(0, 0, canvas.width, 100);

      // App / Event System Label
      ctx.fillStyle = "#FFFEFC";
      ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("THE ORIGIN FOUNDATION • OFFICIAL COMPETITION REGISTRATION", 500, 60);

      // Draw High-Res QR Code centered
      const qrSize = 720;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 160;
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      // Border outline around QR code
      ctx.strokeStyle = "#DCD8D1";
      ctx.lineWidth = 3;
      ctx.strokeRect(qrX, qrY, qrSize, qrSize);

      // Event / Form Name below QR (with multi-line wrap support)
      ctx.fillStyle = "#292824";
      ctx.font = "bold 42px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "center";

      const words = formName.split(" ");
      let line = "";
      let yPos = 940;
      const maxLineWidth = 860;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxLineWidth && n > 0) {
          ctx.fillText(line.trim(), 500, yPos);
          line = words[n] + " ";
          yPos += 52;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), 500, yPos);

      // Instructions Subtitle
      yPos += 48;
      ctx.fillStyle = "#8A8580";
      ctx.font = "500 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("Point your phone camera to register online • Janakpur Dham, Nepal", 500, yPos);

      // Footer Box with Public URL
      yPos += 46;
      ctx.fillStyle = "#F3F1ED";
      ctx.fillRect(80, yPos, 840, 64);
      ctx.strokeStyle = "#DCD8D1";
      ctx.lineWidth = 2;
      ctx.strokeRect(80, yPos, 840, 64);

      ctx.fillStyle = "#5C5751";
      ctx.font = "bold 22px monospace";
      ctx.fillText(registrationUrl, 500, yPos + 40);

      // 4. Convert to JPEG blob (quality 0.95) and trigger browser download
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            toast.error("Failed to generate JPG image");
            setIsDownloading(false);
            return;
          }

          const downloadLink = document.createElement("a");
          downloadLink.download = `${slug}-registration-qr.jpg`;
          downloadLink.href = URL.createObjectURL(blob);
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(downloadLink.href);

          toast.success("High-quality QR code (JPG) downloaded successfully!");
          setIsDownloading(false);
        },
        "image/jpeg",
        0.95
      );
    } catch (err) {
      console.error("QR Code download error:", err);
      toast.error("Failed to export QR Code image");
      setIsDownloading(false);
    }
  };

  return (
    <Card className="border-stone-200/80 shadow-xs bg-white overflow-hidden">
      <CardHeader className="pb-3 border-b border-stone-100 bg-warm-ivory">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-maroon text-white flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-serif font-bold text-charcoal">
                Public Registration URL & QR Code
              </CardTitle>
              <CardDescription className="text-[11px] text-stone-500">
                Scan or share this link on banners, flyers, and social media.
              </CardDescription>
            </div>
          </div>

          <span className="text-[10px] font-semibold text-saffron bg-white border border-cream-dark px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Ready to Print
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* URL Box & Action Buttons */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 block">
            Official Public Registration URL
          </label>
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="flex-1 flex items-center bg-warm-ivory border border-stone-200 rounded-lg px-3 py-2 text-xs font-mono text-stone-800 truncate">
              {registrationUrl || `/register/${slug}`}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="h-9 text-xs border-stone-200 text-stone-700 font-medium gap-1.5 hover:bg-soft-cream"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-saffron" />
                    <span>Copy URL</span>
                  </>
                )}
              </Button>

              <a
                href={registrationUrl || `/register/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs border-stone-200 text-stone-700 font-medium gap-1 hover:bg-soft-cream"
                  title="Open live link"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-saffron" />
                  <span>Open</span>
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* QR Code Preview & Download Card */}
        <div className="p-4 rounded-xl border border-stone-200 bg-warm-ivory flex flex-col sm:flex-row items-center gap-5">
          {/* QR Canvas Display */}
          <div className="w-36 h-36 bg-white p-2.5 rounded-lg border border-stone-200 shadow-2xs flex items-center justify-center shrink-0">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for ${formName}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-stone-400 gap-1">
                <Loader2 className="w-5 h-5 animate-spin text-saffron" />
                <span className="text-[10px]">Generating...</span>
              </div>
            )}
          </div>

          {/* QR Download Actions & Specs */}
          <div className="flex-1 space-y-2 text-center sm:text-left min-w-0">
            <h4 className="text-sm font-serif font-bold text-charcoal truncate">
              {formName}
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Downloads high-resolution <strong>300 DPI JPEG</strong> with pure white background and official competition branding. Perfect for stage banners, standees, flyers, and press badges.
            </p>

            <div className="pt-2">
              <Button
                type="button"
                disabled={!qrDataUrl || isDownloading}
                onClick={handleDownloadJpg}
                className="w-full sm:w-auto h-9 text-xs bg-maroon hover:bg-maroon-dark text-white font-medium gap-2 px-4 shadow-xs"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Rendering High-Res JPG...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download QR Code (JPG)</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
