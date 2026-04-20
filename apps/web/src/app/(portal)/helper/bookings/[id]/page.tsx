import { BookingDetails } from "@/components/BookingDetails";

export default async function HelperBookingPage(props: {
  params: { id?: string } | Promise<{ id?: string }>;
}) {
  const { id } = await Promise.resolve(props.params);
  if (!id) {
    return <div className="p-8 text-center text-destructive">Invalid booking link.</div>;
  }

  return <BookingDetails bookingId={id} role="helper" />;
}
