"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, TargetAndTransition, Transition, useMotionValue, useTransform, useAnimationFrame } from "framer-motion";
import Image from "next/image";
import { Copy, Check } from "lucide-react";

type FolderProps = {
  src: string;
  label: string;
  onClick?: (e?: React.MouseEvent) => void;
  onHover?: (label: string | null) => void;
  className?: string;
  initial?: TargetAndTransition;
  animate?: TargetAndTransition;
  exit?: TargetAndTransition;
  transition?: Transition;
  isSelected?: boolean;
  compact?: boolean;
  priority?: boolean;
  hideLabel?: boolean;
};

const Folder = ({ src, label, onClick, onHover, className, initial, animate, exit, transition, isSelected, compact = false, priority = false, hideLabel = false }: FolderProps) => (
  <motion.div
    className={`flex flex-col items-center justify-center cursor-pointer group outline-none ${className}`}
    initial={initial}
    animate={animate}
    exit={exit}
    transition={transition}
    onClick={(e) => onClick?.(e)}
    onMouseEnter={() => onHover?.(label)}
    onMouseLeave={() => onHover?.(null)}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    style={{
      position: className?.includes('absolute') ? 'absolute' : 'relative',
      minWidth: compact ? '84px' : '100px',
      gap: compact ? '4px' : '6px'
    }}
  >
    <div className={`relative ${compact ? 'w-18 h-18' : 'w-22 h-22'} flex items-center justify-center transition-all duration-200 ${isSelected ? 'scale-110' : ''}`}>
      <div className={`relative ${compact ? 'w-16 h-16' : 'w-20 h-20'}`}>
        <Image
          src={src}
          alt={label}
          draggable={false}
          fill
          priority={priority}
          unoptimized={src.endsWith('.svg')}
          sizes={compact ? '64px' : '80px'}
          style={{
            objectFit: "contain",
            filter: isSelected ? "drop-shadow(0 0 10px rgba(59, 130, 246, 0.9))" : "none"
          }}
        />
      </div>
    </div>
    {!hideLabel && (
      <span className={`folder-label transition-colors z-10 ${compact ? 'text-sm' : ''} ${isSelected ? 'bg-blue-600 text-white shadow-lg' : ''}`}>
        {label}
      </span>
    )}
  </motion.div>
);

type OrbitItem = { src: string; label: string };

// Skills ring: icons orbit the hub continuously, pausing while one is hovered.
const SkillsOrbit = ({
  items,
  isMobile,
  hoveredLabel,
  setHoveredLabel,
}: {
  items: OrbitItem[];
  isMobile: boolean;
  hoveredLabel: string | null;
  setHoveredLabel: (label: string | null) => void;
}) => {
  const rotation = useMotionValue(0);
  const counterRotation = useTransform(rotation, (v) => -v);
  const pausedRef = useRef(false);
  const speedRef = useRef(0); // current angular speed, deg/sec
  const maxDegreesPerSecond = 7.5; // one full revolution ~48s

  useAnimationFrame((_, delta) => {
    const dt = Math.min(delta / 1000, 0.05);
    const target = pausedRef.current ? 0 : maxDegreesPerSecond;
    // Ease the speed toward its target so the ring spins up / coasts to a stop.
    speedRef.current += (target - speedRef.current) * Math.min(1, dt * 3.5);
    rotation.set(rotation.get() + dt * speedRef.current);
  });

  const orbitRadius = isMobile ? 140 : 250;

  return (
    <motion.div
      style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, rotate: rotation }}
    >
      {items.map((item, idx) => {
        const angle = (idx / items.length) * Math.PI * 2 - Math.PI / 2;
        const tx = Math.cos(angle) * orbitRadius;
        const ty = Math.sin(angle) * orbitRadius;
        return (
          <motion.div
            key={item.label}
            style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: isMobile ? "none" : "auto" }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{ x: tx, y: ty, opacity: 1, scale: 1 }}
            exit={{ x: 0, y: 0, opacity: 0, scale: 0, transition: { duration: 0.18, ease: "easeIn" } }}
            transition={{ type: "spring", stiffness: 240, damping: 20, delay: 0.18 + idx * 0.08 }}
            onMouseEnter={isMobile ? undefined : () => { pausedRef.current = true; setHoveredLabel(item.label); }}
            onMouseLeave={isMobile ? undefined : () => { pausedRef.current = false; setHoveredLabel(null); }}
          >
            <motion.div style={{ display: "flex", alignItems: "center", justifyContent: "center", rotate: counterRotation, scale: isMobile ? 0.6 : 1 }}>
              <Folder
                src={item.src}
                label={item.label}
                isSelected={hoveredLabel === item.label}
                compact={isMobile}
                hideLabel
              />
            </motion.div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

const skillBlurbs: Record<string, string> = {
  Python: "My go-to for ML & scripting",
  React: "Component-driven web UIs",
  Java: "OOP & backend fundamentals",
  PostgreSQL: "Relational data, done right",
  CSS: "Styling & responsive layouts",
  Photoshop: "Photo editing & design",
  "Premiere Pro": "Video editing & motion",
  "Three.js": "3D graphics on the web",
  "Next.js": "My framework of choice",
  Ollama: "Running LLMs locally",
  "Claude Code": "AI pair programming",
  Cursor: "AI-native code editor",
  OpenAI: "GPT & API integrations",
  Git: "Version control everywhere",
};

const creativeCloudItems = [
  { label: "Lightroom", src: "/images/optimized/cc-lr-folder.png" },
  { label: "Premiere Pro", src: "/images/optimized/cc-pr-folder.png" },
  { label: "Photoshop", src: "/images/optimized/cc-ps-folder.png" },
];

const contactLinks: { modal: string; label: string; color: string; path?: string; img?: string; href?: string; email?: string }[] = [
  {
    modal: 'Email', label: 'Email', color: '#ff3b30',
    img: '/icons/contact/gmail.svg',
    email: 'daniel.lopez.3@stonybrook.edu',
  },
  {
    modal: 'GitHub', label: 'GitHub', color: '#1f1f1f',
    href: 'https://github.com/danrublop',
    path: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z',
  },
  {
    modal: 'LinkedIn', label: 'LinkedIn', color: '#0a66c2',
    href: 'https://www.linkedin.com/in/daniel-lopez-009620276',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  {
    modal: 'X', label: 'X', color: '#0a0a0a',
    href: 'https://x.com/danrublop',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
];

const photographyGallery = [
  "/images/photography/dsc-9405.jpeg",
  "/images/photography/dsc-9117.jpeg",
  "/images/photography/dsc-8587.jpeg",
  "/images/photography/dsc-7035.jpeg",
  "/images/photography/dsc-8414.jpeg",
  "/images/photography/dsc-8663.jpeg",
  "/images/photography/dsc-9672.JPG",
];

const Modal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  icon, 
  photo, 
  gallery, 
  notesWidth, 
  variant = "default", 
  confirmLabel = "Open", 
  isMobile = false,
  activeCreativeLabel,
  setActiveCreativeLabel,
  activePhotoUrl,
  setActivePhotoUrl,
  onSwitchModal
}: {
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  title: string, 
  message: string, 
  icon: string, 
  photo?: string, 
  gallery?: string[], 
  notesWidth?: number, 
  variant?: "default" | "notes" | "terminal" | "photos" | "mail" | "about" | "projects-grid",
  confirmLabel?: string,
  isMobile?: boolean,
  activeCreativeLabel?: string,
  setActiveCreativeLabel?: (label: string) => void,
  activePhotoUrl?: string,
  setActivePhotoUrl?: (url: string) => void,
  onSwitchModal?: (key: string) => void
}) => {
  const noteLines = message.split("\n").filter((line) => line.trim().length > 0);
  const terminalLoadingText: Record<string, string> = {
    Python: "Collecting package metadata",
    React: "Resolving npm dependencies",
    Java: "Fetching openjdk formula",
    PostgreSQL: "Resolving postgresql package",
    CSS: "Resolving Tailwind toolchain",
    "Three.js": "Resolving three package",
    "Next.js": "Scaffolding Next.js project",
    Ollama: "Installing local runtime",
    "Claude Code": "Installing Claude Code package",
    Cursor: "Installing Cursor CLI",
    OpenAI: "Resolving openai package",
    Git: "Installing git binaries",
  };
  const terminalCommand = message.split("\n")[0] || "echo ready";
  const terminalOutput = `Last login: Thu Mar 26 12:39:20 on ttys023
daniellopez@Daniels-MacBook-Pro ~ % ${terminalCommand}
`;
  
  const activeCreativeItem = creativeCloudItems.find(i => i.label === activeCreativeLabel) || creativeCloudItems[0];
  const activePhoto = activePhotoUrl || (gallery && gallery.length > 0 ? gallery[0] : (title === "Photography" ? photographyGallery[0] : photographyGallery[0]));

  const [photoZoom, setPhotoZoom] = useState(1);
  const [hoveredInterest, setHoveredInterest] = useState<string | null>(null);
  const [selectedProjectIdx, setSelectedProjectIdx] = useState(0);
  const logoAreaRef = useRef<HTMLDivElement | null>(null);
  const logoModelRef = useRef<HTMLDivElement | null>(null);
  const logoMotionRef = useRef({
    dragging: false,
    lastX: 0,
    lastY: 0,
    spinX: -18,
    spinY: 24,
    velX: 0,
    velY: 0,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (variant === "photos" && title === "Creative Cloud" && setActiveCreativeLabel) {
      setActiveCreativeLabel(creativeCloudItems[0].label);
    }
    if (variant === "photos" && title === "Photography" && setActivePhotoUrl) {
      setActivePhotoUrl(photographyGallery[0]);
      setPhotoZoom(1);
    }
    if (variant === "photos" && title !== "Creative Cloud" && gallery && gallery.length > 0 && setActivePhotoUrl) {
      setActivePhotoUrl(gallery[0]);
      setPhotoZoom(1);
    }
  }, [variant, title, gallery, setActiveCreativeLabel, setActivePhotoUrl]);

  useEffect(() => {
    setPhotoZoom(1);
  }, [activePhoto]);

  useEffect(() => {
    if (title !== "Three.js") return;
    logoMotionRef.current = {
      dragging: false,
      lastX: 0,
      lastY: 0,
      spinX: -18,
      spinY: 24,
      velX: 0,
      velY: 0,
    };
  }, [title, isOpen]);

  useEffect(() => {
    if (!isOpen || title !== "Three.js") return;

    const onMouseMove = (e: MouseEvent) => {
      const motion = logoMotionRef.current;
      if (!motion.dragging) return;
      const dx = e.clientX - motion.lastX;
      const dy = e.clientY - motion.lastY;
      motion.spinX -= dy * 0.9;
      motion.spinY += dx * 0.9;
      motion.velX = -dy * 0.06;
      motion.velY = dx * 0.06;
      motion.lastX = e.clientX;
      motion.lastY = e.clientY;
    };

    const onMouseUp = () => {
      logoMotionRef.current.dragging = false;
    };

    const onMouseDown = (e: MouseEvent) => {
      const area = logoAreaRef.current;
      if (!area) return;
      if (!area.contains(e.target as Node)) return;
      e.preventDefault();
      logoMotionRef.current.dragging = true;
      logoMotionRef.current.lastX = e.clientX;
      logoMotionRef.current.lastY = e.clientY;
    };

    let raf = 0;
    const tick = () => {
      const m = logoMotionRef.current;
      if (!m.dragging) {
        m.spinX += m.velX;
        m.spinY += m.velY;

        // Dampen inertial spin over time.
        m.velX *= 0.95;
        m.velY *= 0.95;

        // Spring back to the resting orientation.
        m.spinX += (-18 - m.spinX) * 0.04;
        m.spinY += (24 - m.spinY) * 0.04;
      }
      if (logoModelRef.current) {
        logoModelRef.current.style.transform = `rotateX(${m.spinX}deg) rotateY(${m.spinY}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousedown", onMouseDown);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [isOpen, title]);

  useEffect(() => {
    if (!isOpen || variant !== "photos") return;

    const handleGalleryArrows = (e: KeyboardEvent) => {
      if (title !== "Creative Cloud" && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key) && setActivePhotoUrl) {
        e.preventDefault();
        const currentGallery = title === "Photography" ? photographyGallery : (gallery && gallery.length > 0 ? gallery : photographyGallery);
        const currentIndex = currentGallery.indexOf(activePhoto);
        const delta = e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1;
        const nextIndex = (currentIndex + delta + currentGallery.length) % currentGallery.length;
        setActivePhotoUrl(currentGallery[nextIndex]);
      }

      if (title === "Creative Cloud" && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key) && setActiveCreativeLabel) {
        e.preventDefault();
        const currentIndex = creativeCloudItems.findIndex((item) => item.label === activeCreativeItem.label);
        const delta = e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1;
        const nextIndex = (currentIndex + delta + creativeCloudItems.length) % creativeCloudItems.length;
        setActiveCreativeLabel(creativeCloudItems[nextIndex].label);
      }
    };

    window.addEventListener("keydown", handleGalleryArrows);
    return () => window.removeEventListener("keydown", handleGalleryArrows);
  }, [isOpen, variant, title, activePhoto, activeCreativeItem, photographyGallery, creativeCloudItems, gallery]);

  return (
  <AnimatePresence>
    {isOpen && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onClose()}
        style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}
      >
        <motion.div 
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 40 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          style={{
            width: '100%',
            maxWidth: isMobile
              ? 'calc(100vw - 16px)'
              : variant === "notes"
                ? `${notesWidth ?? 500}px`
                : variant === "terminal"
                  ? '1120px'
                  : variant === "photos"
                    ? '620px'
                    : variant === "mail"
                      ? '680px'
                      : variant === "about"
                        ? '560px'
                        : variant === "projects-grid"
                          ? '720px'
                          : '380px',
            maxHeight: isMobile ? 'calc(100vh - 24px)' : 'none',
            backgroundColor: variant === "notes" ? '#fff7d6' : variant === "terminal" ? '#1a1a1a' : variant === "projects-grid" ? 'rgba(255,255,255,0.55)' : '#ffffff',
            backdropFilter: variant === "projects-grid" ? 'blur(40px) saturate(180%)' : undefined,
            WebkitBackdropFilter: variant === "projects-grid" ? 'blur(40px) saturate(180%)' : undefined,
            borderRadius: '22px',
            boxShadow: '0 32px 64px -16px rgba(0,0,0,0.2)',
            border: variant === "notes" ? '1px solid #e3d59d' : variant === "terminal" ? '1px solid #111' : variant === "projects-grid" ? '1px solid rgba(255,255,255,0.5)' : '1px solid rgba(0,0,0,0.08)',
            padding: variant === "notes" ? '24px' : (variant === "terminal" || variant === "photos" || variant === "mail" || variant === "about" || variant === "projects-grid") ? '0' : '32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: variant === "notes" ? 'left' : (variant === "terminal" || variant === "mail" || variant === "about" || variant === "projects-grid") ? 'left' : 'center',
            position: 'relative',
            overflow: isMobile ? 'hidden' : 'visible'
          }}
        >
          {variant === "mail" ? (
            <div style={{ width: '100%', minHeight: isMobile ? '400px' : '480px', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', borderRadius: '22px', overflow: 'hidden' }}>
              <div style={{ width: '100%', background: '#f5f5f5', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0', position: 'relative' }}>
                <div style={{ display: 'flex', gap: '8px', zIndex: 10 }}>
                  <div onClick={onClose} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f57', border: '0.5px solid #e0443e', cursor: 'pointer' }}></div>
                  <div onClick={onClose} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e', border: '0.5px solid #dea123', cursor: 'pointer' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f', border: '0.5px solid #1aab29' }}></div>
                </div>
                <div style={{ position: 'absolute', left: '0', right: '0', textAlign: 'center', pointerEvents: 'none' }}>
                  <span style={{ fontSize: '13px', color: '#333', fontWeight: 600 }}>New Message</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', zIndex: 10 }}>
                   <div onClick={onConfirm} style={{ width: '22px', height: '22px', position: 'relative', cursor: 'pointer', opacity: 0.8 }} title="Send">
                     <Image src="/icons/contact/email.png" alt="Send" fill style={{ objectFit: 'contain' }} />
                   </div>
                </div>
              </div>
              <div style={{ padding: '0 20px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', fontSize: '14px' }}>
                  <span style={{ color: '#888', minWidth: '70px' }}>To:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#111', fontWeight: 500 }}>{photo || "daniel.lopez.3@stonybrook.edu"}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(photo || "daniel.lopez.3@stonybrook.edu");
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      style={{ 
                        border: 'none', 
                        background: 'none', 
                        padding: '4px', 
                        cursor: 'pointer', 
                        color: copied ? '#27c93f' : '#888',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        transition: 'all 0.2s',
                        backgroundColor: copied ? 'rgba(39, 201, 63, 0.1)' : 'transparent'
                      }}
                      title="Copy email"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <div style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', fontSize: '14px' }}>
                  <span style={{ color: '#888', minWidth: '70px' }}>From:</span>
                  <span style={{ color: '#111' }}>you@example.com</span>
                </div>
                <div style={{ padding: '10px 0', display: 'flex', fontSize: '14px' }}>
                  <span style={{ color: '#888', minWidth: '70px' }}>Subject:</span>
                  <span style={{ color: '#111', fontWeight: 500 }}>Portfolio Inquiry</span>
                </div>
              </div>
              <div style={{ flex: 1, padding: '20px', fontSize: '15px', color: '#333', lineHeight: 1.5, outline: 'none' }} contentEditable={true} suppressContentEditableWarning={true}>
                Greetings Daniel,<br/><br/>
                I just explored your portfolio and I'm very impressed with your work. I would love to connect and discuss potential opportunities.<br/><br/>
                Best regards,<br/>
                [Your Name]
              </div>
            </div>
          ) : variant === "notes" ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: 'calc(100% + 48px)', margin: '-24px -24px 16px -24px', backgroundColor: '#ffd95a', borderTopLeftRadius: '22px', borderTopRightRadius: '22px', borderBottom: '1px solid #e3c44e', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div onClick={onClose} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f57', border: '0.5px solid #e0443e', cursor: 'pointer' }}></div>
                  <div onClick={onClose} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e', border: '0.5px solid #dea123', cursor: 'pointer' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f', border: '0.5px solid #1aab29' }}></div>
                </div>
                <div style={{ width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', filter: 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.18))' }}>
                  <Image src="/icons/notes-symbol.png" alt="Notes" fill style={{ objectFit: 'contain' }} />
                </div>
              </div>
              <div style={{ width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <ul style={{ fontSize: '16px', color: '#333', lineHeight: 1.7, paddingLeft: '22px', fontWeight: 500, listStyleType: 'disc' }}>
                    {noteLines.map((line, idx) => (
                      line.startsWith("## ") ? (
                        <li key={`${line}-${idx}`} style={{ listStyle: 'none', marginLeft: '-22px', marginTop: idx === 0 ? '0' : '10px', marginBottom: '2px', fontWeight: 700, color: '#111' }}>
                          {line.replace("## ", "")}
                        </li>
                      ) : (
                        <li key={`${line}-${idx}`} style={{ marginBottom: '4px' }}>{line}</li>
                      )
                    ))}
                  </ul>
                </div>
                {photo && (
                  <div style={{ position: 'relative', width: '106px', minWidth: '106px', height: '132px', backgroundColor: '#fff', border: '2px dashed #d9c46a', borderRadius: '8px', padding: '6px', boxShadow: '0 6px 16px rgba(0,0,0,0.15)', transform: 'rotate(6deg)' }}>
                    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '4px', overflow: 'hidden' }}>
                      <Image src={photo} alt="school photo" fill style={{ objectFit: 'cover' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : variant === "terminal" || variant === "photos" ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: '100%', position: 'relative', background: variant === "terminal" ? '#262626' : '#efefef', borderTopLeftRadius: '22px', borderTopRightRadius: '22px', borderBottom: variant === "terminal" ? '1px solid #303030' : '1px solid #d9d9d9', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div onClick={onClose} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f57', border: '0.5px solid #e0443e', cursor: 'pointer' }}></div>
                  <div onClick={onClose} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e', border: '0.5px solid #dea123', cursor: 'pointer' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f', border: '0.5px solid #1aab29' }}></div>
                </div>
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'none' }}>
                  {variant === "terminal" && (
                    <span style={{ width: '16px', height: '16px', position: 'relative', display: 'inline-block' }}>
                      <Image src="/icons/terminal-symbol.png" alt="Terminal" fill style={{ objectFit: 'contain' }} />
                    </span>
                  )}
                  <span style={{ fontSize: '13px', color: variant === "terminal" ? '#cfd2df' : '#666', fontWeight: 600 }}>
                    {variant === "terminal" ? "daniellopez -- -zsh -- 80x24" : title}
                  </span>
                </div>
                <div style={{ width: '18px', height: '18px', position: 'relative' }}>
                  {variant === "photos" && (
                    <Image
                      src={title === "Creative Cloud" ? "/icons/skills/creativecloud.png" : "/icons/photos-symbol.png"}
                      alt={title === "Creative Cloud" ? "Creative Cloud" : "Photos"}
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  )}
                </div>
              </div>
              {variant === "terminal" ? (
                <div style={{ width: '100%', minHeight: isMobile ? '260px' : '360px', padding: isMobile ? '14px' : '20px 24px', backgroundColor: '#151515', borderBottomLeftRadius: '22px', borderBottomRightRadius: '22px', display: 'flex', flexDirection: 'column' }}>
                  {title === "Claude Code" ? (
                    <pre style={{ margin: 0, color: '#f59e0b', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '14px', lineHeight: 1.4, whiteSpace: 'pre' }}>{`daniellopez@Daniels-MacBook-Pro ~ % claude
╭─── Claude Code v2.1.87 ─────────────────────────────────────────────────────────────╮
│                                                    │ Tips for getting started       │
│                Welcome back Daniel!                │ Run /init to create a CLAUDE.… │
│                                                    │ ────────────────────────────── │
│                       ▐▛███▜▌                      │ Recent activity                │
│                      ▝▜█████▛▘                     │ No recent activity             │
│                        ▘▘ ▝▝                       │                                │
│        Opus 4.6 (1M context) · Claude Max ·        │                                │
│   daniel.lopez.3@stonybrook.edu's Organization    │                                │
│                     ~/portfolio                    │                                │
╰─────────────────────────────────────────────────────────────────────────────────────╯

───────────────────────────────────────────────────────────────────────────────────────
❯  
───────────────────────────────────────────────────────────────────────────────────────
  ? for shortcuts`}</pre>
                  ) : (
                    <>
                      <pre style={{ margin: 0, color: '#e7e7ea', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '15px', lineHeight: 1.45, whiteSpace: 'pre' }}>{terminalOutput}</pre>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c9c9cd', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '15px' }}>
                        <motion.span
                          animate={{ opacity: [0.35, 1, 0.35] }}
                          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                        >
                          ◐
                        </motion.span>
                        <span>{terminalLoadingText[title] || "Installing packages"}...</span>
                      </div>
                      {title === "Three.js" && (
                        <div
                          ref={logoAreaRef}
                          onDragStart={(e) => e.preventDefault()}
                          style={{ marginTop: '12px', width: '100%', flex: 1, minHeight: '190px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: logoMotionRef.current.dragging ? 'grabbing' : 'grab', perspective: '900px', overflow: 'hidden', userSelect: 'none' }}
                        >
                          <div
                            ref={logoModelRef}
                            style={{ position: 'relative', width: '120px', height: '120px', transformStyle: 'preserve-3d', transform: 'rotateX(-18deg) rotateY(24deg)', willChange: 'transform' }}
                          >
                            {Array.from({ length: 16 }).map((_, idx) => (
                              <div key={idx} style={{ position: 'absolute', inset: 0, transform: `translateZ(${-10 + idx * 0.8}px)`, opacity: idx === 15 ? 1 : 0.2 }}>
                                <Image draggable={false} src="/icons/apple-logo.svg" alt="3D Apple logo" fill style={{ objectFit: 'contain', pointerEvents: 'none', filter: `${idx === 15 ? 'drop-shadow(0 8px 12px rgba(0,0,0,0.45)) ' : ''}brightness(0) invert(1)` }} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div style={{ width: '100%', padding: isMobile ? '16px' : '24px', backgroundColor: '#fff', borderBottomLeftRadius: '22px', borderBottomRightRadius: '22px' }}>
                  <div style={{ width: '100%', height: isMobile ? '190px' : '250px', borderRadius: '12px', border: '1px solid #e5e5e5', background: 'linear-gradient(180deg, #f9fafb, #f3f4f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', width: '100%', height: '100%', transform: `scale(${photoZoom})`, transformOrigin: 'center center', transition: 'transform 0.2s ease' }}>
                      <Image src={activePhoto} alt={title} fill style={{ objectFit: 'contain' }} />
                    </div>
                  </div>
                  {title === "Creative Cloud" && (
                    <div style={{ width: '100%', marginTop: '12px', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
                      {creativeCloudItems.map((item) => (
                        <button key={item.label} onClick={() => setActiveCreativeLabel?.(item.label)} style={{ minWidth: '86px', border: activeCreativeItem.label === item.label ? '1px solid #b9d7ff' : '1px solid #ececec', borderRadius: '10px', padding: '8px', backgroundColor: activeCreativeItem.label === item.label ? '#eef6ff' : '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <div style={{ position: 'relative', width: '30px', height: '30px' }}>
                            <Image src={item.src} alt={item.label} fill style={{ objectFit: 'contain' }} />
                          </div>
                          <span style={{ fontSize: '10px', color: '#666' }}>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <p style={{ fontSize: '13px', color: '#666', marginTop: '10px' }}>{message}</p>
                </div>
              )}
            </div>
          ) : variant === "about" ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', borderRadius: '22px', overflow: 'hidden' }}>
              <div style={{ width: '100%', background: 'linear-gradient(180deg, #f6f6f8, #ececef)', padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #d9d9dc', position: 'relative' }}>
                <div style={{ display: 'flex', gap: '8px', zIndex: 10 }}>
                  <div onClick={onClose} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f57', border: '0.5px solid #e0443e', cursor: 'pointer' }}></div>
                  <div onClick={onClose} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e', border: '0.5px solid #dea123', cursor: 'pointer' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f', border: '0.5px solid #1aab29' }}></div>
                </div>
                <div style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
                  <span style={{ fontSize: '13px', color: '#333', fontWeight: 600 }}>About Me</span>
                </div>
                <div style={{ width: '44px' }} />
              </div>

              <div style={{ padding: isMobile ? '20px' : '28px 32px 24px', display: 'flex', alignItems: 'center', gap: isMobile ? '14px' : '20px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ position: 'relative', width: isMobile ? '72px' : '88px', height: isMobile ? '72px' : '88px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 6px 18px rgba(0,0,0,0.12)' }}>
                  <Image src="/icons/aboutme/danielpfp.png" alt="Daniel Lopez" fill style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                  <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.01em' }}>Daniel Lopez</h2>
                  <span style={{ fontSize: '14px', color: '#555', lineHeight: 1.35 }}>Computer Science &amp; Data Science<br />Stony Brook University</span>
                  <span style={{ fontSize: '13px', color: '#888' }}>Bronx, NY</span>
                </div>
              </div>

              <div style={{ padding: isMobile ? '18px 20px' : '22px 32px', borderBottom: '1px solid #f0f0f0' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>About</h3>
                <p style={{ fontSize: '14px', color: '#333', lineHeight: 1.55, margin: '0 0 10px' }}>
                  Passionate about ML, diffusion models, and programmatic video generation.
                  I build generative media tools and AI agents — the stuff I actually want to
                  use.
                </p>
                <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6, margin: 0 }}>
                  Machine Learning, Generative AI, Diffusion Models, Programmatic Video
                  Generation, Text-to-Video, Text-to-Speech, Multimodal AI, Agent Orchestration,
                  LLM Integration, Prompt Engineering, AI/ML Platforms, Creator Infrastructure,
                  Generative Media APIs, Full-Stack Web Development, Next.js, React, Three.js,
                  Python, TypeScript, Developer Experience (DX).
                </p>
              </div>

              <div style={{ padding: isMobile ? '18px 20px 22px' : '22px 32px 28px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>Interests</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    { label: 'Futbol', emoji: '⚽', photo: '/images/optimized/futbol-1.jpg' },
                    { label: 'Climbing', emoji: '🧗', photo: '/images/aboutme/climbing.png' },
                    { label: 'Peruvian', emoji: '🇵🇪', photo: '/images/optimized/lima-map.png' },
                    { label: 'Food', emoji: '🍜', photo: '/images/aboutme/food.png' },
                    { label: 'Running', emoji: '🏃', photo: '/icons/aboutme/danielpfp.png' },
                  ].map((it) => (
                    <div
                      key={it.label}
                      onMouseEnter={() => setHoveredInterest(it.label)}
                      onMouseLeave={() => setHoveredInterest((v) => v === it.label ? null : v)}
                      style={{
                        position: 'relative',
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px',
                        border: '1px solid #e6e6ea',
                        borderRadius: '999px',
                        background: hoveredInterest === it.label ? '#f3f6ff' : '#fafafa',
                        borderColor: hoveredInterest === it.label ? '#cfdcff' : '#e6e6ea',
                        fontSize: '13px',
                        color: '#333',
                        userSelect: 'none',
                        transition: 'background 0.15s ease, border-color 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '14px', lineHeight: 1 }}>{it.emoji}</span>
                      <span>{it.label}</span>
                      <AnimatePresence>
                        {hoveredInterest === it.label && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 'calc(100% + 10px)',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              pointerEvents: 'none',
                              zIndex: 5,
                            }}
                          >
                            <motion.div
                              initial={{ opacity: 0, y: 6, scale: 0.92 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 6, scale: 0.92 }}
                              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                              style={{
                                width: '140px',
                                height: '140px',
                                borderRadius: '14px',
                                overflow: 'hidden',
                                border: '1px solid rgba(0,0,0,0.08)',
                                boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
                                background: '#fff',
                                position: 'relative',
                              }}
                            >
                              <Image src={it.photo} alt={it.label} fill sizes="140px" style={{ objectFit: 'cover' }} />
                            </motion.div>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : variant === "projects-grid" ? (() => {
            const projects = [
              {
                label: 'Prompt2Video',
                preview: '/icons/projects/project3.png',
                tagline: 'Agentic video editor',
                description: 'Turns text prompts into polished explainer videos with AI-generated scenes, narration, avatars, and background music. Orchestrates Veo 3, DALL·E 3, HeyGen avatars, and OpenAI TTS into a single shipping pipeline.',
                stack: ['Next.js', 'TypeScript', 'OpenAI', 'Veo 3', 'HeyGen'],
                url: 'https://github.com/danrublop/Agentic-video-editor-web-based',
              },
              {
                label: 'Ecommerce',
                preview: '/icons/projects/project2.png',
                tagline: 'Modern storefront',
                description: 'A modern e-commerce storefront with a curated catalog, smooth checkout, and animated product cards. Built to feel snappy on mobile and crisp on desktop.',
                stack: ['Next.js', 'TypeScript', 'Tailwind', 'Vercel'],
                url: 'https://harvell-ml18.vercel.app/',
              },
              {
                label: 'Point of Sale',
                preview: '/icons/projects/project1.png',
                tagline: 'Swftly POS',
                description: 'A point-of-sale platform built for small businesses. Inventory tracking, fast tap-to-pay checkout, and a dashboard that surfaces the numbers that actually matter.',
                stack: ['React', 'Node.js', 'PostgreSQL'],
                url: 'https://www.swftly.app/',
              },
              {
                label: 'Code Assistant',
                preview: '/icons/projects/terminal.png',
                tagline: 'Plain-English coding',
                description: "A natural-language code translator that converts what you want into working code across multiple languages — a friendly buddy for anyone who says they can't code.",
                stack: ['Python', 'OpenAI', 'CLI'],
                url: 'https://github.com/danrublop/I-can-t-code-translator',
              },
            ];
            const safeIdx = Math.max(0, Math.min(selectedProjectIdx, projects.length - 1));
            const active = projects[safeIdx];
            return (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', borderRadius: '22px', overflow: 'hidden' }}>
                <div style={{ width: '100%', background: 'rgba(245,245,247,0.55)', padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.08)', position: 'relative', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                  <div style={{ display: 'flex', gap: '8px', zIndex: 10 }}>
                    <div onClick={onClose} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f57', border: '0.5px solid #e0443e', cursor: 'pointer' }}></div>
                    <div onClick={onClose} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e', border: '0.5px solid #dea123', cursor: 'pointer' }}></div>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f', border: '0.5px solid #1aab29' }}></div>
                  </div>
                  <div style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
                    <span style={{ fontSize: '13px', color: '#222', fontWeight: 600 }}>Projects</span>
                  </div>
                  <div style={{ width: '44px' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '16px' : '24px', padding: isMobile ? '20px' : '28px', alignItems: 'stretch' }}>
                  <div style={{ flex: isMobile ? 'none' : '0 0 280px', position: 'relative', width: isMobile ? '100%' : '280px', aspectRatio: isMobile ? '16 / 10' : '1 / 1', borderRadius: '14px', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(245,245,250,0.95), rgba(225,225,235,0.95))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)' }}>
                    <motion.div
                      key={active.label}
                      initial={{ opacity: 0, scale: 0.92, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                      style={{ position: 'relative', width: '70%', height: '70%' }}
                    >
                      <Image src={active.preview} alt={active.label} fill style={{ objectFit: 'contain', filter: 'drop-shadow(0 16px 24px rgba(0,0,0,0.22))' }} />
                    </motion.div>
                  </div>

                  <motion.div
                    key={`info-${active.label}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{active.tagline}</span>
                    <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.01em' }}>{active.label}</h3>
                    <p style={{ fontSize: '14px', color: '#333', lineHeight: 1.55, margin: 0 }}>{active.description}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      {active.stack.map((tech) => (
                        <span key={tech} style={{ fontSize: '11px', color: '#555', padding: '3px 8px', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '999px', background: 'rgba(255,255,255,0.6)' }}>{tech}</span>
                      ))}
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                      <button
                        onClick={() => { window.open(active.url, '_blank', 'noopener,noreferrer'); }}
                        style={{ padding: '10px 18px', fontSize: '13px', fontWeight: 600, color: '#fff', backgroundColor: '#007aff', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,122,255,0.3)' }}
                      >
                        Open →
                      </button>
                    </div>
                  </motion.div>
                </div>

                <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', background: 'rgba(245,245,247,0.55)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', padding: isMobile ? '14px 12px' : '16px 18px' }}>
                  <div style={{ display: 'flex', gap: isMobile ? '8px' : '14px', overflowX: 'auto', paddingBottom: '2px' }}>
                    {projects.map((p, idx) => {
                      const isActive = idx === safeIdx;
                      return (
                        <button
                          key={p.label}
                          onClick={() => setSelectedProjectIdx(idx)}
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                            padding: '8px 10px',
                            minWidth: isMobile ? '74px' : '92px',
                            border: 'none',
                            borderRadius: '12px',
                            background: isActive ? 'rgba(0,122,255,0.12)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background 0.15s ease, transform 0.15s ease',
                            flexShrink: 0,
                          }}
                          onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                          onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <div style={{ position: 'relative', width: isMobile ? '52px' : '62px', height: isMobile ? '52px' : '62px', borderRadius: '10px', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(245,245,250,0.95), rgba(225,225,235,0.95))', border: isActive ? '1.5px solid #007aff' : '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isActive ? '0 4px 12px rgba(0,122,255,0.18)' : '0 2px 6px rgba(0,0,0,0.06)' }}>
                            <div style={{ position: 'relative', width: '70%', height: '70%' }}>
                              <Image src={p.preview} alt={p.label} fill style={{ objectFit: 'contain' }} />
                            </div>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: isActive ? 600 : 500, color: isActive ? '#007aff' : '#444', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: isMobile ? '70px' : '90px' }}>{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })() : (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
                <div onClick={onClose} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f57', border: '0.5px solid #e0443e', cursor: 'pointer' }}></div>
                <div onClick={onClose} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e', border: '0.5px solid #dea123', cursor: 'pointer' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f', border: '0.5px solid #1aab29' }}></div>
              </div>
              <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '24px', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))' }}>
                <Image src={icon} alt="icon" fill style={{ objectFit: 'contain' }} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#000', marginBottom: '8px' }}>{title}</h3>
              <p style={{ fontSize: '14px', color: '#333', marginBottom: '24px', lineHeight: 1.5, textAlign: 'center' }}>{message}</p>
              <div style={{ display: 'flex', width: '100%', gap: '12px' }}>
                <button onClick={onClose} style={{ flex: 1, padding: '12px', fontSize: '14px', fontWeight: 600, color: '#666', backgroundColor: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '14px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={onConfirm} style={{ flex: 1, padding: '12px', fontSize: '14px', fontWeight: 600, color: '#fff', backgroundColor: '#007aff', border: 'none', borderRadius: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,122,255,0.3)' }}>{confirmLabel}</button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  );
};

const educationResume = [
  {
    src: "/icons/education/pokemon/metagross.png",
    label: "Stony Brook University",
    org: "B.S. Data Science & Computer Science · GPA 3.35 · Jan 2026 – May 2027",
    bullets: [
      "Relevant coursework: Object-Oriented Programming, Linear Algebra, Physics, Discrete Math, Data Structures, Probability & Statistics, Numerical Analysis.",
    ],
    logo: "/icons/education/stonnny.png",
  },
  {
    src: "/icons/education/pokemon/noctowl.png",
    label: "Bard High School Early College",
    org: "High School Diploma & Associate's Degree · GPA 3.8",
    bullets: [
      "Relevant coursework: Calculus I, Calculus II, Programming in Python, Russian Literature, Literary Theory, Spanish (3 years), Biology.",
    ],
    photo: "/images/optimized/bard-stamp.jpg",
    logo: "/icons/education/brd.png",
  },
];

const skillIcons = [
  { src: "/icons/skills/svg/python.svg", label: "Python", x: 0, y: 0 },
  { src: "/icons/skills/svg/react.svg", label: "React", x: 1, y: 0 },
  { src: "/icons/skills/svg/java.svg", label: "Java", x: 2, y: 0 },
  { src: "/icons/skills/svg/postgresql.svg", label: "PostgreSQL", x: 3, y: 0 },
  { src: "/icons/skills/svg/css.svg", label: "CSS", x: 4, y: 0 },
  { src: "/icons/skills/svg/photoshop.svg", label: "Photoshop", x: 1, y: 1 },
  { src: "/icons/skills/svg/premiere.svg", label: "Premiere Pro", x: 2, y: 1 },
  { src: "/icons/skills/svg/threejs.svg", label: "Three.js", x: 3, y: 1 },
  { src: "/icons/skills/svg/nextjs.svg", label: "Next.js", x: 4, y: 1 },
  { src: "/icons/skills/svg/ollama.svg", label: "Ollama", x: 0, y: 2 },
  { src: "/icons/skills/svg/claude.svg", label: "Claude Code", x: 1, y: 2 },
  { src: "/icons/skills/svg/cursor.svg", label: "Cursor", x: 2, y: 2 },
  { src: "/icons/skills/svg/openai.svg", label: "OpenAI", x: 3, y: 2 },
  { src: "/icons/skills/svg/git.svg", label: "Git", x: 4, y: 2 },
];

const creativeIcons = [
  { src: "/icons/skills/icon5.png", label: "Photoshop", x: 0, y: 0 },
  { src: "/icons/skills/icon5.png", label: "Illustrator", x: 1, y: 0 },
  { src: "/icons/skills/icon5.png", label: "Premiere Pro", x: 2, y: 0 },
  { src: "/icons/skills/icon5.png", label: "After Effects", x: 0, y: 2 },
  { src: "/icons/skills/icon5.png", label: "Lightroom", x: 2, y: 2 },
  { src: "/icons/skills/icon5.png", label: "InDesign", x: 0, y: 1 },
  { src: "/icons/skills/icon5.png", label: "Audition", x: 2, y: 1 },
];

const experienceResume = [
  {
    src: "/icons/experience/pokemon/porygon.png",
    label: "Generative AI Intern",
    org: "Thriive AI · Bronx, NY · Aug 2025 – Nov 2025",
    bullets: [
      "Cut turnaround for producing medical explainers from weeks to ~15 minutes by shipping an LLM-to-avatar pipeline.",
      "Automated scene planning, narration, and avatar rendering end-to-end, reducing cost to ~$6 per video with no human editing.",
      "Integrated Veo 3, HeyGen, and TTS models into a unified scene production pipeline.",
    ],
  },
  {
    src: "/icons/experience/pokemon/magnemite.png",
    label: "IT Systems Technician",
    org: "Stony Brook University, Dept. of Information Technology · Feb 2026 – May 2026",
    bullets: [
      "Resolved 50+ faculty and student tickets per semester in TeamDynamix by troubleshooting software and network issues.",
      "Reimaged and deployed 200+ computers using Jamf and Ghost, standardizing software and security configurations.",
      "Maintained printer infrastructure across the University, reducing downtime through maintenance and network management.",
    ],
  },
  {
    src: "/icons/experience/pokemon/charmander.png",
    label: "Goodfellas Pizza",
    org: "Goodfellas Pizza, Bronx, NY · Jun 2023 – Sep 2024",
    bullets: [
      "Cashier / Counter Worker serving customers and taking orders by phone, in person, and through restaurant apps.",
      "Prepared food, manned the cashier, and worked closing shifts.",
    ],
  },
  {
    src: "/icons/experience/pokemon/klefki.png",
    label: "Locksmith @ Cashier",
    org: "Basics on Broadway, Manhattan, NY · Aug 2025 – Feb 2026",
    bullets: [
      "Assisted customers with technical product inquiries and key duplication services in a fast-paced retail environment.",
      "Managed inventory intake and shipment processing, maintaining accurate stock levels across departments.",
    ],
  },
  {
    src: "/icons/experience/pokemon/alakazam.png",
    label: "Volunteer Tutoring",
    org: "Coalition for Asian American Children & Families / Bard College CLW · 2023 – 2025",
    bullets: [
      "Collaborated with NYC DOE to develop and teach curriculum at multiple public high schools citywide; Certificate of Recognition from the NYC Comptroller (2023).",
      "Peer Tutor chosen by college faculty to tutor students and provide educational resources and guidance.",
    ],
  },
  {
    src: "/icons/experience/pokemon/chansey.png",
    label: "Child Care",
    org: "The Hebrew Institute of Riverdale, Bronx, NY · Jun 2021 – Dec 2024",
    bullets: [
      "Youth Leader looking after young children every Saturday morning while their parents attended Shabbat services.",
      "Organized fundraisers and managed community events.",
    ],
  },
  {
    src: "/icons/experience/pokemon/squirtle.png",
    label: "Co-Founder, Window Cleaning",
    org: "Riverdale Window Cleaning · Bronx, NY · Jun 2023 – Oct 2023",
    bullets: [
      "Acquired 15 clients in under 3 months by running door-to-door sales and leveraging customer testimonials.",
      "Ran end-to-end operations including scheduling, billing, service delivery, and client acquisition.",
    ],
  },
  {
    src: "/icons/experience/pokemon/smeargle.png",
    label: "Video & Graphic Design Editor",
    org: "The College Soccer Guy (Remote) · Los Angeles, CA · Aug 2023 – Dec 2024",
    bullets: [
      "Delivered polished video content for 20+ athlete clients on-deadline using Adobe Premiere Pro and Photoshop.",
      "Grew the agency's Instagram to 115K followers by designing graphics for posts.",
    ],
  },
];

const projectsResume = [
  {
    src: "/icons/projects/pokemon/porygonz.png",
    label: "Cench Studio — Agentic Video Editor",
    org: "TypeScript · React · Electron · Three.js · Anthropic SDK · MCP · FFmpeg",
    stack: [
      { name: "TypeScript", src: "/icons/projects/tech/typescript.svg" },
      { name: "React", src: "/icons/projects/tech/react.svg" },
      { name: "Electron", src: "/icons/projects/tech/electron.svg" },
      { name: "Three.js", src: "/icons/projects/tech/threejs.svg" },
      { name: "Anthropic SDK", src: "/icons/projects/tech/anthropic.svg" },
      { name: "MCP", src: "/icons/projects/tech/mcp.svg" },
      { name: "FFmpeg", src: "/icons/projects/tech/ffmpeg.svg" },
    ],
    bullets: [
      "Built an Electron desktop NLE that turns prompts into edited video, driven by a unified agent with 155 tools that spawns parallel scene-builder sub-agents to render multi-scene videos concurrently.",
      "Wrote a provider-agnostic adapter layer for Anthropic, OpenAI, Google, Claude Code, and Codex CLI, plus an action-log-as-truth data model (WAL, blob store, effect runner) giving the timeline deterministic re-render, undo/redo, and Git-style scene branching.",
      "Unified 9 rendering pipelines and 18 generative-media providers (8 image, 5 avatar, 5 TTS) behind one API; shipped a Pixi + WebCodecs MP4 exporter and an MCP server exposing the editor to Claude Code.",
    ],
  },
  {
    src: "/icons/projects/pokemon/mareep.png",
    label: "Llamas Remote — macOS LLM Notch Assistant",
    org: "TypeScript · Electron · React · Ollama · Anthropic · SQLite FTS5 · Swift",
    url: "https://github.com/danrublop/llamas-remote",
    stack: [
      { name: "TypeScript", src: "/icons/projects/tech/typescript.svg" },
      { name: "Electron", src: "/icons/projects/tech/electron.svg" },
      { name: "React", src: "/icons/projects/tech/react.svg" },
      { name: "Ollama", src: "/icons/projects/tech/ollama.svg" },
      { name: "Anthropic", src: "/icons/projects/tech/anthropic.svg" },
      { name: "SQLite FTS5", src: "/icons/projects/tech/sqlite.svg" },
      { name: "Swift", src: "/icons/projects/tech/swift.svg" },
    ],
    bullets: [
      "Built a macOS notch HUD that captures the active selection or a screen region and streams answers from local (Ollama) or cloud (OpenAI, Anthropic) models into a searchable notebook.",
      "Designed a Markdown-as-truth notebook indexed in SQLite FTS5 (rebuilt from disk on launch), with on-device Swift Vision OCR and API keys encrypted at rest via Electron safeStorage.",
      "Architected an injectable service layer (capture, multi-provider LLM router, notebook store) under 18 unit-test suites, with hardened IPC (context isolation, DOMPurify output sanitization).",
    ],
  },
  {
    src: "/icons/projects/pokemon/meowth.png",
    label: "Agentic Point-of-Sale",
    org: "Python · Flask · React · PostgreSQL · Tauri · Claude API · PyTorch · Socket.IO",
    url: "https://github.com/Daniel159642/The-Agentic-POS",
    stack: [
      { name: "Python", src: "/icons/projects/tech/python.svg" },
      { name: "Flask", src: "/icons/projects/tech/flask.svg" },
      { name: "React", src: "/icons/projects/tech/react.svg" },
      { name: "PostgreSQL", src: "/icons/projects/tech/postgresql.svg" },
      { name: "Tauri", src: "/icons/projects/tech/tauri.svg" },
      { name: "Claude API", src: "/icons/projects/tech/claude.svg" },
      { name: "PyTorch", src: "/icons/projects/tech/pytorch.svg" },
      { name: "Socket.IO", src: "/icons/projects/tech/socketio.svg" },
    ],
    bullets: [
      "Built a full-stack, multi-location POS platform (64K+ lines, 96-table PostgreSQL schema) replacing separate checkout, inventory, accounting, and scheduling tools with one system.",
      "Eliminated manual data entry by extracting line items from vendor invoices (PDF, image, spreadsheet) via a hybrid Claude vision and local spaCy/EfficientNet pipeline, auto-restocking inventory and syncing to Shopify.",
      "Engineered a rules-driven double-entry accounting engine that auto-journalizes every transaction and syncs to QuickBooks, plus a constraint-based scheduler publishing optimized shifts to Google Calendar.",
    ],
  },
];


const aboutIcons = [
  { src: "/icons/aboutme/gaming.png", label: "Futbol", x: 0, y: 2 },
  { src: "/icons/aboutme/profile.png", label: "Climbing", x: 2, y: 2 },
  { src: "/icons/aboutme/interests.png", label: "Peruvian", x: 1, y: 1 },
  { src: "/icons/aboutme/cookies.png", label: "Food", x: 1, y: 3 },
];

const contactIcons = [
  { src: "/icons/contact/email.png", label: "Email", x: 1, y: 0 },
  { src: "/icons/contact/x.png", label: "X", x: 0, y: 1 },
  { src: "/icons/contact/linkedin.png", label: "LinkedIn", x: 2, y: 1 },
  { src: "/icons/contact/github.png", label: "GitHub", x: 1, y: 2 },
];

const modalData: Record<string, { title: string; message: string; icon: string; photo?: string; gallery?: string[]; notesWidth?: number; url?: string; variant?: "default" | "notes" | "terminal" | "photos" | "mail" | "about" | "projects-grid"; confirmLabel?: string }> = {
  X: { title: "Open X account?", message: "This will take you to @danrublop on X.com in a new tab.", icon: "/icons/contact/x.png", url: "https://x.com/danrublop" },
  LinkedIn: { title: "Open LinkedIn?", message: "Visit My profile on LinkedIn to connect or view my experiences.", icon: "/icons/contact/linkedin.png", url: "https://www.linkedin.com/in/daniel-lopez-009620276" },
  GitHub: { title: "Open GitHub?", message: "Check out My repositories and code contributions on GitHub.", icon: "/icons/contact/github.png", url: "https://github.com/danrublop" },
  Email: { title: "Draft an Email?", message: "This will open your default email client to message daniel.lopez.3@stonybrook.edu.", icon: "/icons/contact/email.png", url: "mailto:daniel.lopez.3@stonybrook.edu", variant: "mail" },
  Prompt2Video: { title: "Open Prompt2Video?", message: "Open the Agentic Video Editor repository on GitHub in a new tab.", icon: "/icons/projects/project3.png", url: "https://github.com/danrublop/Agentic-video-editor-web-based" },
  "Code Assistant": { title: "Open Code Assistant?", message: "Open the Code Assistant repository on GitHub in a new tab.", icon: "/icons/projects/terminal.png", url: "https://github.com/danrublop/I-can-t-code-translator" },
  "Point of Sale": { title: "Open Point of Sale?", message: "Open the Swftly website in a new tab.", icon: "/icons/projects/project1.png", url: "https://www.swftly.app/" },
  Ecommerce: { title: "Open Ecommerce?", message: "Open the Ecommerce website in a new tab.", icon: "/icons/projects/project2.png", url: "https://harvell-ml18.vercel.app/" },
  "B.S. Comp Sci": { title: "Stony Brook University", message: "B.S Computer Science\nTechnican/Devloper at Stony Brook Department of Informtion Tehcnology", icon: "/icons/education/stonnny.png", photo: "/images/optimized/stonybrook-stamp.jpg", variant: "notes", confirmLabel: "Done" },
  "Diploma & AA Degree": { title: "Bard High School Early College", message: "Spanish & Math Peer Tutor\nStudent Goverment\nVarsity Soccer Capptain\nLatin Amersican Stuent Org Founder", icon: "/icons/education/brd.png", photo: "/images/optimized/bard-stamp.jpg", variant: "notes", confirmLabel: "Done" },
  "Locksmith @ Cashier": { title: "Basics on Broadway Manhattan, NY", message: "Stocker/locksmith August 2025 – February 2026\nAssisted customers with technical product inquiries and key duplication services in a fast-paced retail environment.\nManaged inventory intake and shipment processing, maintaining accurate stock levels across departments.", icon: "/icons/experience/job1.png", photo: "/images/optimized/locksmith-stamp.jpg", variant: "notes", confirmLabel: "Done" },
  "IT Dept @ SBU": { title: "Division of Information Technology Stony Brook, NY", message: "Client Support Technician February 2026 – Present\nResolve hardware and software issues for faculty, staff, and students across walk-in and remote help desk channels.\nDiagnose and repair university computer systems, reducing downtime for end users.", icon: "/icons/experience/terminal.png", photo: "/images/optimized/stonybrook-stamp.jpg", variant: "notes", confirmLabel: "Done" },
  "Window Cleaning": { title: "Riverdale Window Cleaning Bronx, NY", message: "Co-founder June 2023 – October 2023\nLaunched and operated a local service business, handling client acquisition, scheduling, and operations.\nAcquired 15 clients through door-to-door sales, demonstrating persistence and strong communication.", icon: "/icons/experience/job4.png", variant: "notes", confirmLabel: "Done" },
  "Volunteer Tutoring": { title: "Volunteer Tutoring Experience", message: "## Coalition for Asian American Children and Families\nVolunteer, June 2023\nCollaborated with NYC DOE to develop and teach curriculum at multiple public high schools citywide.\nCertificate of Recognition from New York City Comptroller - June 2023\n## Bard College Center For Learning And Writing, New York, NY\nPeer Tutor, September 2023 - June 2025\nChosen by the college faculty to tutor students at my college and provided educational resources and guidance.", icon: "/icons/experience/job2.png", photo: "/images/experience/volunteer-stamp.svg", variant: "notes", confirmLabel: "Done" },
  "Goodfellas Pizza": { title: "Goodfellas Pizza, Bronx, NY", message: "Cashier/Counter Worker, June 2023 - September 2024\nServed customers and took orders by phone, in person, and through restaurant apps.\nPrepared food, manned the cashier, and worked closing shifts.", icon: "/icons/experience/pizzahut.png", photo: "/images/optimized/goodfellas-stamp.jpg", variant: "notes", confirmLabel: "Done" },
  "Video Editor": { title: "College Soccer Guy, Los Angeles, California (Remote)", message: "Editor/Social Media Manager, April 2024 - June 2025\nCreated and edited videos for athletes.\nEdited social media posts and designed custom digital graphics using Adobe apps.", icon: "/icons/experience/assets.png", photo: "/images/experience/video-editor-stamp.jpeg", variant: "notes", confirmLabel: "Done" },
  "Dev @ Thriive AI": { title: "Thriive AI", message: "August 2025 - November 2025\nDeveloped software that converts prompts into polished explainer videos with AI-generated scenes, narration, avatars, and music.\nBuilt on Veo 3, DALL-E 3, HeyGen, and OpenAI TTS.", icon: "/icons/experience/applescript.png", photo: "/images/experience/thriive-stamp.svg", variant: "notes", confirmLabel: "Done" },
  "Child Care": { title: "The Hebrew Institute Of Riverdale, Bronx, NY", message: "Youth Leader, June 2021 - December 2024\nSpent every Saturday morning looking after young children while their parents attended Shabbat services.\nOrganized fundraisers and managed community events.", icon: "/icons/experience/job3.png", variant: "notes", confirmLabel: "Done" },
  Futbol: { title: "Futbol", message: "", icon: "/icons/aboutme/gaming.png", gallery: ["/images/optimized/futbol-4.jpg", "/images/optimized/futbol-3.jpg", "/images/optimized/futbol-1.jpg", "/images/optimized/futbol-2.jpg"], variant: "photos" },
  Peruvian: { title: "Peruvian", message: "I am Peruvian 🇵🇪\nI speak Spanish 🗣️\nMy family is from Lima ❤️", icon: "/icons/aboutme/interests.png", notesWidth: 620, variant: "notes", confirmLabel: "Done" },
  Food: { title: "Food", message: "I love ceviche 🇵🇪\nFlan\nSushi", icon: "/icons/aboutme/cookies.png", notesWidth: 620, variant: "notes", confirmLabel: "Done" },
  Climbing: { title: "Climbing", message: "I just got into climbing\nV2 at the moment", icon: "/icons/aboutme/profile.png", photo: "/images/aboutme/climbing-stamp.svg", variant: "notes", confirmLabel: "Done" },
  Python: { title: "Python", message: "python3 -m pip install --upgrade pip", icon: "/icons/skills/icon1.png", variant: "terminal" },
  React: { title: "React", message: "npm install react react-dom", icon: "/icons/skills/react.png", variant: "terminal" },
  Java: { title: "Java", message: "brew install openjdk", icon: "/icons/skills/icon2.png", variant: "terminal" },
  PostgreSQL: { title: "PostgreSQL", message: "brew install postgresql", icon: "/icons/skills/postgresql.png", variant: "terminal" },
  CSS: { title: "CSS", message: "npm install -D tailwindcss postcss autoprefixer", icon: "/icons/skills/css.png", variant: "terminal" },
  Photography: { title: "Photography", message: "", icon: "/icons/skills/icon5.png", variant: "photos" },
  "Creative Cloud": { title: "Creative Cloud", message: "", icon: "/icons/skills/creativecloud.png", variant: "photos" },
  "Three.js": { title: "Three.js", message: "npm install three", icon: "/icons/skills/threejs.png", variant: "terminal" },
  "Next.js": { title: "Next.js", message: "npx create-next-app@latest my-app", icon: "/icons/skills/nextjs.png", variant: "terminal" },
  Ollama: { title: "Ollama", message: "brew install ollama", icon: "/icons/skills/ollama.png", variant: "terminal" },
  "Claude Code": { title: "Claude Code", message: "claude\n╭─── Claude Code v2.1.87 ─────────────────────────────────────────────────────────────╮\n│                                                    │ Tips for getting started       │\n│                    Welcome back!                   │ Run /init to create a CLAUDE… │\n│                                                    │ ────────────────────────────── │\n│                       ▐▛███▜▌                      │ Recent activity                │\n│                      ▝▜█████▛▘                     │ No recent activity             │\n│                        ▘▘ ▝▝                       │                                │\n│        Opus 4.6 (1M context) · Claude Max ·        │                                │\n│                    Organization                    │                                │\n│                     ~/portfolio                    │                                │\n╰─────────────────────────────────────────────────────────────────────────────────────╯\n\n───────────────────────────────────────────────────────────────────────────────────────\n❯\n───────────────────────────────────────────────────────────────────────────────────────\n? for shortcuts                                                  ◐ medium · /effort", icon: "/icons/skills/icon6.png", variant: "terminal" },
  Cursor: { title: "Cursor", message: "brew install --cask cursor-cli", icon: "/icons/skills/icon3.png", variant: "terminal" },
  OpenAI: { title: "OpenAI", message: "npm install openai", icon: "/icons/skills/chatgpt.png", variant: "terminal" },
  Git: { title: "Git", message: "brew install git", icon: "/icons/skills/git_folder.png", variant: "terminal" },
};

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"main" | "skills" | "experience" | "projects" | "aboutme" | "contact" | "creativecloud" | "education">("main");
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [activeCreativeLabel, setActiveCreativeLabel] = useState(creativeCloudItems[0].label);
  const [activePhotoUrl, setActivePhotoUrl] = useState(photographyGallery[0]);
  const [profileHover, setProfileHover] = useState(false);
  const fanCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openFan = () => { if (fanCloseTimer.current) clearTimeout(fanCloseTimer.current); setProfileHover(true); };
  const closeFan = () => { if (fanCloseTimer.current) clearTimeout(fanCloseTimer.current); fanCloseTimer.current = setTimeout(() => setProfileHover(false), 180); };

  const [contactMenuOpen, setContactMenuOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [notif, setNotif] = useState<{ title: string; message: string; icon?: string } | null>(null);
  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showNotif = (title: string, message: string, icon?: string) => {
    setNotif({ title, message, icon });
    if (notifTimer.current) clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(() => setNotif(null), 3800);
  };
  const handleContact = (it: { modal: string; href?: string; email?: string }) => {
    if (it.email) {
      const email = it.email;
      navigator.clipboard?.writeText(email)
        .then(() => showNotif("Mail", "Email copied to clipboard", "/icons/contact/gmail.svg"))
        .catch(() => showNotif("Mail", email, "/icons/contact/gmail.svg"));
    } else if (it.href) {
      window.open(it.href, "_blank", "noopener,noreferrer");
    }
  };

  const toggleOpen = () => { if (view !== "main") { setView("main"); setIsOpen(true); } else { setIsOpen(!isOpen); } };
  const openSkills = () => { setView("skills"); setHoveredLabel(null); };
  const openExperience = () => { setView("experience"); setHoveredLabel(null); };
  const openProjects = () => { setView("projects"); setHoveredLabel(null); };
  const openContact = () => { setView("contact"); setHoveredLabel(null); };
  const openCreativeCloud = () => { setView("creativecloud"); setHoveredLabel(null); };
  const openEducation = () => { setView("education"); setHoveredLabel(null); };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const updateVisitorCount = async () => {
      try {
        const res = await fetch("/api/visitors", {
          signal: controller.signal,
          cache: "no-store"
        });
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data?.count === "number") {
          setVisitorCount(data.count);
        }
      } catch {
        // Keep UI resilient if the counter service is unavailable.
      }
    };
    updateVisitorCount();
    return () => controller.abort();
  }, []);

  // 2D Spatially Consistent Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'escape') {
        if (showModal) { setShowModal(null); return; }
        if (view !== 'main') { setView('main'); setHoveredLabel(null); }
        else if (isOpen) { setIsOpen(false); setHoveredLabel(null); }
        return;
      }

      if (key === 'enter') {
        if (showModal && modalData[showModal]) {
          const targetUrl = modalData[showModal].url;
          if (targetUrl) window.open(targetUrl, "_blank", "noopener,noreferrer");
          setShowModal(null);
          return;
        }
        if (view === 'main' && !isOpen) { toggleOpen(); setHoveredLabel("Daniel Lopez"); return; }
        if (hoveredLabel) {
          const label = hoveredLabel;
          if (view === 'main') {
            if (label === 'Daniel Lopez') toggleOpen();
            else if (['Skills', 'Experience', 'Projects', 'Education'].includes(label)) {
              if (label === 'Skills') openSkills();
              else if (label === 'Experience') openExperience();
              else if (label === 'Projects') openProjects();
              else if (label === 'Education') openEducation();
            }
          } else if (modalData[label]) {
            setShowModal(label);
          } else if (label === 'Creative Cloud') {
            openCreativeCloud();
          } else if (label === view || ['Skills', 'Experience', 'Projects', 'About Me', 'Contact', 'Creative Cloud', 'Education'].includes(label)) {
            setView('main');
          }
        }
        return;
      }

      if (showModal) return;

      const getLayout = (): { label: string; x: number; y: number }[] => {
        if (view === 'main') {
          return [
            { label: 'Daniel Lopez', x: 0, y: 0 },
            ...(isOpen ? [
              { label: 'Skills', x: 0, y: -1 }, { label: 'Education', x: 0, y: 1 }, { label: 'Projects', x: -1, y: 0 }, { label: 'Experience', x: 1, y: 0 }
            ] : [])
          ];
        }
        let items: { label: string; x: number; y: number }[] = [];
        let hubLabel = "", hubPos = { x: 1, y: 1 };
        if (view === 'skills') { items = skillIcons; hubLabel = "Skills"; hubPos = { x: 2, y: 1 }; }
        else if (view === 'experience' || view === 'projects' || view === 'education') { return []; }
        else if (view === 'aboutme') { items = aboutIcons; hubLabel = "About Me"; hubPos = { x: 1, y: 2 }; }
        else if (view === 'contact') { items = contactIcons; hubLabel = "Contact"; hubPos = { x: 1, y: 1 }; }
        else if (view === 'creativecloud') { items = creativeIcons; hubLabel = "Creative Cloud"; hubPos = { x: 1, y: 1 }; }
        return [{ label: hubLabel, x: hubPos.x, y: hubPos.y }, ...items.map(i => ({ label: i.label, x: i.x, y: i.y }))];
      };

      const layout = getLayout();
      const current = layout.find(l => l.label === (hoveredLabel || (view === 'main' ? 'Daniel Lopez' : 'Skills'))) || layout[0];
      if (!current) return;
      let nextX = current.x, nextY = current.y;
      if (['arrowup', 'w'].includes(key)) nextY--;
      else if (['arrowdown', 's'].includes(key)) nextY++;
      else if (['arrowleft', 'a'].includes(key)) nextX--;
      else if (['arrowright', 'd'].includes(key)) nextX++;
      else return;
      const next = layout.find(l => l.x === nextX && l.y === nextY);
      if (next) setHoveredLabel(next.label);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, isOpen, hoveredLabel, showModal]);

  const getIconForLabel = (label: string): string | null => {
    const hubs = [
      { label: "Education", src: "/icons/education.png" }, { label: "Skills", src: "/icons/skills.png" }, { label: "About Me", src: "/icons/aboutme.png" }, { label: "Contact", src: "/icons/contact.png" }, { label: "Projects", src: "/icons/projects.png" }, { label: "Experience", src: "/icons/experience.png" }, { label: "Creative Cloud", src: "/icons/skills/creativecloud.png" }, { label: "Daniel Lopez", src: "/icons/center.png" }
    ];
    const all = [...hubs, ...educationResume, ...skillIcons, ...experienceResume, ...projectsResume, ...aboutIcons, ...contactIcons, ...creativeIcons];
    return all.find(i => i?.label === label)?.src || null;
  };

  const getSubViewIcon = () => {
    switch(view) {
      case 'skills': return '/icons/skills.png';
      case 'experience': return '/icons/experience.png';
      case 'projects': return '/icons/projects.png';
      case 'aboutme': return '/icons/aboutme.png';
      case 'contact': return '/icons/contact.png';
      case 'creativecloud': return '/icons/skills/creativecloud.png';
      case 'education': return '/icons/education.png';
      default: return '/icons/center.png';
    }
  };

  const springTransition = { type: "spring" as const, stiffness: 300, damping: 25 };
  const activeModal = showModal ? modalData[showModal] : null;
  const mobileCellW = 108;
  const mobileCellH = 98;
  const mainOffsetX = isMobile ? mobileCellW : 145;
  const mainOffsetY = isMobile ? mobileCellH : 125;

  return (
    <main className="relative flex items-center justify-center w-full h-screen overflow-hidden bg-white">
      {(() => {
        const profileDim = isMobile ? 54 : 68;
        const iconDim = isMobile ? 34 : 40;
        const radius = isMobile ? 66 : 84;
        const contacts = contactLinks;
        return (
          <div
            style={{
              position: 'absolute',
              top: isMobile ? '16px' : '20px',
              left: isMobile ? '16px' : '20px',
              width: profileDim,
              height: profileDim,
              zIndex: 9999,
            }}
          >
            {!isMobile && contacts.map((it, idx) => {
              // Fan icons into a quarter-arc toward the lower-right so they stay on-screen.
              const angle = ((idx / (contacts.length - 1)) * 90) * (Math.PI / 180);
              const tx = Math.cos(angle) * radius;
              const ty = Math.sin(angle) * radius;
              return (
                <motion.div
                  key={it.modal}
                  onClick={() => handleContact(it)}
                  onMouseEnter={openFan}
                  onMouseLeave={closeFan}
                  aria-label={it.label}
                  role="button"
                  initial={false}
                  animate={profileHover
                    ? { x: tx, y: ty, opacity: 1, scale: 1, pointerEvents: 'auto' }
                    : { x: 0, y: 0, opacity: 0, scale: 0.4, pointerEvents: 'none' }}
                  transition={{ type: 'spring', stiffness: 420, damping: 26, delay: profileHover ? idx * 0.04 : 0 }}
                  whileHover={{ scale: 1.18 }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: -iconDim / 2,
                    marginLeft: -iconDim / 2,
                    width: iconDim,
                    height: iconDim,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 1,
                  }}
                >
                  {it.img ? (
                    <div style={{ position: 'relative', width: iconDim * 0.95, height: iconDim * 0.95 }}>
                      <Image src={it.img} alt={it.label} fill sizes={`${iconDim}px`} unoptimized={it.img.endsWith('.svg')} style={{ objectFit: 'contain' }} />
                    </div>
                  ) : (
                    <svg width={iconDim * 0.72} height={iconDim * 0.72} viewBox="0 0 24 24" fill={it.color} aria-hidden="true">
                      <path d={it.path} />
                    </svg>
                  )}
                </motion.div>
              );
            })}
            <div
              onMouseEnter={openFan}
              onMouseLeave={closeFan}
              style={{
                position: 'relative',
                width: profileDim,
                height: profileDim,
                borderRadius: '50%',
                overflow: 'hidden',
                cursor: 'default',
                border: '3px solid #ffffff',
                boxShadow: profileHover
                  ? '0 0 0 1.5px rgba(0,0,0,0.10), 0 8px 20px rgba(0,0,0,0.18)'
                  : '0 0 0 1.5px rgba(0,0,0,0.08), 0 3px 10px rgba(0,0,0,0.12)',
                background: '#fff',
                transform: profileHover ? 'scale(1.06)' : 'scale(1)',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                zIndex: 2,
              }}
              aria-label="Daniel Lopez"
            >
              <Image
                src="/icons/aboutme/danielpfp.png"
                alt="Daniel Lopez"
                width={profileDim}
                height={profileDim}
                draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                priority
              />
            </div>
          </div>
        );
      })()}

      {isMobile && (
        <button
          onClick={() => setContactMenuOpen(true)}
          aria-label="Contact"
          style={{
            position: 'absolute', top: '24px', right: '16px', zIndex: 9999,
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '999px',
            border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(10px)', boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            fontSize: '15px', fontWeight: 600, color: '#111', cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          Contact
        </button>
      )}

      <AnimatePresence mode="wait">
        {view === "main" ? (
          <motion.div key="main" className={`relative flex items-center justify-center ${isMobile ? "w-full h-full" : "w-[600px] h-[600px]"}`} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={springTransition}>
            <Folder src="/icons/center.png" label="Daniel Lopez" compact={isMobile} onClick={toggleOpen} onHover={setHoveredLabel} isSelected={hoveredLabel === "Daniel Lopez" || (!hoveredLabel && !isOpen)} className="z-50" priority />
            <AnimatePresence>
              {isOpen && (
                <>
                  <Folder src="/icons/skills.png" label="Skills" compact={isMobile} className="absolute" onClick={openSkills} onHover={setHoveredLabel} isSelected={hoveredLabel === "Skills"} initial={{ y: 0, opacity: 0, scale: 0 }} animate={{ y: -mainOffsetY, opacity: 1, scale: 1 }} exit={{ y: 0, opacity: 0, scale: 0 }} transition={{ ...springTransition, delay: 0.05 }} priority />
                  <Folder src="/icons/education.png" label="Education" compact={isMobile} className="absolute" onClick={openEducation} onHover={setHoveredLabel} isSelected={hoveredLabel === "Education"} initial={{ y: 0, opacity: 0, scale: 0 }} animate={{ y: mainOffsetY, opacity: 1, scale: 1 }} exit={{ y: 0, opacity: 0, scale: 0 }} transition={{ ...springTransition, delay: 0.05 }} priority />
                  <Folder src="/icons/projects.png" label="Projects" compact={isMobile} className="absolute" onClick={openProjects} onHover={setHoveredLabel} isSelected={hoveredLabel === "Projects"} initial={{ x: 0, opacity: 0, scale: 0 }} animate={{ x: -mainOffsetX, opacity: 1, scale: 1 }} exit={{ x: 0, opacity: 0, scale: 0 }} transition={{ ...springTransition, delay: 0 }} priority />
                  <Folder src="/icons/experience.png" label="Experience" compact={isMobile} className="absolute" onClick={openExperience} onHover={setHoveredLabel} isSelected={hoveredLabel === "Experience"} initial={{ x: 0, opacity: 0, scale: 0 }} animate={{ x: mainOffsetX, opacity: 1, scale: 1 }} exit={{ x: 0, opacity: 0, scale: 0 }} transition={{ ...springTransition, delay: 0 }} priority />
                </>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div key={view} className={`relative flex items-center justify-center h-full ${isMobile ? "w-full px-4 pt-20 pb-8" : "w-[1000px]"}`} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={springTransition}>
            {(() => {
              if (view === 'experience' || view === 'projects' || view === 'education') {
                const resumeConfig: Record<string, { data: { src: string; label: string; org: string; bullets: string[]; url?: string; photo?: string; logo?: string; stack?: { name: string; src?: string }[] }[]; heading: string; subtitle: string }> = {
                  experience: { data: experienceResume, heading: "Experience", subtitle: "Every role came with a partner." },
                  projects: { data: projectsResume, heading: "Projects", subtitle: "Things I've built, each with a partner." },
                  education: { data: educationResume, heading: "Education", subtitle: "Where I trained up." },
                };
                const { data: resumeData, heading, subtitle } = resumeConfig[view];
                return (
                  <motion.div
                    key={`${view}-resume`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="no-scrollbar"
                    style={{ width: "100%", maxHeight: isMobile ? "calc(100vh - 150px)" : "calc(100vh - 160px)", overflowY: "auto", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain", padding: isMobile ? "34px 8px 40px" : "28px 16px 44px", maskImage: "linear-gradient(to bottom, transparent 0, #000 32px, #000 calc(100% - 32px), transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 32px, #000 calc(100% - 32px), transparent 100%)" }}
                  >
                    <div style={{ maxWidth: 720, margin: "0 auto" }}>
                      <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 800, color: "#111", letterSpacing: "-0.02em" }}>{heading}</div>
                      <div style={{ fontSize: 13, color: "#999", marginTop: 2, marginBottom: isMobile ? 16 : 22 }}>{subtitle}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 16 : 20 }}>
                        {resumeData.map((entry, idx) => {
                          const isGithub = !!entry.url && entry.url.includes("github.com");
                          return (
                          <motion.div
                            key={entry.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 + idx * 0.05, duration: 0.25 }}
                            style={{ display: "flex", gap: isMobile ? 12 : 16, alignItems: "flex-start" }}
                          >
                            <div style={{ position: "relative", width: isMobile ? 54 : 70, height: isMobile ? 54 : 70, flexShrink: 0, marginTop: 2 }}>
                              <Image src={entry.src} alt={entry.label} fill sizes="70px" style={{ objectFit: "contain" }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                                <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, color: "#111" }}>{entry.label}</div>
                                {entry.url && (
                                  <a
                                    href={entry.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#111", textDecoration: "none", padding: "3px 9px", borderRadius: 999, border: "1px solid rgba(0,0,0,0.12)", background: "rgba(0,0,0,0.03)", transition: "background 0.15s ease" }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.08)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.03)"; }}
                                  >
                                    {isGithub ? (
                                      <>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#111" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                        View on GitHub
                                      </>
                                    ) : (
                                      <>
                                        Visit site
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7"/><path d="M9 7h8v8"/></svg>
                                      </>
                                    )}
                                  </a>
                                )}
                              </div>
                              {entry.stack ? (
                                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 5, marginBottom: 8 }}>
                                  {entry.stack.map((t) => (
                                    t.src ? (
                                      <img key={t.name} src={t.src} alt={t.name} title={t.name} draggable={false} style={{ height: 22, width: "auto", maxWidth: 96, objectFit: "contain" }} />
                                    ) : (
                                      <span key={t.name} title={t.name} style={{ fontSize: 11, fontWeight: 600, color: "#666", padding: "2px 8px", borderRadius: 999, border: "1px solid rgba(0,0,0,0.12)", background: "rgba(0,0,0,0.03)" }}>{t.name}</span>
                                    )
                                  ))}
                                </div>
                              ) : (
                                <div style={{ fontSize: isMobile ? 11.5 : 12.5, color: "#888", marginBottom: 6, marginTop: 2 }}>{entry.org}</div>
                              )}
                              <ul style={{ listStyleType: "disc", paddingLeft: 18, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                                {entry.bullets.map((b, i) => (
                                  <li key={i} style={{ fontSize: isMobile ? 12.5 : 13.5, color: "#444", lineHeight: 1.45 }}>{b}</li>
                                ))}
                              </ul>
                              {(entry.photo || entry.logo) && (
                                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                                  {entry.photo && (
                                    <div style={{ position: "relative", width: 64, height: 64, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", flexShrink: 0 }}>
                                      <Image src={entry.photo} alt={`${entry.label} photo`} fill sizes="64px" style={{ objectFit: "cover" }} />
                                    </div>
                                  )}
                                  {entry.logo && (
                                    <div style={{ position: "relative", width: 64, height: 64, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", background: "#fff", flexShrink: 0 }}>
                                      <Image src={entry.logo} alt={`${entry.label} logo`} fill sizes="64px" style={{ objectFit: "contain", padding: 6 }} />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                );
              }
              let grid: any[] = [];
              let hubLabel = "", hubSrc = "", hubPos = { x: 1, y: 1 };
              const cellW = isMobile ? 108 : 145;
              const cellH = isMobile ? 98 : 125;
              if (view === 'skills') { grid = skillIcons; hubLabel = "Skills"; hubSrc = "/icons/skills.png"; hubPos = { x: 2, y: 1 }; }
              else if (view === 'aboutme') { grid = aboutIcons; hubLabel = "About Me"; hubSrc = "/icons/aboutme.png"; hubPos = { x: 1, y: 2 }; }
              else if (view === 'contact') { grid = contactIcons; hubLabel = "Contact"; hubSrc = "/icons/contact.png"; }
              else if (view === 'creativecloud') { grid = creativeIcons; hubLabel = "Creative Cloud"; hubSrc = "/icons/skills/creativecloud.png"; }
              const centerX = hubPos.x, centerY = hubPos.y;
              const hubMobileY = 0;
              return [
                <Folder
                  key="hub"
                  src={hubSrc}
                  label={view === "skills" ? "Back" : hubLabel}
                  onClick={() => setView("main")}
                  isSelected={hoveredLabel === hubLabel}
                  onHover={setHoveredLabel}
                  compact={isMobile}
                  className={isMobile ? "absolute z-50" : "z-50"}
                  initial={isMobile ? { y: hubMobileY, scale: 0, opacity: 0 } : { scale: 0 }}
                  animate={isMobile ? { y: hubMobileY, scale: 1, opacity: 1 } : { scale: 1 }}
                  transition={springTransition}
                />,
                ...(view === "skills"
                  ? [
                      <div
                        key="skills-center-text"
                        style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, 78px)", width: isMobile ? "160px" : "200px", textAlign: "center", pointerEvents: "none", zIndex: 60 }}
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={hoveredLabel && skillBlurbs[hoveredLabel] ? hoveredLabel : "__skills__"}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.16 }}
                          >
                            {hoveredLabel && skillBlurbs[hoveredLabel] ? (
                              <>
                                <div style={{ fontSize: "13px", fontWeight: 700, color: "#111" }}>{hoveredLabel}</div>
                                <div style={{ fontSize: "12px", fontWeight: 500, color: "#666", lineHeight: 1.35, marginTop: "2px" }}>{skillBlurbs[hoveredLabel]}</div>
                              </>
                            ) : null}
                          </motion.div>
                        </AnimatePresence>
                      </div>,
                      <SkillsOrbit
                        key="skills-orbit"
                        items={grid}
                        isMobile={isMobile}
                        hoveredLabel={hoveredLabel}
                        setHoveredLabel={setHoveredLabel}
                      />,
                    ]
                  : grid.map((item, idx) => (
                      <Folder
                        key={item.label}
                        src={item.src}
                        label={item.label}
                        onHover={setHoveredLabel}
                        isSelected={hoveredLabel === item.label}
                        compact={isMobile}
                        onClick={() => { if (modalData[item.label]) setShowModal(item.label); else if (item.label === 'Creative Cloud') openCreativeCloud(); }}
                        className="absolute"
                        initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                        animate={{
                          x: (item.x - centerX) * cellW,
                          y: (item.y - centerY) * cellH,
                          opacity: 1,
                          scale: 1
                        }}
                        exit={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                        transition={{ ...springTransition, delay: idx * 0.01 }}
                      />
                    ))
                )
              ];
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {showModal && modalData[showModal] && (
        <Modal 
          isOpen={!!showModal} 
          onClose={() => setShowModal(null)} 
          onConfirm={() => {
            const targetUrl = modalData[showModal].url;
            if (targetUrl) window.open(targetUrl, "_blank", "noopener,noreferrer");
            setShowModal(null);
          }} 
          title={modalData[showModal].title} 
          message={modalData[showModal].message} 
          icon={modalData[showModal].icon} 
          photo={modalData[showModal].photo}
          gallery={modalData[showModal].gallery}
          notesWidth={modalData[showModal].notesWidth}
          variant={modalData[showModal].variant}
          confirmLabel={modalData[showModal].confirmLabel ?? "Open"}
          isMobile={isMobile}
          activeCreativeLabel={activeCreativeLabel}
          setActiveCreativeLabel={setActiveCreativeLabel}
          activePhotoUrl={activePhotoUrl}
          setActivePhotoUrl={setActivePhotoUrl}
          onSwitchModal={(key) => setShowModal(key)}
        />
      )}

      {!isMobile && view !== 'experience' && view !== 'projects' && view !== 'education' && (
        <div className="absolute top-8 left-0 right-0 flex justify-center text-neutral-400 text-xs font-light w-full"><span>{view === 'main' ? "WASD / Arrows to explore • Enter to open • Esc to close" : "WASD / Arrows to explore • Enter to select • Esc to go back"}</span></div>
      )}

      {(view === 'experience' || view === 'projects' || view === 'education') && (
        <motion.div
          onClick={() => { setView('main'); setHoveredLabel(null); }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springTransition}
          aria-label="Back"
          style={{ position: 'absolute', right: isMobile ? '20px' : '48px', bottom: isMobile ? '84px' : '40px', zIndex: 10000, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
        >
          <div style={{ position: 'relative', width: isMobile ? 76 : 104, height: isMobile ? 76 : 104 }}>
            <Image src={view === 'projects' ? "/icons/projects.png" : view === 'education' ? "/icons/education.png" : "/icons/experience.png"} alt="Back" fill sizes="104px" style={{ objectFit: 'contain' }} priority />
          </div>
          <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 400, color: '#111' }}>Back</span>
        </motion.div>
      )}
      
      <div style={{ position: 'absolute', top: 'auto', bottom: isMobile ? '16px' : '24px', left: isMobile ? '50%' : '32px', transform: isMobile ? 'translateX(-50%)' : 'none', maxWidth: isMobile ? 'calc(100vw - 20px)' : 'none', overflowX: isMobile ? 'auto' : 'visible', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 12px', borderRadius: '6px', backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0, 0, 0, 0.05)', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 500, color: '#999' }}>
          {!isMobile && (
            <>
              <div style={{ position: 'relative', width: '16px', height: '16px', flexShrink: 0 }}>
                <img src="/icons/path/macintosh-hd.png" alt="Macintosh HD" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <span style={{ whiteSpace: 'nowrap' }}>Macintosh HD</span>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </>
          )}
          <div style={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src="/icons/center.png" width={14} height={14} alt="user" draggable={false} style={{ borderRadius: '50%' }} /></div>
          <span style={{ whiteSpace: 'nowrap' }}>daniellopez</span>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          <div style={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src="/icons/center.png" width={14} height={14} alt="portfolio" draggable={false} /></div>
          <span style={{ color: (view === "main" && !hoveredLabel) ? "#000" : "#999", whiteSpace: 'nowrap' }}>portfolio</span>
          {view !== "main" && (
            <>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              <div style={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src={getSubViewIcon()} width={14} height={14} alt={view} draggable={false} /></div>
              <span style={{ color: !hoveredLabel ? '#000' : '#999', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{view === 'aboutme' ? 'About Me' : view === 'creativecloud' ? 'Creative Cloud' : view === 'education' ? 'Education' : view}</span>
            </>
          )}
          {hoveredLabel && !showModal && (
            <>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              <div style={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{(() => { const icon = getIconForLabel(hoveredLabel); return icon ? <img src={icon} width={14} height={14} alt={hoveredLabel} draggable={false} /> : null; })()}</div>
              <span style={{ color: '#000', whiteSpace: 'nowrap' }}>{hoveredLabel}</span>
            </>
          )}
          {showModal && activeModal && (
            <>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              <div style={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={activeModal.icon} width={14} height={14} alt={showModal} draggable={false} />
              </div>
              <span style={{ color: activeModal.variant && activeModal.variant !== 'default' ? '#999' : '#000', whiteSpace: 'nowrap' }}>{showModal}</span>
              {activeModal.variant && activeModal.variant !== 'default' && (
                <>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  <div style={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src={
                        showModal === 'Creative Cloud' 
                          ? (creativeCloudItems.find(i => i.label === activeCreativeLabel)?.src || "/icons/skills/creativecloud.png")
                          : (activeModal.variant === 'notes' ? "/icons/notes-symbol.png" : activeModal.variant === 'terminal' ? "/icons/terminal-symbol.png" : activeModal.variant === 'photos' ? "/icons/photos-symbol.png" : activeModal.variant === 'mail' ? "/icons/contact/gmail.svg" : activeModal.icon)
                      } 
                      width={14} height={14} alt={activeModal.variant || ""} draggable={false} 
                    />
                  </div>
                  <span style={{ color: '#000', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                    {showModal === 'Creative Cloud' ? activeCreativeLabel : activeModal.variant === 'mail' ? 'New Message' : activeModal.variant}
                  </span>
                </>
              )}
            </>
          )}
        </div>
      </div>


      {!isMobile && (
        <div
          style={{
            position: "absolute",
            right: "16px",
            top: "16px",
            zIndex: 10000,
            fontSize: "12px",
            fontWeight: 500,
            color: "#666",
            background: "rgba(255,255,255,0.72)",
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: "6px",
            padding: "4px 8px",
            backdropFilter: "blur(8px)"
          }}
        >
          {`Visitors: ${visitorCount ?? "..."}`}
        </div>
      )}

      <AnimatePresence>
        {isMobile && contactMenuOpen && (
          <motion.div
            key="contact-fullmenu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setContactMenuOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 100001,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: "10px",
              paddingTop: "120px",
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
            }}
          >
            {contactLinks.map((it) => {
              const isCopied = it.email && copiedEmail;
              return (
                <motion.button
                  key={it.modal}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: contactLinks.indexOf(it) * 0.04 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (it.email) {
                      navigator.clipboard?.writeText(it.email).catch(() => {});
                      setCopiedEmail(true);
                      if (copiedTimer.current) clearTimeout(copiedTimer.current);
                      copiedTimer.current = setTimeout(() => setCopiedEmail(false), 2000);
                    } else if (it.href) {
                      window.open(it.href, "_blank", "noopener,noreferrer");
                      setContactMenuOpen(false);
                    }
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: "16px",
                    width: "min(78vw, 300px)", padding: "16px 22px", borderRadius: "16px",
                    border: "1px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.7)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    fontSize: "18px", fontWeight: 600, color: "#111", cursor: "pointer", textAlign: "left",
                  }}
                >
                  <span style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {it.img ? (
                      <img src={it.img} alt={it.label} width={27} height={27} style={{ objectFit: "contain" }} />
                    ) : (
                      <svg width={26} height={26} viewBox="0 0 24 24" fill={it.color}><path d={it.path} /></svg>
                    )}
                  </span>
                  {isCopied ? "Copied to clipboard" : it.label}
                </motion.button>
              );
            })}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: contactLinks.length * 0.04 }}
              onClick={(e) => { e.stopPropagation(); setContactMenuOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: "16px",
                width: "min(78vw, 300px)", padding: "16px 22px", borderRadius: "16px",
                border: "1px solid rgba(0,0,0,0.06)", background: "rgba(0,0,0,0.04)",
                fontSize: "18px", fontWeight: 600, color: "#111", cursor: "pointer", textAlign: "left", marginTop: "4px",
              }}
            >
              <span style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </span>
              Back
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notif && (
          <motion.div
            key="notif"
            initial={{ opacity: 0, x: 40, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            onClick={() => { if (notifTimer.current) clearTimeout(notifTimer.current); setNotif(null); }}
            style={{
              position: 'fixed',
              top: isMobile ? '12px' : '16px',
              right: isMobile ? '12px' : '16px',
              left: isMobile ? '12px' : 'auto',
              width: isMobile ? 'auto' : 340,
              zIndex: 100000,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '14px 16px',
              borderRadius: '18px',
              background: 'rgba(248,248,248,0.82)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
              border: '1px solid rgba(0,0,0,0.06)',
              cursor: 'default',
            }}
          >
            {notif.icon && (
              <div style={{ position: 'relative', width: 38, height: 38, borderRadius: 9, overflow: 'hidden', flexShrink: 0, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
                <Image src={notif.icon} alt={notif.title} fill sizes="38px" unoptimized={notif.icon.endsWith('.svg')} style={{ objectFit: 'contain', padding: 6 }} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{notif.title}</span>
                <span style={{ fontSize: 11, color: '#999', flexShrink: 0 }}>now</span>
              </div>
              <div style={{ fontSize: 13, color: '#333', marginTop: 1, lineHeight: 1.35 }}>{notif.message}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
