"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { API_URL } from "@/lib/api";
import {
  ArrowRight,
  BrainCircuit,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();

        throw new Error(
          data.detail || "Unable to sign in."
        );
      }

      const data = await response.json();

      localStorage.setItem(
        "lumina_access_token",
        data.access_token
      );

      router.push("/app");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050708] px-6 py-12 text-white">
      <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-white/[0.04] blur-[180px]" />

      <motion.div
        initial={{
          opacity: 0,
          y: 40,
          scale: 0.96,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.035] shadow-2xl backdrop-blur-2xl lg:grid-cols-2"
      >
        <div className="relative hidden min-h-[680px] overflow-hidden lg:block">
          <div className="absolute inset-0 bg-[url('/showcase/voice.png')] bg-cover bg-center" />

          <div className="absolute inset-0 bg-black/35" />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

          <div className="relative z-10 flex h-full flex-col justify-between p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/20 backdrop-blur-xl">
                <BrainCircuit className="h-5 w-5" />
              </div>

              <div>
                <div className="font-semibold">
                  Lumina AI
                </div>

                <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                  Adaptive intelligence
                </div>
              </div>
            </div>

            <div className="max-w-md">
              <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                Welcome back
              </p>

              <h1 className="mt-4 text-5xl font-semibold leading-[0.95] tracking-[-0.055em]">
                Continue your
                <br />
                AI journey.
              </h1>

              <p className="mt-5 text-lg leading-8 text-white/65">
                Your conversations, memories, documents and preferences
                are waiting.
              </p>
            </div>
          </div>
        </div>

        <div className="flex min-h-[680px] items-center p-7 md:p-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-9">
              <p className="text-sm uppercase tracking-[0.22em] text-white/40">
                Sign in
              </p>

              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                Welcome back.
              </h2>

              <p className="mt-3 leading-7 text-white/55">
                Sign in to continue to your Lumina workspace.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm text-white/65"
                >
                  Email
                </label>

                <div className="flex items-center rounded-2xl border border-white/10 bg-black/25 px-4 transition focus-within:border-white/25 focus-within:bg-black/35">
                  <Mail className="h-4 w-4 shrink-0 text-white/35" />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-white/25"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm text-white/65"
                >
                  Password
                </label>

                <div className="flex items-center rounded-2xl border border-white/10 bg-black/25 px-4 transition focus-within:border-white/25 focus-within:bg-black/35">
                  <LockKeyhole className="h-4 w-4 shrink-0 text-white/35" />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-white/25"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    className="text-white/40 transition hover:text-white"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="rounded-2xl border border-red-400/15 bg-red-400/10 px-4 py-3 text-sm text-red-200"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                whileHover={{
                  scale: loading ? 1 : 1.015,
                }}
                whileTap={{
                  scale: loading ? 1 : 0.98,
                }}
                disabled={loading}
                type="submit"
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 font-medium text-black transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Signing in..."
                  : "Sign in"}

                {!loading && (
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                )}
              </motion.button>
            </form>

            <div className="mt-8 text-center text-sm text-white/45">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() =>
                  router.push("/register")
                }
                className="text-white transition hover:text-white/75"
              >
                Create one
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}