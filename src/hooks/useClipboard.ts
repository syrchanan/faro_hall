import { useState } from "react";

export default function useClipboard() {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function copy(text: string) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 1500);
      return true;
    } catch (e) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 1500);
      return false;
    }
  }

  return { copy, status } as const;
}
