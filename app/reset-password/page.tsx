"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.location.hash.includes("type=recovery")
      ? ""
      : "Open the password reset link from your email to continue.";
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.location.hash.includes("type=recovery");
  });

  useEffect(() => {
    if (!recoveryReady) return;

    let cancelled = false;
    const supabase = createSupabaseBrowserClient();

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data.session) {
          setMessage("This reset link is invalid or has expired. Request a new one.");
          setRecoveryReady(false);
          return;
        }
        setRecoveryReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setMessage("Password reset is not configured. Please contact support.");
        setRecoveryReady(false);
      });

    return () => {
      cancelled = true;
    };
  }, [recoveryReady]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password !== confirmation) {
      setMessage("The passwords do not match.");
      return;
    }

    if (!recoveryReady) {
      setMessage("Open the password reset link from your email to continue.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setMessage(
          response.status === 401
            ? "This reset link is invalid or has expired. Request a new one."
            : "Password could not be updated. Please try again.",
        );
        return;
      }
      setMessage("Your password has been updated. You can now sign in.");
      setRecoveryReady(false);
    } catch {
      setMessage("Password could not be updated. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-7 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Set a new password
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Choose a new password for your account.
        </p>
      </div>
      <form className="space-y-4" onSubmit={submit}>
        <label className="block text-sm font-medium text-gray-700">
          New password
          <input
            type="password"
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Confirm new password
          <input
            type="password"
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
          />
        </label>
        {message && <p role="status" className="text-sm text-gray-600">{message}</p>}
        <button
          type="submit"
          disabled={isSubmitting || !recoveryReady}
          className="w-full rounded-xl bg-brand px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
