// Book Storage Service
// Manages book metadata and content persistence

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

export interface Chapter {
  title: string;
  startIndex: number; // Word index where chapter begins
}

export interface Book {
  id: string;
  title: string;
  author?: string;
  type: "epub" | "pdf";
  filePath: string;
  wordCount: number;
  currentWord: number; // Reading progress (word index)
  addedAt: number;
  lastReadAt?: number;
  chapters?: Chapter[];
}

const BOOKS_STORAGE_KEY = "@readfast/books";
const WORDS_DIR = `${FileSystem.documentDirectory}words/`;

/**
 * Ensure the words directory exists
 */
async function ensureWordsDirectory(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(WORDS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(WORDS_DIR, { intermediates: true });
  }
}

/**
 * Get all books from storage
 */
export async function getAllBooks(): Promise<Book[]> {
  try {
    const json = await AsyncStorage.getItem(BOOKS_STORAGE_KEY);
    if (!json) return [];
    return JSON.parse(json);
  } catch (error) {
    console.error("Error loading books:", error);
    return [];
  }
}

/**
 * Get a single book by ID
 */
export async function getBook(bookId: string): Promise<Book | null> {
  const books = await getAllBooks();
  return books.find((b) => b.id === bookId) || null;
}

/**
 * Save a new book
 */
export async function saveBook(book: Book): Promise<void> {
  const books = await getAllBooks();
  books.push(book);
  await AsyncStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
}

/**
 * Update a book's properties
 */
export async function updateBook(
  bookId: string,
  updates: Partial<Book>,
): Promise<void> {
  const books = await getAllBooks();
  const index = books.findIndex((b) => b.id === bookId);
  if (index >= 0) {
    books[index] = { ...books[index], ...updates };
    await AsyncStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
  }
}

/**
 * Delete a book and its associated files
 */
export async function deleteBook(bookId: string): Promise<void> {
  const books = await getAllBooks();
  const book = books.find((b) => b.id === bookId);

  if (book) {
    // Delete the word cache
    await deleteWordsCache(bookId);

    // Delete the source file
    try {
      await FileSystem.deleteAsync(book.filePath, { idempotent: true });
    } catch (e) {
      console.warn("Could not delete book file:", e);
    }

    // Remove from storage
    const newBooks = books.filter((b) => b.id !== bookId);
    await AsyncStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(newBooks));
  }
}

/**
 * Save word array to cache
 */
export async function saveWordsCache(
  bookId: string,
  words: string[],
): Promise<void> {
  await ensureWordsDirectory();
  const path = `${WORDS_DIR}${bookId}.json`;
  await FileSystem.writeAsStringAsync(path, JSON.stringify(words));
}

/**
 * Load word array from cache
 */
export async function loadWordsCache(bookId: string): Promise<string[] | null> {
  try {
    const path = `${WORDS_DIR}${bookId}.json`;
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return null;

    const json = await FileSystem.readAsStringAsync(path);
    return JSON.parse(json);
  } catch (error) {
    console.error("Error loading words cache:", error);
    return null;
  }
}

/**
 * Delete word cache for a book
 */
export async function deleteWordsCache(bookId: string): Promise<void> {
  try {
    const path = `${WORDS_DIR}${bookId}.json`;
    await FileSystem.deleteAsync(path, { idempotent: true });
  } catch (error) {
    console.warn("Error deleting words cache:", error);
  }
}

/**
 * Update reading progress
 */
export async function updateProgress(
  bookId: string,
  currentWord: number,
): Promise<void> {
  await updateBook(bookId, {
    currentWord,
    lastReadAt: Date.now(),
  });
}

/**
 * Generate a unique book ID
 */
export function generateBookId(): string {
  return `book_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calculate reading progress percentage
 */
export function calculateProgress(book: Book): number {
  if (book.wordCount === 0) return 0;
  return Math.round((book.currentWord / book.wordCount) * 100);
}

/**
 * Estimate reading time remaining (at given WPM)
 */
export function estimateTimeRemaining(book: Book, wpm: number): string {
  const wordsRemaining = book.wordCount - book.currentWord;
  const minutesRemaining = Math.ceil(wordsRemaining / wpm);

  if (minutesRemaining < 60) {
    return `${minutesRemaining} min`;
  }

  const hours = Math.floor(minutesRemaining / 60);
  const mins = minutesRemaining % 60;
  return `${hours}h ${mins}m`;
}
