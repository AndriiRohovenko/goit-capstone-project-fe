import type { Dispatch, SetStateAction } from "react";

export async function copyToClipboard(
  state: {
    setCopiedKey: Dispatch<SetStateAction<string | null>>;
    setActionError: Dispatch<SetStateAction<string | null>>;
  },
  key: string,
  value: string | string[],
) {
  const text = Array.isArray(value) ? value.join("\n") : value;

  if (!text.trim() || typeof navigator === "undefined") {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    state.setCopiedKey(key);
    window.setTimeout(() => state.setCopiedKey(null), 1600);
  } catch {
    state.setActionError("Could not copy to clipboard.");
  }
}
