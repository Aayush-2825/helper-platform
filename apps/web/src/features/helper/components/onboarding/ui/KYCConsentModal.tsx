"use client";

import React, { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Checkbox } from "@repo/ui/components/ui/checkbox";

interface KYCConsentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (consentVersion: string) => void;
}

export default function KYCConsentModal({ open, onClose, onConfirm }: KYCConsentModalProps) {
  const [agreed, setAgreed] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white border border-border p-6">
        <h2 className="text-lg font-semibold">DPDP Consent</h2>
        <p className="mt-3 text-sm text-gray-700">
          We need your consent to collect, process, and securely store identity and business documents for verification and compliance purposes. Your documents are encrypted at rest and accessed only by authorized reviewers.
        </p>

        <div className="mt-4">
          <label className="flex items-start gap-3">
            <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(Boolean(v))} />
            <div>
              <p className="text-sm font-medium">I consent to the collection and processing of my documents for verification purposes.</p>
              <p className="text-xs text-gray-500">Read our <a className="text-blue-600 underline" href="/privacy">Privacy Policy</a> for more details.</p>
            </div>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onConfirm("v1.0"); onClose(); }} disabled={!agreed}>I consent and continue</Button>
        </div>
      </div>
    </div>
  );
}
