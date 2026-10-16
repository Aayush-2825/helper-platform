import type { Metadata } from "next";
import { dashboardMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  ...dashboardMetadata,
  title: "Customer Dashboard — DOZO",
};

import CustomerDashboard from "./customer-dashboard";

export default function CustomerPage() {
  return <CustomerDashboard />;
}
