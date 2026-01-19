// Book Import Service
// Orchestrates the import process for EPUB and PDF files

import {
    Book,
    generateBookId,
    saveBook,
    saveWordsCache,
} from "./book-storage";
import { PickedDocument, saveDocumentToLibrary } from "./document-picker";
import { parseEPUB } from "./epub-parser";
import { parsePDF } from "./pdf-parser";

export interface ImportProgress {
  stage: "copying" | "parsing" | "saving";
  message: string;
}

export type ProgressCallback = (progress: ImportProgress) => void;

/**
 * Import a picked document into the library
 */
export async function importBook(
  document: PickedDocument,
  onProgress?: ProgressCallback,
): Promise<Book> {
  const bookId = generateBookId();

  try {
    // Stage 1: Copy file to permanent storage
    onProgress?.({
      stage: "copying",
      message: "Saving file...",
    });

    const filePath = await saveDocumentToLibrary(document);

    // Stage 2: Parse the document
    onProgress?.({
      stage: "parsing",
      message: "Extracting text...",
    });

    let title: string;
    let author: string | undefined;
    let words: string[];
    let chapters: { title: string; startIndex: number }[] | undefined;

    if (document.type === "epub") {
      const content = await parseEPUB(filePath);
      title = content.metadata.title || extractTitleFromFilename(document.name);
      author = content.metadata.author;
      words = content.words;
      chapters = content.chapters;
    } else {
      const content = await parsePDF(filePath);
      title = content.title || extractTitleFromFilename(document.name);
      words = content.words;
    }

    // Stage 3: Save to storage
    onProgress?.({
      stage: "saving",
      message: "Adding to library...",
    });

    // Create book record
    const book: Book = {
      id: bookId,
      title,
      author,
      type: document.type,
      filePath,
      wordCount: words.length,
      currentWord: 0,
      addedAt: Date.now(),
      chapters,
    };

    // Save book metadata
    await saveBook(book);

    // Save word cache
    await saveWordsCache(bookId, words);

    return book;
  } catch (error) {
    console.error("Error importing book:", error);
    throw error;
  }
}

/**
 * Extract a readable title from filename
 */
function extractTitleFromFilename(filename: string): string {
  // Remove extension
  let name = filename.replace(/\.(epub|pdf)$/i, "");

  // Replace underscores and hyphens with spaces
  name = name.replace(/[_-]/g, " ");

  // Clean up multiple spaces
  name = name.replace(/\s+/g, " ").trim();

  // Capitalize first letter of each word
  name = name.replace(/\b\w/g, (c) => c.toUpperCase());

  return name || "Untitled";
}
