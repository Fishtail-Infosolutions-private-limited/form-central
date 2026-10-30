"use client";

import React, { useState } from "react";
import { Crown, Mail, Phone, MapPin, Send, CheckCircle2, Clock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { submitContactInquiryAction } from "@/server/actions/contact-actions";

const CONTACT_TOPICS = [
  "General Competition Guidance",
  "Video Audition & WhatsApp Submission Support",
  "Payment & Fee Verification Assistance",
  "Eligibility & Minor Consent Inquiry",
  "Sponsorship & Partnership Opportunity",
  "Press & Media Relations",
  "Other Inquiries",
] as const;

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("General Competition Guidance");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const finalSubject = subject.trim() ? `${selectedTopic}: ${subject.trim()}` : selectedTopic;

    const res = await submitContactInquiryAction({
      name,
      email,
      subject: finalSubject,
      message,
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsSent(true);
      toast.success("Thank you! Your inquiry has been delivered to The Origin Foundation.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } else {
      setErrorMessage(res.error || "Failed to deliver inquiry. Please try again.");
      toast.error(res.error || "Failed to send inquiry.");
    }
  };

  return (
    <div className="py-12 sm:py-20 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F4F7FA] border border-[#DCE5ED] text-[#183153] text-xs font-semibold shadow-xs">
          <Crown className="w-3.5 h-3.5 text-[#356FA8]" />
          <span>Official Contact Desk</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-[#263238] tracking-tight">
          Get in Touch
        </h1>
        <p className="text-sm text-[#546E7A] max-w-xl mx-auto leading-relaxed">
          Reach out to the organizing team of The Origin Foundation for competition guidance, registration queries, or official correspondence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Directors & Contact Info (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 rounded-2xl bg-[#183153] text-white shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-white/20 pb-3">
              Direct Leadership Contacts
            </h2>

            {/* Gaurav Gupta */}
            <div className="space-y-1">
              <p className="font-bold text-white text-base">Gaurav Gupta</p>
              <p className="text-xs text-[#356FA8] font-semibold">Managing Director</p>
              <a
                href="tel:+9779704571941"
                className="text-xs text-[#DCE5ED] hover:text-white flex items-center gap-2 font-mono pt-1 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#356FA8]" />
                <span>+977 9704571941</span>
              </a>
            </div>

            {/* Dipendra Shah Kalwar */}
            <div className="space-y-1 pt-3 border-t border-white/15">
              <p className="font-bold text-white text-base">Dipendra Shah Kalwar</p>
              <p className="text-xs text-[#356FA8] font-semibold">Managing Director</p>
              <a
                href="tel:+9779812005468"
                className="text-xs text-[#DCE5ED] hover:text-white flex items-center gap-2 font-mono pt-1 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#356FA8]" />
                <span>+977 981-2005468</span>
              </a>
            </div>

            {/* General Info */}
            <div className="pt-4 border-t border-white/15 space-y-3 text-xs text-[#DCE5ED]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#356FA8] shrink-0 mt-0.5" />
                <span>Janakpur Dham, Madhesh Province, Nepal</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#356FA8] shrink-0" />
                <a
                  href="mailto:originfoundation107@gmail.com"
                  className="hover:text-white font-mono transition-colors"
                >
                  originfoundation107@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#356FA8] shrink-0" />
                <span>Nepal Standard Time (UTC+05:45)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiry Form (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="p-8 sm:p-10 rounded-2xl bg-white border border-[#DCE5ED] shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#263238]">
                Send an Inquiry
              </h2>
              <p className="text-xs text-[#546E7A] mt-1">
                Please leave your message and contact details below. Our team responds promptly.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {isSent ? (
              <div className="p-8 rounded-xl bg-[#F4F7FA] border border-[#356FA8] text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#183153] text-[#356FA8] mx-auto flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-[#183153] text-lg">Message Delivered</h3>
                <p className="text-xs text-[#546E7A] max-w-sm mx-auto leading-relaxed">
                  Thank you for writing to The Origin Foundation. Your inquiry has been registered in our administration desk and our directors will respond via email shortly.
                </p>
                <Button
                  onClick={() => setIsSent(false)}
                  variant="outline"
                  className="border-[#DCE5ED] text-[#183153] hover:bg-white text-xs h-9 px-4 rounded-md mt-2 font-semibold"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" required className="text-xs font-bold text-[#263238]">
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Anjali Sharma"
                      required
                      className="h-10 text-xs border-[#DCE5ED] bg-white focus-visible:ring-[#356FA8]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" required className="text-xs font-bold text-[#263238]">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="anjali@example.com"
                      required
                      className="h-10 text-xs border-[#DCE5ED] bg-white focus-visible:ring-[#356FA8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="topic" className="text-xs font-bold text-[#263238]">
                      Topic of Inquiry
                    </Label>
                    <Select
                      value={selectedTopic}
                      onValueChange={(val) => setSelectedTopic(val)}
                    >
                      <SelectTrigger id="topic" className="h-10 text-xs border-[#DCE5ED] bg-white font-medium">
                        <SelectValue placeholder="Select topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTACT_TOPICS.map((topic) => (
                          <SelectItem key={topic} value={topic}>
                            {topic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-xs font-bold text-[#263238]">
                      Specific Subject (Optional)
                    </Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Audition video inquiry"
                      className="h-10 text-xs border-[#DCE5ED] bg-white focus-visible:ring-[#356FA8]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message" required className="text-xs font-bold text-[#263238]">
                    Your Message
                  </Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can The Origin Foundation assist you?"
                    rows={5}
                    required
                    className="text-xs border-[#DCE5ED] bg-white resize-none focus-visible:ring-[#356FA8]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#183153] hover:bg-[#12243D] text-white font-bold text-xs h-11 rounded-md shadow-xs gap-2 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Sending Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Inquiry to Organizers</span>
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
