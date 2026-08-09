"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

import {
  BrainCircuit,
  FileText,
  LogOut,
  MessageSquare,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Send,
  Settings,
  Sparkles,
  Square,
  Volume2,
  Waves,
} from "lucide-react";


type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};


type ChatResponse = {
  response: string;
  conversation_id: number;
};


type VoiceResponse = {
  transcript: string;
  response: string;
  conversation_id: number;
  audio_available: boolean;
};


export default function AppPage() {
  const router = useRouter();

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const audioChunksRef =
    useRef<Blob[]>([]);

  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const audioUrlRef =
    useRef<string | null>(null);

  const [ready, setReady] = useState(false);

  const [mode, setMode] =
    useState<"voice" | "text">("voice");

  const [recording, setRecording] =
    useState(false);

  const [processingVoice, setProcessingVoice] =
    useState(false);

  const [generatingAudio, setGeneratingAudio] =
    useState(false);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [voiceError, setVoiceError] =
    useState("");

  const [liveTranscript, setLiveTranscript] =
    useState("");

  const [voiceResponse, setVoiceResponse] =
    useState("");

  const [audioAvailable, setAudioAvailable] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [conversationId, setConversationId] =
    useState<number | null>(null);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);


  useEffect(() => {
    const token = localStorage.getItem(
      "lumina_access_token"
    );

    if (!token) {
      router.replace("/login");
      return;
    }

    setReady(true);
  }, [router]);


  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      if (audioUrlRef.current) {
        URL.revokeObjectURL(
          audioUrlRef.current
        );
      }
    };
  }, []);


  function stopCurrentAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsPlaying(false);
  }


  function clearAudio() {
    stopCurrentAudio();

    if (audioUrlRef.current) {
      URL.revokeObjectURL(
        audioUrlRef.current
      );

      audioUrlRef.current = null;
    }

    audioRef.current = null;

    setAudioAvailable(false);
  }


  function logout() {
    clearAudio();

    localStorage.removeItem(
      "lumina_access_token"
    );

    router.push("/login");
  }


  function startNewChat() {
    clearAudio();

    setConversationId(null);
    setMessages([]);
    setMessage("");
    setError("");

    setLiveTranscript("");
    setVoiceResponse("");
    setVoiceError("");
  }


  async function speakText(
    text: string
  ) {
    const token = localStorage.getItem(
      "lumina_access_token"
    );

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!text.trim()) {
      return;
    }

    setGeneratingAudio(true);
    setVoiceError("");

    try {
      stopCurrentAudio();

      if (audioUrlRef.current) {
        URL.revokeObjectURL(
          audioUrlRef.current
        );

        audioUrlRef.current = null;
      }

      const formData = new FormData();

      formData.append(
        "text",
        text
      );

      const response = await fetch(
        "http://127.0.0.1:8000/voice/speak",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
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
          "Unable to generate voice audio.";

        try {
          const data =
            await response.json();

          if (
            typeof data.detail ===
            "string"
          ) {
            detail = data.detail;
          }
        } catch {
          // Use fallback error.
        }

        throw new Error(detail);
      }

      const audioBlob =
        await response.blob();

      const audioUrl =
        URL.createObjectURL(
          audioBlob
        );

      audioUrlRef.current =
        audioUrl;

      const audio =
        new Audio(audioUrl);

      audioRef.current =
        audio;

      audio.onplay = () => {
        setIsPlaying(true);
      };

      audio.onpause = () => {
        setIsPlaying(false);
      };

      audio.onended = () => {
        setIsPlaying(false);
      };

      setAudioAvailable(true);

      try {
        await audio.play();
      } catch {
        /*
          Some browsers may block automatic
          playback after asynchronous processing.

          The audio is still ready and the user
          can press the Play button manually.
        */
        setIsPlaying(false);
      }
    } catch (err) {
      if (err instanceof Error) {
        setVoiceError(
          err.message
        );
      } else {
        setVoiceError(
          "Unable to play Lumina's voice."
        );
      }
    } finally {
      setGeneratingAudio(false);
    }
  }


  function toggleAudioPlayback() {
    const audio =
      audioRef.current;

    if (!audio) {
      if (voiceResponse) {
        void speakText(
          voiceResponse
        );
      }

      return;
    }

    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  }


  function replayAudio() {
    const audio =
      audioRef.current;

    if (!audio) {
      if (voiceResponse) {
        void speakText(
          voiceResponse
        );
      }

      return;
    }

    audio.currentTime = 0;

    void audio.play();
  }


  async function startRecording() {
    setVoiceError("");
    setLiveTranscript("");
    setVoiceResponse("");

    clearAudio();

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      let mimeType = "";

      if (
        MediaRecorder.isTypeSupported(
          "audio/webm;codecs=opus"
        )
      ) {
        mimeType =
          "audio/webm;codecs=opus";
      } else if (
        MediaRecorder.isTypeSupported(
          "audio/webm"
        )
      ) {
        mimeType =
          "audio/webm";
      } else if (
        MediaRecorder.isTypeSupported(
          "audio/ogg;codecs=opus"
        )
      ) {
        mimeType =
          "audio/ogg;codecs=opus";
      }

      const recorder =
        mimeType
          ? new MediaRecorder(
              stream,
              {
                mimeType,
              }
            )
          : new MediaRecorder(
              stream
            );

      audioChunksRef.current = [];

      recorder.ondataavailable = (
        event: BlobEvent
      ) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(
            event.data
          );
        }
      };

      recorder.onstop = async () => {
        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        const finalMimeType =
          recorder.mimeType ||
          mimeType ||
          "audio/webm";

        const audioBlob =
          new Blob(
            audioChunksRef.current,
            {
              type:
                finalMimeType,
            }
          );

        await sendVoiceMessage(
          audioBlob
        );
      };

      mediaRecorderRef.current =
        recorder;

      recorder.start();

      setRecording(true);
    } catch {
      setVoiceError(
        "Microphone access was denied or is unavailable."
      );
    }
  }


  function stopRecording() {
    const recorder =
      mediaRecorderRef.current;

    if (!recorder) {
      return;
    }

    if (
      recorder.state !==
      "inactive"
    ) {
      recorder.stop();
    }

    setRecording(false);
  }


  async function sendVoiceMessage(
    audioBlob: Blob
  ) {
    const token =
      localStorage.getItem(
        "lumina_access_token"
      );

    if (!token) {
      router.replace("/login");
      return;
    }

    setProcessingVoice(true);
    setVoiceError("");

    try {
      const formData =
        new FormData();

      let extension = "webm";

      if (
        audioBlob.type.includes(
          "ogg"
        )
      ) {
        extension = "ogg";
      }

      formData.append(
        "file",
        audioBlob,
        `voice-message.${extension}`
      );

      if (
        conversationId !== null
      ) {
        formData.append(
          "conversation_id",
          String(
            conversationId
          )
        );
      }

      const response =
        await fetch(
          "http://127.0.0.1:8000/voice/chat",
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
            body: formData,
          }
        );

      if (
        response.status === 401
      ) {
        localStorage.removeItem(
          "lumina_access_token"
        );

        router.replace(
          "/login"
        );

        return;
      }

      if (!response.ok) {
        let detail =
          "Unable to process voice message.";

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

      const data: VoiceResponse =
        await response.json();

      setConversationId(
        data.conversation_id
      );

      setLiveTranscript(
        data.transcript
      );

      setVoiceResponse(
        data.response
      );

      setMessages(
        (current) => [
          ...current,
          {
            role: "user",
            content:
              data.transcript,
          },
          {
            role: "assistant",
            content:
              data.response,
          },
        ]
      );

      if (
        data.audio_available
      ) {
        await speakText(
          data.response
        );
      }
    } catch (err) {
      if (
        err instanceof Error
      ) {
        setVoiceError(
          err.message
        );
      } else {
        setVoiceError(
          "Something went wrong while processing your voice."
        );
      }
    } finally {
      setProcessingVoice(
        false
      );
    }
  }


  async function sendMessage(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedMessage =
      message.trim();

    if (
      !trimmedMessage ||
      sending
    ) {
      return;
    }

    const token =
      localStorage.getItem(
        "lumina_access_token"
      );

    if (!token) {
      router.replace("/login");
      return;
    }

    setError("");
    setSending(true);

    setMessages(
      (current) => [
        ...current,
        {
          role: "user",
          content:
            trimmedMessage,
        },
      ]
    );

    setMessage("");

    try {
      const response =
        await fetch(
          "http://127.0.0.1:8000/chat/",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization:
                `Bearer ${token}`,
            },
            body: JSON.stringify({
              message:
                trimmedMessage,
              conversation_id:
                conversationId,
            }),
          }
        );

      if (
        response.status === 401
      ) {
        localStorage.removeItem(
          "lumina_access_token"
        );

        router.replace(
          "/login"
        );

        return;
      }

      if (!response.ok) {
        let detail =
          "Unable to send message.";

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

      const data: ChatResponse =
        await response.json();

      setConversationId(
        data.conversation_id
      );

      setMessages(
        (current) => [
          ...current,
          {
            role: "assistant",
            content:
              data.response,
          },
        ]
      );
    } catch (err) {
      if (
        err instanceof Error
      ) {
        setError(
          err.message
        );
      } else {
        setError(
          "Something went wrong while talking to Lumina."
        );
      }
    } finally {
      setSending(false);
    }
  }


  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050708] text-white">
        <div className="flex items-center gap-3 text-white/60">
          <Sparkles className="h-5 w-5 animate-pulse" />

          Loading Lumina...
        </div>
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-[#050708] text-white">
      <div className="flex min-h-screen">

        <aside className="hidden w-72 shrink-0 border-r border-white/8 bg-black/20 p-5 backdrop-blur-xl lg:block">

          <div className="flex h-full flex-col">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                <BrainCircuit className="h-5 w-5" />
              </div>

              <div>
                <div className="font-semibold">
                  Lumina AI
                </div>

                <div className="text-xs uppercase tracking-[0.18em] text-white/35">
                  Voice workspace
                </div>
              </div>

            </div>


            <nav className="mt-10 space-y-2">

              <button
                onClick={() =>
                  setMode("voice")
                }
                className={
                  mode === "voice"
                    ? "flex w-full items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-left"
                    : "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-white/55 transition hover:bg-white/[0.05] hover:text-white"
                }
              >
                <Mic className="h-4 w-4" />
                Voice
              </button>

              <button
                onClick={() =>
                  setMode("text")
                }
                className={
                  mode === "text"
                    ? "flex w-full items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-left"
                    : "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-white/55 transition hover:bg-white/[0.05] hover:text-white"
                }
              >
                <MessageSquare className="h-4 w-4" />
                Chat
              </button>

              <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-white/55 transition hover:bg-white/[0.05] hover:text-white">
                <FileText className="h-4 w-4" />
                Documents
              </button>

              <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-white/55 transition hover:bg-white/[0.05] hover:text-white">
                <Settings className="h-4 w-4" />
                Preferences
              </button>

            </nav>


            <div className="mt-auto">

              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-white/45 transition hover:bg-white/[0.05] hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>

            </div>

          </div>

        </aside>


        <section className="flex-1 overflow-hidden">

          <div className="relative min-h-screen">

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute left-1/2 top-[12%] h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-white/[0.025] blur-[190px]" />
            </div>


            <div className="relative z-10 mx-auto max-w-6xl px-6 py-8 md:px-10">

              <div className="flex items-center justify-between gap-6">

                <div>

                  <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                    Lumina workspace
                  </p>

                  <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] md:text-4xl">
                    {mode === "voice"
                      ? "Talk to Lumina."
                      : "Chat with Lumina."}
                  </h1>

                </div>


                <motion.button
                  onClick={
                    startNewChat
                  }
                  whileHover={{
                    scale: 1.04,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/70 backdrop-blur-xl"
                >
                  New conversation
                </motion.button>

              </div>


              {mode === "voice" ? (

                <motion.section
                  initial={{
                    opacity: 0,
                    scale: 0.96,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.7,
                  }}
                  className="mt-12"
                >

                  <div className="flex min-h-[520px] flex-col items-center justify-center">


                    <div className="relative flex h-[340px] w-[340px] items-center justify-center">

                      <motion.div
                        animate={
                          recording
                            ? {
                                scale: [
                                  1,
                                  1.14,
                                  1,
                                ],
                                opacity: [
                                  0.4,
                                  0.08,
                                  0.4,
                                ],
                              }
                            : isPlaying
                            ? {
                                scale: [
                                  1,
                                  1.1,
                                  1,
                                ],
                              }
                            : {
                                scale: [
                                  1,
                                  1.035,
                                  1,
                                ],
                              }
                        }
                        transition={{
                          duration:
                            recording
                              ? 1.1
                              : isPlaying
                              ? 1.7
                              : 4,
                          repeat:
                            Infinity,
                          ease:
                            "easeInOut",
                        }}
                        className="absolute h-[310px] w-[310px] rounded-full border border-white/10 bg-white/[0.025]"
                      />


                      <motion.div
                        animate={
                          recording
                            ? {
                                scale: [
                                  1,
                                  1.18,
                                  1,
                                ],
                                rotate: [
                                  0,
                                  6,
                                  -6,
                                  0,
                                ],
                              }
                            : isPlaying
                            ? {
                                scale: [
                                  1,
                                  1.08,
                                  1,
                                ],
                                rotate: [
                                  0,
                                  2,
                                  -2,
                                  0,
                                ],
                              }
                            : {
                                y: [
                                  0,
                                  -8,
                                  0,
                                ],
                              }
                        }
                        transition={{
                          duration:
                            recording
                              ? 1.5
                              : isPlaying
                              ? 2
                              : 5,
                          repeat:
                            Infinity,
                          ease:
                            "easeInOut",
                        }}
                        className="absolute h-[235px] w-[235px] rounded-full border border-white/15 bg-black/30 shadow-[0_0_100px_rgba(255,255,255,0.06)] backdrop-blur-2xl"
                      />


                      <motion.button
                        type="button"
                        onClick={
                          recording
                            ? stopRecording
                            : startRecording
                        }
                        disabled={
                          processingVoice ||
                          generatingAudio
                        }
                        whileHover={{
                          scale: 1.06,
                        }}
                        whileTap={{
                          scale: 0.94,
                        }}
                        className="relative z-10 flex h-32 w-32 items-center justify-center rounded-full bg-white text-black shadow-[0_20px_80px_rgba(255,255,255,0.15)] disabled:cursor-not-allowed disabled:opacity-60"
                      >

                        {processingVoice ||
                        generatingAudio ? (
                          <Waves className="h-10 w-10 animate-pulse" />
                        ) : recording ? (
                          <Square className="h-9 w-9 fill-current" />
                        ) : (
                          <Mic className="h-10 w-10" />
                        )}

                      </motion.button>

                    </div>


                    <div className="mt-3 text-center">

                      <h2 className="text-2xl font-semibold">
                        {processingVoice
                          ? "Lumina is thinking..."
                          : generatingAudio
                          ? "Preparing voice..."
                          : recording
                          ? "Listening..."
                          : isPlaying
                          ? "Lumina is speaking..."
                          : "Tap to speak"}
                      </h2>

                      <p className="mt-2 text-sm text-white/45">
                        {recording
                          ? "Tap again when you finish speaking."
                          : isPlaying
                          ? "Listen naturally, or pause the response below."
                          : "Speak naturally. Lumina will listen, understand and respond."}
                      </p>

                    </div>


                    {voiceError && (
                      <div className="mt-6 max-w-xl rounded-2xl border border-red-400/15 bg-red-400/10 px-5 py-3 text-sm text-red-200">
                        {voiceError}
                      </div>
                    )}


                    {(liveTranscript ||
                      voiceResponse) && (

                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 25,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className="mt-10 grid w-full max-w-4xl gap-4 md:grid-cols-2"
                      >

                        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">

                          <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                            You said
                          </p>

                          <p className="mt-4 text-lg leading-8 text-white/80">
                            {liveTranscript}
                          </p>

                        </div>


                        <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl">

                          <div className="flex items-center justify-between gap-4">

                            <div>

                              <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                                Lumina
                              </p>

                              {isPlaying && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-white/45">
                                  <Volume2 className="h-3.5 w-3.5" />
                                  Speaking
                                </div>
                              )}

                            </div>


                            {voiceResponse && (

                              <div className="flex gap-2">

                                <motion.button
                                  type="button"
                                  onClick={
                                    toggleAudioPlayback
                                  }
                                  whileHover={{
                                    scale: 1.06,
                                  }}
                                  whileTap={{
                                    scale: 0.94,
                                  }}
                                  disabled={
                                    generatingAudio
                                  }
                                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                                  aria-label={
                                    isPlaying
                                      ? "Pause response"
                                      : "Play response"
                                  }
                                >
                                  {isPlaying ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </motion.button>


                                <motion.button
                                  type="button"
                                  onClick={
                                    replayAudio
                                  }
                                  whileHover={{
                                    scale: 1.06,
                                  }}
                                  whileTap={{
                                    scale: 0.94,
                                  }}
                                  disabled={
                                    generatingAudio ||
                                    !audioAvailable
                                  }
                                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                                  aria-label="Replay response"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </motion.button>

                              </div>

                            )}

                          </div>


                          <p className="mt-4 text-lg leading-8 text-white/85">
                            {voiceResponse}
                          </p>

                        </div>

                      </motion.div>

                    )}

                  </div>

                </motion.section>

              ) : (

                <motion.section
                  initial={{
                    opacity: 0,
                    y: 25,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mt-12 overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.035] shadow-2xl backdrop-blur-2xl"
                >

                  <div className="min-h-[420px] max-h-[58vh] overflow-y-auto px-6 py-7 md:px-8">

                    {messages.length ===
                    0 ? (

                      <div className="flex min-h-[360px] items-center justify-center">

                        <div className="max-w-xl text-center">

                          <BrainCircuit className="mx-auto h-8 w-8 text-white/60" />

                          <h3 className="mt-5 text-2xl font-semibold">
                            Ask Lumina anything.
                          </h3>

                          <p className="mt-3 leading-7 text-white/45">
                            Your conversation context and memory remain available as you continue.
                          </p>

                        </div>

                      </div>

                    ) : (

                      <div className="space-y-6">

                        {messages.map(
                          (
                            chatMessage,
                            index
                          ) => (

                            <div
                              key={`${chatMessage.role}-${index}`}
                              className={
                                chatMessage.role ===
                                "user"
                                  ? "flex justify-end"
                                  : "flex justify-start"
                              }
                            >

                              <div
                                className={
                                  chatMessage.role ===
                                  "user"
                                    ? "max-w-[80%] rounded-[24px] rounded-br-md bg-white px-5 py-4 text-black"
                                    : "max-w-[85%] rounded-[24px] rounded-bl-md border border-white/10 bg-white/[0.045] px-5 py-4"
                                }
                              >

                                <p className="whitespace-pre-wrap leading-7">
                                  {
                                    chatMessage.content
                                  }
                                </p>

                              </div>

                            </div>

                          )
                        )}

                        {sending && (

                          <div className="flex justify-start">

                            <div className="flex items-center gap-2 rounded-[22px] border border-white/10 bg-white/[0.045] px-5 py-4">

                              <span className="h-2 w-2 animate-pulse rounded-full bg-white/50" />

                              <span className="h-2 w-2 animate-pulse rounded-full bg-white/50 [animation-delay:150ms]" />

                              <span className="h-2 w-2 animate-pulse rounded-full bg-white/50 [animation-delay:300ms]" />

                            </div>

                          </div>

                        )}

                      </div>

                    )}

                  </div>


                  <div className="border-t border-white/8 p-5">

                    {error && (
                      <div className="mb-4 rounded-2xl border border-red-400/15 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                        {error}
                      </div>
                    )}


                    <form
                      onSubmit={
                        sendMessage
                      }
                      className="rounded-[26px] border border-white/10 bg-black/25 p-4"
                    >

                      <textarea
                        value={message}
                        onChange={(
                          event
                        ) =>
                          setMessage(
                            event.target
                              .value
                          )
                        }
                        placeholder="Ask Lumina anything..."
                        rows={3}
                        maxLength={10000}
                        disabled={sending}
                        className="w-full resize-none bg-transparent text-lg outline-none placeholder:text-white/25 disabled:opacity-60"
                      />


                      <div className="mt-4 flex items-center justify-between">

                        <button
                          type="button"
                          onClick={() =>
                            setMode(
                              "voice"
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/55 transition hover:bg-white/[0.08] hover:text-white"
                          aria-label="Switch to voice"
                        >
                          <Mic className="h-4 w-4" />
                        </button>


                        <motion.button
                          whileHover={{
                            scale:
                              sending
                                ? 1
                                : 1.04,
                          }}
                          whileTap={{
                            scale:
                              sending
                                ? 1
                                : 0.97,
                          }}
                          disabled={
                            sending ||
                            !message.trim()
                          }
                          type="submit"
                          className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-black disabled:opacity-40"
                        >

                          {sending
                            ? "Thinking..."
                            : "Send"}

                          {!sending && (
                            <Send className="h-4 w-4" />
                          )}

                        </motion.button>

                      </div>

                    </form>

                  </div>

                </motion.section>

              )}

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}