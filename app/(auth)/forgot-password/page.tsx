
"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/password-reset-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.get("email") }),
      });
      if (!response.ok) {
        setMessage("A reset link could not be sent. Please try again later.");
        return;
      }
      setMessage("If an account exists for that email, a reset link will be sent.");
    } catch {
      setMessage("A reset link could not be sent. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-7 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.7}
            stroke="currentColor"
            className="h-7 w-7 text-sky-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V7.5a4.5 4.5 0 0 0-9 0v3m-1.5 0h12A1.5 1.5 0 0 1 19.5 12v7.5A1.5 1.5 0 0 1 18 21H6a1.5 1.5 0 0 1-1.5-1.5V12A1.5 1.5 0 0 1 6 10.5Z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Forgot your password?
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          No worries! Enter the email address associated with your account
          and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form className="space-y-5" onSubmit={submit}>
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

        {message && <p role="status" className="text-sm text-gray-600">{message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 transition hover:text-sky-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
