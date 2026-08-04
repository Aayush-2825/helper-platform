import Link from "next/link";
import type { Chapter, DocumentMetadata } from "../../privacy/data/termsData";

type LegalDocumentProps = {
  title: string;
  subtitle?: string;
  chapters: Chapter[];
  metadata?: DocumentMetadata;
  intro?: string;
  showTableOfContents?: boolean;
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const renderInlineText = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^\)]+\))/g);

  return parts.map((part, index) => {
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      const external = /^https?:\/\//.test(href);

      return (
        <Link
          key={`${href}-${index}`}
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          className="font-medium text-sky-600 underline decoration-sky-300 underline-offset-4 transition hover:text-sky-700"
        >
          {label}
        </Link>
      );
    }

    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) {
      return <strong key={`${index}-${part}`}>{boldMatch[1]}</strong>;
    }

    return <span key={`${index}-${part}`}>{part}</span>;
  });
};

export function LegalDocument({
  title,
  subtitle,
  chapters,
  metadata,
  intro,
  showTableOfContents = true,
}: LegalDocumentProps) {
  const tableOfContents = chapters.map((chapter) => ({
    chapter,
    sections: chapter.sections.map((section) => ({
      title: section.title,
      num: section.num,
      id: section.num
        ? `sec-${section.num.replace(/\./g, "-")}`
        : `sec-${chapter.number}-${slugify(section.title)}`,
    })),
  }));

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_28%),linear-gradient(to_bottom,#ffffff,#f8fafc)] text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16 md:px-10 lg:py-20">
        <header className="space-y-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-200 hover:text-sky-700 hover:shadow-md"
            >
              Back to Home
            </Link>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">
              DOZO Legal
            </p>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
                {subtitle}
              </p>
            ) : null}
            {intro ? (
              <p className="max-w-3xl text-sm leading-6 text-slate-500">
                {intro}
              </p>
            ) : null}
          </div>

          {metadata ? (
            <div className="grid gap-3 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur md:grid-cols-3 lg:grid-cols-5">
              {[
                ["Effective Date", metadata.effectiveDate],
                ["Version", metadata.version],
                ["Jurisdiction", metadata.jurisdiction],
                ["Governing Law", metadata.governingLaw],
                ["Document", metadata.title],
              ].map(([label, value]) => (
                <div key={label} className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {label}
                  </p>
                  <p className="text-sm font-semibold text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          ) : null}
        </header>

        {showTableOfContents && tableOfContents.length > 0 ? (
          <aside className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
                  Table of Contents
                </p>
                <h2 className="text-xl font-bold tracking-tight text-slate-950">
                  Jump to any section
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-slate-500">
                Use the chapter and section links to move through the legal document quickly.
              </p>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {tableOfContents.map(({ chapter, sections }) => (
                <div key={`toc-${chapter.number}`} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <Link
                    href={`#chapter-${chapter.number}`}
                    className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600 transition hover:text-sky-700"
                  >
                    Chapter {chapter.number}: {chapter.title}
                  </Link>
                  <ul className="mt-3 space-y-2">
                    {sections.map((section) => (
                      <li key={section.id}>
                        <Link
                          href={`#${section.id}`}
                          className="text-sm leading-6 text-slate-600 transition hover:text-slate-950"
                        >
                          {section.num ? `${section.num} ` : ""}
                          {section.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </aside>
        ) : null}

        <section className="space-y-6">
          {chapters.map((chapter) => (
            <article
              key={chapter.number}
              id={`chapter-${chapter.number}`}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
            >
              <div className="border-b border-slate-100 bg-slate-50 px-6 py-5 md:px-8">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
                  Chapter {chapter.number}
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {chapter.title}
                </h2>
              </div>

              <div className="space-y-6 px-6 py-6 md:px-8 md:py-8">
                {chapter.sections.map((section) => {
                  const sectionId = section.num
                    ? `sec-${section.num.replace(/\./g, "-")}`
                    : `sec-${chapter.number}-${slugify(section.title)}`;

                  return (
                    <section key={`${chapter.number}-${section.title}`} id={sectionId} className="space-y-4">
                      <div className="space-y-1">
                        {section.num ? (
                          <p className="text-sm font-semibold text-sky-600">{section.num}</p>
                        ) : null}
                        <h3 className="text-xl font-semibold text-slate-900">
                          {section.title}
                        </h3>
                      </div>

                      <div className="space-y-3 text-[15px] leading-7 text-slate-700">
                        {section.elements.map((element, index) =>
                          element.type === "bullet" ? (
                            <ul key={`${sectionId}-bullet-${index}`} className="list-disc space-y-2 pl-6">
                              <li>{renderInlineText(element.text)}</li>
                            </ul>
                          ) : (
                            <p key={`${sectionId}-paragraph-${index}`}>{renderInlineText(element.text)}</p>
                          ),
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}