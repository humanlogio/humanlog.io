export const decodeUint8Array = (data: Uint8Array) => {
  try {
    const decoder = new TextDecoder();
    const str = decoder.decode(data);
    return str;
  } catch (err) {
    console.error("Uint8Array decoding error:", err);
    return `[Decoding failed: ${err instanceof Error ? err.message : "Unknown error"}]`;
  }
};
