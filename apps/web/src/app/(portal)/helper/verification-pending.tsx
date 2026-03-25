"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle, Clock, Mail, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Verification Pending Page
 * Shown after successful onboarding submission
 * Informs user about verification timeline
 */
function VerificationPendingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 via-white to-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Success Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
              You are All Set! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Your application has been submitted successfully
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8 shadow-sm">
          {/* Timeline */}
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white font-semibold text-sm">
                  ✓
                </div>
                <div className="mt-2 h-12 w-0.5 bg-green-600" />
              </div>
              <div className="flex-1 pb-8">
                <h3 className="font-semibold text-gray-900">Submitted</h3>
                <p className="text-sm text-gray-600 mt-1">Your application is in our queue</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="mt-2 h-12 w-0.5 bg-gray-300" />
              </div>
              <div className="flex-1 pb-8">
                <h3 className="font-semibold text-gray-900">Under Review</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Our team is verifying your documents (24-48 hours)
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Approved</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Start receiving jobs and accepting bookings
                </p>
              </div>
            </div>
          </div>

          {/* Status Info */}
          <div className="mt-8 rounded-lg bg-blue-50 border border-blue-200 p-4">
            <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>✓ Check your email for updates (verify your email)</li>
              <li>✓ Your profile goes live once approved</li>
              <li>✓ You can edit your profile while pending verification</li>
              <li>✓ Questions? Contact support@helperplatform.com</li>
            </ul>
          </div>
        </div>

        {/* Contact & Next Steps */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Email Updates</h4>
                <p className="text-sm text-gray-600 mt-1">
                  We will notify you at your registered email
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Need Help?</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Contact us anytime during business hours
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={() => router.push("/helper")}
            className="sm:order-2"
          >
            View Dashboard
          </Button>
          <Button
            onClick={() => router.push("/helper")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Back to Home
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {id ? (
          <div className="mt-6 text-center text-sm text-gray-500">
            Application ID: {id}
          </div>
        ) : null}

        {/* FAQ */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Common Questions</h3>
          <div className="space-y-4">
            {[
              {
                q: "How long does verification take?",
                a: "Usually 24-48 hours, but can be longer during high volume periods.",
              },
              {
                q: "Can I edit my profile while pending?",
                a: "Yes, edit anytime to improve your chances of faster approval.",
              },
              {
                q: "What if my application is rejected?",
                a: "You will receive detailed feedback. You can reapply after fixing the issues.",
              },
              {
                q: "When can I start accepting jobs?",
                a: "Immediately after approval. You might see jobs within hours!",
              },
            ].map((item, i) => (
              <details key={i} className="rounded-lg border border-gray-200 p-4">
                <summary className="cursor-pointer font-medium text-gray-900">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm text-gray-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerificationPendingPage() {
  return (
    <Suspense fallback={null}>
      <VerificationPendingContent />
    </Suspense>
  );
}
