"use client";

import { useState } from "react";
import Link from "next/link";
import { LuArrowRight, LuEye, LuEyeOff, LuLockKeyhole, LuMail } from "react-icons/lu";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Sign in to manage your court bookings.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          // TODO: Connect to Supabase Auth.
        }}
        className="space-y-5"
      >
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="relative">
            <LuMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <Link href="/forgot-password" className="text-sm font-semibold text-brand hover:text-brand-dark">
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <LuLockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
              className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-12 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            name="remember"
            className="size-4 rounded border-gray-300 accent-brand"
          />
          Remember me
        </label>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Sign in
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <Link href="/register" className="font-semibold text-brand hover:text-brand-dark">
          Create account
        </Link>
      </p>
    </>
  );
}