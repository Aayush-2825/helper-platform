"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle, Clock, Mail, Phone } from "lucide-react";
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
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">You are all set!</h1>
          <p className="text-lg text-gray-600">Your application has been submitted successfully.</p>
        </div>

        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white">
                  OK
                </div>
                <div className="mt-2 h-12 w-0.5 bg-green-600" />
              </div>
              <div className="flex-1 pb-8">
                <h3 className="font-semibold text-gray-900">Submitted</h3>
                <p className="mt-1 text-sm text-gray-600">Your application is in our queue.</p>
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
                <h3 className="font-semibold text-gray-900">Under review</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Our team is verifying your documents. This usually takes 24-48 hours.
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
                <p className="mt-1 text-sm text-gray-600">Start receiving jobs and accepting bookings.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 font-medium text-blue-900">What happens next?</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>Check your email for updates.</li>
              <li>Your profile goes live once approved.</li>
              <li>You can track your uploaded documents and review status from the verification page.</li>
              <li>Questions? Contact support@helperplatform.com.</li>
            </ul>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">Email updates</h4>
                <p className="mt-1 text-sm text-gray-600">We will notify you at your registered email.</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">Need help?</h4>
                <p className="mt-1 text-sm text-gray-600">Contact us anytime during business hours.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={() => router.push("/account/settings")}
            className="sm:order-2"
          >
            Back to settings
          </Button>
          <Button
            onClick={() => router.push("/helper/verification")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Open verification status
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {id ? <div className="mt-6 text-center text-sm text-gray-500">Application ID: {id}</div> : null}
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
