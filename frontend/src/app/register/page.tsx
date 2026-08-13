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
  UserRound,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");

    if (fullName.trim().length < 2) {
      setError(
        "Please enter your full name."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      const registerResponse =
        await fetch(
          `${API_URL}/users/register`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              full_name:
                fullName.trim(),

              email:
                email.trim(),

              password,
            }),
          }
        );

      if (!registerResponse.ok) {
        let detail =
          "Unable to create account.";

        try {
          const data =
            await registerResponse.json();

          if (
            typeof data.detail ===
            "string"
          ) {
            detail =
              data.detail;
          } else if (
            Array.isArray(
              data.detail
            )
          ) {
            detail =
              data.detail
                .map(
                  (
                    item: {
                      msg?: string;
                    }
                  ) =>
                    item.msg
                )
                .filter(Boolean)
                .join(" ");
          }
        } catch {
          // Keep fallback.
        }

        throw new Error(
          detail
        );
      }

      const loginResponse =
        await fetch(
          `${API_URL}/users/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email:
                email.trim(),

              password,
            }),
          }
        );

      if (!loginResponse.ok) {
        router.push("/login");
        return;
      }

      const loginData =
        await loginResponse.json();

      localStorage.setItem(
        "lumina_access_token",
        loginData.access_token
      );

      router.push("/app");

    } catch (err) {
      if (
        err instanceof Error
      ) {
        setError(
          err.message
        );
      } else {
        setError(
          "Something went wrong."
        );
      }

    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050708] px-4 py-6 text-white sm:px-6 md:px-8">

      {/* BACKGROUND GLOW */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute left-1/2 top-[-180px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-white/[0.025] blur-[180px]" />

        <div className="absolute bottom-[-220px] right-[-120px] h-[500px] w-[500px] rounded-full bg-white/[0.02] blur-[180px]" />

      </div>

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
          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        }}
        className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] shadow-2xl backdrop-blur-2xl sm:rounded-[36px] lg:grid-cols-2"
      >

        {/* LEFT VISUAL */}

        <div className="relative hidden min-h-[720px] overflow-hidden lg:block">

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
                Join Lumina
              </p>

              <h1 className="mt-4 text-5xl font-semibold leading-[0.95] tracking-[-0.055em]">

                Build your
                <br />
                AI workspace.

              </h1>

              <p className="mt-5 text-lg leading-8 text-white/65">

                Create an account and begin building conversations, voice interactions, documents and personalized experiences.

              </p>

            </div>

          </div>

        </div>

        {/* REGISTER FORM */}

        <div className="flex min-h-[680px] items-center p-5 sm:p-7 md:p-10 lg:p-12">

          <div className="mx-auto w-full max-w-md">

            {/* MOBILE BRAND */}

            <div className="mb-8 flex items-center gap-3 lg:hidden">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">

                <BrainCircuit className="h-5 w-5" />

              </div>

              <div>

                <p className="font-semibold">
                  Lumina AI
                </p>

                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">

                  Adaptive intelligence

                </p>

              </div>

            </div>

            <div className="mb-8 sm:mb-9">

              <p className="text-sm uppercase tracking-[0.22em] text-white/40">

                Create account

              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">

                Start with Lumina.

              </h2>

              <p className="mt-3 leading-7 text-white/55">

                Create your account to access your AI workspace.

              </p>

            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5"
            >

              {/* FULL NAME */}

              <div>

                <label
                  htmlFor="full-name"
                  className="mb-2 block text-sm text-white/65"
                >
                  Full name
                </label>

                <div className="flex items-center rounded-2xl border border-white/10 bg-black/25 px-4 transition focus-within:border-white/25 focus-within:bg-black/35">

                  <UserRound className="h-4 w-4 shrink-0 text-white/35" />

                  <input
                    id="full-name"
                    type="text"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={150}
                    value={
                      fullName
                    }
                    onChange={(
                      event
                    ) =>
                      setFullName(
                        event.target.value
                      )
                    }
                    placeholder="Your full name"
                    className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-white/25"
                  />

                </div>

              </div>

              {/* EMAIL */}

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
                    value={
                      email
                    }
                    onChange={(
                      event
                    ) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="you@example.com"
                    className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-white/25"
                  />

                </div>

              </div>

              {/* PASSWORD */}

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
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={128}
                    value={
                      password
                    }
                    onChange={(
                      event
                    ) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder="At least 8 characters"
                    className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-white/25"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (
                          current
                        ) =>
                          !current
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

              {/* CONFIRM PASSWORD */}

              <div>

                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm text-white/65"
                >

                  Confirm password

                </label>

                <div className="flex items-center rounded-2xl border border-white/10 bg-black/25 px-4 transition focus-within:border-white/25 focus-within:bg-black/35">

                  <LockKeyhole className="h-4 w-4 shrink-0 text-white/35" />

                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={128}
                    value={
                      confirmPassword
                    }
                    onChange={(
                      event
                    ) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Repeat your password"
                    className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-white/25"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (
                          current
                        ) =>
                          !current
                      )
                    }
                    className="text-white/40 transition hover:text-white"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}

                  </button>

                </div>

              </div>

              {/* ERROR */}

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

              {/* SUBMIT */}

              <motion.button
                whileHover={{
                  scale:
                    loading
                      ? 1
                      : 1.015,
                }}
                whileTap={{
                  scale:
                    loading
                      ? 1
                      : 0.98,
                }}
                disabled={
                  loading
                }
                type="submit"
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 font-medium text-black transition disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading
                  ? "Creating account..."
                  : "Create account"}

                {!loading && (

                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />

                )}

              </motion.button>

            </form>

            <div className="mt-8 text-center text-sm text-white/45">

              Already have an account?{" "}

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/login"
                  )
                }
                className="text-white transition hover:text-white/75"
              >

                Sign in

              </button>

            </div>

          </div>

        </div>

      </motion.div>

    </main>
  );
}