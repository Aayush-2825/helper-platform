"use client";

import { UseFormReturn, FieldValues } from "react-hook-form";
import { FormField } from "@/components/ui/form-field";
import { CreditCard, AlertCircle } from "lucide-react";

interface Step5BankPayoutProps<T extends FieldValues> {
  form: UseFormReturn<T>;
}

/**
 * Step 5: Bank & Payout Details
 * Collect bank account, IFSC, and UPI for payouts
 */
export function Step5BankPayout<T extends FieldValues>({
  form,
}: Step5BankPayoutProps<T>) {
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          <CreditCard className="inline h-6 w-6 mr-2 text-blue-600" />
          Payout Details
        </h1>
        <p className="mt-2 text-gray-600">
          Where should we send your earnings?
        </p>
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Information is secure and encrypted
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Your bank details are never shared with customers. Payouts happen automatically every Monday.
            </p>
          </div>
        </div>
      </div>

      {/* Account Holder Name */}
      <div>
        <FormField
          id="accountHolderName"
          label="Account Holder Name"
          placeholder="John Doe"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...register("accountHolderName" as any)}
          error={errors.accountHolderName?.message as string}
        />
        <p className="mt-1 text-xs text-gray-500">
          Must match your bank account name exactly
        </p>
      </div>

      {/* Bank Account Number */}
      <div>
        <FormField
          id="bankAccountNumber"
          label="Bank Account Number"
          placeholder="1234567890"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...register("bankAccountNumber" as any)}
          error={errors.bankAccountNumber?.message as string}
        />
        <p className="mt-1 text-xs text-gray-500">
          Your account number (9-18 digits)
        </p>
      </div>

      {/* IFSC Code */}
      <div>
        <FormField
          id="ifscCode"
          label="IFSC Code"
          placeholder="SBIN0001234"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...register("ifscCode" as any)}
          error={errors.ifscCode?.message as string}
        />
        <p className="mt-1 text-xs text-gray-500">
          11-character bank code (e.g., HDFC0000001 for HDFC Bank)
        </p>
      </div>

      {/* UPI Alternative */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-900 mb-3">
          Prefer UPI? (Optional)
        </p>
        <FormField
          label="UPI ID (Optional)"
          placeholder="user@upi"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...register("upiId" as any)}
          error={errors.upiId?.message as string}
        />
        <p className="mt-1 text-xs text-gray-500">
          You can receive payouts via UPI instead of bank transfer (up to ₹1,00,000/day)
        </p>
      </div>

      {/* Bank Details Helper */}
      <details className="rounded-lg border border-gray-200 p-4">
        <summary className="cursor-pointer font-medium text-gray-900 hover:text-gray-700">
          Where to find your bank details?
        </summary>
        <div className="mt-3 space-y-2 text-sm text-gray-600">
          <p>
            <strong>Bank Account Number:</strong> On your debit card, passbook, or online banking portal
          </p>
          <p>
            <strong>IFSC Code:</strong> On your bank&apos;s website, or ask your bank
          </p>
          <p>
            <strong>UPI ID:</strong> Set up in your bank&apos;s mobile app (usually yourname@bankname)
          </p>
        </div>
      </details>

      {/* Security Note */}
      <div className="rounded-lg bg-green-50 border border-green-200 p-4">
        <p className="text-xs text-green-900">
          <strong>Your data is secure:</strong> Uses AES-256 encryption. No one sees your full account number.
        </p>
      </div>
    </div>
  );
}
