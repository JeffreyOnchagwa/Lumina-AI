"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import MobileNav from "@/components/mobile-nav";

import {
  BrainCircuit,
  FileText,
  History,
  LogOut,
  MessageSquare,
  Mic,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  Send,
  Settings,
  Sparkles,
  Square,
  StopCircle,
  Trash2,
  UserRound,
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


type Conversation = {
  id: number;
  user_id: number;
  title: string | null;
  created_at: string;
  updated_at: string;
};


type BackendMessage = {
  id: number;
  conversation_id: number;
  role: string;
  content: string;
  created_at: string;
};


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


export default function AppPage() {
  const router = useRouter();

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const activeStreamRef =
    useRef<MediaStream | null>(null);

  const audioChunksRef =
    useRef<Blob[]>([]);

  const lastSpokenTextRef =
    useRef("");

  const chatScrollRef =
    useRef<HTMLDivElement | null>(null);


  const [ready, setReady] =
    useState(false);

  const [mode, setMode] =
    useState<"voice" | "text">("voice");

  const [recording, setRecording] =
    useState(false);

  const [processingVoice, setProcessingVoice] =
    useState(false);

  const [voiceError, setVoiceError] =
    useState("");

  const [liveTranscript, setLiveTranscript] =
    useState("");

  const [voiceResponse, setVoiceResponse] =
    useState("");

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

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [
    loadingConversations,
    setLoadingConversations,
  ] = useState(false);

  const [
    loadingConversation,
    setLoadingConversation,
  ] = useState(false);

  const [
    conversationError,
    setConversationError,
  ] = useState("");

  const [
    openConversationMenu,
    setOpenConversationMenu,
  ] = useState<number | null>(null);

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const [speechPaused, setSpeechPaused] =
    useState(false);

  const [speechRate, setSpeechRate] =
    useState(1);

  const [
    availableVoices,
    setAvailableVoices,
  ] = useState<
    SpeechSynthesisVoice[]
  >([]);

  const [
    selectedVoiceName,
    setSelectedVoiceName,
  ] = useState("");

  const [
    userPreferences,
    setUserPreferences,
  ] = useState<UserPreferences | null>(
    null
  );


  function getToken() {
    return localStorage.getItem(
      "lumina_access_token"
    );
  }


  function stopActiveMicrophone() {
    activeStreamRef.current
      ?.getTracks()
      .forEach((track) => {
        track.stop();
      });

    activeStreamRef.current =
      null;
  }


  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setReady(true);

    void loadConversations();
    void loadPreferences();
  }, [router]);


  useEffect(() => {
    if (
      typeof window ===
        "undefined" ||
      !(
        "speechSynthesis" in
        window
      )
    ) {
      return;
    }

    function loadVoices() {
      const voices =
        window.speechSynthesis.getVoices();

      setAvailableVoices(
        voices
      );

      if (
        voices.length > 0 &&
        !selectedVoiceName
      ) {
        const savedVoice =
          userPreferences?.preferred_voice &&
          userPreferences.preferred_voice !==
            "default"
            ? voices.find(
                (voice) =>
                  voice.name ===
                  userPreferences.preferred_voice
              )
            : undefined;

        const languageVoice =
          userPreferences?.preferred_language
            ? voices.find(
                (voice) =>
                  voice.lang
                    .toLowerCase()
                    .startsWith(
                      userPreferences.preferred_language.toLowerCase()
                    )
              )
            : undefined;

        const naturalVoice =
          voices.find(
            (voice) => {
              const name =
                voice.name.toLowerCase();

              return (
                voice.lang
                  .toLowerCase()
                  .startsWith(
                    "en"
                  ) &&
                (
                  name.includes(
                    "natural"
                  ) ||
                  name.includes(
                    "aria"
                  ) ||
                  name.includes(
                    "jenny"
                  ) ||
                  name.includes(
                    "zira"
                  ) ||
                  name.includes(
                    "david"
                  )
                )
              );
            }
          );

        const englishVoice =
          voices.find(
            (voice) =>
              voice.lang
                .toLowerCase()
                .startsWith(
                  "en"
                )
          );

        const preferred =
          savedVoice ||
          languageVoice ||
          naturalVoice ||
          englishVoice ||
          voices[0];

        if (preferred) {
          setSelectedVoiceName(
            preferred.name
          );
        }
      }
    }

    loadVoices();

    window.speechSynthesis.onvoiceschanged =
      loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged =
        null;
    };
  }, [
    selectedVoiceName,
    userPreferences,
  ]);


  useEffect(() => {
    return () => {
      if (
        typeof window !==
          "undefined" &&
        "speechSynthesis" in
          window
      ) {
        window.speechSynthesis.cancel();
      }

      const recorder =
        mediaRecorderRef.current;

      if (
        recorder &&
        recorder.state !==
          "inactive"
      ) {
        recorder.stop();
      }

      stopActiveMicrophone();
    };
  }, []);


  useEffect(() => {
    if (mode !== "text") {
      return;
    }

    const container =
      chatScrollRef.current;

    if (!container) {
      return;
    }

    const frame =
      window.requestAnimationFrame(
        () => {
          container.scrollTo({
            top:
              container.scrollHeight,
            behavior:
              "smooth",
          });
        }
      );

    return () => {
      window.cancelAnimationFrame(
        frame
      );
    };
  }, [
    messages,
    sending,
    mode,
  ]);


  async function loadPreferences() {
    const token =
      getToken();

    if (!token) {
      router.replace(
        "/login"
      );
      return;
    }

    try {
      const response =
        await fetch(
          "http://127.0.0.1:8000/preferences/",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
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
        return;
      }

      const data:
        UserPreferences =
        await response.json();

      setUserPreferences(
        data
      );

      setSpeechRate(
        data.speech_speed
      );

      if (
        data.preferred_voice &&
        data.preferred_voice !==
          "default"
      ) {
        setSelectedVoiceName(
          data.preferred_voice
        );
      }
    } catch {
      // Preferences should not
      // prevent Lumina loading.
    }
  }


  async function loadConversations() {
    const token =
      getToken();

    if (!token) {
      router.replace(
        "/login"
      );
      return;
    }

    setLoadingConversations(
      true
    );

    setConversationError(
      ""
    );

    try {
      const response =
        await fetch(
          "http://127.0.0.1:8000/conversations/",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
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
        throw new Error(
          "Unable to load conversation history."
        );
      }

      const data:
        Conversation[] =
        await response.json();

      const sorted =
        [...data].sort(
          (a, b) =>
            new Date(
              b.updated_at
            ).getTime() -
            new Date(
              a.updated_at
            ).getTime()
        );

      setConversations(
        sorted
      );
    } catch (err) {
      if (
        err instanceof Error
      ) {
        setConversationError(
          err.message
        );
      }
    } finally {
      setLoadingConversations(
        false
      );
    }
  }


  async function openConversation(
    id: number
  ) {
    const token =
      getToken();

    if (!token) {
      router.replace(
        "/login"
      );
      return;
    }

    stopSpeech();
    stopActiveMicrophone();

    setLoadingConversation(
      true
    );

    setConversationError(
      ""
    );

    setError("");
    setVoiceError("");

    setOpenConversationMenu(
      null
    );

    try {
      const response =
        await fetch(
          `http://127.0.0.1:8000/conversations/${id}/messages`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
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
        throw new Error(
          "Unable to load this conversation."
        );
      }

      const data:
        BackendMessage[] =
        await response.json();

      const mappedMessages:
        ChatMessage[] =
        data
          .filter(
            (item) =>
              item.role ===
                "user" ||
              item.role ===
                "model" ||
              item.role ===
                "assistant"
          )
          .map(
            (item) => ({
              role:
                item.role ===
                "user"
                  ? "user"
                  : "assistant",

              content:
                item.content,
            })
          );

      setConversationId(
        id
      );

      setMessages(
        mappedMessages
      );

      setMode(
        "text"
      );

      setLiveTranscript(
        ""
      );

      setVoiceResponse(
        ""
      );
    } catch (err) {
      if (
        err instanceof Error
      ) {
        setConversationError(
          err.message
        );
      }
    } finally {
      setLoadingConversation(
        false
      );
    }
  }


  async function renameConversation(
    conversation:
      Conversation
  ) {
    const newTitle =
      window.prompt(
        "Rename conversation:",
        conversation.title ||
          ""
      );

    if (
      !newTitle ||
      !newTitle.trim()
    ) {
      setOpenConversationMenu(
        null
      );
      return;
    }

    const token =
      getToken();

    if (!token) {
      router.replace(
        "/login"
      );
      return;
    }

    try {
      const response =
        await fetch(
          `http://127.0.0.1:8000/conversations/${conversation.id}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                title:
                  newTitle.trim(),
              }),
          }
        );

      if (!response.ok) {
        throw new Error(
          "Unable to rename conversation."
        );
      }

      await loadConversations();
    } catch (err) {
      if (
        err instanceof Error
      ) {
        setConversationError(
          err.message
        );
      }
    } finally {
      setOpenConversationMenu(
        null
      );
    }
  }


  async function deleteConversation(
    conversation:
      Conversation
  ) {
    const confirmed =
      window.confirm(
        `Delete "${
          conversation.title ||
          "Untitled conversation"
        }"?`
      );

    if (!confirmed) {
      setOpenConversationMenu(
        null
      );
      return;
    }

    const token =
      getToken();

    if (!token) {
      router.replace(
        "/login"
      );
      return;
    }

    try {
      const response =
        await fetch(
          `http://127.0.0.1:8000/conversations/${conversation.id}`,
          {
            method:
              "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (!response.ok) {
        throw new Error(
          "Unable to delete conversation."
        );
      }

      if (
        conversationId ===
        conversation.id
      ) {
        startNewChat();
      }

      await loadConversations();
    } catch (err) {
      if (
        err instanceof Error
      ) {
        setConversationError(
          err.message
        );
      }
    } finally {
      setOpenConversationMenu(
        null
      );
    }
  }


  function stopSpeech() {
    if (
      typeof window ===
        "undefined" ||
      !(
        "speechSynthesis" in
        window
      )
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    setIsSpeaking(
      false
    );

    setSpeechPaused(
      false
    );
  }


  function pauseSpeech() {
    if (
      typeof window ===
        "undefined" ||
      !(
        "speechSynthesis" in
        window
      )
    ) {
      return;
    }

    if (
      window.speechSynthesis
        .speaking &&
      !window.speechSynthesis
        .paused
    ) {
      window.speechSynthesis.pause();

      setSpeechPaused(
        true
      );

      setIsSpeaking(
        false
      );
    }
  }


  function resumeSpeech() {
    if (
      typeof window ===
        "undefined" ||
      !(
        "speechSynthesis" in
        window
      )
    ) {
      return;
    }

    if (
      window.speechSynthesis
        .paused
    ) {
      window.speechSynthesis.resume();

      setSpeechPaused(
        false
      );

      setIsSpeaking(
        true
      );
    }
  }


  function speakResponse(
    text: string
  ) {
    if (
      typeof window ===
        "undefined" ||
      !(
        "speechSynthesis" in
        window
      )
    ) {
      setVoiceError(
        "Speech synthesis is not supported by this browser."
      );

      return;
    }

    if (!text.trim()) {
      return;
    }

    /*
     * CRITICAL FEEDBACK-LOOP FIX:
     *
     * Lumina must never have an
     * active microphone while
     * speaking.
     */

    const recorder =
      mediaRecorderRef.current;

    if (
      recorder &&
      recorder.state !==
        "inactive"
    ) {
      recorder.stop();

      setRecording(
        false
      );
    }

    stopActiveMicrophone();

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        text
      );

    const voices =
      window.speechSynthesis.getVoices();

    const chosenVoice =
      voices.find(
        (voice) =>
          voice.name ===
          selectedVoiceName
      );

    if (chosenVoice) {
      utterance.voice =
        chosenVoice;
    }

    utterance.rate =
      speechRate;

    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart =
      () => {
        /*
         * Double check that
         * microphone is dead
         * before speech starts.
         */
        stopActiveMicrophone();

        setIsSpeaking(
          true
        );

        setSpeechPaused(
          false
        );
      };

    utterance.onend =
      () => {
        setIsSpeaking(
          false
        );

        setSpeechPaused(
          false
        );
      };

    utterance.onerror =
      (event) => {
        setIsSpeaking(
          false
        );

        setSpeechPaused(
          false
        );

        if (
          event.error !==
          "interrupted"
        ) {
          setVoiceError(
            "Lumina could not speak the response."
          );
        }
      };

    lastSpokenTextRef.current =
      text;

    window.speechSynthesis.speak(
      utterance
    );
  }


  function replaySpeech() {
    if (
      lastSpokenTextRef.current
    ) {
      speakResponse(
        lastSpokenTextRef.current
      );
    }
  }


  function logout() {
    stopSpeech();
    stopActiveMicrophone();

    localStorage.removeItem(
      "lumina_access_token"
    );

    router.push(
      "/login"
    );
  }


  function startNewChat() {
    stopSpeech();
    stopActiveMicrophone();

    setRecording(
      false
    );

    setConversationId(
      null
    );

    setMessages(
      []
    );

    setMessage(
      ""
    );

    setError(
      ""
    );

    setLiveTranscript(
      ""
    );

    setVoiceResponse(
      ""
    );

    setVoiceError(
      ""
    );

    setOpenConversationMenu(
      null
    );

    lastSpokenTextRef.current =
      "";
  }


  async function startRecording() {
    if (processingVoice || isSpeaking) {
      return;
    }

    setVoiceError("");
    setLiveTranscript("");
    setVoiceResponse("");

    /*
     * Always completely cancel old speech before
     * opening the microphone.
     */
    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setSpeechPaused(false);

    stopActiveMicrophone();

    /*
     * Give the speakers a moment to become silent
     * before opening the microphone.
     */
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 250);
    });

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
          },
        });

      activeStreamRef.current = stream;

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
        mimeType = "audio/webm";
      } else if (
        MediaRecorder.isTypeSupported(
          "audio/ogg;codecs=opus"
        )
      ) {
        mimeType =
          "audio/ogg;codecs=opus";
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, {
            mimeType,
          })
        : new MediaRecorder(stream);

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

      recorder.onerror = () => {
        stopActiveMicrophone();

        setRecording(false);

        setVoiceError(
          "The microphone recording failed."
        );
      };

      recorder.onstop = async () => {
        stopActiveMicrophone();

        const finalMimeType =
          recorder.mimeType ||
          mimeType ||
          "audio/webm";

        const audioBlob = new Blob(
          audioChunksRef.current,
          {
            type: finalMimeType,
          }
        );

        mediaRecorderRef.current = null;

        if (audioBlob.size === 0) {
          setVoiceError(
            "No audio was recorded. Please try again."
          );

          return;
        }

        await sendVoiceMessage(
          audioBlob
        );
      };

      mediaRecorderRef.current =
        recorder;

      recorder.start(250);

      setRecording(true);
    } catch (err) {
      console.error(
        "MICROPHONE ERROR:",
        err
      );

      stopActiveMicrophone();

      setRecording(false);

      setVoiceError(
        "Microphone access was denied or is unavailable."
      );
    }
  }


  function stopRecording() {
    const recorder =
      mediaRecorderRef.current;

    if (!recorder) {
      stopActiveMicrophone();

      setRecording(
        false
      );

      return;
    }

    if (
      recorder.state !==
        "inactive"
    ) {
      recorder.stop();
    }

    setRecording(
      false
    );
  }


  async function sendVoiceMessage(
    audioBlob: Blob
  ) {
    const token =
      getToken();

    if (!token) {
      router.replace(
        "/login"
      );

      return;
    }

    /*
     * The microphone must remain
     * OFF during transcription,
     * AI processing and speech.
     */

    stopActiveMicrophone();

    setProcessingVoice(
      true
    );

    setVoiceError(
      ""
    );

    try {
      const formData =
        new FormData();

      let extension =
        "webm";

      if (
        audioBlob.type.includes(
          "ogg"
        )
      ) {
        extension =
          "ogg";
      } else if (
        audioBlob.type.includes(
          "wav"
        )
      ) {
        extension =
          "wav";
      } else if (
        audioBlob.type.includes(
          "mp4"
        )
      ) {
        extension =
          "m4a";
      }

      formData.append(
        "file",
        audioBlob,
        `voice-message.${extension}`
      );

      if (
        conversationId !==
        null
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
            method:
              "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            body:
              formData,
          }
        );

      if (
        response.status ===
        401
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

      const data:
        VoiceResponse =
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
            role:
              "user",

            content:
              data.transcript,
          },

          {
            role:
              "assistant",

            content:
              data.response,
          },
        ]
      );

      /*
       * Processing ends before
       * speaking starts, but the
       * microphone remains off.
       */

      setProcessingVoice(
        false
      );

      speakResponse(
        data.response
      );

      void loadConversations();
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

      stopActiveMicrophone();
    }
  }


  async function sendMessage(
    event?:
      FormEvent<HTMLFormElement>
  ) {
    event?.preventDefault();

    const trimmedMessage =
      message.trim();

    if (
      !trimmedMessage ||
      sending
    ) {
      return;
    }

    const token =
      getToken();

    if (!token) {
      router.replace(
        "/login"
      );

      return;
    }

    setError(
      ""
    );

    setSending(
      true
    );

    setMessages(
      (current) => [
        ...current,

        {
          role:
            "user",

          content:
            trimmedMessage,
        },
      ]
    );

    setMessage(
      ""
    );

    try {
      const response =
        await fetch(
          "http://127.0.0.1:8000/chat/",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                message:
                  trimmedMessage,

                conversation_id:
                  conversationId,
              }),
          }
        );

      if (
        response.status ===
        401
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

      const data:
        ChatResponse =
        await response.json();

      setConversationId(
        data.conversation_id
      );

      setMessages(
        (current) => [
          ...current,

          {
            role:
              "assistant",

            content:
              data.response,
          },
        ]
      );

      /*
       * Only automatically speak
       * normal chat responses when
       * the user is in voice mode.
       *
       * In text mode the speaker
       * icon can still be used.
       */

      if (
        mode === "voice"
      ) {
        speakResponse(
          data.response
        );
      }

      void loadConversations();
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
      setSending(
        false
      );
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
    <main
      className={
        userPreferences?.high_contrast_mode
          ? "min-h-screen bg-black text-white"
          : "min-h-screen bg-[#050708] text-white"
      }
      style={{
        fontSize:
          userPreferences
            ? `${userPreferences.font_size}px`
            : undefined,

        letterSpacing:
          userPreferences?.dyslexia_mode
            ? "0.04em"
            : undefined,

        wordSpacing:
          userPreferences?.dyslexia_mode
            ? "0.12em"
            : undefined,

        lineHeight:
          userPreferences?.dyslexia_mode
            ? 1.8
            : undefined,
      }}
    >
      <MobileNav
        mode={mode}
        onModeChange={(
          nextMode
        ) => {
          stopSpeech();
          stopActiveMicrophone();
          setRecording(false);

          setMode(
            nextMode
          );
        }}
        onLogout={logout}
      />


      <div className="flex min-h-screen">

        {/* DESKTOP SIDEBAR */}

        <aside className="hidden w-80 shrink-0 border-r border-white/10 bg-black/20 p-5 backdrop-blur-xl lg:block">
          <div className="flex h-screen flex-col">

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                <BrainCircuit className="h-5 w-5" />
              </div>

              <div>
                <div className="font-semibold">
                  Lumina AI
                </div>

                <div className="text-xs uppercase tracking-[0.18em] text-white/35">
                  Intelligent voice
                </div>
              </div>
            </div>


            <nav className="mt-8 space-y-2">

              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  stopActiveMicrophone();
                  setRecording(false);
                  setMode("voice");
                }}
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
                type="button"
                onClick={() => {
                  stopSpeech();
                  stopActiveMicrophone();
                  setRecording(false);
                  setMode("text");
                }}
                className={
                  mode === "text"
                    ? "flex w-full items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-left"
                    : "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-white/55 transition hover:bg-white/[0.05] hover:text-white"
                }
              >
                <MessageSquare className="h-4 w-4" />
                Chat
              </button>


              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/documents"
                  )
                }
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-white/55 transition hover:bg-white/[0.05] hover:text-white"
              >
                <FileText className="h-4 w-4" />
                Documents
              </button>


              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/preferences"
                  )
                }
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-white/55 transition hover:bg-white/[0.05] hover:text-white"
              >
                <Settings className="h-4 w-4" />
                Preferences
              </button>


              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/profile"
                  )
                }
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-white/55 transition hover:bg-white/[0.05] hover:text-white"
              >
                <UserRound className="h-4 w-4" />
                Profile
              </button>

            </nav>


            {/* HISTORY */}

            <div className="mt-7 flex min-h-0 flex-1 flex-col border-t border-white/10 pt-5">

              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-white/35" />

                  <span className="text-xs uppercase tracking-[0.18em] text-white/35">
                    History
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void loadConversations()
                  }
                  className="text-xs text-white/35 transition hover:text-white"
                >
                  Refresh
                </button>
              </div>


              {conversationError && (
                <div className="mx-1 mt-3 rounded-xl border border-red-400/10 bg-red-400/10 px-3 py-2 text-xs text-red-200">
                  {conversationError}
                </div>
              )}


              <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">

                {loadingConversations ? (
                  <div className="px-3 py-6 text-sm text-white/30">
                    Loading history...
                  </div>
                ) : conversations.length ===
                  0 ? (
                  <div className="px-3 py-6 text-sm text-white/30">
                    No conversations yet.
                  </div>
                ) : (
                  <div className="space-y-1">

                    {conversations.map(
                      (
                        conversation
                      ) => (
                        <div
                          key={
                            conversation.id
                          }
                          className="group relative"
                        >

                          <button
                            type="button"
                            onClick={() =>
                              void openConversation(
                                conversation.id
                              )
                            }
                            className={
                              conversationId ===
                              conversation.id
                                ? "w-full rounded-xl bg-white/10 px-3 py-3 pr-10 text-left"
                                : "w-full rounded-xl px-3 py-3 pr-10 text-left text-white/55 transition hover:bg-white/[0.05] hover:text-white"
                            }
                          >
                            <p className="truncate text-sm">
                              {conversation.title ||
                                "Untitled conversation"}
                            </p>

                            <p className="mt-1 text-[11px] text-white/25">
                              {new Date(
                                conversation.updated_at
                              ).toLocaleDateString()}
                            </p>
                          </button>


                          <button
                            type="button"
                            onClick={(
                              event
                            ) => {
                              event.stopPropagation();

                              setOpenConversationMenu(
                                openConversationMenu ===
                                  conversation.id
                                  ? null
                                  : conversation.id
                              );
                            }}
                            className="absolute right-2 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-white/25 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>


                          {openConversationMenu ===
                            conversation.id && (
                            <div className="absolute right-2 top-11 z-40 w-36 rounded-xl border border-white/10 bg-[#111315] p-1 shadow-2xl">

                              <button
                                type="button"
                                onClick={() =>
                                  void renameConversation(
                                    conversation
                                  )
                                }
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-white/65 transition hover:bg-white/10 hover:text-white"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Rename
                              </button>


                              <button
                                type="button"
                                onClick={() =>
                                  void deleteConversation(
                                    conversation
                                  )
                                }
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-red-300 transition hover:bg-red-400/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>

                            </div>
                          )}

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>
            </div>


            <div className="border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-white/45 transition hover:bg-white/[0.05] hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>

          </div>
        </aside>


        {/* MAIN */}

        <section className="flex-1 overflow-hidden">
          <div className="relative min-h-screen">

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute left-1/2 top-[12%] h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-white/[0.025] blur-[200px]" />

              <div className="absolute bottom-[-220px] right-[5%] h-[500px] w-[500px] rounded-full bg-white/[0.02] blur-[190px]" />
            </div>


            <div className="relative z-10 mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6 md:px-10 md:py-8">

              {/* HEADER */}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">

                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                    Lumina workspace
                  </p>

                  <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] md:text-4xl">
                    {mode ===
                    "voice"
                      ? "Talk to Lumina."
                      : "Chat with Lumina."}
                  </h1>
                </div>


                <motion.button
                  type="button"
                  onClick={
                    startNewChat
                  }
                  whileHover={{
                    scale:
                      1.04,
                  }}
                  whileTap={{
                    scale:
                      0.97,
                  }}
                  className="w-full rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white/70 backdrop-blur-xl sm:w-auto"
                >
                  New conversation
                </motion.button>

              </div>


              {loadingConversation && (
                <div className="mt-6 flex items-center gap-2 text-sm text-white/40">
                  <Sparkles className="h-4 w-4 animate-pulse" />

                  Loading conversation...
                </div>
              )}


              {/* VOICE MODE */}

              {mode ===
              "voice" ? (

                <motion.section
                  initial={{
                    opacity:
                      0,

                    scale:
                      0.96,
                  }}
                  animate={{
                    opacity:
                      1,

                    scale:
                      1,
                  }}
                  transition={{
                    duration:
                      0.7,
                  }}
                  className="mt-10"
                >

                  <div className="flex min-h-[500px] flex-col items-center justify-center">

                    <div className="relative flex h-[260px] w-[260px] items-center justify-center sm:h-[340px] sm:w-[340px]">

                      <motion.div
                        animate={
                          recording
                            ? {
                                scale: [
                                  1,
                                  1.18,
                                  1,
                                ],

                                opacity: [
                                  0.5,
                                  0.08,
                                  0.5,
                                ],
                              }
                            : isSpeaking
                            ? {
                                scale: [
                                  1,
                                  1.13,
                                  1,
                                ],

                                opacity: [
                                  0.4,
                                  0.12,
                                  0.4,
                                ],
                              }
                            : {
                                scale: [
                                  1,
                                  1.04,
                                  1,
                                ],
                              }
                        }
                        transition={{
                          duration:
                            recording
                              ? 1.1
                              : isSpeaking
                              ? 1.5
                              : 4,

                          repeat:
                            Infinity,

                          ease:
                            "easeInOut",
                        }}
                        className="absolute h-[240px] w-[240px] rounded-full border border-white/10 bg-white/[0.025] sm:h-[320px] sm:w-[320px]"
                      />


                      <motion.div
                        animate={
                          recording
                            ? {
                                scale: [
                                  1,
                                  1.12,
                                  1,
                                ],

                                rotate: [
                                  0,
                                  5,
                                  -5,
                                  0,
                                ],
                              }
                            : isSpeaking
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
                              ? 1.4
                              : isSpeaking
                              ? 1.8
                              : 5,

                          repeat:
                            Infinity,

                          ease:
                            "easeInOut",
                        }}
                        className="absolute h-[180px] w-[180px] rounded-full border border-white/15 bg-black/30 shadow-[0_0_120px_rgba(255,255,255,0.07)] backdrop-blur-2xl sm:h-[240px] sm:w-[240px]"
                      />


                      <motion.button
                        type="button"
                        onClick={() => {
                          if (recording) {
                            stopRecording();
                            return;
                          }

                          void startRecording();
                        }}
                        disabled={
                          processingVoice ||
                          isSpeaking
                        }
                        whileHover={{
                          scale: 1.06,
                        }}
                        whileTap={{
                          scale: 0.94,
                        }}
                        className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-white text-black shadow-[0_20px_80px_rgba(255,255,255,0.15)] disabled:cursor-not-allowed disabled:opacity-60 sm:h-32 sm:w-32"
                      >

                        {processingVoice ? (
                          <Waves className="h-10 w-10 animate-pulse" />
                        ) : recording ? (
                          <Square className="h-9 w-9 fill-current" />
                        ) : (
                          <Mic className="h-10 w-10" />
                        )}

                      </motion.button>

                    </div>


                    <div className="mt-2 text-center">

                      <h2 className="text-2xl font-semibold">
                        {processingVoice
                          ? "Lumina is thinking..."
                          : recording
                          ? "Listening..."
                          : isSpeaking
                          ? "Lumina is speaking..."
                          : speechPaused
                          ? "Voice paused."
                          : "Tap to speak"}
                      </h2>


                      <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
                        {recording
                          ? "Speak naturally and tap again when you finish."
                          : processingVoice
                          ? "Your speech is being transcribed and understood."
                          : isSpeaking
                          ? "Lumina is reading the response aloud. The microphone is disabled."
                          : speechPaused
                          ? "Resume or stop Lumina before speaking again."
                          : "Speak naturally. Lumina will listen, understand and answer."}
                      </p>

                    </div>


                    {(voiceResponse ||
                      isSpeaking ||
                      speechPaused) && (

                      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">

                        <motion.button
                          type="button"
                          onClick={
                            isSpeaking
                              ? pauseSpeech
                              : resumeSpeech
                          }
                          disabled={
                            !isSpeaking &&
                            !speechPaused
                          }
                          whileHover={{
                            scale:
                              1.05,
                          }}
                          whileTap={{
                            scale:
                              0.95,
                          }}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
                        >
                          {isSpeaking ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </motion.button>


                        <motion.button
                          type="button"
                          onClick={
                            replaySpeech
                          }
                          whileHover={{
                            scale:
                              1.05,
                          }}
                          whileTap={{
                            scale:
                              0.95,
                          }}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/70 transition hover:bg-white/10 hover:text-white"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </motion.button>


                        <motion.button
                          type="button"
                          onClick={
                            stopSpeech
                          }
                          whileHover={{
                            scale:
                              1.05,
                          }}
                          whileTap={{
                            scale:
                              0.95,
                          }}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/70 transition hover:bg-white/10 hover:text-white"
                        >
                          <StopCircle className="h-4 w-4" />
                        </motion.button>

                      </div>
                    )}


                    {voiceError && (
                      <div className="mt-6 max-w-xl rounded-2xl border border-red-400/15 bg-red-400/10 px-5 py-3 text-sm text-red-200">
                        {voiceError}
                      </div>
                    )}


                    {(liveTranscript ||
                      voiceResponse) && (

                      <motion.div
                        initial={{
                          opacity:
                            0,

                          y:
                            25,
                        }}
                        animate={{
                          opacity:
                            1,

                          y:
                            0,
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

                              {isSpeaking && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-white/45">
                                  <Volume2 className="h-3.5 w-3.5" />
                                  Speaking
                                </div>
                              )}
                            </div>


                            <button
                              type="button"
                              onClick={() =>
                                speakResponse(
                                  voiceResponse
                                )
                              }
                              disabled={
                                !voiceResponse
                              }
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/65 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
                              aria-label="Read response aloud"
                            >
                              <Volume2 className="h-4 w-4" />
                            </button>

                          </div>


                          <p className="mt-4 whitespace-pre-wrap text-lg leading-8 text-white/85">
                            {voiceResponse}
                          </p>

                        </div>

                      </motion.div>
                    )}


                    <div className="mt-8 w-full max-w-4xl rounded-[26px] border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl">

                      <div className="grid gap-5 md:grid-cols-2">

                        <div>
                          <label className="text-xs uppercase tracking-[0.18em] text-white/35">
                            Voice
                          </label>

                          <select
                            value={
                              selectedVoiceName
                            }
                            onChange={(
                              event
                            ) => {
                              setSelectedVoiceName(
                                event.target.value
                              );
                            }}
                            className="mt-2 w-full rounded-xl border border-white/10 bg-[#101214] px-3 py-3 text-sm text-white outline-none"
                          >
                            {availableVoices.map(
                              (
                                voice
                              ) => (
                                <option
                                  key={`${voice.name}-${voice.lang}`}
                                  value={
                                    voice.name
                                  }
                                >
                                  {voice.name}{" "}
                                  ({voice.lang})
                                </option>
                              )
                            )}
                          </select>
                        </div>


                        <div>
                          <div className="flex items-center justify-between">
                            <label className="text-xs uppercase tracking-[0.18em] text-white/35">
                              Speech speed
                            </label>

                            <span className="text-sm text-white/50">
                              {speechRate.toFixed(
                                1
                              )}
                              x
                            </span>
                          </div>

                          <input
                            type="range"
                            min="0.6"
                            max="1.6"
                            step="0.1"
                            value={
                              speechRate
                            }
                            onChange={(
                              event
                            ) => {
                              setSpeechRate(
                                Number(
                                  event.target.value
                                )
                              );
                            }}
                            className="mt-4 w-full"
                          />
                        </div>

                      </div>

                    </div>

                  </div>

                </motion.section>

              ) : (

                /* CHAT MODE */

                <motion.section
                  initial={{
                    opacity:
                      0,

                    y:
                      25,
                  }}
                  animate={{
                    opacity:
                      1,

                    y:
                      0,
                  }}
                  className="mt-10 overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.035] shadow-2xl backdrop-blur-2xl"
                >

                  <div
                    ref={
                      chatScrollRef
                    }
                    className="min-h-[430px] max-h-[58vh] overflow-y-auto px-6 py-7 md:px-8"
                  >

                    {messages.length ===
                    0 ? (

                      <div className="flex min-h-[370px] items-center justify-center">

                        <div className="max-w-xl text-center">

                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                            <BrainCircuit className="h-6 w-6 text-white/65" />
                          </div>

                          <h3 className="mt-5 text-2xl font-semibold">
                            Ask Lumina anything.
                          </h3>

                          <p className="mt-3 leading-7 text-white/45">
                            Start a conversation or reopen one from your history.
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

                            <motion.div
                              key={`${chatMessage.role}-${index}`}
                              initial={{
                                opacity:
                                  0,

                                y:
                                  10,
                              }}
                              animate={{
                                opacity:
                                  1,

                                y:
                                  0,
                              }}
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

                                <div className="flex items-start gap-3">

                                  <p className="flex-1 whitespace-pre-wrap leading-7">
                                    {chatMessage.content}
                                  </p>


                                  {chatMessage.role ===
                                    "assistant" && (

                                    <button
                                      type="button"
                                      onClick={() =>
                                        speakResponse(
                                          chatMessage.content
                                        )
                                      }
                                      className="mt-1 shrink-0 text-white/35 transition hover:text-white"
                                      aria-label="Read aloud"
                                    >
                                      <Volume2 className="h-4 w-4" />
                                    </button>

                                  )}

                                </div>

                              </div>

                            </motion.div>
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


                  <div className="border-t border-white/10 p-5">

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
                        value={
                          message
                        }
                        onChange={(
                          event
                        ) =>
                          setMessage(
                            event.target.value
                          )
                        }
                        onKeyDown={(
                          event
                        ) => {
                          if (
                            event.key ===
                              "Enter" &&
                            !event.shiftKey
                          ) {
                            event.preventDefault();

                            if (
                              message.trim() &&
                              !sending
                            ) {
                              void sendMessage();
                            }
                          }
                        }}
                        placeholder="Ask Lumina anything..."
                        rows={3}
                        maxLength={
                          10000
                        }
                        disabled={
                          sending
                        }
                        className="w-full resize-none bg-transparent text-lg text-white outline-none placeholder:text-white/25 disabled:opacity-60"
                      />


                      <div className="mt-4 flex items-center justify-between gap-4">

                        <button
                          type="button"
                          onClick={() => {
                            stopSpeech();
                            stopActiveMicrophone();
                            setRecording(false);
                            setMode("voice");
                          }}
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
                          className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-black disabled:cursor-not-allowed disabled:opacity-40"
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