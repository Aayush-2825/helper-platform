"use client";

import React from "react";
import { Check, Clock, AlertCircle } from "lucide-react";

interface Section {
  id: string | number;
  title: string;
  status?: "completed" | "in-progress" | "required";
  eta?: string;
}

export default function SummaryPanel({ sections }: { sections: Section[] }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-900">Onboarding Progress</h3>
        <p className="text-xs text-gray-500 mt-1">Complete these sections to finish your application.</p>
      </div>

      <div className="space-y-2">
        {sections.map((s) => (
          <div key={s.id} className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
            <div className="mt-0.5">
              {s.status === "completed" ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : s.status === "in-progress" ? (
                <Clock className="h-5 w-5 text-yellow-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.title}</p>
                  {s.eta ? <p className="text-xs text-gray-500">{s.eta}</p> : null}
                </div>
                <div className="text-xs text-gray-500">
                  {s.status === "completed" ? "Done" : s.status === "in-progress" ? "In progress" : "Required"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-blue-50 p-3 text-sm text-blue-900">
        <strong>Need help?</strong>
        <p className="mt-1 text-xs">Contact support@helperplatform.com or visit the help center.</p>
      </div>
    </div>
  );
}
