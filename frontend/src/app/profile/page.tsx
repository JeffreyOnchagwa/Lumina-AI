"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";


type UserProfile = {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
};


type MessageResponse = {
  message: string;
};


export default function ProfilePage() {
  const router = useRouter();

  const [ready, setReady] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [error, setError] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  const [passwordSuccess, setPasswordSuccess] =
    useState("");

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmNewPassword, setConfirmNewPassword] =
    useState("");

  const [deletePassword, setDeletePassword] =
    useState("");

  const [deleteError, setDeleteError] =
    useState("");

  const [deleting, setDeleting] =
    useState(false);

  const [showDeletePanel, setShowDeletePanel] =
    useState(false);


  function getToken() {
    return localStorage.getItem(
      "lumina_access_token"
    );
  }


  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setReady(true);

    void loadProfile();
  }, [router]);


  async function loadProfile() {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/users/me`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem(
          "lumina_access_token"
        );

        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Unable to load your account."
        );
      }

      const data: UserProfile =
        await response.json();

      setProfile(data);

    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message
        );
      }

    } finally {
      setLoading(false);
    }
  }


  async function changePassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword.trim()) {
      setPasswordError(
        "Enter your current password."
      );

      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "Your new password must contain at least 8 characters."
      );

      return;
    }

    if (
      newPassword !==
      confirmNewPassword
    ) {
      setPasswordError(
        "The new passwords do not match."
      );

      return;
    }

    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch(
        `${API_URL}/users/me/password`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            current_password:
              currentPassword,

            new_password:
              newPassword,
          }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem(
          "lumina_access_token"
        );

        router.replace("/login");
        return;
      }

      if (!response.ok) {
        let detail =
          "Unable to change password.";

        try {
          const data =
            await response.json();

          if (
            typeof data.detail ===
            "string"
          ) {
            detail =
              data.detail;
          }

        } catch {
          // Keep fallback.
        }

        throw new Error(
          detail
        );
      }

      const data: MessageResponse =
        await response.json();

      setPasswordSuccess(
        data.message
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

    } catch (err) {
      if (err instanceof Error) {
        setPasswordError(
          err.message
        );
      }

    } finally {
      setChangingPassword(false);
    }
  }


  async function deleteAccount(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!deletePassword.trim()) {
      setDeleteError(
        "Enter your password to confirm account deletion."
      );

      return;
    }

    const confirmed =
      window.confirm(
        "This permanently deletes your Lumina account and associated data. Continue?"
      );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setDeleting(true);
    setDeleteError("");

    try {
      const response = await fetch(
        `${API_URL}/users/me`,
        {
          method: "DELETE",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            password:
              deletePassword,
          }),
        }
      );

      if (!response.ok) {
        let detail =
          "Unable to delete account.";

        try {
          const data =
            await response.json();

          if (
            typeof data.detail ===
            "string"
          ) {
            detail =
              data.detail;
          }

        } catch {
          // Keep fallback.
        }

        throw new Error(
          detail
        );
      }

      localStorage.removeItem(
        "lumina_access_token"
      );

      router.replace("/login");

    } catch (err) {
      if (err instanceof Error) {
        setDeleteError(
          err.message
        );
      }

    } finally {
      setDeleting(false);
    }
  }


  function signOut() {
    localStorage.removeItem(
      "lumina_access_token"
    );

    router.replace("/login");
  }


  function getInitials(
    name: string
  ) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part[0]?.toUpperCase()
      )
      .join("");
  }


  if (!ready) {
    return null;
  }


  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050708] text-white">

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:px-10 md:py-8">


        <button
          type="button"
          onClick={() =>
            router.push("/app")
          }
          className="flex items-center gap-2 text-sm text-white/45 transition hover:text-white"
        >

          <ArrowLeft className="h-4 w-4" />

          Back to Lumina

        </button>


        <div className="mt-8">


          <p className="text-xs uppercase tracking-[0.2em] text-white/35">

            Account

          </p>


          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">

            Your profile

          </h1>


          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">

            View your account information, manage security, and control your Lumina account.

          </p>

        </div>


        {error && (

          <div className="mt-6 rounded-2xl border border-red-400/15 bg-red-400/10 px-4 py-4 text-sm text-red-200">

            {error}

          </div>

        )}


        {loading || !profile ? (

          <div className="mt-12 flex items-center justify-center py-20">

            <Loader2 className="h-7 w-7 animate-spin text-white/45" />

          </div>

        ) : (

          <div className="mt-8 space-y-6 sm:mt-10">


            {/* PROFILE CARD */}

            <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:rounded-[30px] sm:p-7 md:p-8">


              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">


                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] border border-white/10 bg-white text-2xl font-semibold text-black">

                  {getInitials(
                    profile.full_name
                  )}

                </div>


                <div className="min-w-0 flex-1">

                  <h2 className="break-words text-2xl font-semibold">

                    {profile.full_name}

                  </h2>


                  <div className="mt-2 flex items-center gap-2 text-sm text-white/45">

                    <Mail className="h-4 w-4 shrink-0" />

                    <span className="break-all">

                      {profile.email}

                    </span>

                  </div>


                  <div className="mt-4 flex flex-wrap gap-2">

                    <div
                      className={
                        profile.is_active
                          ? "flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-200"
                          : "flex items-center gap-2 rounded-full border border-red-400/15 bg-red-400/10 px-3 py-1.5 text-xs text-red-200"
                      }
                    >

                      <CheckCircle2 className="h-3.5 w-3.5" />

                      {profile.is_active
                        ? "Active account"
                        : "Inactive account"}

                    </div>


                    <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/45">

                      Member since{" "}

                      {new Date(
                        profile.created_at
                      ).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}

                    </div>

                  </div>

                </div>

              </div>


              <div className="mt-7 grid gap-3 sm:grid-cols-2">


                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">

                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/35">

                    <UserRound className="h-4 w-4" />

                    Account ID

                  </div>


                  <p className="mt-2 font-medium">

                    #{profile.id}

                  </p>

                </div>


                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">

                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/35">

                    <ShieldCheck className="h-4 w-4" />

                    Status

                  </div>


                  <p className="mt-2 font-medium">

                    {profile.is_active
                      ? "Verified and active"
                      : "Inactive"}

                  </p>

                </div>

              </div>

            </section>


            {/* SECURITY */}

            <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:rounded-[30px] sm:p-7 md:p-8">


              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">

                  <KeyRound className="h-5 w-5 text-white/70" />

                </div>


                <div>

                  <h2 className="font-semibold">

                    Password & security

                  </h2>


                  <p className="mt-1 text-sm leading-6 text-white/40">

                    Change your password regularly to help keep your Lumina account secure.

                  </p>

                </div>

              </div>


              {passwordError && (

                <div className="mt-5 rounded-2xl border border-red-400/15 bg-red-400/10 px-4 py-3 text-sm text-red-200">

                  {passwordError}

                </div>

              )}


              {passwordSuccess && (

                <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">

                  <CheckCircle2 className="h-4 w-4 shrink-0" />

                  {passwordSuccess}

                </div>

              )}


              <form
                onSubmit={
                  changePassword
                }
                className="mt-6 space-y-4"
              >


                <div>

                  <label className="text-xs uppercase tracking-[0.16em] text-white/35">

                    Current password

                  </label>


                  <input
                    type="password"
                    value={
                      currentPassword
                    }
                    onChange={(
                      event
                    ) =>
                      setCurrentPassword(
                        event.target.value
                      )
                    }
                    autoComplete="current-password"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-white/20"
                    placeholder="Enter current password"
                  />

                </div>


                <div className="grid gap-4 md:grid-cols-2">


                  <div>

                    <label className="text-xs uppercase tracking-[0.16em] text-white/35">

                      New password

                    </label>


                    <input
                      type="password"
                      value={
                        newPassword
                      }
                      onChange={(
                        event
                      ) =>
                        setNewPassword(
                          event.target.value
                        )
                      }
                      autoComplete="new-password"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-white/20"
                      placeholder="At least 8 characters"
                    />

                  </div>


                  <div>

                    <label className="text-xs uppercase tracking-[0.16em] text-white/35">

                      Confirm new password

                    </label>


                    <input
                      type="password"
                      value={
                        confirmNewPassword
                      }
                      onChange={(
                        event
                      ) =>
                        setConfirmNewPassword(
                          event.target.value
                        )
                      }
                      autoComplete="new-password"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-white/20"
                      placeholder="Repeat new password"
                    />

                  </div>

                </div>


                <div className="flex justify-stretch pt-2 sm:justify-end">

                  <button
                    type="submit"
                    disabled={
                      changingPassword
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-black disabled:opacity-50 sm:w-auto"
                  >

                    {changingPassword && (

                      <Loader2 className="h-4 w-4 animate-spin" />

                    )}

                    {changingPassword
                      ? "Changing..."
                      : "Change password"}

                  </button>

                </div>

              </form>

            </section>


            {/* SESSION */}

            <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:rounded-[30px] sm:p-7 md:p-8">


              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">


                <div>

                  <h2 className="font-semibold">

                    Current session

                  </h2>


                  <p className="mt-1 text-sm leading-6 text-white/40">

                    Sign out of Lumina on this browser.

                  </p>

                </div>


                <button
                  type="button"
                  onClick={
                    signOut
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-white/75 transition hover:bg-white/10 hover:text-white sm:w-auto"
                >

                  <LogOut className="h-4 w-4" />

                  Sign out

                </button>

              </div>

            </section>


            {/* DANGER ZONE */}

            <section className="rounded-[24px] border border-red-400/15 bg-red-400/[0.04] p-5 sm:rounded-[30px] sm:p-7 md:p-8">


              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-400/10">

                  <AlertTriangle className="h-5 w-5 text-red-300" />

                </div>


                <div>

                  <h2 className="font-semibold text-red-100">

                    Danger zone

                  </h2>


                  <p className="mt-1 text-sm leading-6 text-red-100/50">

                    Account deletion is permanent. Your account cannot be restored after deletion.

                  </p>

                </div>

              </div>


              {!showDeletePanel ? (

                <button
                  type="button"
                  onClick={() => {
                    setShowDeletePanel(
                      true
                    );

                    setDeleteError("");
                  }}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-3 text-red-200 transition hover:bg-red-400/15 sm:w-auto"
                >

                  <Trash2 className="h-4 w-4" />

                  Delete account

                </button>

              ) : (

                <form
                  onSubmit={
                    deleteAccount
                  }
                  className="mt-6 rounded-2xl border border-red-400/15 bg-black/20 p-4"
                >


                  <p className="text-sm leading-6 text-red-100/70">

                    Enter your password to confirm permanent account deletion.

                  </p>


                  {deleteError && (

                    <div className="mt-4 rounded-xl bg-red-400/10 px-4 py-3 text-sm text-red-200">

                      {deleteError}

                    </div>

                  )}


                  <input
                    type="password"
                    value={
                      deletePassword
                    }
                    onChange={(
                      event
                    ) =>
                      setDeletePassword(
                        event.target.value
                      )
                    }
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="mt-4 w-full rounded-2xl border border-red-400/15 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/25"
                  />


                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">


                    <button
                      type="button"
                      onClick={() => {
                        setShowDeletePanel(
                          false
                        );

                        setDeletePassword("");
                        setDeleteError("");
                      }}
                      className="rounded-2xl border border-white/10 px-5 py-3 text-white/65 transition hover:bg-white/[0.05]"
                    >

                      Cancel

                    </button>


                    <button
                      type="submit"
                      disabled={
                        deleting
                      }
                      className="flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-3 font-medium text-white transition hover:bg-red-400 disabled:opacity-50"
                    >

                      {deleting ? (

                        <Loader2 className="h-4 w-4 animate-spin" />

                      ) : (

                        <Trash2 className="h-4 w-4" />

                      )}

                      {deleting
                        ? "Deleting..."
                        : "Permanently delete"}

                    </button>

                  </div>

                </form>

              )}

            </section>


            <div className="h-8" />

          </div>

        )}

      </div>

    </main>
  );
}