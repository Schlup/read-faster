// PDF Parser Service
// Extracts text from PDF files
// Note: Uses a simple approach since expo-pdf-text-extract may need dev client

import * as FileSystem from "expo-file-system/legacy";
import { extractTitle, normalizeText, tokenizeWords } from "./text-normalizer";

interface PDFContent {
  title: string;
  text: string;
  words: string[];
}

/**
 * Simple PDF text extraction
 * For production, consider using expo-pdf-text-extract with a dev client
 *
 * This is a fallback that attempts basic extraction
 */
export async function parsePDF(filePath: string): Promise<PDFContent> {
  try {
    // Read file as base64
    const fileContent = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Decode base64 to binary string
    const binaryString = atob(fileContent);

    // Extract text streams from PDF
    // This is a simplified approach that works for many PDFs
    let extractedText = extractTextFromPDFBinary(binaryString);

    if (!extractedText || extractedText.trim().length < 50) {
      // If no text found, the PDF might be image-based
      throw new Error(
        "Could not extract text from PDF. It may be a scanned/image-based document.",
      );
    }

    // Normalize the text
    const normalizedText = normalizeText(extractedText);
    const words = tokenizeWords(normalizedText);
    const title = extractTitle(normalizedText);

    return {
      title,
      text: normalizedText,
      words,
    };
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw error;
  }
}

/**
 * Extract text from PDF binary content
 * This handles common PDF text encoding
 */
function extractTextFromPDFBinary(binary: string): string {
  const textParts: string[] = [];

  // Look for text streams between BT (begin text) and ET (end text)
  const textBlockRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match;

  while ((match = textBlockRegex.exec(binary)) !== null) {
    const textBlock = match[1];

    // Extract text from Tj and TJ operators
    const textContent = extractTextOperators(textBlock);
    if (textContent) {
      textParts.push(textContent);
    }
  }

  // Also try to find raw string content
  const stringRegex = /\(([^)]+)\)/g;
  while ((match = stringRegex.exec(binary)) !== null) {
    const content = match[1];
    // Filter out non-text content
    if (isPrintableText(content) && content.length > 2) {
      textParts.push(decodePDFString(content));
    }
  }

  // Look for hex-encoded strings
  const hexRegex = /<([0-9A-Fa-f]+)>/g;
  while ((match = hexRegex.exec(binary)) !== null) {
    const hexContent = match[1];
    if (hexContent.length > 4) {
      const decoded = decodeHexString(hexContent);
      if (isPrintableText(decoded) && decoded.length > 2) {
        textParts.push(decoded);
      }
    }
  }

  return textParts.join(" ");
}

/**
 * Extract text from PDF text operators (Tj, TJ, ', ")
 */
function extractTextOperators(textBlock: string): string {
  const parts: string[] = [];

  // Tj operator: (text) Tj
  const tjRegex = /\(([^)]*)\)\s*Tj/g;
  let match;
  while ((match = tjRegex.exec(textBlock)) !== null) {
    parts.push(decodePDFString(match[1]));
  }

  // TJ operator: [(text) num (text) ...] TJ
  const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
  while ((match = tjArrayRegex.exec(textBlock)) !== null) {
    const arrayContent = match[1];
    const stringRegex = /\(([^)]*)\)/g;
    let stringMatch;
    while ((stringMatch = stringRegex.exec(arrayContent)) !== null) {
      parts.push(decodePDFString(stringMatch[1]));
    }
  }

  return parts.join("");
}

/**
 * Decode PDF string escape sequences
 */
function decodePDFString(str: string): string {
  return str
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\")
    .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
}

/**
 * Decode hex-encoded string
 */
function decodeHexString(hex: string): string {
  let result = "";
  for (let i = 0; i < hex.length; i += 2) {
    const charCode = parseInt(hex.substring(i, i + 2), 16);
    if (charCode > 0) {
      result += String.fromCharCode(charCode);
    }
  }
  return result;
}

/**
 * Check if text appears to be printable/readable
 */
function isPrintableText(text: string): boolean {
  if (!text || text.length === 0) return false;

  // Count printable characters
  let printable = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (
      (code >= 32 && code <= 126) || // ASCII printable
      (code >= 160 && code <= 255) || // Extended Latin
      (code >= 0x0400 && code <= 0x04ff) || // Cyrillic
      (code >= 0x00c0 && code <= 0x024f) // Latin Extended
    ) {
      printable++;
    }
  }

  return printable / text.length > 0.7;
}
