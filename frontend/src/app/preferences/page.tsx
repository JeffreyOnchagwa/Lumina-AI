"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

import {
  Accessibility,
  ArrowLeft,
  Check,
  Languages,
  Loader2,
  Save,
  Settings,
  Type,
  Volume2,
} from "lucide-react";


type UserPreferences = {
  id: number;
  user_id: number;
  preferred_voice: string;
  speech_speed: number;
  font_size: number;
  dyslexia_mode: boolean;
  high_contrast_mode: boolean;
  preferred_language: string;
};


export default function PreferencesPage() {
  const router = useRouter();

  const [ready, setReady] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState("");

  const [preferences, setPreferences] =
    useState<UserPreferences | null>(null);

  const [availableVoices, setAvailableVoices] =
    useState<SpeechSynthesisVoice[]>([]);


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

    void loadPreferences();
  }, [router]);


  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    function loadVoices() {
      const voices =
        window.speechSynthesis.getVoices();

      setAvailableVoices(
        voices
      );
    }

    loadVoices();

    window.speechSynthesis.onvoiceschanged =
      loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged =
        null;
    };
  }, []);


  async function loadPreferences() {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/preferences/`,
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
          "Unable to load preferences."
        );
      }

      const data: UserPreferences =
        await response.json();

      setPreferences(
        data
      );

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


  async function savePreferences() {
    if (!preferences) {
      return;
    }

    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/preferences/`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            preferred_voice:
              preferences.preferred_voice,

            speech_speed:
              preferences.speech_speed,

            font_size:
              preferences.font_size,

            dyslexia_mode:
              preferences.dyslexia_mode,

            high_contrast_mode:
              preferences.high_contrast_mode,

            preferred_language:
              preferences.preferred_language,
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
          "Unable to save preferences.";

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

      const data: UserPreferences =
        await response.json();

      setPreferences(
        data
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2000);

    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message
        );
      }

    } finally {
      setSaving(false);
    }
  }


  function testVoice() {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      !preferences
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        "Hello. This is your selected Lumina voice."
      );

    const voice =
      availableVoices.find(
        (item) =>
          item.name ===
          preferences.preferred_voice
      );

    if (voice) {
      utterance.voice =
        voice;
    }

    utterance.rate =
      preferences.speech_speed;

    window.speechSynthesis.speak(
      utterance
    );
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


          <div className="flex items-start gap-3 sm:items-center">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">

              <Settings className="h-5 w-5" />

            </div>


            <div className="min-w-0">

              <p className="text-xs uppercase tracking-[0.2em] text-white/35">

                Personalization

              </p>

              <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">

                Preferences

              </h1>

            </div>

          </div>


          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">

            Customize how Lumina speaks, displays text, and adapts the interface to your needs.

          </p>

        </div>


        {error && (

          <div className="mt-6 rounded-2xl border border-red-400/15 bg-red-400/10 px-4 py-4 text-sm text-red-200 sm:px-5">

            {error}

          </div>

        )}


        {loading || !preferences ? (

          <div className="mt-12 flex items-center justify-center py-20">

            <Loader2 className="h-7 w-7 animate-spin text-white/45" />

          </div>

        ) : (

          <div className="mt-8 space-y-5 sm:mt-10 sm:space-y-6">


            {/* VOICE */}

            <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl sm:rounded-[30px] sm:p-6 md:p-8">


              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">

                  <Volume2 className="h-5 w-5 text-white/70" />

                </div>


                <div>

                  <h2 className="font-semibold">

                    Voice

                  </h2>

                  <p className="mt-1 text-sm leading-6 text-white/40">

                    Choose how Lumina sounds when reading responses aloud.

                  </p>

                </div>

              </div>


              <div className="mt-6 grid gap-6 md:grid-cols-2">


                <div className="min-w-0">

                  <label className="text-xs uppercase tracking-[0.18em] text-white/35">

                    Preferred voice

                  </label>


                  <select
                    value={
                      preferences.preferred_voice
                    }
                    onChange={(
                      event
                    ) =>
                      setPreferences({
                        ...preferences,

                        preferred_voice:
                          event.target.value,
                      })
                    }
                    className="mt-3 w-full min-w-0 rounded-2xl border border-white/10 bg-[#111315] px-4 py-3 text-sm text-white outline-none"
                  >

                    {availableVoices.length ===
                    0 ? (

                      <option
                        value={
                          preferences.preferred_voice
                        }
                      >

                        {preferences.preferred_voice}

                      </option>

                    ) : (

                      availableVoices.map(
                        (voice) => (

                          <option
                            key={`${voice.name}-${voice.lang}`}
                            value={
                              voice.name
                            }
                          >

                            {voice.name} ({voice.lang})

                          </option>

                        )
                      )

                    )}

                  </select>


                  <button
                    type="button"
                    onClick={
                      testVoice
                    }
                    className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white/65 transition hover:bg-white/10 hover:text-white sm:w-auto"
                  >

                    Test voice

                  </button>

                </div>


                <div>

                  <div className="flex items-center justify-between gap-4">

                    <label className="text-xs uppercase tracking-[0.18em] text-white/35">

                      Speech speed

                    </label>


                    <span className="text-sm text-white/50">

                      {preferences.speech_speed.toFixed(
                        1
                      )}x

                    </span>

                  </div>


                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={
                      preferences.speech_speed
                    }
                    onChange={(
                      event
                    ) =>
                      setPreferences({
                        ...preferences,

                        speech_speed:
                          Number(
                            event.target.value
                          ),
                      })
                    }
                    className="mt-5 w-full"
                  />

                </div>

              </div>

            </section>


            {/* LANGUAGE */}

            <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl sm:rounded-[30px] sm:p-6 md:p-8">


              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">

                  <Languages className="h-5 w-5 text-white/70" />

                </div>


                <div>

                  <h2 className="font-semibold">

                    Language

                  </h2>

                  <p className="mt-1 text-sm leading-6 text-white/40">

                    Set your preferred language for Lumina.

                  </p>

                </div>

              </div>


              <div className="mt-6 max-w-md">

                <label className="text-xs uppercase tracking-[0.18em] text-white/35">

                  Preferred language

                </label>


                <select
                  value={
                    preferences.preferred_language
                  }
                  onChange={(
                    event
                  ) =>
                    setPreferences({
                      ...preferences,

                      preferred_language:
                        event.target.value,
                    })
                  }
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-[#111315] px-4 py-3 text-sm text-white outline-none"
                >

                  <option value="en">
                    English
                  </option>

                  <option value="sw">
                    Kiswahili
                  </option>

                  <option value="fr">
                    French
                  </option>

                  <option value="de">
                    German
                  </option>

                  <option value="es">
                    Spanish
                  </option>

                  <option value="ar">
                    Arabic
                  </option>

                </select>

              </div>

            </section>


            {/* READING */}

            <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl sm:rounded-[30px] sm:p-6 md:p-8">


              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">

                  <Type className="h-5 w-5 text-white/70" />

                </div>


                <div>

                  <h2 className="font-semibold">

                    Reading

                  </h2>

                  <p className="mt-1 text-sm leading-6 text-white/40">

                    Adjust text size and reading accessibility.

                  </p>

                </div>

              </div>


              <div className="mt-6">


                <div className="flex items-center justify-between gap-4">

                  <label className="text-xs uppercase tracking-[0.18em] text-white/35">

                    Font size

                  </label>


                  <span className="text-sm text-white/50">

                    {preferences.font_size}px

                  </span>

                </div>


                <input
                  type="range"
                  min="12"
                  max="48"
                  step="1"
                  value={
                    preferences.font_size
                  }
                  onChange={(
                    event
                  ) =>
                    setPreferences({
                      ...preferences,

                      font_size:
                        Number(
                          event.target.value
                        ),
                    })
                  }
                  className="mt-5 w-full"
                />

              </div>

            </section>


            {/* ACCESSIBILITY */}

            <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl sm:rounded-[30px] sm:p-6 md:p-8">


              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">

                  <Accessibility className="h-5 w-5 text-white/70" />

                </div>


                <div>

                  <h2 className="font-semibold">

                    Accessibility

                  </h2>

                  <p className="mt-1 text-sm leading-6 text-white/40">

                    Make Lumina easier and more comfortable to use.

                  </p>

                </div>

              </div>


              <div className="mt-6 space-y-4">


                <label className="flex cursor-pointer flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">


                  <div className="min-w-0">

                    <p className="font-medium">

                      Dyslexia-friendly mode

                    </p>

                    <p className="mt-1 text-sm leading-6 text-white/40">

                      Increase spacing and improve text readability.

                    </p>

                  </div>


                  <input
                    type="checkbox"
                    checked={
                      preferences.dyslexia_mode
                    }
                    onChange={(
                      event
                    ) =>
                      setPreferences({
                        ...preferences,

                        dyslexia_mode:
                          event.target.checked,
                      })
                    }
                    className="h-5 w-5 shrink-0"
                  />

                </label>


                <label className="flex cursor-pointer flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">


                  <div className="min-w-0">

                    <p className="font-medium">

                      High contrast mode

                    </p>

                    <p className="mt-1 text-sm leading-6 text-white/40">

                      Increase contrast between text and interface elements.

                    </p>

                  </div>


                  <input
                    type="checkbox"
                    checked={
                      preferences.high_contrast_mode
                    }
                    onChange={(
                      event
                    ) =>
                      setPreferences({
                        ...preferences,

                        high_contrast_mode:
                          event.target.checked,
                      })
                    }
                    className="h-5 w-5 shrink-0"
                  />

                </label>

              </div>

            </section>


            {/* SAVE */}

            <div className="sticky bottom-0 z-20 -mx-4 border-t border-white/10 bg-[#050708]/90 px-4 py-4 backdrop-blur-xl sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-10 sm:pt-0 sm:backdrop-blur-none">


              <div className="flex justify-stretch sm:justify-end">

                <button
                  type="button"
                  disabled={
                    saving
                  }
                  onClick={
                    savePreferences
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-black transition disabled:opacity-50 sm:w-auto"
                >

                  {saving ? (

                    <Loader2 className="h-4 w-4 animate-spin" />

                  ) : saved ? (

                    <Check className="h-4 w-4" />

                  ) : (

                    <Save className="h-4 w-4" />

                  )}


                  {saving
                    ? "Saving..."
                    : saved
                    ? "Saved"
                    : "Save preferences"}

                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </main>
  );
}