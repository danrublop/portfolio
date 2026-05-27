"use client";

// App Router error boundary. Catches render/runtime errors anywhere in the
// page tree so a single throw doesn't leave the visitor on a blank screen.
// `reset()` re-renders the segment without a full reload.
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#333",
        padding: 24,
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
        Something went wrong
      </h2>
      <p style={{ fontSize: 14, color: "#666", margin: 0, maxWidth: 360 }}>
        This page hit an unexpected error. Try again, and if it keeps happening
        reach out at daniel.lopez.3@stonybrook.edu.
      </p>
      <button
        onClick={reset}
        style={{
          padding: "10px 18px",
          fontSize: 13,
          fontWeight: 600,
          color: "#fff",
          backgroundColor: "#007aff",
          border: "none",
          borderRadius: 12,
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,122,255,0.3)",
        }}
      >
        Try again
      </button>
    </div>
  );
}
