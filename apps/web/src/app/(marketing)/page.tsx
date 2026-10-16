import type { Metadata } from "next";
import { homeMetadata } from "@/lib/seo/metadata";
import DozoLandingPage from "./dozo-landing-page";

export const metadata: Metadata = homeMetadata;

export default function HomePage() {
  return <DozoLandingPage />;
}
