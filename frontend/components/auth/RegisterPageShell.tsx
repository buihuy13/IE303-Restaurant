"use client";

import Link from "next/link";

import { useRegisterPage } from "@/hooks/auth/useRegisterPage";

export default function RegisterPageShell() {
  const {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    handleSubmit,
  } = useRegisterPage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Register</h1>
        <p className="mt-1 text-sm text-gray-500">Mock – no real signup.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-[#EE4D2D] py-2 text-sm font-medium text-white hover:bg-[#EE4D2D]/90"
          >
            Create account (mock)
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          <Link href="/login" className="text-[#EE4D2D] hover:underline">
            Login
          </Link>
          {" · "}
          <Link href="/" className="text-gray-600 hover:underline">
            Home
          </Link>
        </p>
      </div>
    </div>
  );
}
