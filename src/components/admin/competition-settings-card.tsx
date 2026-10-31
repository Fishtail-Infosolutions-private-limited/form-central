"use client";

import React, { useState, useEffect } from "react";
import { Crown, Save, Loader2, Calendar, Phone, Mail, MessageCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getSiteSettingsAction, updateSiteSettingsAction } from "@/server/actions/site-settings-actions";

export function CompetitionSettingsCard() {
  const [fee, setFee] = useState("399");
  const [schedule, setSchedule] = useState("To Be Announced");
  const [venue, setVenue] = useState("To Be Announced");
  const [whatsapp, setWhatsapp] = useState("+977 9704571941");
  const [email, setEmail] = useState("originfoundation107@gmail.com");
  const [insta, setInsta] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await getSiteSettingsAction();
        if (res.success && res.setting) {
          if (res.setting.registrationFee) setFee(String(res.setting.registrationFee));
          if (res.setting.eventSchedule) setSchedule(res.setting.eventSchedule);
          if (res.setting.eventVenue) setVenue(res.setting.eventVenue);
          if (res.setting.whatsappContact) setWhatsapp(res.setting.whatsappContact);
          if (res.setting.officialEmail) setEmail(res.setting.officialEmail);
          if (res.setting.officialInstagram) setInsta(res.setting.officialInstagram);
          if (res.setting.officialTiktok) setTiktok(res.setting.officialTiktok);
          if (res.setting.requiredHashtags) setHashtags(res.setting.requiredHashtags);
        }
      } catch (e) {}
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateSiteSettingsAction({
        registrationFee: parseInt(fee, 10) || 399,
        eventSchedule: schedule,
        eventVenue: venue,
        whatsappContact: whatsapp,
        officialEmail: email,
        officialInstagram: insta,
        officialTiktok: tiktok,
        requiredHashtags: hashtags,
      });
      if (res.success) {
        toast.success("Competition & website settings successfully updated!");
      } else {
        toast.error(res.error || "Failed to update settings");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-zinc-200 shadow-xs md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between mb-1">
          <div className="w-10 h-10 rounded-md bg-[#183153] text-[#356FA8] flex items-center justify-center">
            <Crown className="w-5 h-5 stroke-[1.8]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#356FA8] bg-[#183153] px-2 py-0.5 rounded">
            Mithila Queen CMS
          </span>
        </div>
        <CardTitle className="text-lg font-bold text-zinc-900 font-bold">
          Mithila Queen Competition & Social Media Settings
        </CardTitle>
        <CardDescription className="text-xs text-zinc-500">
          Configure official competition parameters, contact channels, and video audition instructions without code changes.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fee" className="text-xs font-bold text-zinc-800">
                Registration Fee (NPR)
              </Label>
              <Input
                id="fee"
                type="number"
                min="0"
                step="1"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="h-10 text-xs border-zinc-200 bg-white font-mono font-bold"
                placeholder="399"
              />
              <p className="text-[10px] text-zinc-500">Official fee collected in Nepalese Rupees per registration.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sched" className="text-xs font-bold text-zinc-800">
                Event Schedule
              </Label>
              <Input
                id="sched"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="To Be Announced"
                className="h-10 text-xs border-zinc-300 bg-white"
              />
              <p className="text-[10px] text-zinc-500">Currently: To Be Announced.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="venue" className="text-xs font-bold text-zinc-800">
                Competition Venue
              </Label>
              <Input
                id="venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="To Be Announced"
                className="h-10 text-xs border-zinc-300 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="wa" className="text-xs font-bold text-zinc-800">
                Official WhatsApp Video Submission Contact
              </Label>
              <Input
                id="wa"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="h-10 text-xs border-zinc-300 bg-white font-mono"
              />
              <p className="text-[10px] text-zinc-500">Gaurav Gupta (+977 9704571941)</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="offMail" className="text-xs font-bold text-zinc-800">
                Official Contact Email
              </Label>
              <Input
                id="offMail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 text-xs border-zinc-300 bg-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="instaH" className="text-xs font-bold text-zinc-800">
                Official Instagram Handle
              </Label>
              <Input
                id="instaH"
                value={insta}
                onChange={(e) => setInsta(e.target.value)}
                placeholder="Pending organizer announcement"
                className="h-10 text-xs border-zinc-300 bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tiktokH" className="text-xs font-bold text-zinc-800">
                Official TikTok Handle
              </Label>
              <Input
                id="tiktokH"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="Pending organizer announcement"
                className="h-10 text-xs border-zinc-300 bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tags" className="text-xs font-bold text-zinc-800">
                Required Audition Hashtags
              </Label>
              <Input
                id="tags"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#MithilaQueen #TheOriginFoundation"
                className="h-10 text-xs border-zinc-300 bg-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#183153] hover:bg-[#12243d] text-white text-xs font-bold h-10 px-5 rounded-md shadow-xs gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-[#356FA8]" />}
              <span>Save Competition Configuration</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


