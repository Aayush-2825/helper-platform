import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { FEATURED, POSTS } from "../data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return [FEATURED, ...POSTS].map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Blog: ${slug} — Coming Soon | DOZO`,
    description: "This blog article is coming soon.",
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-28">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold">
          <FileText className="size-3.5" />
          Article
        </div>
        <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
          This article is <span className="text-blue-600">coming soon.</span>
        </h1>
        <p className="text-lg text-muted-foreground font-medium leading-relaxed">
          The blog post <span className="font-bold text-foreground">{slug}</span> is not published yet.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/blog" className={buttonVariants({ size: "lg" }) + " px-8"}>
            Back to Blog
          </Link>
          <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" }) + " px-8"}>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
