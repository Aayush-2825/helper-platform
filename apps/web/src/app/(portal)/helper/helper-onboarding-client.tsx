"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type HelperType = "individual" | "agency";

type HelperOnboardingPayload = {
  helperType: HelperType;
  primaryCategory: string;
  phone: string;
  city: string;
  bio?: string;
  yearsExperience?: number;
  serviceRadiusKm?: number;
  isOnline?: boolean;
  businessName?: string;
  logoUrl?: string;
  businessAddress?: string;
  gstNumber?: string;
};

function toNumberOrUndefined(value: string): number | undefined {
  const n = Number(value);
  if (Number.isNaN(n)) return undefined;
  return n;
}

function getStringProp(obj: unknown, key: string): string | null {
  if (!obj || typeof obj !== "object") return null;
  const value = (obj as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

export function HelperOnboardingClientPage() {
  const router = useRouter();

  const [helperType, setHelperType] = useState<HelperType>("individual");
  const [primaryCategory, setPrimaryCategory] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [city, setCity] = useState<string>("");

  const [bio, setBio] = useState<string>("");
  const [yearsExperience, setYearsExperience] = useState<string>("");
  const [serviceRadiusKm, setServiceRadiusKm] = useState<string>("8");
  const [isOnline, setIsOnline] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload: HelperOnboardingPayload = {
        helperType,
        primaryCategory,
        phone,
        city,
        bio: bio || undefined,
        yearsExperience: yearsExperience ? toNumberOrUndefined(yearsExperience) : undefined,
        serviceRadiusKm: serviceRadiusKm
          ? toNumberOrUndefined(serviceRadiusKm)
          : undefined,
        isOnline,
      };

      const res = await fetch("/api/helpers/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        const message = getStringProp(json, "message") ?? `Request failed with status ${res.status}`;
        setError(message);
        return;
      }

      const id = getStringProp(json, "id");
      if (id) {
        router.push(`/helper/verification-pending?id=${encodeURIComponent(id)}`);
        return;
      }

      setError("Unexpected response from server.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Helper Onboarding</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1">
                <div className="text-sm font-medium">Helper Type</div>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={helperType}
                  onChange={(e) => setHelperType(e.target.value as HelperType)}
                >
                  <option value="individual">Individual</option>
                  <option value="agency">Agency</option>
                </select>
              </label>

              <label className="space-y-1">
                <div className="text-sm font-medium">Primary Category</div>
                <Input
                  value={primaryCategory}
                  onChange={(e) => setPrimaryCategory(e.target.value)}
                  placeholder="e.g. plumber, driver..."
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1">
                <div className="text-sm font-medium">Phone</div>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91..."
                  required
                />
              </label>

              <label className="space-y-1">
                <div className="text-sm font-medium">City</div>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1">
                <div className="text-sm font-medium">Bio (optional)</div>
                <Input
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Short bio"
                />
              </label>

              <label className="space-y-1">
                <div className="text-sm font-medium">Experience (years)</div>
                <Input
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  placeholder="e.g. 2"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1">
                <div className="text-sm font-medium">Service Radius (km)</div>
                <Input
                  value={serviceRadiusKm}
                  onChange={(e) => setServiceRadiusKm(e.target.value)}
                  placeholder="8"
                />
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isOnline}
                  onChange={(e) => setIsOnline(e.target.checked)}
                />
                <span className="text-sm">Available online</span>
              </label>
            </div>

            {error ? (
              <div className="rounded-md border border-destructive bg-destructive/5 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <div className="pt-2 flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

