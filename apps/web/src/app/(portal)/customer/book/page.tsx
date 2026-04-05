"use client";

import { MyMap } from "@/components/map-component";
import { useSession } from "@/lib/auth/session";

export default function CustomerBookPage() {
  const { session } = useSession();

  return (
    <div className="space-y-0">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50 px-0 py-3 mb-4">
        <h1 className="text-2xl font-semibold">Book a Helper</h1>
        <p className="text-sm text-muted-foreground">
          Drag the pin to your location, fill in the details below.
        </p>
      </div>
      <MyMap userId={session?.user.id} />
    </div>
  );
}
