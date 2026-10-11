"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LuTrophy } from "react-icons/lu";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-dark px-4 py-8">
      {/* Shared court background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=2400&q=85')",
        }}
      />

      {/* Shared overlays */}
      <div className="absolute inset-0 bg-brand-dark/40" />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/50 via-transparent to-black/50" />

      <div className="relative z-10 grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2">
        {/* Branding and introduction */}
        <section className="hidden text-white lg:block">
          <h1 className="max-w-lg text-5xl font-bold leading-tight tracking-tight">
            Play more.
            <br />
            Worry less.
          </h1>

          <p className="mt-5 max-w-md text-lg leading-8 text-white/85">
            Book your court, anytime, anywhere.
          </p>
        </section>

        {/* Page-specific white card */}
        <section className="w-full max-w-md justify-self-center lg:justify-self-end">
          <div className="rounded-3xl bg-white p-6 shadow-2xl sm:p-9">
            <div className="flex h-12 px-4 mb-8 items-center justify-center rounded-xl text-white">
                <img src='/servior-logo.png' alt="Servior" className="w-9" />
                <img src='/servior-name-logo.png' alt="Servior" className="w-30" />
            </div>

            {children}
          </div>

          <p className="mt-6 text-center text-xs text-white/75">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-white">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-white">
              Privacy Policy
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}