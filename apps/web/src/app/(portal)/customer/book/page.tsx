import { MyMap } from "@/components/map-component";

export default function CustomerBookPage() {
  
  return (
    <main className="space-y-2 p-6">
      <h1 className="text-2xl font-semibold">Book a Helper</h1>
      <p className="text-sm text-muted-foreground">Create a new booking request with location and task details.</p>
      <MyMap  />
    </main>
  );
}
