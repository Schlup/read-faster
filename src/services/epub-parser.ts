// EPUB Parser Service
// Extracts text content from EPUB files using JSZip

import * as FileSystem from "expo-file-system/legacy";
import JSZip from "jszip";
import { normalizeText, stripHtmlTags, tokenizeWords } from "./text-normalizer";

interface EPUBSpineItem {
  id: string;
  href: string;
}

interface EPUBMetadata {
  title?: string;
  author?: string;
}

export interface EPUBChapter {
  title: string;
  startIndex: number; // Word index where this chapter starts
}

interface EPUBContent {
  metadata: EPUBMetadata;
  text: string;
  words: string[];
  chapters: EPUBChapter[];
}

/**
 * Parse EPUB file and extract text content with chapters
 */
export async function parseEPUB(filePath: string): Promise<EPUBContent> {
  try {
    // Read the EPUB file as base64
    const fileContent = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Load the ZIP
    const zip = await JSZip.loadAsync(fileContent, { base64: true });

    // Find and parse container.xml to get the OPF path
    const containerXml = await zip
      .file("META-INF/container.xml")
      ?.async("string");
    if (!containerXml) {
      throw new Error("Invalid EPUB: Missing container.xml");
    }

    const opfPath = extractOpfPath(containerXml);
    const opfDir = opfPath.substring(0, opfPath.lastIndexOf("/") + 1);

    // Parse the OPF file
    const opfContent = await zip.file(opfPath)?.async("string");
    if (!opfContent) {
      throw new Error("Invalid EPUB: Missing OPF file");
    }

    // Extract metadata
    const metadata = extractMetadata(opfContent);

    // Extract spine items (reading order)
    const spineItems = extractSpine(opfContent);

    // Extract manifest to map IDs to hrefs
    const manifest = extractManifest(opfContent);

    // Try to extract TOC for chapter titles
    const tocTitles = await extractTOCTitles(zip, opfDir, opfContent);

    // Read each chapter in spine order, tracking word positions
    let allWords: string[] = [];
    const chapters: EPUBChapter[] = [];

    for (const spineItem of spineItems) {
      const href = manifest[spineItem.id];
      if (!href) continue;

      const chapterPath = opfDir + href;
      const chapterContent = await zip.file(chapterPath)?.async("string");

      if (chapterContent) {
        // Get chapter title from TOC or generate from href
        const chapterTitle = tocTitles[href] || generateChapterTitle(href, chapters.length + 1);
        
        // Strip HTML and extract text
        const chapterText = stripHtmlTags(chapterContent);
        const normalizedText = normalizeText(chapterText);
        const chapterWords = tokenizeWords(normalizedText);
        
        // Only add chapter if it has meaningful content
        if (chapterWords.length > 10) {
          chapters.push({
            title: chapterTitle,
            startIndex: allWords.length,
          });
          
          allWords = allWords.concat(chapterWords);
        }
      }
    }

    // If no chapters found, create a single "Start" chapter
    if (chapters.length === 0 && allWords.length > 0) {
      chapters.push({
        title: "Start",
        startIndex: 0,
      });
    }

    return {
      metadata,
      text: allWords.join(" "),
      words: allWords,
      chapters,
    };
  } catch (error) {
    console.error("Error parsing EPUB:", error);
    throw new Error(`Failed to parse EPUB: ${error}`);
  }
}

/**
 * Extract OPF path from container.xml
 */
function extractOpfPath(containerXml: string): string {
  const match = containerXml.match(/full-path="([^"]+)"/);
  if (!match) {
    throw new Error("Could not find OPF path in container.xml");
  }
  return match[1];
}

/**
 * Extract metadata from OPF content
 */
function extractMetadata(opfContent: string): EPUBMetadata {
  const metadata: EPUBMetadata = {};

  // Extract title
  const titleMatch = opfContent.match(
    /<dc:title[^>]*>([^<]+)<\/dc:title>/i,
  );
  if (titleMatch) {
    metadata.title = titleMatch[1].trim();
  }

  // Extract author/creator
  const authorMatch = opfContent.match(
    /<dc:creator[^>]*>([^<]+)<\/dc:creator>/i,
  );
  if (authorMatch) {
    metadata.author = authorMatch[1].trim();
  }

  return metadata;
}

/**
 * Extract spine items from OPF content
 */
function extractSpine(opfContent: string): EPUBSpineItem[] {
  const items: EPUBSpineItem[] = [];

  // Find all itemref elements in spine
  const spineMatch = opfContent.match(/<spine[^>]*>([\s\S]*?)<\/spine>/i);
  if (!spineMatch) return items;

  const spineContent = spineMatch[1];
  const itemrefRegex = /<itemref[^>]*idref="([^"]+)"[^>]*\/?>/gi;

  let match;
  while ((match = itemrefRegex.exec(spineContent)) !== null) {
    items.push({
      id: match[1],
      href: "", // Will be filled from manifest
    });
  }

  return items;
}

/**
 * Extract manifest (ID to href mapping) from OPF content
 */
function extractManifest(opfContent: string): Record<string, string> {
  const manifest: Record<string, string> = {};

  // Find all item elements in manifest
  const manifestMatch = opfContent.match(
    /<manifest[^>]*>([\s\S]*?)<\/manifest>/i,
  );
  if (!manifestMatch) return manifest;

  const manifestContent = manifestMatch[1];
  const itemRegex =
    /<item[^>]*id="([^"]+)"[^>]*href="([^"]+)"[^>]*\/?>/gi;

  let match;
  while ((match = itemRegex.exec(manifestContent)) !== null) {
    manifest[match[1]] = match[2];
  }

  // Also try alternate attribute order
  const itemRegex2 =
    /<item[^>]*href="([^"]+)"[^>]*id="([^"]+)"[^>]*\/?>/gi;
  while ((match = itemRegex2.exec(manifestContent)) !== null) {
    manifest[match[2]] = match[1];
  }

  return manifest;
}

/**
 * Extract chapter titles from TOC (NCX or NAV)
 */
async function extractTOCTitles(
  zip: JSZip,
  opfDir: string,
  opfContent: string,
): Promise<Record<string, string>> {
  const titles: Record<string, string> = {};

  // Try to find NCX file reference
  const ncxMatch = opfContent.match(
    /<item[^>]*href="([^"]+)"[^>]*media-type="application\/x-dtbncx\+xml"[^>]*\/?>/i,
  );

  if (ncxMatch) {
    const ncxPath = opfDir + ncxMatch[1];
    const ncxContent = await zip.file(ncxPath)?.async("string");

    if (ncxContent) {
      // Parse NCX navPoints
      const navPointRegex =
        /<navPoint[^>]*>[\s\S]*?<text>([^<]+)<\/text>[\s\S]*?<content[^>]*src="([^"#]+)/gi;
      let match;
      while ((match = navPointRegex.exec(ncxContent)) !== null) {
        const title = match[1].trim();
        const src = match[2];
        titles[src] = title;
      }
    }
  }

  // Also try EPUB3 NAV document
  const navMatch = opfContent.match(
    /<item[^>]*properties="nav"[^>]*href="([^"]+)"[^>]*\/?>/i,
  );

  if (navMatch) {
    const navPath = opfDir + navMatch[1];
    const navContent = await zip.file(navPath)?.async("string");

    if (navContent) {
      // Parse NAV anchor tags within toc nav
      const tocMatch = navContent.match(
        /<nav[^>]*epub:type="toc"[^>]*>([\s\S]*?)<\/nav>/i,
      );
      if (tocMatch) {
        const anchorRegex = /<a[^>]*href="([^"#]+)[^"]*"[^>]*>([^<]+)<\/a>/gi;
        let match;
        while ((match = anchorRegex.exec(tocMatch[1])) !== null) {
          const src = match[1];
          const title = match[2].trim();
          titles[src] = title;
        }
      }
    }
  }

  return titles;
}

/**
 * Generate a chapter title from the href if no TOC title found
 */
function generateChapterTitle(href: string, index: number): string {
  // Try to extract meaningful name from href
  const filename = href.split("/").pop() || href;
  const name = filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
  
  // If name looks like a chapter reference, use it
  if (name.toLowerCase().includes("chapter") || name.toLowerCase().includes("chap")) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  
  // Otherwise use generic chapter number
  return `Chapter ${index}`;
}

