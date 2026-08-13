"use client";

import {
  ChangeEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { motion } from "motion/react";
import { API_URL } from "@/lib/api";

import {
  ArrowLeft,
  FileText,
  Loader2,
  MessageSquare,
  Sparkles,
  Square,
  Upload,
  Volume2,
  WandSparkles,
} from "lucide-react";


type DocumentSummary = {
  id: number;
  user_id: number;
  filename: string;
  mime_type: string;
  created_at: string;
  updated_at: string;
};


type DocumentDetail =
  DocumentSummary & {
    extracted_text: string;
  };


type DocumentAIResponse = {
  result: string;
};


export default function DocumentsPage() {
  const router = useRouter();

  const [ready, setReady] =
    useState(false);

  const [documents, setDocuments] =
    useState<DocumentSummary[]>([]);

  const [
    selectedDocument,
    setSelectedDocument,
  ] =
    useState<DocumentDetail | null>(
      null
    );

  const [uploading, setUploading] =
    useState(false);

  const [
    loadingDocument,
    setLoadingDocument,
  ] =
    useState(false);

  const [aiLoading, setAiLoading] =
    useState(false);

  const [question, setQuestion] =
    useState("");

  const [aiResult, setAiResult] =
    useState("");

  const [error, setError] =
    useState("");

  const [isSpeaking, setIsSpeaking] =
    useState(false);


  function getToken() {
    return localStorage.getItem(
      "lumina_access_token"
    );
  }


  function stopSpeaking() {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    setIsSpeaking(false);
  }


  function speakResult() {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    if (!aiResult.trim()) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        aiResult
      );

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(
      utterance
    );
  }


  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setReady(true);

    void loadDocuments();

    return () => {
      if (
        typeof window !==
        "undefined"
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, [router]);


  async function loadDocuments() {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const response =
        await fetch(
          `${API_URL}/documents/`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Unable to load documents."
        );
      }

      const data: DocumentSummary[] =
        await response.json();

      setDocuments(data);

    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message
        );
      }
    }
  }


  async function uploadDocument(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Please choose a PDF, PNG, JPG, or JPEG file."
      );

      return;
    }

    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    stopSpeaking();

    setUploading(true);
    setError("");
    setAiResult("");

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const response =
        await fetch(
          `${API_URL}/documents/upload`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            body:
              formData,
          }
        );

      if (!response.ok) {
        let detail =
          "Unable to upload file.";

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

      const data: DocumentDetail =
        await response.json();

      setSelectedDocument(
        data
      );

      await loadDocuments();

    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message
        );
      }

    } finally {
      setUploading(false);

      event.target.value =
        "";
    }
  }


  async function openDocument(
    documentId: number
  ) {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    stopSpeaking();

    setLoadingDocument(true);
    setError("");
    setAiResult("");

    try {
      const response =
        await fetch(
          `${API_URL}/documents/${documentId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (!response.ok) {
        throw new Error(
          "Unable to load document."
        );
      }

      const data: DocumentDetail =
        await response.json();

      setSelectedDocument(
        data
      );

    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message
        );
      }

    } finally {
      setLoadingDocument(false);
    }
  }


  async function runDocumentAction(
    action:
      | "summarize"
      | "simplify"
  ) {
    if (!selectedDocument) {
      return;
    }

    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    stopSpeaking();

    setAiLoading(true);
    setError("");
    setAiResult("");

    try {
      const response =
        await fetch(
          `${API_URL}/documents/${selectedDocument.id}/${action}`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (!response.ok) {
        let detail =
          `Unable to ${action} document.`;

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

      const data: DocumentAIResponse =
        await response.json();

      setAiResult(
        data.result
      );

    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message
        );
      }

    } finally {
      setAiLoading(false);
    }
  }


  async function askDocument() {
    if (
      !selectedDocument ||
      !question.trim()
    ) {
      return;
    }

    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    stopSpeaking();

    setAiLoading(true);
    setError("");
    setAiResult("");

    try {
      const response =
        await fetch(
          `${API_URL}/documents/${selectedDocument.id}/ask`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                question:
                  question.trim(),
              }),
          }
        );

      if (!response.ok) {
        let detail =
          "Unable to answer question.";

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

      const data: DocumentAIResponse =
        await response.json();

      setAiResult(
        data.result
      );

    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message
        );
      }

    } finally {
      setAiLoading(false);
    }
  }


  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050708] text-white">

        <div className="flex items-center gap-3 text-white/60">

          <Sparkles className="h-5 w-5 animate-pulse" />

          Loading documents...

        </div>

      </main>
    );
  }


  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050708] text-white">

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-10 md:py-8">


        {/* HEADER */}

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">


          <div className="min-w-0">

            <button
              type="button"
              onClick={() =>
                router.push("/app")
              }
              className="mb-5 flex items-center gap-2 text-sm text-white/45 transition hover:text-white"
            >

              <ArrowLeft className="h-4 w-4" />

              Back to Lumina

            </button>


            <p className="text-xs uppercase tracking-[0.22em] text-white/35">

              Document intelligence

            </p>


            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">

              Your knowledge workspace.

            </h1>


            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">

              Upload PDFs or images, extract their content, summarize difficult material, simplify complex text, and ask Lumina questions about your files.

            </p>

          </div>


          <label className="w-full cursor-pointer sm:w-auto">

            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              onChange={
                uploadDocument
              }
              className="hidden"
            />


            <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:bg-white/90 sm:w-auto">

              {uploading ? (

                <Loader2 className="h-4 w-4 animate-spin" />

              ) : (

                <Upload className="h-4 w-4" />

              )}


              {uploading
                ? "Uploading..."
                : "Upload file"}

            </div>

          </label>

        </div>


        {error && (

          <div className="mt-6 rounded-2xl border border-red-400/15 bg-red-400/10 px-4 py-4 text-sm text-red-200 sm:px-5">

            {error}

          </div>

        )}


        <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-[320px_minmax(0,1fr)]">


          {/* DOCUMENT LIST */}

          <aside className="min-w-0 rounded-[24px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl sm:rounded-[28px]">


            <div className="flex items-center justify-between px-1 pb-4 sm:px-2">

              <div>

                <h2 className="font-semibold">

                  Documents

                </h2>


                <p className="mt-1 text-sm text-white/40">

                  {documents.length} saved

                </p>

              </div>


              <FileText className="h-5 w-5 text-white/30" />

            </div>


            {documents.length ===
            0 ? (

              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/35">

                Upload your first document or image.

              </div>

            ) : (

              <>
                {/* MOBILE HORIZONTAL LIST */}

                <div className="flex gap-3 overflow-x-auto pb-2 lg:hidden">

                  {documents.map(
                    (document) => (

                      <button
                        key={
                          document.id
                        }
                        type="button"
                        onClick={() =>
                          void openDocument(
                            document.id
                          )
                        }
                        className={
                          selectedDocument?.id ===
                          document.id
                            ? "w-[230px] shrink-0 rounded-2xl border border-white/10 bg-white/10 p-4 text-left"
                            : "w-[230px] shrink-0 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-left transition hover:bg-white/[0.05]"
                        }
                      >

                        <div className="flex items-start gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">

                            <FileText className="h-4 w-4" />

                          </div>


                          <div className="min-w-0">

                            <p className="truncate text-sm font-medium">

                              {
                                document.filename
                              }

                            </p>


                            <p className="mt-1 text-xs text-white/35">

                              {new Date(
                                document.created_at
                              ).toLocaleDateString()}

                            </p>

                          </div>

                        </div>

                      </button>

                    )
                  )}

                </div>


                {/* DESKTOP VERTICAL LIST */}

                <div className="hidden space-y-2 lg:block">

                  {documents.map(
                    (document) => (

                      <button
                        key={
                          document.id
                        }
                        type="button"
                        onClick={() =>
                          void openDocument(
                            document.id
                          )
                        }
                        className={
                          selectedDocument?.id ===
                          document.id
                            ? "w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-left"
                            : "w-full rounded-2xl border border-transparent p-4 text-left transition hover:bg-white/[0.05]"
                        }
                      >

                        <div className="flex items-start gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">

                            <FileText className="h-4 w-4" />

                          </div>


                          <div className="min-w-0">

                            <p className="truncate text-sm font-medium">

                              {
                                document.filename
                              }

                            </p>


                            <p className="mt-1 text-xs text-white/35">

                              {new Date(
                                document.created_at
                              ).toLocaleDateString()}

                            </p>

                          </div>

                        </div>

                      </button>

                    )
                  )}

                </div>

              </>

            )}

          </aside>


          {/* DOCUMENT CONTENT */}

          <section className="min-h-[520px] min-w-0 rounded-[24px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl sm:rounded-[30px] sm:p-6 md:p-8 lg:min-h-[650px]">


            {loadingDocument ? (

              <div className="flex min-h-[420px] items-center justify-center lg:min-h-[560px]">

                <Loader2 className="h-7 w-7 animate-spin text-white/50" />

              </div>

            ) : selectedDocument ? (

              <div className="min-w-0">


                {/* SELECTED DOCUMENT HEADER */}

                <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-6 xl:flex-row xl:items-center">


                  <div className="min-w-0">

                    <p className="text-xs uppercase tracking-[0.2em] text-white/35">

                      Selected file

                    </p>


                    <h2 className="mt-2 break-words text-xl font-semibold sm:text-2xl">

                      {
                        selectedDocument.filename
                      }

                    </h2>

                  </div>


                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:flex">


                    <motion.button
                      type="button"
                      whileHover={{
                        scale: 1.03,
                      }}
                      whileTap={{
                        scale: 0.97,
                      }}
                      disabled={
                        aiLoading
                      }
                      onClick={() =>
                        void runDocumentAction(
                          "summarize"
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/70 transition hover:bg-white/[0.08] disabled:opacity-40 xl:w-auto"
                    >

                      <Sparkles className="h-4 w-4" />

                      Summarize

                    </motion.button>


                    <motion.button
                      type="button"
                      whileHover={{
                        scale: 1.03,
                      }}
                      whileTap={{
                        scale: 0.97,
                      }}
                      disabled={
                        aiLoading
                      }
                      onClick={() =>
                        void runDocumentAction(
                          "simplify"
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/70 transition hover:bg-white/[0.08] disabled:opacity-40 xl:w-auto"
                    >

                      <WandSparkles className="h-4 w-4" />

                      Simplify

                    </motion.button>

                  </div>

                </div>


                <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-2">


                  {/* EXTRACTED TEXT */}

                  <div className="min-w-0">

                    <p className="text-xs uppercase tracking-[0.2em] text-white/35">

                      Extracted text

                    </p>


                    <div className="mt-3 max-h-[420px] overflow-y-auto overflow-x-hidden rounded-2xl border border-white/10 bg-black/20 p-4 sm:max-h-[470px] sm:p-5">

                      <p className="break-words whitespace-pre-wrap text-sm leading-7 text-white/65">

                        {
                          selectedDocument.extracted_text
                        }

                      </p>

                    </div>

                  </div>


                  {/* AI PANEL */}

                  <div className="min-w-0">

                    <p className="text-xs uppercase tracking-[0.2em] text-white/35">

                      Ask Lumina

                    </p>


                    <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">


                      <textarea
                        value={
                          question
                        }
                        onChange={(
                          event
                        ) =>
                          setQuestion(
                            event.target.value
                          )
                        }
                        placeholder="Ask something about this document..."
                        rows={4}
                        className="w-full resize-none bg-transparent text-sm leading-6 text-white outline-none placeholder:text-white/25 sm:text-base"
                      />


                      <div className="mt-4 flex justify-stretch sm:justify-end">

                        <motion.button
                          type="button"
                          whileHover={{
                            scale: 1.03,
                          }}
                          whileTap={{
                            scale: 0.97,
                          }}
                          disabled={
                            aiLoading ||
                            !question.trim()
                          }
                          onClick={
                            askDocument
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black disabled:opacity-40 sm:w-auto"
                        >

                          {aiLoading ? (

                            <Loader2 className="h-4 w-4 animate-spin" />

                          ) : (

                            <MessageSquare className="h-4 w-4" />

                          )}

                          Ask

                        </motion.button>

                      </div>


                      <div className="mt-6 min-h-[220px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:min-h-[260px] sm:p-5">

                        {aiLoading ? (

                          <div className="flex h-[190px] items-center justify-center sm:h-[220px]">

                            <Loader2 className="h-6 w-6 animate-spin text-white/45" />

                          </div>

                        ) : aiResult ? (

                          <div>

                            <div className="mb-4 flex items-center justify-end">

                              <motion.button
                                type="button"
                                whileHover={{
                                  scale: 1.05,
                                }}
                                whileTap={{
                                  scale: 0.95,
                                }}
                                onClick={
                                  isSpeaking
                                    ? stopSpeaking
                                    : speakResult
                                }
                                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/65 transition hover:bg-white/[0.08] hover:text-white"
                              >

                                {isSpeaking ? (

                                  <Square className="h-4 w-4" />

                                ) : (

                                  <Volume2 className="h-4 w-4" />

                                )}

                                {isSpeaking
                                  ? "Stop"
                                  : "Read aloud"}

                              </motion.button>

                            </div>


                            <p className="break-words whitespace-pre-wrap text-sm leading-7 text-white/75 sm:text-base">

                              {aiResult}

                            </p>

                          </div>

                        ) : (

                          <div className="flex h-[190px] items-center justify-center text-center text-sm leading-6 text-white/30 sm:h-[220px]">

                            Summaries, simplified explanations and answers will appear here.

                          </div>

                        )}

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            ) : (

              <div className="flex min-h-[420px] items-center justify-center px-3 text-center lg:min-h-[580px]">


                <div className="max-w-md">


                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">

                    <FileText className="h-7 w-7 text-white/60" />

                  </div>


                  <h2 className="mt-6 text-2xl font-semibold">

                    Open a document.

                  </h2>


                  <p className="mt-3 leading-7 text-white/40">

                    Upload a PDF or image, or choose one from your library to read, summarize, simplify and explore with Lumina.

                  </p>

                </div>

              </div>

            )}

          </section>

        </div>

      </div>

    </main>
  );
}