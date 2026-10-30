"use client";

import React, { useState } from "react";
import { Crown, Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MithilaMotif } from "@/components/ui/mithila-motif";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSent(true);
    toast.success("Thank you! Your message has been sent to The Origin Foundation.");
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="py-12 sm:py-20 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8DFD0]/60 border border-[#B69A65]/40 text-[#292821] text-xs font-semibold">
          <Crown className="w-3.5 h-3.5 text-[#B69A65]" />
          <span>Official Contact Desk</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-serif text-[#292821] tracking-tight">
          Get in Touch
        </h1>
        <p className="text-sm text-[#292821] max-w-xl mx-auto leading-relaxed">
          Reach out to the organizing team of The Origin Foundation for competition guidance, registration queries, or official correspondence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* DIRECTORS & CONTACT INFO (LG: 5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 rounded-lg bg-[#292821] text-[#FAF5EE] border border-[#292821] shadow-xs space-y-6">
            <h2 className="text-lg font-bold font-serif text-white border-b border-[#292821] pb-3">
              Direct Leadership Contacts
            </h2>

            {/* Gaurav Gupta */}
            <div className="space-y-1">
              <p className="font-bold text-white text-base font-serif">Gaurav Gupta</p>
              <p className="text-xs text-[#B69A65] font-medium">Managing Director</p>
              <a
                href="tel:+9779704571941"
                className="text-xs text-[#E8DFD0]/90 hover:text-white flex items-center gap-2 font-mono pt-1"
              >
                <Phone className="w-3.5 h-3.5 text-[#B69A65]" />
                <span>+977 9704571941</span>
              </a>
            </div>

            {/* Dipendra Shah Kalwar */}
            <div className="space-y-1 pt-3 border-t border-[#292821]">
              <p className="font-bold text-white text-base font-serif">Dipendra Shah Kalwar</p>
              <p className="text-xs text-[#B69A65] font-medium">Managing Director</p>
              <a
                href="tel:+9779812005468"
                className="text-xs text-[#E8DFD0]/90 hover:text-white flex items-center gap-2 font-mono pt-1"
              >
                <Phone className="w-3.5 h-3.5 text-[#B69A65]" />
                <span>+977 981-2005468</span>
              </a>
            </div>

            {/* General Info */}
            <div className="pt-4 border-t border-[#292821] space-y-3 text-xs text-[#E8DFD0]/90">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#B69A65] shrink-0 mt-0.5" />
                <span>Janakpur Dham, Madhesh Province, Nepal</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#B69A65] shrink-0" />
                <a
                  href="mailto:originfoundation107@gmail.com"
                  className="hover:text-white font-mono"
                >
                  originfoundation107@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#B69A65] shrink-0" />
                <span>Nepal Standard Time (UTC+05:45)</span>
              </div>
            </div>
          </div>
        </div>

        {/* INQUIRY FORM (LG: 7 COLS) */}
        <div className="lg:col-span-7">
          <div className="p-8 sm:p-10 rounded-lg bg-white border border-[#E8DFD0] shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold font-serif text-[#292821]">
                Send an Inquiry
              </h2>
              <p className="text-xs text-[#292821] mt-1">
                Please leave your message and contact details below. Our team responds promptly.
              </p>
            </div>

            {isSent ? (
              <div className="p-6 rounded-md bg-[#FAF5EE] border border-[#B69A65] text-center space-y-3">
                <div className="w-12 h-12 rounded-md bg-[#292821] text-[#B69A65] mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#292821] text-base font-serif">Message Received</h3>
                <p className="text-xs text-[#292821] max-w-sm mx-auto">
                  Thank you for writing to The Origin Foundation. We will review your message and reply via email shortly.
                </p>
                <Button
                  onClick={() => setIsSent(false)}
                  variant="outline"
                  className="border-[#292821]/20 text-xs h-9 px-4 rounded-md mt-2"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" required className="text-xs font-bold text-[#292821]">
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Anjali Sharma"
                      required
                      className="h-10 text-xs border-[#E8DFD0] bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" required className="text-xs font-bold text-[#292821]">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="anjali@example.com"
                      required
                      className="h-10 text-xs border-[#E8DFD0] bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="subject" className="text-xs font-bold text-[#292821]">
                    Subject / Competition Inquiry
                  </Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Question regarding video audition guidelines"
                    className="h-10 text-xs border-[#E8DFD0] bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message" required className="text-xs font-bold text-[#292821]">
                    Your Message
                  </Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can The Origin Foundation assist you?"
                    rows={5}
                    required
                    className="text-xs border-[#E8DFD0] bg-white resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#292821] hover:bg-[#292821] text-[#FAF5EE] font-bold text-xs h-11 rounded-md shadow-xs gap-2"
                >
                  <Send className="w-3.5 h-3.5 text-[#B69A65]" />
                  <span>Submit Inquiry to Organizers</span>
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

