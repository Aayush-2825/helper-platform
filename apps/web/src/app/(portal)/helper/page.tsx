import type { Metadata } from "next";
import { dashboardMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  ...dashboardMetadata,
  title: "Helper Dashboard — DOZO",
};

import HelperDashboard from "./helper-dashboard";

export default function HelperPage() {
  return <HelperDashboard />;
}
