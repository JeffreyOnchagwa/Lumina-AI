"use client";

import {
  BrainCircuit,
  FileText,
  History,
  LogOut,
  Menu,
  MessageSquare,
  Mic,
  Settings,
  UserRound,
  X,
} from "lucide-react";

import { useState } from "react";
import { useRouter } from "next/navigation";

type MobileNavProps = {
  mode: "voice" | "text";
  onModeChange: (
    mode: "voice" | "text"
  ) => void;
  onLogout: () => void;
};

export default function MobileNav({
  mode,
  onModeChange,
  onLogout,
}: MobileNavProps) {
  const router = useRouter();

  const [open, setOpen] =
    useState(false);

  function closeMenu() {
    setOpen(false);
  }

  function changeMode(
    nextMode:
      | "voice"
      | "text"
  ) {
    onModeChange(
      nextMode
    );

    closeMenu();
  }

  function goTo(
    path: string
  ) {
    router.push(
      path
    );

    closeMenu();
  }

  function logout() {
    closeMenu();
    onLogout();
  }

  return (
    <>
      {/* MOBILE TOP BAR */}

      <div className="flex items-center justify-between border-b border-white/10 bg-black/30 px-5 py-4 backdrop-blur-xl lg:hidden">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">

            <BrainCircuit className="h-5 w-5" />

          </div>

          <div>

            <p className="font-semibold">
              Lumina AI
            </p>

            <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
              Intelligent voice
            </p>

          </div>

        </div>


        <button
          type="button"
          onClick={() =>
            setOpen(true)
          }
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white"
          aria-label="Open menu"
        >

          <Menu className="h-5 w-5" />

        </button>

      </div>


      {/* OVERLAY */}

      {open && (

        <div className="fixed inset-0 z-[100] lg:hidden">

          <button
            type="button"
            aria-label="Close menu"
            onClick={
              closeMenu
            }
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />


          {/* DRAWER */}

          <div className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col border-l border-white/10 bg-[#080a0b] p-5 shadow-2xl">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">

                  <BrainCircuit className="h-5 w-5" />

                </div>


                <div>

                  <p className="font-semibold">
                    Lumina AI
                  </p>

                  <p className="text-xs text-white/35">
                    Workspace
                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={
                  closeMenu
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]"
                aria-label="Close menu"
              >

                <X className="h-5 w-5" />

              </button>

            </div>


            {/* NAVIGATION */}

            <nav className="mt-10 space-y-2">

              <button
                type="button"
                onClick={() =>
                  changeMode(
                    "voice"
                  )
                }
                className={
                  mode ===
                  "voice"
                    ? "flex w-full items-center gap-3 rounded-2xl bg-white/10 px-4 py-3.5 text-left text-white"
                    : "flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-white/55 transition hover:bg-white/[0.05] hover:text-white"
                }
              >

                <Mic className="h-5 w-5" />

                Voice

              </button>


              <button
                type="button"
                onClick={() =>
                  changeMode(
                    "text"
                  )
                }
                className={
                  mode ===
                  "text"
                    ? "flex w-full items-center gap-3 rounded-2xl bg-white/10 px-4 py-3.5 text-left text-white"
                    : "flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-white/55 transition hover:bg-white/[0.05] hover:text-white"
                }
              >

                <MessageSquare className="h-5 w-5" />

                Chat

              </button>


              <button
                type="button"
                onClick={() =>
                  goTo(
                    "/documents"
                  )
                }
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-white/55 transition hover:bg-white/[0.05] hover:text-white"
              >

                <FileText className="h-5 w-5" />

                Documents

              </button>


              <button
                type="button"
                onClick={() =>
                  goTo(
                    "/preferences"
                  )
                }
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-white/55 transition hover:bg-white/[0.05] hover:text-white"
              >

                <Settings className="h-5 w-5" />

                Preferences

              </button>


              <button
                type="button"
                onClick={() =>
                  goTo(
                    "/profile"
                  )
                }
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-white/55 transition hover:bg-white/[0.05] hover:text-white"
              >

                <UserRound className="h-5 w-5" />

                Profile

              </button>


              <button
                type="button"
                onClick={() => {
                  changeMode(
                    "text"
                  );
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-white/55 transition hover:bg-white/[0.05] hover:text-white"
              >

                <History className="h-5 w-5" />

                Conversation history

              </button>

            </nav>


            <div className="mt-auto border-t border-white/10 pt-5">

              <button
                type="button"
                onClick={
                  logout
                }
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-white/45 transition hover:bg-white/[0.05] hover:text-white"
              >

                <LogOut className="h-5 w-5" />

                Sign out

              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}