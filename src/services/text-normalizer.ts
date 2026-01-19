// Text Normalizer Service
// Cleans extracted text by removing page numbers, headers, footers, and other artifacts

export interface NormalizationOptions {
  removePageNumbers?: boolean;
  removeChapterMarkers?: boolean;
  removeHeaders?: boolean;
  collapseWhitespace?: boolean;
  handleHyphenation?: boolean;
}

const DEFAULT_OPTIONS: NormalizationOptions = {
  removePageNumbers: true,
  removeChapterMarkers: true,
  removeHeaders: true,
  collapseWhitespace: true,
  handleHyphenation: true,
};

/**
 * Patterns to identify and remove common artifacts
 */
const ARTIFACT_PATTERNS = {
  // Page numbers in various formats
  pageNumber: [
    /^(Page\s+)?\d{1,4}$/gim, // "Page 42" or just "42"
    /^[-—–]\s*\d{1,4}\s*[-—–]$/gm, // "— 42 —" or "- 42 -"
    /^\[\d{1,4}\]$/gm, // "[42]"
    /^\(\d{1,4}\)$/gm, // "(42)"
    /^p\.\s*\d{1,4}$/gim, // "p. 42"
  ],

  // Chapter markers that are just numbers
  chapterMarker: [
    /^(chapter|capítulo|cap\.?)\s*\d+$/gim,
    /^[ivxlcdm]+$/gim, // Roman numerals alone
    /^part\s+\d+$/gim,
    /^section\s+\d+$/gim,
  ],

  // Common header/footer patterns
  headerFooter: [
    /^(copyright|©).*$/gim,
    /^all rights reserved.*$/gim,
    /^isbn[\s:-]*[\d-]+$/gim,
  ],
};

/**
 * Remove page numbers from text
 */
function removePageNumbers(text: string): string {
  let result = text;
  for (const pattern of ARTIFACT_PATTERNS.pageNumber) {
    result = result.replace(pattern, "");
  }
  return result;
}

/**
 * Remove chapter markers that are just numbers
 */
function removeChapterMarkers(text: string): string {
  let result = text;
  for (const pattern of ARTIFACT_PATTERNS.chapterMarker) {
    result = result.replace(pattern, "");
  }
  return result;
}

/**
 * Remove common headers and footers
 */
function removeHeaders(text: string): string {
  let result = text;
  for (const pattern of ARTIFACT_PATTERNS.headerFooter) {
    result = result.replace(pattern, "");
  }
  return result;
}

/**
 * Handle hyphenation at line breaks
 * Joins words that were split across lines with a hyphen
 */
function handleHyphenation(text: string): string {
  // Join hyphenated words at line breaks
  return text.replace(/(\w+)-\s*\n\s*(\w+)/g, "$1$2");
}

/**
 * Collapse multiple whitespace characters into single spaces
 */
function collapseWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, "\n") // Normalize line endings
    .replace(/\n{3,}/g, "\n\n") // Max 2 consecutive newlines
    .replace(/[ \t]+/g, " ") // Collapse horizontal whitespace
    .replace(/\n /g, "\n") // Remove space after newline
    .replace(/ \n/g, "\n") // Remove space before newline
    .trim();
}

/**
 * Strip HTML tags from text (for EPUB content)
 */
export function stripHtmlTags(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "") // Remove styles
    .replace(/<[^>]+>/g, " ") // Remove all HTML tags
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&[a-z]+;/gi, " "); // Remove other HTML entities
}

/**
 * Main normalization function
 * Takes raw text and cleans it for speed reading
 */
export function normalizeText(
  text: string,
  options: NormalizationOptions = DEFAULT_OPTIONS,
): string {
  let result = text;

  if (options.handleHyphenation) {
    result = handleHyphenation(result);
  }

  if (options.removePageNumbers) {
    result = removePageNumbers(result);
  }

  if (options.removeChapterMarkers) {
    result = removeChapterMarkers(result);
  }

  if (options.removeHeaders) {
    result = removeHeaders(result);
  }

  if (options.collapseWhitespace) {
    result = collapseWhitespace(result);
  }

  return result;
}

/**
 * Split text into words for speed reading
 * Keeps punctuation attached to words
 */
export function tokenizeWords(text: string): string[] {
  return text
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .filter((word) => !/^[\d]+$/.test(word)); // Remove standalone numbers
}

/**
 * Extract title from text (first significant line)
 */
export function extractTitle(text: string, maxLength: number = 50): string {
  const lines = text.split("\n").map((l) => l.trim());

  for (const line of lines) {
    // Skip empty lines and very short lines
    if (line.length < 3) continue;
    // Skip lines that look like page numbers or metadata
    if (/^[\d\[\]()—–-]+$/.test(line)) continue;
    if (/^(page|chapter|copyright)/i.test(line)) continue;

    // Found a good title candidate
    return line.length > maxLength
      ? line.substring(0, maxLength - 3) + "..."
      : line;
  }

  return "Untitled";
}
