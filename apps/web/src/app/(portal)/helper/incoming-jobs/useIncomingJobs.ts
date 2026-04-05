"use client";

import { useState, useCallback } from "react";

export type IncomingJob = {
  bookingId: string;
  candidateId?: string;
  customerId: string;
  eventType?: string;
  categoryId: string;
  addressLine: string;
  city: string;
  quotedAmount: number;
  distanceKm?: number;
  customerName?: string;
  expiresAt?: string;
  expiresInSeconds?: number;
  latitude?: number;
  longitude?: number;
};

export function useIncomingJobs() {
  const [jobs, setJobs] = useState<IncomingJob[]>([]);

  const addJob = useCallback((job: IncomingJob) => {
    setJobs((prev) => {
      if (prev.some((j) => j.bookingId === job.bookingId)) return prev;
      return [job, ...prev];
    });
  }, []);

  const removeJob = useCallback((bookingId: string) => {
    setJobs((prev) => prev.filter((j) => j.bookingId !== bookingId));
  }, []);

  const replaceJobs = useCallback((nextJobs: IncomingJob[]) => {
    setJobs(nextJobs);
  }, []);

  return { jobs, addJob, removeJob, replaceJobs };
}