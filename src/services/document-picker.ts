// Document Picker Service
// Handles file selection for EPUB and PDF files

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

export type DocumentType = "epub" | "pdf";

export interface PickedDocument {
  uri: string;
  name: string;
  type: DocumentType;
  size: number;
}

const MIME_TYPES = {
  epub: "application/epub+zip",
  pdf: "application/pdf",
};

const BOOK_DIR = `${FileSystem.documentDirectory}books/`;

/**
 * Ensure the books directory exists
 */
async function ensureBookDirectory(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(BOOK_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(BOOK_DIR, { intermediates: true });
  }
}

/**
 * Generate a unique ID for a book
 */
function generateBookId(): string {
  return `book_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Open document picker for EPUB and PDF files
 */
export async function pickDocument(): Promise<PickedDocument | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [MIME_TYPES.epub, MIME_TYPES.pdf],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const mimeType = asset.mimeType || "";

    // Determine document type
    let docType: DocumentType;
    if (mimeType === MIME_TYPES.epub || asset.name.endsWith(".epub")) {
      docType = "epub";
    } else if (mimeType === MIME_TYPES.pdf || asset.name.endsWith(".pdf")) {
      docType = "pdf";
    } else {
      console.warn("Unknown document type:", mimeType, asset.name);
      return null;
    }

    return {
      uri: asset.uri,
      name: asset.name,
      type: docType,
      size: asset.size || 0,
    };
  } catch (error) {
    console.error("Error picking document:", error);
    return null;
  }
}

/**
 * Copy picked document to app's permanent storage
 */
export async function saveDocumentToLibrary(
  document: PickedDocument,
): Promise<string> {
  await ensureBookDirectory();

  const bookId = generateBookId();
  const extension = document.type === "epub" ? "epub" : "pdf";
  const destPath = `${BOOK_DIR}${bookId}.${extension}`;

  await FileSystem.copyAsync({
    from: document.uri,
    to: destPath,
  });

  return destPath;
}

/**
 * Delete a book file from storage
 */
export async function deleteBookFile(filePath: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(filePath, { idempotent: true });
  } catch (error) {
    console.error("Error deleting book file:", error);
  }
}

/**
 * Get the books directory path
 */
export function getBooksDirectory(): string {
  return BOOK_DIR;
}
