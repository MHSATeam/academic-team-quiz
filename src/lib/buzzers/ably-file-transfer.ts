import { ChunkMessage } from "@/src/lib/buzzers/message-types";

export function splitFile(file: File | Blob, chunkSize = 1024 * 12) {
  const chunks: Blob[] = [];
  for (let bytes = 0; bytes < file.size; bytes += chunkSize) {
    chunks.push(
      file.slice(bytes, Math.min(bytes + chunkSize, file.size), file.type),
    );
  }
  return chunks;
}

export function assembleFile(chunkMessages: ChunkMessage[]) {
  const chunks: Blob[] = new Array(chunkMessages[0].length);
  for (const chunkMessage of chunkMessages) {
    chunks[chunkMessage.index] = decodeBlob(chunkMessage.blob);
  }
  return new Blob(chunks, { type: chunks[0].type });
}

export async function encodeBlob(blob: Blob): Promise<string> {
  const buffer = new Uint8Array(await blob.arrayBuffer());
  const len = buffer.byteLength;
  let binary = "";
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  const base64 = btoa(binary);
  return blob.type + " " + base64;
}

export function decodeBlob(str: string): Blob {
  const [type, base64] = str.split(" ");
  const binary = atob(base64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }

  return new Blob([buffer], { type });
}
