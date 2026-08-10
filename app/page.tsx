"use client";

import { useEffect, useRef, useState } from "react";

const loveNotes = [
  {
    number: "01",
    eyebrow: "Mi regalo favorito",
    text: "Eres el mejor regalo que Dios me ha dado.",
  },
  {
    number: "02",
    eyebrow: "Mi bonita casualidad",
    text: "Eres la coincidencia más bonita que me ha pasado.",
  },
  {
    number: "03",
    eyebrow: "Mi lugar seguro",
    text: "Contigo, hasta los días más simples se convierten en recuerdos extraordinarios.",
  },
];

type Star = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speed: number;
  phase: number;
};

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function GalaxyCanvas({ revealed }: { revealed: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let frame = 0;
    let stars: Star[] = [];
    let shootingStar = { x: width * 0.82, y: height * 0.08, life: 0 };
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const createStars = () => {
      const random = seededRandom(1437);
      const amount = Math.min(520, Math.floor((width * height) / 2600));
      stars = Array.from({ length: amount }, () => ({
        x: random() * width,
        y: random() * height,
        radius: random() * 1.4 + 0.25,
        alpha: random() * 0.65 + 0.25,
        speed: random() * 0.018 + 0.006,
        phase: random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      createStars();
    };

    const drawGlow = (x: number, y: number, radius: number, color: string) => {
      const glow = context.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, color);
      glow.addColorStop(1, "transparent");
      context.fillStyle = glow;
      context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    };

    const drawHeartConstellation = (time: number) => {
      const scale = Math.min(width, height) * (width < 620 ? 0.021 : 0.026);
      const centerX = width * (width < 850 ? 0.5 : 0.74);
      const centerY = height * (width < 850 ? 0.31 : 0.49);
      const points = Array.from({ length: 25 }, (_, index) => {
        const t = (Math.PI * 2 * index) / 25;
        return {
          x: centerX + 0.88 * scale * 16 * Math.pow(Math.sin(t), 3),
          y:
            centerY -
            0.88 * scale *
              (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
        };
      });

      context.beginPath();
      points.forEach((point, index) => {
        if (index === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      });
      context.closePath();
      context.strokeStyle = "rgba(255, 255, 255, 0.16)";
      context.lineWidth = 0.75;
      context.stroke();

      points.forEach((point, index) => {
        const pulse = 0.75 + Math.sin(time * 0.0016 + index) * 0.25;
        drawGlow(point.x, point.y, 14, `rgba(228, 215, 255, ${0.12 * pulse})`);
        context.beginPath();
        context.arc(point.x, point.y, index % 4 === 0 ? 2.4 : 1.4, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, 255, 255, ${pulse})`;
        context.fill();
      });
    };

    const render = (time = 0) => {
      context.clearRect(0, 0, width, height);

      drawGlow(width * 0.18, height * 0.25, Math.max(width, height) * 0.46, "rgba(70, 35, 120, 0.16)");
      drawGlow(width * 0.78, height * 0.72, Math.max(width, height) * 0.38, "rgba(132, 50, 100, 0.10)");

      stars.forEach((star) => {
        const twinkle = prefersReducedMotion
          ? star.alpha
          : star.alpha * (0.7 + Math.sin(time * star.speed + star.phase) * 0.3);
        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
        context.fill();
      });

      if (revealed) {
        drawHeartConstellation(time);
        if (!prefersReducedMotion) {
          shootingStar.life = (shootingStar.life + 0.006) % 1;
          const travel = shootingStar.life * (width + 280);
          const x = shootingStar.x - travel;
          const y = shootingStar.y + travel * 0.34;
          const gradient = context.createLinearGradient(x, y, x + 120, y - 42);
          gradient.addColorStop(0, "rgba(255,255,255,0)");
          gradient.addColorStop(1, "rgba(255,255,255,0.85)");
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(x + 120, y - 42);
          context.strokeStyle = gradient;
          context.lineWidth = 1.1;
          context.stroke();
        }
      }

      if (!prefersReducedMotion) frame = requestAnimationFrame(render);
    };

    resize();
    render();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [revealed]);

  return <canvas ref={canvasRef} className="galaxy-canvas" aria-hidden="true" />;
}

export default function Home() {
  const [revealed, setRevealed] = useState(false);
  const experienceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (revealed) return;

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscroll = body.style.overscrollBehavior;

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousBodyOverscroll;
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };
  }, [revealed]);

  useEffect(() => {
    if (!revealed) return;

    const root = experienceRef.current;
    if (!root) return;

    const clamp = (value: number, limit = 10) => Math.max(-limit, Math.min(limit, value));
    const applyDepth = (x: number, y: number) => {
      const tiltX = clamp(x);
      const tiltY = clamp(y);
      root.style.setProperty("--depth-x", `${tiltX}px`);
      root.style.setProperty("--depth-y", `${tiltY}px`);
      root.style.setProperty("--depth-inverse-x", `${-tiltX * 0.55}px`);
      root.style.setProperty("--depth-inverse-y", `${-tiltY * 0.55}px`);
      root.style.setProperty("--depth-rotate-x", `${tiltY * -0.18}deg`);
      root.style.setProperty("--depth-rotate-y", `${tiltX * 0.18}deg`);
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma === null || event.beta === null) return;
      applyDepth(event.gamma / 3.5, (event.beta - 45) / 4.5);
    };

    const handlePointer = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      const x = (event.clientX / window.innerWidth - 0.5) * 16;
      const y = (event.clientY / window.innerHeight - 0.5) * 16;
      applyDepth(x, y);
    };

    const resetDepth = () => applyDepth(0, 0);
    window.addEventListener("deviceorientation", handleOrientation, true);
    window.addEventListener("pointermove", handlePointer, { passive: true });
    document.documentElement.addEventListener("mouseleave", resetDepth);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
      window.removeEventListener("pointermove", handlePointer);
      document.documentElement.removeEventListener("mouseleave", resetDepth);
    };
  }, [revealed]);

  const openSurprise = () => {
    setRevealed(true);
    const orientationEvent = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    if (typeof orientationEvent.requestPermission === "function") {
      void orientationEvent.requestPermission().catch(() => undefined);
    }
    window.setTimeout(() => document.querySelector("main")?.focus(), 700);
  };

  return (
    <div ref={experienceRef} className={`experience ${revealed ? "is-revealed" : ""}`}>
      <GalaxyCanvas revealed={revealed} />

      <div className="intro" aria-hidden={revealed}>
        <div className="intro-orbit intro-orbit-one" />
        <div className="intro-orbit intro-orbit-two" />
        <section className="intro-card" aria-label="Sorpresa para Yeckis">
          <span className="tiny-star" aria-hidden="true">✦</span>
          <p className="intro-kicker">Una pequeña sorpresa</p>
          <h1>Para mi novia<br /><em>Yeckis</em></h1>
          <p className="intro-copy">
            Preparé un pedacito del universo para recordarte lo especial que eres para mí.
          </p>
          <button className="open-button" type="button" onClick={openSurprise}>
            <span>Abrir sorpresa</span>
            <span className="button-star" aria-hidden="true">✦</span>
          </button>
          <p className="intro-whisper">Toca para encender las estrellas</p>
        </section>
      </div>

      <main tabIndex={-1}>
        <nav className="topbar" aria-label="Encabezado">
          <a href="#inicio" className="wordmark" aria-label="Ir al inicio">Y <span>✦</span></a>
          <p>Una historia escrita en las estrellas</p>
          <span className="date-mark">Para siempre</span>
        </nav>

        <section id="inicio" className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span /> Para mi persona favorita</p>
            <h2 id="hero-title">Yeckis, tú eres<br />mi <em>universo</em> favorito.</h2>
            <p className="hero-note">
              Si pudiera regalarte algo, te regalaría la forma en la que te veo: llena de luz,
              infinita y absolutamente extraordinaria.
            </p>
            <a className="continue-link" href="#mensajes">
              Descubre lo que siento <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-caption" aria-hidden="true">
            <span>✦</span>
            <p>Entre millones de estrellas,<br />siempre te elegiría a ti.</p>
          </div>
          <span className="side-label" aria-hidden="true">11 DE JULIO DE 2026</span>
        </section>

        <section id="mensajes" className="messages" aria-labelledby="messages-title">
          <header className="section-heading">
            <p className="eyebrow"><span /> Suspiros escritos para ti</p>
            <h2 id="messages-title">Todo lo bonito<br />me lleva a <em>ti.</em></h2>
          </header>

          <div className="note-grid">
            {loveNotes.map((note) => (
              <article className="love-note" key={note.number}>
                <span className="note-number">{note.number}</span>
                <span className="note-star" aria-hidden="true">✦</span>
                <p>{note.eyebrow}</p>
                <h3>{note.text}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="finale" aria-labelledby="final-title">
          <div className="heart-cluster" aria-hidden="true">
            {Array.from({ length: 22 }, (_, index) => <i key={index} />)}
          </div>
          <p className="eyebrow"><span /> Mi promesa</p>
          <h2 id="final-title">En esta vida y en<br />todas las que existan.</h2>
          <p>Te elegiría una y mil veces más.</p>
          <div className="signature">Con todo mi amor <span>✦</span></div>
        </section>

        <footer>
          <p>HECHO CON AMOR DE J.COCHACHI</p>
          <span>Para Yeckis · Siempre</span>
        </footer>
      </main>
    </div>
  );
}
