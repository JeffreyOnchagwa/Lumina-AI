"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, type MouseEvent } from "react";

import {
  ArrowDown,
  ArrowRight,
  BrainCircuit,
  FileText,
  Mic2,
  ScanText,
  Sparkles,
  Waves,
  type LucideIcon,
} from "lucide-react";


type SceneProps = {
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  index: number;
  icon: LucideIcon;
};


function FloatingParticle({
  left,
  top,
  size,
  delay,
}: {
  left: string;
  top: string;
  size: number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.4,
      }}
      animate={{
        opacity: [0.15, 0.75, 0.15],
        scale: [0.8, 1.2, 0.8],
        y: [0, -20, 0],
      }}
      transition={{
        duration: 5 + delay,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
      style={{
        left,
        top,
        width: size,
        height: size,
      }}
      className="pointer-events-none absolute z-10 rounded-full bg-white/60 shadow-[0_0_28px_rgba(255,255,255,0.35)]"
    />
  );
}


function ParallaxScene({
  image,
  eyebrow,
  title,
  description,
  index,
  icon: Icon,
}: SceneProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const smoothPointerX = useSpring(pointerX, {
    stiffness: 90,
    damping: 20,
    mass: 0.4,
  });

  const smoothPointerY = useSpring(pointerY, {
    stiffness: 90,
    damping: 20,
    mass: 0.4,
  });

  const handlePointerMove = (
    event: MouseEvent<HTMLElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const normalizedX =
      (event.clientX - rect.left) / rect.width - 0.5;

    const normalizedY =
      (event.clientY - rect.top) / rect.height - 0.5;

    pointerX.set(normalizedX * 34);
    pointerY.set(normalizedY * 24);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 62,
    damping: 24,
    mass: 0.5,
  });

  const imageScale = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [1.06, 1.22, 1.5]
  );

  const imageScrollY = useTransform(
    smoothProgress,
    [0, 1],
    [-110, 130]
  );

  const imageScrollX = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [-24, 0, 24]
  );

  const imageOpacity = useTransform(
    smoothProgress,
    [0, 0.08, 0.22, 0.78, 0.94, 1],
    [0, 0.35, 1, 1, 0.35, 0]
  );

  const foregroundY = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [240, 0, -260]
  );

  const foregroundX = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [-30, 0, 34]
  );

  const foregroundScale = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [0.84, 1, 1.1]
  );

  const foregroundOpacity = useTransform(
    smoothProgress,
    [0.08, 0.28, 0.7, 0.9],
    [0, 1, 1, 0]
  );

  const fastLayerY = useTransform(
    smoothProgress,
    [0, 1],
    [300, -380]
  );

  const fastLayerX = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [-60, 0, 70]
  );

  const fastLayerScale = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [1.4, 1, 0.65]
  );

  const slowLayerY = useTransform(
    smoothProgress,
    [0, 1],
    [100, -140]
  );

  const atmosphereY = useTransform(
    smoothProgress,
    [0, 1],
    [220, -240]
  );

  const atmosphereScale = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [1.4, 1, 0.7]
  );

  const transitionShadeOpacity = useTransform(
    smoothProgress,
    [0, 0.1, 0.5, 0.9, 1],
    [0.7, 0.2, 0, 0.2, 0.7]
  );

  return (
    <section
      ref={sectionRef}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      className="relative h-[190vh]"
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-black">

        {/* BACKGROUND */}
        <motion.div
          style={{
            scale: imageScale,
            x: imageScrollX,
            y: imageScrollY,
            opacity: imageOpacity,
          }}
          className="absolute inset-[-12%]"
        >
          <motion.div
            style={{
              x: smoothPointerX,
              y: smoothPointerY,
            }}
            className="absolute inset-0"
          >
            <Image
              src={image}
              alt={title}
              fill
              sizes="100vw"
              priority={index === 0}
              quality={95}
              className="object-cover"
            />
          </motion.div>
        </motion.div>

        {/* DARK CINEMATIC LAYERS */}
        <div className="absolute inset-0 bg-black/10" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/80" />

        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-black/20" />

        <motion.div
          style={{
            opacity: transitionShadeOpacity,
          }}
          className="pointer-events-none absolute inset-0 bg-black"
        />

        {/* SOFT ATMOSPHERE */}
        <motion.div
          style={{
            y: atmosphereY,
            scale: atmosphereScale,
          }}
          className="pointer-events-none absolute -left-[12%] top-[10%] h-[760px] w-[760px] rounded-full bg-white/[0.035] blur-[220px]"
        />

        {/* PARTICLES */}
        <FloatingParticle
          left="12%"
          top="28%"
          size={5}
          delay={0.3}
        />

        <FloatingParticle
          left="76%"
          top="22%"
          size={4}
          delay={1.2}
        />

        <FloatingParticle
          left="88%"
          top="60%"
          size={6}
          delay={2.1}
        />

        <FloatingParticle
          left="35%"
          top="76%"
          size={3}
          delay={0.8}
        />

        {/* SLOW DEPTH GLASS PANEL */}
        <motion.div
          style={{
            y: slowLayerY,
            x: smoothPointerX,
          }}
          className="pointer-events-none absolute right-[8%] top-[18%] z-10 hidden md:block"
        >
          <div className="h-36 w-52 rounded-[28px] border border-white/10 bg-white/[0.035] backdrop-blur-xl">
            <div className="flex h-full flex-col justify-between p-5">
              <Sparkles className="h-5 w-5 text-white/65" />

              <div>
                <div className="h-1.5 w-20 rounded-full bg-white/30" />
                <div className="mt-2 h-1.5 w-32 rounded-full bg-white/15" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAST FOREGROUND PANEL */}
        <motion.div
          style={{
            y: fastLayerY,
            x: fastLayerX,
            scale: fastLayerScale,
          }}
          className="pointer-events-none absolute bottom-[6%] right-[4%] z-30 hidden lg:block"
        >
          <div className="w-64 rotate-[-4deg] rounded-[30px] border border-white/15 bg-black/30 p-5 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <Icon className="h-4 w-4" />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                  Live intelligence
                </p>

                <p className="mt-1 text-sm font-medium text-white/85">
                  Context active
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-end gap-1">
              {[16, 28, 22, 36, 18, 30, 24, 40, 19, 32].map(
                (height, itemIndex) => (
                  <motion.div
                    key={itemIndex}
                    animate={{
                      height: [
                        height,
                        height + 12,
                        height,
                      ],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      delay: itemIndex * 0.08,
                    }}
                    className="w-2 rounded-full bg-white/35"
                  />
                )
              )}
            </div>
          </div>
        </motion.div>

        {/* FOREGROUND TEXT */}
        <motion.div
          style={{
            y: foregroundY,
            x: foregroundX,
            scale: foregroundScale,
            opacity: foregroundOpacity,
          }}
          className="relative z-20 mx-auto flex h-full max-w-7xl items-center px-6 md:px-10 lg:px-16"
        >
          <div className="max-w-3xl">

            <motion.div
              whileHover={{
                scale: 1.04,
                x: 6,
              }}
              className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/15 bg-black/25 px-4 py-2 backdrop-blur-2xl"
            >
              <Icon className="h-4 w-4" />

              <span className="text-sm uppercase tracking-[0.24em] text-white/70">
                {eyebrow}
              </span>
            </motion.div>

            <h2 className="max-w-4xl text-5xl font-semibold leading-[0.94] tracking-[-0.06em] text-white md:text-7xl lg:text-[96px]">
              {title}
            </h2>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70 md:text-xl">
              {description}
            </p>

            <motion.button
              whileHover={{
                x: 10,
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.97,
              }}
              className="mt-9 flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-6 py-3.5 font-medium text-white backdrop-blur-2xl"
            >
              Explore experience
              <ArrowRight className="h-4 w-4" />
            </motion.button>

          </div>
        </motion.div>

        <motion.div
          style={{
            opacity: foregroundOpacity,
          }}
          className="pointer-events-none absolute bottom-8 right-8 z-20 text-[110px] font-semibold leading-none tracking-[-0.09em] text-white/[0.045] md:text-[180px]"
        >
          0{index + 1}
        </motion.div>

        <motion.div
          style={{
            opacity: foregroundOpacity,
          }}
          className="absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/40 md:flex"
        >
          <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
          Continue
        </motion.div>

      </div>
    </section>
  );
}


const scenes: Array<{
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    image: "/showcase/voice.png",
    eyebrow: "Voice intelligence",
    title: "Move through conversation.",
    description:
      "Speak naturally as Lumina listens, understands context, remembers what matters, and responds with adaptive voice.",
    icon: Mic2,
  },
  {
    image: "/showcase/documents.png",
    eyebrow: "Document intelligence",
    title: "Step inside your knowledge.",
    description:
      "Move through textbooks, lecture notes, scanned pages, and PDFs as if the knowledge around you were an explorable environment.",
    icon: FileText,
  },
  {
    image: "/showcase/vision.png",
    eyebrow: "Visual intelligence",
    title: "See information differently.",
    description:
      "Transform screenshots, photographed pages, and visual text into readable and understandable information.",
    icon: ScanText,
  },
];


export default function Home() {
  const heroRef = useRef<HTMLElement | null>(null);

  const heroPointerX = useMotionValue(0);
  const heroPointerY = useMotionValue(0);

  const smoothHeroPointerX = useSpring(heroPointerX, {
    stiffness: 90,
    damping: 20,
    mass: 0.4,
  });

  const smoothHeroPointerY = useSpring(heroPointerY, {
    stiffness: 90,
    damping: 20,
    mass: 0.4,
  });

  const handleHeroPointerMove = (
    event: MouseEvent<HTMLElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const normalizedX =
      (event.clientX - rect.left) / rect.width - 0.5;

    const normalizedY =
      (event.clientY - rect.top) / rect.height - 0.5;

    heroPointerX.set(normalizedX * 42);
    heroPointerY.set(normalizedY * 28);
  };

  const handleHeroPointerLeave = () => {
    heroPointerX.set(0);
    heroPointerY.set(0);
  };

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const smoothHeroProgress = useSpring(scrollYProgress, {
    stiffness: 62,
    damping: 24,
    mass: 0.5,
  });

  const heroImageScale = useTransform(
    smoothHeroProgress,
    [0, 1],
    [1.02, 1.36]
  );

  const heroImageY = useTransform(
    smoothHeroProgress,
    [0, 1],
    [0, 120]
  );

  const heroTextY = useTransform(
    smoothHeroProgress,
    [0, 1],
    [0, 290]
  );

  const heroTextScale = useTransform(
    smoothHeroProgress,
    [0, 1],
    [1, 0.88]
  );

  const heroTextOpacity = useTransform(
    smoothHeroProgress,
    [0, 0.68, 1],
    [1, 0.7, 0]
  );

  const heroShadeOpacity = useTransform(
    smoothHeroProgress,
    [0, 0.5, 1],
    [0.15, 0.05, 0.85]
  );

  const { scrollYProgress: pageProgress } = useScroll();

  const smoothPageProgress = useSpring(pageProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.4,
  });

  return (
    <main className="bg-[#050708] text-white">

      {/* SCROLL PROGRESS */}
      <motion.div
        style={{
          scaleX: smoothPageProgress,
        }}
        className="fixed left-0 top-0 z-[100] h-[2px] w-full origin-left bg-white/80"
      />

      {/* NAV */}
      <nav className="fixed left-1/2 top-5 z-50 flex w-[calc(100%-32px)] max-w-6xl -translate-x-1/2 items-center justify-between rounded-full border border-white/10 bg-black/25 px-5 py-3 backdrop-blur-2xl">

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.07]">
            <BrainCircuit className="h-5 w-5" />
          </div>

          <div>
            <div className="text-sm font-semibold tracking-wide">
              Lumina AI
            </div>

            <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">
              Adaptive intelligence
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-8 text-sm text-white/60 md:flex">
          <a
            href="#journey"
            className="transition hover:text-white"
          >
            Experience
          </a>

          <a
            href="#final"
            className="transition hover:text-white"
          >
            Enter Lumina
          </a>
        </div>

        <motion.button
          whileHover={{
            scale: 1.05,
            y: -1,
          }}
          whileTap={{
            scale: 0.96,
          }}
          className="rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm backdrop-blur-xl"
        >
          Sign in
        </motion.button>

      </nav>

      {/* HERO */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroPointerMove}
        onMouseLeave={handleHeroPointerLeave}
        className="relative h-[165vh]"
      >
        <div className="sticky top-0 h-screen overflow-hidden bg-black">

          <motion.div
            style={{
              scale: heroImageScale,
              y: heroImageY,
            }}
            className="absolute inset-[-6%]"
          >
            <motion.div
              style={{
                x: smoothHeroPointerX,
                y: smoothHeroPointerY,
              }}
              className="absolute inset-0"
            >
              <Image
                src="/showcase/voice.png"
                alt="Lumina immersive AI experience"
                fill
                priority
                quality={95}
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          </motion.div>

          <div className="absolute inset-0 bg-black/25" />

          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/5 to-[#050708]" />

          <motion.div
            style={{
              opacity: heroShadeOpacity,
            }}
            className="pointer-events-none absolute inset-0 bg-black"
          />

          {/* HERO FLOATING WAVEFORM */}
          <motion.div
            animate={{
              y: [0, -14, 0],
              rotate: [-1, 1, -1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute bottom-[14%] right-[6%] z-20 hidden rounded-[32px] border border-white/12 bg-black/25 p-6 backdrop-blur-2xl lg:block"
          >
            <Waves className="h-6 w-6 text-white/70" />

            <div className="mt-5 flex h-16 items-center gap-1">
              {[18, 40, 28, 54, 24, 46, 32, 58, 26, 44, 20].map(
                (height, index) => (
                  <motion.div
                    key={index}
                    animate={{
                      height: [
                        height,
                        height + 16,
                        height,
                      ],
                    }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      delay: index * 0.07,
                    }}
                    className="w-2 rounded-full bg-white/40"
                  />
                )
              )}
            </div>
          </motion.div>

          <motion.div
            style={{
              y: heroTextY,
              scale: heroTextScale,
              opacity: heroTextOpacity,
            }}
            className="relative z-10 mx-auto flex h-screen max-w-7xl items-center px-6 md:px-10 lg:px-16"
          >
            <div className="max-w-5xl pt-16">

              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.9,
                }}
                className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-2 backdrop-blur-xl"
              >
                <Sparkles className="h-4 w-4" />

                <span className="text-sm text-white/70">
                  Intelligence you move through
                </span>
              </motion.div>

              <motion.h1
                initial={{
                  opacity: 0,
                  y: 45,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 1,
                  delay: 0.12,
                }}
                className="max-w-6xl text-6xl font-semibold leading-[0.88] tracking-[-0.07em] md:text-8xl lg:text-[122px]"
              >
                Don&apos;t just use AI.
                <br />

                <span className="text-white/48">
                  Move through it.
                </span>
              </motion.h1>

              <motion.p
                initial={{
                  opacity: 0,
                  y: 28,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.9,
                  delay: 0.3,
                }}
                className="mt-8 max-w-2xl text-lg leading-8 text-white/68 md:text-xl"
              >
                Voice, documents, vision, memory and accessibility become one
                continuous interactive environment.
              </motion.p>

              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  duration: 1,
                  delay: 0.65,
                }}
                className="mt-12 flex items-center gap-4 text-sm text-white/50"
              >
                <ArrowDown className="h-4 w-4 animate-bounce" />

                Scroll to enter the experience
              </motion.div>

            </div>
          </motion.div>

        </div>
      </section>

      <div id="journey">
        {scenes.map((scene, index) => (
          <ParallaxScene
            key={scene.title}
            {...scene}
            index={index}
          />
        ))}
      </div>

      {/* FINAL CTA */}
      <section
        id="final"
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050708] px-6"
      >
        <div className="pointer-events-none absolute h-[700px] w-[700px] rounded-full bg-white/[0.028] blur-[200px]" />

        <motion.div
          initial={{
            opacity: 0,
            y: 70,
            scale: 0.92,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          viewport={{
            once: true,
            amount: 0.35,
          }}
          transition={{
            duration: 1.1,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative z-10 max-w-5xl text-center"
        >
          <p className="text-sm uppercase tracking-[0.27em] text-white/40">
            Your workspace is waiting
          </p>

          <h2 className="mt-6 text-5xl font-semibold leading-[0.94] tracking-[-0.06em] md:text-7xl lg:text-[98px]">
            One interface.
            <br />
            Many ways to think.
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/58">
            Talk, read, listen, upload, scan, remember and explore without
            leaving Lumina.
          </p>

          <motion.button
            whileHover={{
              scale: 1.05,
              y: -5,
            }}
            whileTap={{
              scale: 0.97,
            }}
            className="mt-10 rounded-full bg-white px-8 py-4 font-medium text-black"
          >
            Enter Lumina
          </motion.button>
        </motion.div>
      </section>

    </main>
  );
}