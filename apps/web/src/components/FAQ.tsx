"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "How fast does a helper arrive after booking?",
    a: "DOZO guarantees a helper arrives within 10 minutes of your booking confirmation. In most cases across Delhi NCR, helpers typically arrive in 4–8 minutes. If we ever miss the 10-minute window, your next booking is on us.",
  },
  {
    q: "How are DOZO helpers verified and trained?",
    a: "Every helper goes through a rigorous 7-step verification process: government ID check, criminal background screen, address verification, skill test, in-person interview, reference check, and platform training. Only 1 in 5 applicants makes the cut.",
  },
  {
    q: "What if I'm not satisfied with the service?",
    a: "We stand behind every job with our ₹5 Lakh Service Guarantee. If you're not 100% satisfied, simply raise a complaint within 24 hours and we'll either send a replacement helper at no cost or issue a full refund — no questions asked.",
  },
  {
    q: "How does payment work?",
    a: "You only pay after the job is done and you're satisfied. DOZO accepts UPI, cards, net banking, and cash. All digital transactions are encrypted and PCI-DSS compliant. You'll always see pricing upfront before you book.",
  },
  {
    q: "Can I schedule a booking in advance?",
    a: "Yes! While DOZO specializes in on-demand same-day service, you can also schedule bookings up to 7 days in advance. Scheduled bookings are assigned to a specific helper you can review before confirming.",
  },
  {
    q: "Which cities is DOZO available in?",
    a: "DOZO is currently live and serving customers across Delhi NCR with 1,800+ verified helpers. We are actively expanding to Mumbai, Bengaluru, Hyderabad, Pune, and 8 more cities — launching very soon. Drop your email on our city page for launch updates!",
  },
  {
    q: "Can I request the same helper again?",
    a: "Absolutely. Once you've had a great experience, you can favourite a helper and request them directly for future bookings. Subject to their availability, your preferred helper will be assigned first.",
  },
  {
    q: "How do I become a helper on DOZO?",
    a: "Visit our 'Become a Helper' page and fill in a quick form. Our team will review your application, schedule a skills assessment, and walk you through the onboarding process. Most helpers start earning within 3–5 business days of applying.",
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-28 px-6 border-t border-border bg-muted/20">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold">
            Frequently Asked Questions
          </div>
          <h2 className="text-4xl font-black tracking-tight">
            Everything you need to know.
          </h2>
          <p className="text-muted-foreground font-medium text-lg">
            Can't find an answer? <a href="mailto:support@dozo.in" className="text-primary font-bold hover:underline">Email our support team →</a>
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={`bg-background border rounded-[14px] overflow-hidden transition-all duration-300 ${
                openIdx === i ? "border-primary/30 shadow-sm" : "border-border hover:border-border/80"
              }`}
            >
              <button
                className="w-full flex items-center justify-between gap-4 p-6 text-left"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span className={`font-bold text-[16px] leading-snug transition-colors ${openIdx === i ? "text-primary" : "text-foreground"}`}>
                  {faq.q}
                </span>
                <div className={`shrink-0 size-7 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  openIdx === i ? "bg-primary border-primary text-white" : "border-border text-muted-foreground"
                }`}>
                  {openIdx === i ? <Minus className="size-3.5" strokeWidth={3} /> : <Plus className="size-3.5" strokeWidth={3} />}
                </div>
              </button>
              {openIdx === i && (
                <div className="px-6 pb-6">
                  <p className="text-muted-foreground font-medium leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
