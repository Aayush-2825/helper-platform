import type { Metadata } from "next";
import { LegalDocument } from "../_components/legal-document";
import { chaptersData, documentMetadata } from "../../privacy/data/termsData";

export const metadata: Metadata = {
  title: "Terms of Service | DOZO",
  description: "Terms governing use of the DOZO platform and services.",
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      subtitle={documentMetadata.subtitle}
      metadata={documentMetadata}
      chapters={chaptersData}
    />
  );
}
