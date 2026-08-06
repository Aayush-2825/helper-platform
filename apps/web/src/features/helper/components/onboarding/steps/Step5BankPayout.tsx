"use client";

import { UseFormReturn, FieldValues } from "react-hook-form";
import { FormField } from "@repo/ui/components/ui/form-field";
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
          Payout details
        </h1>
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
      </div>

      {/* Bank Account Number */}
      <div>
        <FormField
          id="bankAccountNumber"
          label="Bank Account Number"
          placeholder="1234567890"
          inputMode="numeric"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...register("bankAccountNumber" as any)}
          error={errors.bankAccountNumber?.message as string}
        />
      </div>

      {/* IFSC Code */}
      <div>
        <FormField
          id="ifscCode"
          label="IFSC Code"
          placeholder="SBIN0001234"
          autoCapitalize="characters"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...register("ifscCode" as any)}
          error={errors.ifscCode?.message as string}
        />
      </div>

      <FormField
          label="UPI ID (Optional)"
          placeholder="user@upi"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...register("upiId" as any)}
          error={errors.upiId?.message as string}
        />
    </div>
  );
}
