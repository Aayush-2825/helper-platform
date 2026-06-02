"use client";

"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type DocStatus = "not_uploaded" | "uploaded" | "pending" | "verified" | "rejected";

interface Item {
  id: string;
  label: string;
  optional?: boolean;
  // fileKey is the uploaded storage key returned from upload service (if any)
  fileKey?: string | null;
}

interface StatusMap {
  [id: string]: { status: DocStatus; message?: string };
}

export default function KYCChecklist({
  items,
  onRequestReupload,
}: {
  items: Item[];
  onRequestReupload?: (id: string) => void;
}) {
  const [statuses, setStatuses] = useState<StatusMap>(() =>
    items.reduce((acc, it) => {
      acc[it.id] = { status: it.fileKey ? "uploaded" : "not_uploaded" };
      return acc;
    }, {} as StatusMap)
  );

  useEffect(() => {
    // fetch status for items with fileKey
    const active = true;

    async function fetchStatus(fileKey: string) {
      try {
        const res = await fetch(`/api/helpers/verification-status?key=${encodeURIComponent(fileKey)}`);
        if (!res.ok) return { status: "pending" as DocStatus };
        const json = await res.json();
        // Expect { status: 'pending'|'verified'|'rejected', message? }
        return { status: (json.status as DocStatus) || "pending", message: json.message };
      } catch (e) {
        return { status: "pending" as DocStatus };
      }
    }

    (async () => {
      const next: StatusMap = { ...statuses };
      for (const it of items) {
        if (!it.fileKey) continue;
        // mark loading
        next[it.id] = { status: "pending" };
        setStatuses({ ...next });
        const result = await fetchStatus(it.fileKey);
        if (!active) return;
        next[it.id] = { status: result.status, message: result.message };
        setStatuses({ ...next });
      }
    })();

    return () => {
      // noop
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(items.map((i) => i.fileKey))]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Required documents</h3>
      <p className="text-xs text-gray-500">Upload the items below. We review documents and notify you of the result.</p>

      <div className="mt-3 space-y-2">
        {items.map((it) => {
          const st = statuses[it.id] || { status: it.fileKey ? "uploaded" : "not_uploaded" };
          return (
            <div key={it.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
              <div>
                {st.status === "verified" ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : st.status === "rejected" ? (
                  <XCircle className="h-5 w-5 text-amber-600" />
                ) : st.status === "pending" ? (
                  <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-gray-100" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-900">
                      {it.label} {it.optional ? <span className="text-xs text-gray-400">(optional)</span> : null}
                    </p>
                    {st.message ? <p className="text-xs text-amber-700">{st.message}</p> : null}
                  </div>
                  <div className="text-xs text-gray-500">
                    {st.status === "not_uploaded" && "Not uploaded"}
                    {st.status === "uploaded" && "Uploaded"}
                    {st.status === "pending" && "Under review"}
                    {st.status === "verified" && "Verified"}
                    {st.status === "rejected" && "Action required"}
                  </div>
                </div>
                {st.status === "rejected" && (
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      className="text-sm text-blue-600 underline"
                      onClick={() => onRequestReupload?.(it.id)}
                    >
                      Re-upload
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
