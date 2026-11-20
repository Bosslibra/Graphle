/** Share via the native sheet when available (mobile), otherwise copy to the clipboard. */
export async function shareOrCopy(text: string): Promise<"shared" | "copied" | "failed"> {
  try {
    if (typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches) {
      await navigator.share({ text });
      return "shared";
    }
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}
