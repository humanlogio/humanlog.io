export const decodeUint8Array = (data: Uint8Array) => {
  try {
    const decoder = new TextDecoder();
    const str = decoder.decode(data);
    return str;
  } catch (error) {
    console.error("Uint8Array decoding error:", error);
    return `[Decoding failed: ${error instanceof Error ? error.message : "Unknown error"}]`;
  }
};

export const unit8ArrayBufferToBase64 = (buffer: Uint8Array): string => {
  try {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return base64;
  } catch (err) {
    console.error("Base64 encoding error:", err);
    return `[Encoding failed: ${err instanceof Error ? err.message : "Unknown error"}]`;
  }
};

export const unit8ArrayBufferToBase16 = (buffer?: Uint8Array): string => {
  if (!buffer) return "";

  return Array.from(buffer)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};
