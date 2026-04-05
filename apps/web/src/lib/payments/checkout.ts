type CheckoutSuccessPayload = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: { color?: string };
  retry?: { enabled: boolean; max_count?: number };
  handler: (response: CheckoutSuccessPayload) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

let razorpayScriptPromise: Promise<void> | null = null;

export function ensureRazorpayCheckoutLoaded(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay checkout is only available in browser."));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout script."));
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

export async function openRazorpayCheckout(options: {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  bookingId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}): Promise<CheckoutSuccessPayload> {
  await ensureRazorpayCheckoutLoaded();

  const RazorpayConstructor = window.Razorpay;
  if (!RazorpayConstructor) {
    throw new Error("Razorpay checkout is unavailable.");
  }

  return new Promise<CheckoutSuccessPayload>((resolve, reject) => {
    const instance = new RazorpayConstructor({
      key: options.keyId,
      amount: options.amount,
      currency: options.currency,
      order_id: options.orderId,
      name: "Helper Platform",
      description: `Booking ${options.bookingId.slice(0, 8)} payment`,
      prefill: {
        name: options.customerName,
        email: options.customerEmail,
        contact: options.customerPhone,
      },
      notes: {
        bookingId: options.bookingId,
      },
      retry: {
        enabled: true,
        max_count: 2,
      },
      theme: {
        color: "#0f766e",
      },
      handler: (response) => {
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          reject(new Error("Payment checkout was cancelled."));
        },
      },
    });

    instance.open();
  });
}
