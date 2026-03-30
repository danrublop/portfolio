"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, TargetAndTransition, Transition } from "framer-motion";
import Image from "next/image";
import { ArrowBigLeft } from "lucide-react";

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
};

const Folder = ({ src, label, onClick, onHover, className, initial, animate, exit, transition, isSelected, compact = false }: FolderProps) => (
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
      {isSelected && (
        <motion.div 
          layoutId="selection-border"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1.15 }}
          className="absolute inset-0 border-2 border-blue-400/50 rounded-xl"
          style={{ width: compact ? '74px' : '90px', height: compact ? '74px' : '90px' }}
        />
      )}
      
      <div className={`relative ${compact ? 'w-16 h-16' : 'w-20 h-20'}`}>
        <Image src={src} alt={label} fill style={{ objectFit: 'contain', filter: isSelected ? 'drop-shadow(0 0 16px rgba(59, 130, 246, 0.9))' : 'none' }} priority />
      </div>
    </div>
    <span className={`folder-label transition-colors z-10 ${compact ? 'text-sm' : ''} ${isSelected ? 'bg-blue-600 text-white px-3 py-0.5 rounded-sm shadow-lg' : ''}`}>
      {label}
    </span>
  </motion.div>
);

const Modal = ({ isOpen, onClose, onConfirm, title, message, icon, photo, gallery, notesWidth, variant = "default", confirmLabel = "Open", isMobile = false }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string, icon: string, photo?: string, gallery?: string[], notesWidth?: number, variant?: "default" | "notes" | "terminal" | "photos", confirmLabel?: string, isMobile?: boolean }) => {
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
    ChatGPT: "Resolving openai package",
    Git: "Installing git binaries",
  };
  const terminalCommand = message.split("\n")[0] || "echo ready";
  const terminalOutput = `Last login: Thu Mar 26 12:39:20 on ttys023
daniellopez@Daniels-MacBook-Pro ~ % ${terminalCommand}
`;
  const creativeCloudItems = [
    { label: "Lightroom", src: "/icons/cc-lr-folder.png" },
    { label: "Premiere Pro", src: "/icons/cc-pr-folder.png" },
    { label: "Photoshop", src: "/icons/cc-ps-folder.png" },
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
  const [activeCreativeItem, setActiveCreativeItem] = useState(creativeCloudItems[0]);
  const [activePhoto, setActivePhoto] = useState(photographyGallery[0]);
  const [photoZoom, setPhotoZoom] = useState(1);
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

  useEffect(() => {
    if (variant === "photos" && title === "Creative Cloud") {
      setActiveCreativeItem(creativeCloudItems[0]);
    }
    if (variant === "photos" && title === "Photography") {
      setActivePhoto(photographyGallery[0]);
      setPhotoZoom(1);
    }
    if (variant === "photos" && title !== "Creative Cloud" && gallery && gallery.length > 0) {
      setActivePhoto(gallery[0]);
      setPhotoZoom(1);
    }
  }, [variant, title, gallery]);

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
      if (title !== "Creative Cloud" && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        const currentGallery = title === "Photography" ? photographyGallery : (gallery && gallery.length > 0 ? gallery : photographyGallery);
        const currentIndex = currentGallery.indexOf(activePhoto);
        const delta = e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1;
        const nextIndex = (currentIndex + delta + currentGallery.length) % currentGallery.length;
        setActivePhoto(currentGallery[nextIndex]);
      }

      if (title === "Creative Cloud" && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        const currentIndex = creativeCloudItems.findIndex((item) => item.label === activeCreativeItem.label);
        const delta = e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1;
        const nextIndex = (currentIndex + delta + creativeCloudItems.length) % creativeCloudItems.length;
        setActiveCreativeItem(creativeCloudItems[nextIndex]);
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
                    : '380px',
            maxHeight: isMobile ? 'calc(100vh - 24px)' : 'none',
            backgroundColor: variant === "notes" ? '#fff7d6' : variant === "terminal" ? '#1a1a1a' : '#ffffff',
            borderRadius: '22px',
            boxShadow: '0 32px 64px -16px rgba(0,0,0,0.2)',
            border: variant === "notes" ? '1px solid #e3d59d' : variant === "terminal" ? '1px solid #111' : '1px solid rgba(0,0,0,0.08)',
            padding: variant === "notes" ? '24px' : variant === "terminal" || variant === "photos" ? '0' : '32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: variant === "notes" ? 'left' : variant === "terminal" ? 'left' : 'center',
            position: 'relative',
            overflow: isMobile ? 'hidden' : 'visible'
          }}
        >
          {variant === "notes" ? (
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
          ) : variant === "terminal" || variant === "photos" ? (
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
          ) : (
            <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
              <div onClick={onClose} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f57', border: '0.5px solid #e0443e', cursor: 'pointer' }}></div>
              <div onClick={onClose} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e', border: '0.5px solid #dea123', cursor: 'pointer' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f', border: '0.5px solid #1aab29' }}></div>
            </div>
          )}

          {variant === "terminal" ? (
            <div style={{ width: '100%', minHeight: isMobile ? '260px' : '360px', maxHeight: isMobile ? 'calc(100vh - 120px)' : 'none', overflowY: isMobile ? 'auto' : 'visible', padding: isMobile ? '14px 14px' : '20px 24px', backgroundColor: '#151515', borderBottomLeftRadius: '22px', borderBottomRightRadius: '22px', display: 'flex', flexDirection: 'column' }}>
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
                    <>
                      <div
                        ref={logoAreaRef}
                        onDragStart={(e) => e.preventDefault()}
                        style={{ marginTop: '12px', width: '100%', flex: 1, minHeight: '190px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: logoMotionRef.current.dragging ? 'grabbing' : 'grab', perspective: '900px', overflow: 'hidden', userSelect: 'none' }}
                      >
                        <div
                          ref={logoModelRef}
                          style={{
                            position: 'relative',
                            width: '120px',
                            height: '120px',
                            transformStyle: 'preserve-3d',
                            transform: 'rotateX(-18deg) rotateY(24deg)',
                            willChange: 'transform',
                          }}
                        >
                          {Array.from({ length: 16 }).map((_, idx) => (
                            <div key={idx} style={{ position: 'absolute', inset: 0, transform: `translateZ(${-10 + idx * 0.8}px)`, opacity: idx === 15 ? 1 : 0.2 }}>
                              <Image draggable={false} src="/icons/apple-logo.svg" alt="3D Apple logo" fill style={{ objectFit: 'contain', pointerEvents: 'none', filter: `${idx === 15 ? 'drop-shadow(0 8px 12px rgba(0,0,0,0.45)) ' : ''}brightness(0) invert(1)` }} />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ marginTop: '8px', width: '100%', textAlign: 'center', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '12px', color: '#a1a1a8', letterSpacing: '0.02em' }}>
                        Drag me
                      </div>
                    </>
                  )}
                  {title === "PostgreSQL" && (
                    <div style={{ marginTop: '12px', width: '100%', borderRadius: '10px', border: '1px solid #2b2b2b', backgroundColor: '#101010', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderBottom: '1px solid #252525', color: '#93c5fd', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '12px' }}>
                        <span>postgres://localhost:5432/portfolio</span>
                        <span style={{ color: '#86efac' }}>connected</span>
                      </div>
                      <div style={{ padding: '10px', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '8px' }}>
                        {["users", "projects", "experience", "skills", "education", "contact"].map((table) => (
                          <div key={table} style={{ border: '1px solid #2a2a2a', borderRadius: '8px', padding: '8px', backgroundColor: '#151515' }}>
                            <div style={{ color: '#e5e7eb', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '11px' }}>{table}</div>
                            <div style={{ color: '#9ca3af', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '10px', marginTop: '4px' }}>rows: active</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : variant === "photos" ? (
            <div style={{ width: '100%', maxHeight: isMobile ? 'calc(100vh - 120px)' : 'none', overflowY: isMobile ? 'auto' : 'visible', padding: isMobile ? '12px 12px 14px 12px' : '18px 18px 20px 18px', borderBottomLeftRadius: '22px', borderBottomRightRadius: '22px', backgroundColor: '#fff' }}>
              {title === "Photography" || (title !== "Creative Cloud" && gallery && gallery.length > 0) ? (
                <>
                  <div style={{ width: '100%', height: isMobile ? '190px' : '250px', borderRadius: '12px', border: '1px solid #e5e5e5', background: 'linear-gradient(180deg, #f9fafb, #f3f4f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', width: '100%', height: '100%', transform: `scale(${photoZoom})`, transformOrigin: 'center center', transition: 'transform 0.2s ease' }}>
                      <Image src={activePhoto} alt="Photography preview image" fill style={{ objectFit: 'contain' }} />
                    </div>
                    <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.85)', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '4px 6px' }}>
                      <button onClick={() => setPhotoZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2)))} style={{ width: '22px', height: '22px', borderRadius: '6px', border: '1px solid #d9d9d9', background: '#fff', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}>-</button>
                      <span style={{ minWidth: '44px', textAlign: 'center', fontSize: '11px', color: '#666', fontWeight: 600 }}>{Math.round(photoZoom * 100)}%</span>
                      <button onClick={() => setPhotoZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))} style={{ width: '22px', height: '22px', borderRadius: '6px', border: '1px solid #d9d9d9', background: '#fff', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}>+</button>
                    </div>
                  </div>
                  <div style={{ width: '100%', marginTop: '12px', display: 'flex', gap: isMobile ? '8px' : '10px', overflowX: 'auto', paddingBottom: '2px' }}>
                    {(title === "Photography" ? photographyGallery : (gallery && gallery.length > 0 ? gallery : photographyGallery)).map((src, idx) => (
                      <button key={src} onClick={() => setActivePhoto(src)} style={{ minWidth: isMobile ? '82px' : '96px', border: activePhoto === src ? '1px solid #b9d7ff' : '1px solid #ececec', borderRadius: '10px', padding: isMobile ? '5px' : '6px', backgroundColor: activePhoto === src ? '#eef6ff' : '#fafafa', cursor: 'pointer' }}>
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', borderRadius: '7px', overflow: 'hidden' }}>
                          <Image src={src} alt={`Photography thumbnail ${idx + 1}`} fill style={{ objectFit: 'cover' }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ width: '100%', height: isMobile ? '190px' : '250px', borderRadius: '12px', border: '1px solid #e5e5e5', background: 'linear-gradient(180deg, #f9fafb, #f3f4f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'relative', width: isMobile ? '96px' : '120px', height: isMobile ? '96px' : '120px' }}>
                    <Image src={title === "Creative Cloud" ? activeCreativeItem.src : icon} alt={title === "Creative Cloud" ? activeCreativeItem.label : title} fill style={{ objectFit: 'contain', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.12))' }} />
                  </div>
                </div>
              )}
              {title === "Creative Cloud" && (
                <div style={{ width: '100%', marginTop: '12px', display: 'flex', gap: isMobile ? '8px' : '10px', overflowX: 'auto', paddingBottom: '2px' }}>
                  {creativeCloudItems.map((item) => (
                    <button key={item.label} onClick={() => setActiveCreativeItem(item)} style={{ minWidth: isMobile ? '76px' : '86px', border: activeCreativeItem.label === item.label ? '1px solid #b9d7ff' : '1px solid #ececec', borderRadius: '10px', padding: isMobile ? '6px' : '8px', backgroundColor: activeCreativeItem.label === item.label ? '#eef6ff' : '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <div style={{ position: 'relative', width: isMobile ? '24px' : '30px', height: isMobile ? '24px' : '30px' }}>
                        <Image src={item.src} alt={item.label} fill style={{ objectFit: 'contain' }} />
                      </div>
                      <span style={{ fontSize: '10px', color: '#666', textAlign: 'center', lineHeight: 1.2 }}>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
              <p style={{ fontSize: '13px', color: '#666', marginTop: '10px' }}>{message}</p>
            </div>
          ) : (
            <>
              <div style={{ position: 'relative', width: variant === "notes" ? '58px' : '80px', height: variant === "notes" ? '58px' : '80px', marginBottom: variant === "notes" ? '12px' : '24px', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))' }}>
                <Image src={icon} alt="icon" fill style={{ objectFit: 'contain' }} />
              </div>
              <h3 style={{ width: '100%', fontSize: variant === "notes" ? '24px' : '20px', fontWeight: 700, color: '#000', marginBottom: variant === "notes" ? '12px' : '8px', letterSpacing: '-0.02em' }}>{title}</h3>
              {variant === "notes" ? (
            <div style={{ width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
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
              ) : (
                <p style={{ width: '100%', fontSize: '14px', color: '#333', marginBottom: '24px', lineHeight: 1.5, padding: '0 10px', fontWeight: 500, whiteSpace: 'pre-line' }}>{message}</p>
              )}
            </>
          )}
          
          {variant === "default" && (
            <div style={{ display: 'flex', width: '100%', gap: '12px' }}>
              <button onClick={onClose} style={{ flex: 1, padding: '12px', fontSize: '14px', fontWeight: 600, color: '#666', backgroundColor: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>Cancel</button>
              <button onClick={onConfirm} style={{ flex: 1, padding: '12px', fontSize: '14px', fontWeight: 600, color: '#fff', backgroundColor: '#007aff', border: 'none', borderRadius: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,122,255,0.3)', transition: 'all 0.2s' }}>{confirmLabel}</button>
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
  { src: "/icons/skills/chatgpt.png", label: "ChatGPT", x: 3, y: 2 },
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

const modalData: Record<string, { title: string; message: string; icon: string; photo?: string; gallery?: string[]; notesWidth?: number; url?: string; variant?: "default" | "notes" | "terminal" | "photos"; confirmLabel?: string }> = {
  X: { title: "Open X account?", message: "This will take you to @danrublop on X.com in a new tab.", icon: "/icons/contact/x.png", url: "https://x.com/danrublop" },
  LinkedIn: { title: "Open LinkedIn?", message: "Visit My profile on LinkedIn to connect or view my experiences.", icon: "/icons/contact/linkedin.png", url: "https://www.linkedin.com/in/daniel-lopez-009620276" },
  GitHub: { title: "Open GitHub?", message: "Check out My repositories and code contributions on GitHub.", icon: "/icons/contact/github.png", url: "https://github.com/danrublop" },
  Email: { title: "Draft an Email?", message: "This will open your default email client to message daniel.lopez.3@stonybrook.edu.", icon: "/icons/contact/email.png", url: "mailto:daniel.lopez.3@stonybrook.edu" },
  Prompt2Video: { title: "Open Prompt2Video?", message: "Open the Agentic Video Editor repository on GitHub in a new tab.", icon: "/icons/projects/project3.png", url: "https://github.com/danrublop/Agentic-video-editor-web-based" },
  "Code Assistant": { title: "Open Code Assistant?", message: "Open the Code Assistant repository on GitHub in a new tab.", icon: "/icons/projects/terminal.png", url: "https://github.com/danrublop/I-can-t-code-translator" },
  "Point of Sale": { title: "Open Point of Sale?", message: "Open the Swftly website in a new tab.", icon: "/icons/projects/project1.png", url: "https://www.swftly.app/" },
  Ecommerce: { title: "Open Ecommerce?", message: "Open the Ecommerce website in a new tab.", icon: "/icons/projects/project2.png", url: "https://harvell-ml18.vercel.app/" },
  "B.S. Comp Sci": { title: "Stony Brook University", message: "B.S Computer Science\nTechnican/Devloper at Stony Brook Department of Informtion Tehcnology", icon: "/icons/education/stonnny.png", photo: "/images/education/stonybrook-stamp.jpg", variant: "notes", confirmLabel: "Done" },
  "Diploma & AA Degree": { title: "Bard High School Early College", message: "Spanish & Math Peer Tutor\nStudent Goverment\nVarsity Soccer Capptain\nLatin Amersican Stuent Org Founder", icon: "/icons/education/brd.png", photo: "/images/education/bard-stamp.jpg", variant: "notes", confirmLabel: "Done" },
  "Locksmith @ Cashier": { title: "Basics on Broadway Manhattan, NY", message: "Stocker/locksmith August 2025 – February 2026\nAssisted customers with technical product inquiries and key duplication services in a fast-paced retail environment.\nManaged inventory intake and shipment processing, maintaining accurate stock levels across departments.", icon: "/icons/experience/job1.png", photo: "/images/experience/locksmith-stamp.jpg", variant: "notes", confirmLabel: "Done" },
  "IT Dept @ SBU": { title: "Division of Information Technology Stony Brook, NY", message: "Client Support Technician February 2026 – Present\nResolve hardware and software issues for faculty, staff, and students across walk-in and remote help desk channels.\nDiagnose and repair university computer systems, reducing downtime for end users.", icon: "/icons/experience/terminal.png", photo: "/images/education/stonybrook-stamp.jpg", variant: "notes", confirmLabel: "Done" },
  "Window Cleaning": { title: "Riverdale Window Cleaning Bronx, NY", message: "Co-founder June 2023 – October 2023\nLaunched and operated a local service business, handling client acquisition, scheduling, and operations.\nAcquired 15 clients through door-to-door sales, demonstrating persistence and strong communication.", icon: "/icons/experience/job4.png", variant: "notes", confirmLabel: "Done" },
  "Volunteer Tutoring": { title: "Volunteer Tutoring Experience", message: "## Coalition for Asian American Children and Families\nVolunteer, June 2023\nCollaborated with NYC DOE to develop and teach curriculum at multiple public high schools citywide.\nCertificate of Recognition from New York City Comptroller - June 2023\n## Bard College Center For Learning And Writing, New York, NY\nPeer Tutor, September 2023 - June 2025\nChosen by the college faculty to tutor students at my college and provided educational resources and guidance.", icon: "/icons/experience/job2.png", photo: "/images/experience/volunteer-stamp.svg", variant: "notes", confirmLabel: "Done" },
  "Goodfellas Pizza": { title: "Goodfellas Pizza, Bronx, NY", message: "Cashier/Counter Worker, June 2023 - September 2024\nServed customers and took orders by phone, in person, and through restaurant apps.\nPrepared food, manned the cashier, and worked closing shifts.", icon: "/icons/experience/pizzahut.png", photo: "/images/experience/goodfellas-stamp.jpg", variant: "notes", confirmLabel: "Done" },
  "Video Editor": { title: "College Soccer Guy, Los Angeles, California (Remote)", message: "Editor/Social Media Manager, April 2024 - June 2025\nCreated and edited videos for athletes.\nEdited social media posts and designed custom digital graphics using Adobe apps.", icon: "/icons/experience/assets.png", photo: "/images/experience/video-editor-stamp.jpeg", variant: "notes", confirmLabel: "Done" },
  "Dev @ Thriive AI": { title: "Thriive AI", message: "August 2025 - November 2025\nDeveloped software that converts prompts into polished explainer videos with AI-generated scenes, narration, avatars, and music.\nBuilt on Veo 3, DALL-E 3, HeyGen, and OpenAI TTS.", icon: "/icons/experience/applescript.png", photo: "/images/experience/thriive-stamp.svg", variant: "notes", confirmLabel: "Done" },
  "Child Care": { title: "The Hebrew Institute Of Riverdale, Bronx, NY", message: "Youth Leader, June 2021 - December 2024\nSpent every Saturday morning looking after young children while their parents attended Shabbat services.\nOrganized fundraisers and managed community events.", icon: "/icons/experience/job3.png", variant: "notes", confirmLabel: "Done" },
  Futbol: { title: "Futbol", message: "", icon: "/icons/aboutme/gaming.png", gallery: ["/images/aboutme/futbol/psal-2.PNG", "/images/aboutme/futbol/dsc-3585.JPG", "/images/aboutme/futbol/dsc-01393.jpeg", "/images/aboutme/futbol/dsc-3350.jpeg"], variant: "photos" },
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
  ChatGPT: { title: "ChatGPT", message: "npm install openai", icon: "/icons/skills/chatgpt.png", variant: "terminal" },
  Git: { title: "Git", message: "brew install git", icon: "/icons/skills/git_folder.png", variant: "terminal" },
};

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"main" | "skills" | "experience" | "projects" | "aboutme" | "contact" | "creativecloud" | "education">("main");
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

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
            else if (['Skills', 'Experience', 'Projects', 'About Me', 'Contact', 'Education'].includes(label)) {
              if (label === 'Skills') openSkills();
              else if (label === 'Experience') openExperience();
              else if (label === 'Projects') openProjects();
              else if (label === 'About Me') openAboutMe();
              else if (label === 'Contact') openContact();
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
              { label: 'Education', x: 0, y: -1 }, { label: 'Skills', x: 0, y: -2 }, { label: 'About Me', x: 0, y: 1 }, { label: 'Contact', x: 0, y: 2 }, { label: 'Projects', x: -1, y: 0 }, { label: 'Experience', x: 1, y: 0 }
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
      <AnimatePresence mode="wait">
        {view === "main" ? (
          <motion.div key="main" className={`relative flex items-center justify-center ${isMobile ? "w-full h-full" : "w-[600px] h-[600px]"}`} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={springTransition}>
            <Folder src="/icons/center.png" label="Daniel Lopez" compact={isMobile} onClick={toggleOpen} onHover={setHoveredLabel} isSelected={hoveredLabel === "Daniel Lopez" || (!hoveredLabel && !isOpen)} className="z-50" />
            <AnimatePresence>
              {isOpen && (
                <>
                  <Folder src="/icons/education.png" label="Education" compact={isMobile} className="absolute" onClick={openEducation} onHover={setHoveredLabel} isSelected={hoveredLabel === "Education"} initial={{ y: 0, opacity: 0, scale: 0 }} animate={{ y: -mainOffsetY, opacity: 1, scale: 1 }} exit={{ y: 0, opacity: 0, scale: 0 }} transition={{ ...springTransition, delay: 0.05 }} />
                  <Folder src="/icons/skills.png" label="Skills" compact={isMobile} className="absolute" onClick={openSkills} onHover={setHoveredLabel} isSelected={hoveredLabel === "Skills"} initial={{ y: -mainOffsetY, opacity: 0, scale: 0 }} animate={{ y: -mainOffsetY * 2, opacity: 1, scale: 1 }} exit={{ y: -mainOffsetY, opacity: 0, scale: 0 }} transition={{ ...springTransition, delay: 0.1 }} />
                  <Folder src="/icons/aboutme.png" label="About Me" compact={isMobile} className="absolute" onClick={openAboutMe} onHover={setHoveredLabel} isSelected={hoveredLabel === "About Me"} initial={{ y: 0, opacity: 0, scale: 0 }} animate={{ y: mainOffsetY, opacity: 1, scale: 1 }} exit={{ y: 0, opacity: 0, scale: 0 }} transition={{ ...springTransition, delay: 0.05 }} />
                  <Folder src="/icons/contact.png" label="Contact" compact={isMobile} className="absolute" onClick={openContact} onHover={setHoveredLabel} isSelected={hoveredLabel === "Contact"} initial={{ y: mainOffsetY, opacity: 0, scale: 0 }} animate={{ y: mainOffsetY * 2, opacity: 1, scale: 1 }} exit={{ y: mainOffsetY, opacity: 0, scale: 0 }} transition={{ ...springTransition, delay: 0.1 }} />
                  <Folder src="/icons/projects.png" label="Projects" compact={isMobile} className="absolute" onClick={openProjects} onHover={setHoveredLabel} isSelected={hoveredLabel === "Projects"} initial={{ x: 0, opacity: 0, scale: 0 }} animate={{ x: -mainOffsetX, opacity: 1, scale: 1 }} exit={{ x: 0, opacity: 0, scale: 0 }} transition={{ ...springTransition, delay: 0 }} />
                  <Folder src="/icons/experience.png" label="Experience" compact={isMobile} className="absolute" onClick={openExperience} onHover={setHoveredLabel} isSelected={hoveredLabel === "Experience"} initial={{ x: 0, opacity: 0, scale: 0 }} animate={{ x: mainOffsetX, opacity: 1, scale: 1 }} exit={{ x: 0, opacity: 0, scale: 0 }} transition={{ ...springTransition, delay: 0 }} />
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
        />
      )}

      {!isMobile && (
        <div className="absolute top-8 left-0 right-0 flex justify-center text-neutral-400 text-xs font-light w-full"><span>{view === 'main' ? "WASD / Arrows to explore • Enter to open • Esc to close" : "WASD / Arrows to explore • Enter to select • Esc to go back"}</span></div>
      )}
      
      <div style={{ position: 'absolute', top: isMobile ? '12px' : 'auto', bottom: isMobile ? 'auto' : '24px', left: isMobile ? '50%' : '32px', transform: isMobile ? 'translateX(-50%)' : 'none', maxWidth: isMobile ? 'calc(100vw - 20px)' : 'none', overflowX: isMobile ? 'auto' : 'visible', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 12px', borderRadius: '6px', backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0, 0, 0, 0.05)', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 500, color: '#999' }}>
          <div style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg viewBox="0 0 24 24" width="14" height="14"><rect x="3" y="4" width="18" height="16" rx="2" fill="#e0e0e0" /><rect x="5" y="6" width="14" height="2" fill="#fff" opacity="0.5" /><rect x="5" y="9" width="14" height="2" fill="#fff" opacity="0.3" /><circle cx="17" cy="15" r="2" fill="#bdbdbd" /></svg></div>
          <span style={{ whiteSpace: 'nowrap' }}>Macintosh HD</span>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          <div style={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="#60a5fa" opacity="0.8"><path d="M2.25 18.75V7.5c0-1.105.895-2 2-2h3.25l1.5 2.25h12.5c1.105 0 2 .895 2 2v9c0 1.105-.895 2-2 2H4.25c-1.105 0-2-.895-2-2Z" /></svg></div>
          <span style={{ whiteSpace: 'nowrap' }}>Users</span>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          <div style={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Image src="/icons/center.png" width={14} height={14} alt="user" style={{ borderRadius: '50%' }} /></div>
          <span style={{ whiteSpace: 'nowrap' }}>daniellopez</span>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          <div style={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Image src="/icons/center.png" width={14} height={14} alt="portfolio" /></div>
          <span style={{ color: (view === "main" && !hoveredLabel) ? "#000" : "#999", whiteSpace: 'nowrap' }}>portfolio</span>
          {view !== "main" && (
            <>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              <div style={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Image src={getSubViewIcon()} width={14} height={14} alt={view} /></div>
              <span style={{ color: !hoveredLabel ? '#000' : '#999', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{view === 'aboutme' ? 'About Me' : view === 'creativecloud' ? 'Creative Cloud' : view === 'education' ? 'Education' : view}</span>
            </>
          )}
          {hoveredLabel && !showModal && (
            <>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              <div style={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{(() => { const icon = getIconForLabel(hoveredLabel); return icon ? <Image src={icon} width={14} height={14} alt={hoveredLabel} /> : null; })()}</div>
              <span style={{ color: '#000', whiteSpace: 'nowrap' }}>{hoveredLabel}</span>
            </>
          )}
          {showModal && activeModal && (
            <>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              <div style={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeModal.variant === 'notes' ? (
                  <Image src="/icons/notes-symbol.png" width={14} height={14} alt="Notes" />
                ) : (
                  <Image src={activeModal.icon} width={14} height={14} alt={showModal} />
                )}
              </div>
              <span style={{ color: '#000', whiteSpace: 'nowrap' }}>{showModal}</span>
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
    </main>
  );
}
