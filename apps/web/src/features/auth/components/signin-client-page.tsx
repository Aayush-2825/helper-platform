"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Chrome,
  Lock,
  Zap,
  ShieldCheck,
  CreditCard,
  Star,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Users,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth/client";
import { showFormError } from "@/lib/ui/form-feedback";
import { signInSchema, type SignInFormValues } from "@/lib/validation/auth";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@repo/ui/components/ui/field";
import { Input } from "@repo/ui/components/ui/input";

interface SignInClientPageProps {
  nextPath?: string;
}

export function SignInClientPage({ nextPath }: SignInClientPageProps) {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const callbackURL =
    nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard";

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isLoading = form.formState.isSubmitting || googleLoading;

  const handleEmailSignIn = form.handleSubmit(async (values) => {
    setFormError("");

    try {
      const { error: signInError } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        callbackURL,
      });

      if (signInError) {
        setFormError(
          showFormError("Sign-in failed", signInError, "Unable to sign in."),
        );
        return;
      }

      router.push(callbackURL);
    } catch (error) {
      setFormError(
        showFormError("Sign-in failed", error, "An unexpected error occurred."),
      );
    }
  });

  const handleGoogleSignIn = async () => {
    setFormError("");
    setGoogleLoading(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });
    } catch (error) {
      setFormError(
        showFormError("Google sign-in failed", error, "Google sign-in failed."),
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-background">
      {/* LEFT PANEL — DOZO Branding, Hero Stats & Trust Indicators */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 relative flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-zinc-950 via-zinc-900 to-orange-950 text-white overflow-hidden border-r border-border/40">
        {/* Ambient lighting glows */}
        <div className="absolute -top-24 -left-24 size-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 size-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Logo & Tagline */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="size-11 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              D
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white block">
                DOZO
              </span>
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block -mt-0.5">
                Instant Home Services
              </span>
            </div>
          </Link>
        </div>

        {/* Middle: Value Proposition & 3 Trust Indicators */}
        <div className="relative z-10 my-auto py-10 space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-black uppercase tracking-wider">
              <Zap className="size-3.5 fill-current" />
              10-Minute Average Arrival
            </div>
            <h2 className="text-3xl xl:text-4xl font-black tracking-tight text-white leading-tight">
              Verified home help at your doorstep in minutes.
            </h2>
            <p className="text-sm text-zinc-300 font-medium leading-relaxed">
              Electricians, plumbers, house cleaners, and cooks ready to serve across Bengaluru with guaranteed upfront pricing.
            </p>
          </div>

          {/* 3 Trust Indicators */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="size-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                <Zap className="size-5" />
              </div>
              <div>
                <p className="text-sm font-black text-white">10-Minute Rapid Dispatch</p>
                <p className="text-xs text-zinc-400 font-medium mt-0.5">
                  Nearest available professional dispatched with live turn-by-turn map tracking.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="size-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-black text-white">100% Background-Checked Pros</p>
                <p className="text-xs text-zinc-400 font-medium mt-0.5">
                  Every helper undergoes identity verification, criminal check, and skill validation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="size-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <CreditCard className="size-5" />
              </div>
              <div>
                <p className="text-sm font-black text-white">Cashless & Secure Pay</p>
                <p className="text-xs text-zinc-400 font-medium mt-0.5">
                  Zero advance deposit. Pay via UPI, card, or cash only after the work is completed.
                </p>
              </div>
            </div>
          </div>

          {/* User Testimonial Quote */}
          <div className="border-l-2 border-orange-500/60 pl-4 py-1">
            <p className="text-xs italic text-zinc-300">
              &ldquo;DOZO sent an electrician to my apartment in 7 minutes on a Sunday night when our fuse blew. Absolute lifesaver!&rdquo;
            </p>
            <p className="text-[11px] font-bold text-orange-400 mt-1">
              — Ananya R., Koramangala
            </p>
          </div>
        </div>

        {/* Bottom: Hero Stats Strip */}
        <div className="relative z-10 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-black text-white">10 Min</p>
            <p className="text-[10px] uppercase font-bold text-zinc-400">Avg Arrival</p>
          </div>
          <div>
            <p className="text-xl font-black text-white">50k+</p>
            <p className="text-[10px] uppercase font-bold text-zinc-400">Happy Users</p>
          </div>
          <div>
            <p className="text-xl font-black text-white flex items-center justify-center gap-0.5">
              4.9 <Star className="size-3.5 fill-amber-400 text-amber-400" />
            </p>
            <p className="text-[10px] uppercase font-bold text-zinc-400">Customer Rating</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — Sign-in Form */}
      <div className="col-span-12 lg:col-span-7 xl:col-span-7 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 relative">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile-only brand badge */}
          <div className="lg:hidden text-center mb-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="size-9 rounded-xl bg-orange-500 text-white font-black flex items-center justify-center text-base">
                D
              </div>
              <span className="text-xl font-black tracking-tight text-foreground">
                DOZO
              </span>
            </Link>
          </div>

          {/* Form Header */}
          <div className="text-center sm:text-left space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold mb-1">
              <Lock className="size-3" />
              Secure Sign In
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Sign in to manage your bookings and access instant home help.
            </p>
          </div>

          <Card className="border-border/80 shadow-xl bg-card rounded-2xl overflow-hidden">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl font-black">Sign in to DOZO</CardTitle>
              <CardDescription className="text-xs">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <form onSubmit={handleEmailSignIn} noValidate aria-busy={isLoading}>
                <FieldGroup>
                  {/* Enhanced Error State with Icon + Colored Alert */}
                  {formError ? (
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="size-4.5 shrink-0 mt-0.5 text-destructive" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs uppercase tracking-wide">
                          Sign-in failed
                        </p>
                        <p className="text-xs mt-0.5 leading-snug">{formError}</p>
                      </div>
                    </div>
                  ) : null}

                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name} className="font-bold text-xs">
                          Email address
                        </FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          aria-invalid={fieldState.invalid}
                          className="h-11 rounded-xl"
                        />
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </Field>
                    )}
                  />

                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name} className="font-bold text-xs">
                          Password
                        </FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          type="password"
                          autoComplete="current-password"
                          placeholder="••••••••"
                          aria-invalid={fieldState.invalid}
                          className="h-11 rounded-xl"
                        />
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </Field>
                    )}
                  />

                  <div className="flex justify-end">
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Loading Button with Animated Spinner */}
                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-md shadow-orange-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    disabled={isLoading}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  <FieldSeparator className="my-5" />

                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full gap-2 rounded-xl font-bold text-xs border-border hover:bg-muted/50"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    {googleLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Chrome className="size-4 text-orange-500" />
                    )}
                    Continue with Google
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col items-center gap-3 pt-4 border-t border-border/60 bg-muted/20">
              <p className="text-xs text-muted-foreground font-medium">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="font-bold text-orange-600 dark:text-orange-400 hover:underline"
                >
                  Sign up for free
                </Link>
              </p>
            </CardFooter>
          </Card>

          {/* Social Proof Strip below form */}
          <div className="rounded-2xl border border-border/80 bg-card/60 p-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2 overflow-hidden">
                <span className="inline-block size-7 rounded-full ring-2 ring-background bg-orange-500 text-white text-[10px] font-black flex items-center justify-center">
                  R
                </span>
                <span className="inline-block size-7 rounded-full ring-2 ring-background bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                  P
                </span>
                <span className="inline-block size-7 rounded-full ring-2 ring-background bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center">
                  A
                </span>
              </div>
              <p className="text-xs font-bold text-foreground">
                Join 10,000+ helpers &amp; 50,000+ happy customers
              </p>
            </div>
            <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
              <Star className="size-3.5 fill-amber-400" />
              <span className="text-xs font-black">4.9</span>
            </div>
          </div>

          <p className="text-center text-[11px] text-muted-foreground font-medium">
            By signing in, you agree to DOZO&apos;s{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
