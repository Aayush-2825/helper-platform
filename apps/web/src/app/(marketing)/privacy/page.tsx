import type { Metadata } from "next";
import { LegalDocument } from "../_components/legal-document";
import { chaptersData } from "../../privacy/data/termsData";

const privacyChapter = chaptersData.find((chapter) => chapter.number === 13);

export const metadata: Metadata = {
  title: "Privacy Policy | DOZO",
  description: "How DOZO collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      subtitle={privacyChapter?.title}
      chapters={privacyChapter ? [privacyChapter] : []}
      showTableOfContents={false}
    />
  );
}
