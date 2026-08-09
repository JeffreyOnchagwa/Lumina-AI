"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  FileText,
  Mic2,
  ScanText,
} from "lucide-react";

const slides = [
  {
    id: 1,
    title: "Talk naturally",
    description:
      "Speak to Lumina and receive intelligent, context-aware responses with natural voice playback.",
    image: "/showcase/voice.png",
    icon: Mic2,
    label: "Voice",
  },
  {
    id: 2,
    title: "Understand any document",
    description:
      "Upload lecture notes, textbooks, and PDFs. Ask questions, simplify concepts, and explore instantly.",
    image: "/showcase/documents.png",
    icon: FileText,
    label: "Documents",
  },
  {
    id: 3,
    title: "See and understand",
    description:
      "Use OCR and visual understanding to turn images, screenshots, and photographed text into usable knowledge.",
    image: "/showcase/vision.png",
    icon: ScanText,
    label: "Vision",
  },
];

export default function ShowcaseCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => {
        return (current + 1) % slides.length;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const activeSlide = slides[activeIndex];

  return (
    <section
      id="experience"
      className="mx-auto max-w-7xl py-24"
    >
      <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--text-muted)]">
              The Lumina experience
            </p>

            <h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
              More than a chat box.
              <span className="text-gradient">
                {" "}
                A living AI workspace.
              </span>
            </h2>

            <p className="mt-6 max-w-lg text-lg leading-8 text-[var(--text-secondary)]">
              Move between voice, documents, vision, and conversation without
              leaving your workspace.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {slides.map((slide, index) => {
              const Icon = slide.icon;
              const isActive = index === activeIndex;

              return (
                <motion.button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  whileHover={{
                    x: 8,
                    scale: 1.01,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  className={[
                    "w-full rounded-[22px] border p-4 text-left transition",
                    isActive
                      ? "border-white/20 bg-white/10"
                      : "border-white/8 bg-white/[0.025] hover:bg-white/[0.05]",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={[
                        "flex h-11 w-11 items-center justify-center rounded-2xl transition",
                        isActive
                          ? "bg-white text-black"
                          : "bg-white/8 text-white",
                      ].join(" ")}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="text-sm text-[var(--text-muted)]">
                        {slide.label}
                      </div>

                      <div className="mt-1 font-medium">
                        {slide.title}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.8,
          }}
          className="relative min-h-[620px] overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.035]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{
                opacity: 0,
                scale: 1.08,
                x: 55,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                x: -55,
              }}
              transition={{
                duration: 0.75,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute inset-0"
            >
              <motion.div
                animate={{
                  scale: [1, 1.035, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0"
              >
                <Image
                  src={activeSlide.image}
                  alt={activeSlide.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              </motion.div>

              <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/20 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 24,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.2,
                    duration: 0.5,
                  }}
                  className="glass max-w-xl rounded-[26px] p-6"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
                    {activeSlide.label}
                  </p>

                  <h3 className="mt-2 text-3xl font-semibold">
                    {activeSlide.title}
                  </h3>

                  <p className="mt-3 leading-7 text-[var(--text-secondary)]">
                    {activeSlide.description}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute right-5 top-5 z-20 flex gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={[
                  "h-2 rounded-full transition-all duration-500",
                  index === activeIndex
                    ? "w-8 bg-white"
                    : "w-2 bg-white/30",
                ].join(" ")}
                aria-label={`Show ${slide.title}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}