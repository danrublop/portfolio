"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, TargetAndTransition, Transition } from "framer-motion";
import Image from "next/image";
import { ArrowBigLeft, Copy, Check } from "lucide-react";
import EmailIcon3D from "./EmailIcon3D";
import BrandIcon3D from "./BrandIcon3D";

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
};

const Folder = ({ src, label, onClick, onHover, className, initial, animate, exit, transition, isSelected, compact = false, priority = false }: FolderProps) => (
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
          sizes={compact ? '64px' : '80px'}
          style={{
            objectFit: "contain",
            filter: isSelected ? "drop-shadow(0 0 10px rgba(59, 130, 246, 0.9))" : "none"
          }}
        />
      </div>
    </div>
    <span className={`folder-label transition-colors z-10 ${compact ? 'text-sm' : ''} ${isSelected ? 'bg-blue-600 text-white shadow-lg' : ''}`}>
      {label}
    </span>
  </motion.div>
);

const creativeCloudItems = [
  { label: "Lightroom", src: "/images/optimized/cc-lr-folder.png" },
  { label: "Premiere Pro", src: "/images/optimized/cc-pr-folder.png" },
  { label: "Photoshop", src: "/images/optimized/cc-ps-folder.png" },
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
                        onClick={() => { window.open(active.url, '_blank'); }}
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

const educationIcons = [
  { src: "/icons/education/brd.png", label: "Diploma & AA Degree", x: 0, y: 1 },
  { src: "/icons/education/stonnny.png", label: "B.S. Comp Sci", x: 2, y: 1 },
];

const skillIcons = [
  { src: "/icons/skills/icon1.png", label: "Python", x: 0, y: 0 },
  { src: "/icons/skills/react.png", label: "React", x: 1, y: 0 },
  { src: "/icons/skills/icon2.png", label: "Java", x: 2, y: 0 },
  { src: "/icons/skills/postgresql.png", label: "PostgreSQL", x: 3, y: 0 },
  { src: "/icons/skills/css.png", label: "CSS", x: 4, y: 0 },
  { src: "/icons/skills/icon5.png", label: "Photography", x: 0, y: 1 },
  { src: "/icons/skills/creativecloud.png", label: "Creative Cloud", x: 1, y: 1 },
  { src: "/icons/skills/threejs.png", label: "Three.js", x: 3, y: 1 },
  { src: "/icons/skills/nextjs.png", label: "Next.js", x: 4, y: 1 },
  { src: "/icons/skills/ollama.png", label: "Ollama", x: 0, y: 2 },
  { src: "/icons/skills/icon6.png", label: "Claude Code", x: 1, y: 2 },
  { src: "/icons/skills/icon3.png", label: "Cursor", x: 2, y: 2 },
  { src: "/icons/skills/chatgpt.png", label: "OpenAI", x: 3, y: 2 },
  { src: "/icons/skills/git_folder.png", label: "Git", x: 4, y: 2 },
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

const experienceIcons = [
  { src: "/icons/experience/applescript.png", label: "Dev @ Thriive AI", x: 0, y: 0 },
  { src: "/icons/experience/terminal.png", label: "IT Dept @ SBU", x: 1, y: 0 },
  { src: "/icons/experience/pizzahut.png", label: "Goodfellas Pizza", x: 2, y: 0 },
  { src: "/icons/experience/job1.png", label: "Locksmith @ Cashier", x: 0, y: 1 },
  { src: "/icons/experience/job2.png", label: "Volunteer Tutoring", x: 2, y: 1 },
  { src: "/icons/experience/job3.png", label: "Child Care", x: 0, y: 2 },
  { src: "/icons/experience/job4.png", label: "Window Cleaning", x: 1, y: 2 },
  { src: "/icons/experience/assets.png", label: "Video Editor", x: 2, y: 2 },
];

const projectIcons = [
  { src: "/icons/projects/project3.png", label: "Prompt2Video", x: 1, y: 0 },
  { src: "/icons/projects/project2.png", label: "Ecommerce", x: 0, y: 1 },
  { src: "/icons/projects/project1.png", label: "Point of Sale", x: 2, y: 1 },
  { src: "/icons/projects/terminal.png", label: "Code Assistant", x: 1, y: 2 },
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
  AboutMe: { title: "About Me", message: "", icon: "/icons/aboutme/profile.png", variant: "about" },
  ProjectsGrid: { title: "Projects", message: "", icon: "/icons/projects.png", variant: "projects-grid" },
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
  const [socialsOpen, setSocialsOpen] = useState(false);

  const toggleOpen = () => { if (view !== "main") { setView("main"); setIsOpen(true); } else { setIsOpen(!isOpen); } };
  const openSkills = () => { setView("skills"); setHoveredLabel(null); };
  const openExperience = () => { setView("experience"); setHoveredLabel(null); };
  const openProjects = () => { setView("projects"); setHoveredLabel(null); };
  const openAboutMe = () => { setView("aboutme"); setHoveredLabel(null); };
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
          if (targetUrl) window.open(targetUrl, "_blank");
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
              else if (label === 'Projects') setShowModal('ProjectsGrid');
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
        let items: any[] = [];
        let hubLabel = "", hubPos = { x: 1, y: 1 };
        if (view === 'skills') { items = skillIcons; hubLabel = "Skills"; hubPos = { x: 2, y: 1 }; }
        else if (view === 'experience') { items = experienceIcons; hubLabel = "Experience"; hubPos = { x: 1, y: 1 }; }
        else if (view === 'projects') { items = projectIcons; hubLabel = "Projects"; hubPos = { x: 1, y: 1 }; }
        else if (view === 'aboutme') { items = aboutIcons; hubLabel = "About Me"; hubPos = { x: 1, y: 2 }; }
        else if (view === 'contact') { items = contactIcons; hubLabel = "Contact"; hubPos = { x: 1, y: 1 }; }
        else if (view === 'creativecloud') { items = creativeIcons; hubLabel = "Creative Cloud"; hubPos = { x: 1, y: 1 }; }
        else if (view === 'education') { items = educationIcons; hubLabel = "Education"; hubPos = { x: 1, y: 1 }; }
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
    const all = [...hubs, ...educationIcons, ...skillIcons, ...experienceIcons, ...projectIcons, ...aboutIcons, ...contactIcons, ...creativeIcons];
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
      <div
        style={{
          position: 'absolute',
          top: isMobile ? '52px' : '20px',
          left: isMobile ? '12px' : '20px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          onClick={() => setShowModal('AboutMe')}
          style={{
            width: isMobile ? '40px' : '48px',
            height: isMobile ? '40px' : '48px',
            borderRadius: '50%',
            overflow: 'hidden',
            cursor: 'pointer',
            border: '1.5px solid rgba(0,0,0,0.08)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            background: '#fff',
            flexShrink: 0,
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.06)';
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.18)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
          }}
          aria-label="About Me"
          role="button"
        >
          <Image
            src="/icons/aboutme/danielpfp.png"
            alt="Daniel Lopez"
            width={isMobile ? 40 : 48}
            height={isMobile ? 40 : 48}
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            priority
          />
        </div>
        <EmailIcon3D
          size={isMobile ? 44 : 56}
          onClick={() => setSocialsOpen((v) => !v)}
        />
        <AnimatePresence>
          {socialsOpen && (
            <motion.div
              key="social-tray"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {([
                { brand: 'x' as const, modal: 'X' },
                { brand: 'github' as const, modal: 'GitHub' },
                { brand: 'linkedin' as const, modal: 'LinkedIn' },
              ]).map((it, idx) => (
                <motion.div
                  key={it.brand}
                  initial={{ opacity: 0, scale: 0.4, x: -16 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.4, x: -16 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 22, delay: idx * 0.06 }}
                >
                  <BrandIcon3D
                    brand={it.brand}
                    size={isMobile ? 40 : 52}
                    onClick={() => setShowModal(it.modal)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {view === "main" ? (
          <motion.div key="main" className={`relative flex items-center justify-center ${isMobile ? "w-full h-full" : "w-[600px] h-[600px]"}`} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={springTransition}>
            <Folder src="/icons/center.png" label="Daniel Lopez" compact={isMobile} onClick={toggleOpen} onHover={setHoveredLabel} isSelected={hoveredLabel === "Daniel Lopez" || (!hoveredLabel && !isOpen)} className="z-50" priority />
            <AnimatePresence>
              {isOpen && (
                <>
                  <Folder src="/icons/skills.png" label="Skills" compact={isMobile} className="absolute" onClick={openSkills} onHover={setHoveredLabel} isSelected={hoveredLabel === "Skills"} initial={{ y: 0, opacity: 0, scale: 0 }} animate={{ y: -mainOffsetY, opacity: 1, scale: 1 }} exit={{ y: 0, opacity: 0, scale: 0 }} transition={{ ...springTransition, delay: 0.05 }} priority />
                  <Folder src="/icons/education.png" label="Education" compact={isMobile} className="absolute" onClick={openEducation} onHover={setHoveredLabel} isSelected={hoveredLabel === "Education"} initial={{ y: 0, opacity: 0, scale: 0 }} animate={{ y: mainOffsetY, opacity: 1, scale: 1 }} exit={{ y: 0, opacity: 0, scale: 0 }} transition={{ ...springTransition, delay: 0.05 }} priority />
                  <Folder src="/icons/projects.png" label="Projects" compact={isMobile} className="absolute" onClick={() => setShowModal('ProjectsGrid')} onHover={setHoveredLabel} isSelected={hoveredLabel === "Projects"} initial={{ x: 0, opacity: 0, scale: 0 }} animate={{ x: -mainOffsetX, opacity: 1, scale: 1 }} exit={{ x: 0, opacity: 0, scale: 0 }} transition={{ ...springTransition, delay: 0 }} priority />
                  <Folder src="/icons/experience.png" label="Experience" compact={isMobile} className="absolute" onClick={openExperience} onHover={setHoveredLabel} isSelected={hoveredLabel === "Experience"} initial={{ x: 0, opacity: 0, scale: 0 }} animate={{ x: mainOffsetX, opacity: 1, scale: 1 }} exit={{ x: 0, opacity: 0, scale: 0 }} transition={{ ...springTransition, delay: 0 }} priority />
                </>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div key={view} className={`relative flex items-center justify-center h-full ${isMobile ? "w-full px-4 pt-20 pb-8" : "w-[1000px]"}`} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={springTransition}>
            {(() => {
              let grid: any[] = [];
              let hubLabel = "", hubSrc = "", hubPos = { x: 1, y: 1 };
              const cellW = isMobile ? 108 : 145;
              const cellH = isMobile ? 98 : 125;
              const getMobileSkillsPosition = (idx: number) => {
                // Fill a 3x5 grid while reserving center cell (col 1, row 2) for the Skills hub.
                const slots: Array<{ col: number; row: number }> = [];
                for (let row = 0; row < 5; row++) {
                  for (let col = 0; col < 3; col++) {
                    if (col === 1 && row === 2) continue;
                    slots.push({ col, row });
                  }
                }
                return slots[idx] ?? { col: 2, row: 4 };
              };
              if (view === 'skills') { grid = skillIcons; hubLabel = "Skills"; hubSrc = "/icons/skills.png"; hubPos = { x: 2, y: 1 }; }
              else if (view === 'experience') { grid = experienceIcons; hubLabel = "Experience"; hubSrc = "/icons/experience.png"; }
              else if (view === 'projects') { grid = projectIcons; hubLabel = "Projects"; hubSrc = "/icons/projects.png"; }
              else if (view === 'aboutme') { grid = aboutIcons; hubLabel = "About Me"; hubSrc = "/icons/aboutme.png"; hubPos = { x: 1, y: 2 }; }
              else if (view === 'contact') { grid = contactIcons; hubLabel = "Contact"; hubSrc = "/icons/contact.png"; }
              else if (view === 'creativecloud') { grid = creativeIcons; hubLabel = "Creative Cloud"; hubSrc = "/icons/skills/creativecloud.png"; }
              else if (view === 'education') { grid = educationIcons; hubLabel = "Education"; hubSrc = "/icons/education.png"; }
              const centerX = hubPos.x, centerY = hubPos.y;
              const hubMobileY = 0;
              return [
                <Folder
                  key="hub"
                  src={hubSrc}
                  label={hubLabel}
                  onClick={() => setView("main")}
                  isSelected={hoveredLabel === hubLabel}
                  onHover={setHoveredLabel}
                  compact={isMobile}
                  className={isMobile ? "absolute z-50" : "z-50"}
                  initial={isMobile ? { y: hubMobileY, scale: 0, opacity: 0 } : { scale: 0 }}
                  animate={isMobile ? { y: hubMobileY, scale: 1, opacity: 1 } : { scale: 1 }}
                  transition={springTransition}
                />,
                ...grid.map((item, idx) => (
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
                    animate={
                      isMobile && view === "skills"
                        ? {
                            x: (getMobileSkillsPosition(idx).col - 1) * cellW,
                            y: (getMobileSkillsPosition(idx).row - 2) * cellH,
                            opacity: 1,
                            scale: 1
                          }
                        : {
                            x: (item.x - centerX) * cellW,
                            y: (item.y - centerY) * cellH,
                            opacity: 1,
                            scale: 1
                          }
                    }
                    exit={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                    transition={{ ...springTransition, delay: idx * 0.01 }}
                  />
                ))
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
            if (targetUrl) window.open(targetUrl, "_blank");
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

      {!isMobile && (
        <div className="absolute top-8 left-0 right-0 flex justify-center text-neutral-400 text-xs font-light w-full"><span>{view === 'main' ? "WASD / Arrows to explore • Enter to open • Esc to close" : "WASD / Arrows to explore • Enter to select • Esc to go back"}</span></div>
      )}
      
      <div style={{ position: 'absolute', top: isMobile ? '12px' : 'auto', bottom: isMobile ? 'auto' : '24px', left: isMobile ? '50%' : '32px', transform: isMobile ? 'translateX(-50%)' : 'none', maxWidth: isMobile ? 'calc(100vw - 20px)' : 'none', overflowX: isMobile ? 'auto' : 'visible', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 12px', borderRadius: '6px', backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0, 0, 0, 0.05)', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 500, color: '#999' }}>
          <div style={{ position: 'relative', width: '16px', height: '16px', flexShrink: 0 }}>
            <img src="/icons/path/macintosh-hd.png" alt="Macintosh HD" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span style={{ whiteSpace: 'nowrap' }}>Macintosh HD</span>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          <div style={{ position: 'relative', width: '14px', height: '14px', flexShrink: 0 }}>
            <img src="/icons/path/users.png" alt="Users" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span style={{ whiteSpace: 'nowrap' }}>Users</span>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
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
                          : (activeModal.variant === 'notes' ? "/icons/notes-symbol.png" : activeModal.variant === 'terminal' ? "/icons/terminal-symbol.png" : activeModal.variant === 'photos' ? "/icons/photos-symbol.png" : activeModal.variant === 'mail' ? "/icons/contact/email.png" : activeModal.icon)
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

      {isMobile && (showModal || view !== "main" || isOpen) && (
        <button
          onClick={() => {
            if (showModal) {
              setShowModal(null);
              return;
            }
            if (view !== "main") {
              setView("main");
              setHoveredLabel(null);
              return;
            }
            if (isOpen) {
              setIsOpen(false);
              setHoveredLabel(null);
            }
          }}
          aria-label="Go back"
          style={{
            position: 'absolute',
            left: '16px',
            bottom: '16px',
            zIndex: 10000,
            width: '46px',
            height: '52px',
            borderRadius: '999px',
            border: '1px solid rgba(0,0,0,0.08)',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#111',
            cursor: 'pointer'
          }}
        >
          <ArrowBigLeft size={16} strokeWidth={2.25} />
        </button>
      )}

      <div
        style={{
          position: "absolute",
          right: "16px",
          bottom: "16px",
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
    </main>
  );
}
