"use client";

import React from "react";

export default function SectionCard({
  title,
  subtitle,
  children,
  errorCount,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  errorCount?: number;
}) {
  return (
    <div className="space-y-6">
      {title ? (
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm text-gray-600">{subtitle}</p> : null}
          </div>
          {typeof errorCount === "number" && errorCount > 0 ? (
            <div className="text-sm text-red-600">{errorCount} error(s)</div>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-lg bg-white border border-gray-200 p-6">{children}</div>
    </div>
  );
}
