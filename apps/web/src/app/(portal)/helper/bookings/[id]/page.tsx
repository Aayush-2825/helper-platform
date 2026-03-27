import { BookingDetails } from "@/components/BookingDetails";

export default async function HelperBookingPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  return <BookingDetails bookingId={id} role="helper" />;
}
