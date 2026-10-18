
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData(event.currentTarget);
    if (formData.get("password") !== formData.get("confirmPassword")) {
      setErrorMessage("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      if (!response.ok) {
        setErrorMessage(
          response.status === 400
            ? "Please check your details and try again."
            : "Account registration is temporarily unavailable.",
        );
        return;
      }

      const result = (await response.json()) as { confirmationRequired: boolean };
      if (result.confirmationRequired) {
        setSuccessMessage("Check your email to confirm your account.");
      } else {
        router.replace("/dashboard");
        router.refresh();
      }
    } catch {
      setErrorMessage("Account registration is temporarily unavailable.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-7 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Join us and get started today.
        </p>
      </div>

      <form className="space-y-4" onSubmit={submit}>
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Enter your full name"
            required
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a password"
            minLength={8}
            required
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          />
          <p className="mt-1.5 text-xs text-gray-400">
            Must be at least 8 characters.
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            minLength={8}
            required
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          />
        </div>

        <div className="flex items-start gap-2 pt-1">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded border-gray-300 accent-sky-600 focus:ring-sky-500"
          />
          <label htmlFor="terms" className="text-sm text-gray-500">
            I agree to the{" "}
            <Link
              href="/terms"
              className="font-medium text-sky-600 hover:text-sky-700"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-medium text-sky-600 hover:text-sky-700"
            >
              Privacy Policy
            </Link>
            .
          </label>
        </div>

        {(errorMessage || successMessage) && (
          <p role={errorMessage ? "alert" : "status"} className={`text-sm ${errorMessage ? "text-red-600" : "text-green-700"}`}>
            {errorMessage || successMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-sky-600 transition hover:text-sky-700"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
