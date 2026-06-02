"use client";

import React, { useEffect, useRef } from "react";

interface Section {
  id: string | number;
  title: string;
  status?: "completed" | "in-progress" | "required";
  eta?: string;
}

export default function OnboardingShell({
  title,
  currentStep,
  totalSteps,
  progressPercentage,
  sections,
  summary,
  children,
}: {
  title?: string;
  currentStep: number;
  totalSteps: number;
  progressPercentage: number;
  sections?: Section[];
  summary?: React.ReactNode;
  children: React.ReactNode;
}) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    // Move focus to the onboarding heading when the step changes for screen reader users
    headingRef.current?.focus();
  }, [currentStep]);
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <a className="sr-only focus:not-sr-only" href="#onboarding-main">Skip to main content</a>
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 ref={headingRef} tabIndex={-1} className="text-sm font-semibold text-gray-900" id="onboarding-heading">{title}</h1>
                <p className="text-xs text-gray-500">Step {currentStep + 1} of {totalSteps}</p>
              </div>
              <div className="text-sm font-medium text-gray-600">{progressPercentage}%</div>
            </div>

            <div className="mt-3">
              <div id="progress-label" className="sr-only">Progress: {progressPercentage}%</div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-labelledby="progress-label onboarding-heading" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercentage}>
                <div className="h-full bg-linear-to-r from-blue-500 to-blue-600 transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <main id="onboarding-main" role="main" aria-labelledby="onboarding-heading" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Summary column */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-20">
              {summary}
            </div>
          </aside>

          {/* Main content */}
          <section className="col-span-1 lg:col-span-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              {children}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
 
