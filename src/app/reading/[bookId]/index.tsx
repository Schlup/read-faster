// Reading Screen - Speed Reading Interface

import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Pressable,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton } from "../../../../components/ui/icon-button";
import { Progress } from "../../../../components/ui/progress";
import { P, Small } from "../../../../components/ui/text";
import "../../../../global.css";
import { ChaptersModal } from "../../../components/chapters-modal";
import { useSettings } from "../../../context/settings-context";
import { useTheme } from "../../../context/theme-context";
import {
    Book,
    getBook,
    loadWordsCache,
    updateProgress,
} from "../../../services/book-storage";

// Constants for context view
const WORDS_PER_LINE = 6;
const CONTEXT_LINES = 3; // Lines above and below

/**
 * Calculate the Optimal Recognition Point (ORP) for a word.
 */
function calculateORP(word: string): number {
  const len = word.length;
  if (len <= 1) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  if (len <= 13) return 3;
  return 4;
}

/**
 * Group words into lines for context view
 */
function groupWordsIntoLines(
  words: string[],
  currentIndex: number,
  wordsPerLine: number,
  linesAbove: number,
  linesBelow: number
): { lines: string[][]; currentLineIndex: number; currentWordInLine: number } {
  if (words.length === 0) {
    return { lines: [], currentLineIndex: 0, currentWordInLine: 0 };
  }

  // Calculate which "virtual line" the current word is on
  const currentLineNum = Math.floor(currentIndex / wordsPerLine);
  const currentWordInLine = currentIndex % wordsPerLine;

  // Get range of lines to show
  const startLine = Math.max(0, currentLineNum - linesAbove);
  const endLine = Math.min(
    Math.ceil(words.length / wordsPerLine) - 1,
    currentLineNum + linesBelow
  );

  const lines: string[][] = [];
  for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
    const startIdx = lineNum * wordsPerLine;
    const endIdx = Math.min(startIdx + wordsPerLine, words.length);
    lines.push(words.slice(startIdx, endIdx));
  }

  // Adjust current line index relative to our slice
  const currentLineIndex = currentLineNum - startLine;

  return { lines, currentLineIndex, currentWordInLine };
}

export default function ReadingScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { accentColor } = useSettings();

  // Book and words state
  const [book, setBook] = useState<Book | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reading state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wpm, setWpm] = useState(300);

  // Chapter modal state
  const [showChapters, setShowChapters] = useState(false);

  // Animation values
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Playback ref for interval
  const playbackRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animate when play state changes
  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: isPlaying ? 0 : 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [isPlaying]);

  // Load book and words on mount
  useEffect(() => {
    loadBookData();
    return () => {
      if (book && currentIndex > 0) {
        updateProgress(book.id, currentIndex);
      }
    };
  }, [bookId]);

  // Handle playback
  useEffect(() => {
    if (isPlaying && words.length > 0) {
      const interval = 60000 / wpm;

      playbackRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, interval);

      return () => {
        if (playbackRef.current) {
          clearInterval(playbackRef.current);
        }
      };
    }
  }, [isPlaying, wpm, words.length]);

  // Auto-save progress periodically
  useEffect(() => {
    if (book && currentIndex > 0 && currentIndex % 50 === 0) {
      updateProgress(book.id, currentIndex);
    }
  }, [currentIndex, book]);

  const loadBookData = async () => {
    try {
      if (!bookId) {
        setError("No book ID provided");
        return;
      }

      const bookData = await getBook(bookId);
      if (!bookData) {
        setError("Book not found");
        return;
      }

      setBook(bookData);
      setCurrentIndex(bookData.currentWord);

      const wordsData = await loadWordsCache(bookId);
      if (!wordsData || wordsData.length === 0) {
        setError("Could not load book content");
        return;
      }

      setWords(wordsData);
    } catch (err) {
      setError("Error loading book");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Touch zones handler
  const handleTouch = useCallback(
    (zone: "left" | "center" | "right") => {
      switch (zone) {
        case "left":
          setCurrentIndex((prev) => Math.max(0, prev - 10));
          break;
        case "center":
          setIsPlaying((prev) => !prev);
          break;
        case "right":
          setCurrentIndex((prev) => Math.min(words.length - 1, prev + 10));
          break;
      }
    },
    [words.length]
  );

  // Handle chapter selection
  const handleChapterSelect = useCallback(
    (chapterIdx: number, wordIndex: number) => {
      setCurrentIndex(wordIndex);
      setIsPlaying(false);
    },
    []
  );

  // Calculate progress
  const progress =
    words.length > 0 ? Math.round((currentIndex / words.length) * 100) : 0;

  // Handle back with save
  const handleBack = async () => {
    if (book && currentIndex > 0) {
      await updateProgress(book.id, currentIndex);
    }
    router.back();
  };

  // Get chapters (if available)
  const chapters = book?.chapters || [];
  const hasChapters = chapters.length > 1;

  // Theme-aware colors
  const bgColor = isDark ? "#0a0a0a" : "#ffffff";
  const textColor = isDark ? "#fafafa" : "#0a0a0a";
  const mutedColor = isDark ? "#525252" : "#a3a3a3";
  const borderColor = isDark ? "#2e2e2e" : "#e5e5e5";
  const primaryBg = isDark ? "#fafafa" : "#171717";
  const primaryFg = isDark ? "#0a0a0a" : "#fafafa";

  // Current word with ORP calculation
  const currentWord = words[currentIndex] || "";
  const orpIndex = useMemo(() => calculateORP(currentWord), [currentWord]);

  // Split word into three parts for highlighting
  const wordParts = useMemo(() => {
    if (!currentWord) return { before: "", focus: "", after: "" };
    return {
      before: currentWord.slice(0, orpIndex),
      focus: currentWord[orpIndex] || "",
      after: currentWord.slice(orpIndex + 1),
    };
  }, [currentWord, orpIndex]);

  // Context lines for paused view
  const contextData = useMemo(() => {
    return groupWordsIntoLines(
      words,
      currentIndex,
      WORDS_PER_LINE,
      CONTEXT_LINES,
      CONTEXT_LINES
    );
  }, [words, currentIndex]);

  // Animation interpolations
  const playingScale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.7],
  });

  const contextOpacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const focusWordOpacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.5, 0],
  });

  // Loading state
  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <ActivityIndicator size="large" color={textColor} />
        <P className="mt-4" style={{ color: mutedColor }}>
          Loading book...
        </P>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View
        className="flex-1 items-center justify-center p-6"
        style={{ backgroundColor: bgColor }}
      >
        <Feather name="alert-circle" size={48} color={mutedColor} />
        <P className="mt-4 text-center" style={{ color: textColor }}>
          {error}
        </P>
        <Pressable className="mt-6" onPress={() => router.back()}>
          <P style={{ color: isDark ? "#fafafa" : "#171717" }}>Go Back</P>
        </Pressable>
      </View>
    );
  }

  // Render a word with optional ORP highlighting
  const renderWord = (
    word: string,
    isCurrentWord: boolean,
    wordIdx: number
  ) => {
    if (isCurrentWord) {
      const orp = calculateORP(word);
      return (
        <Text key={wordIdx} style={{ flexDirection: "row" }}>
          <Text
            style={{
              color: textColor,
              fontSize: 24,
              fontWeight: "600",
            }}
          >
            {word.slice(0, orp)}
          </Text>
          <Text
            style={{
              color: accentColor,
              fontSize: 24,
              fontWeight: "600",
            }}
          >
            {word[orp] || ""}
          </Text>
          <Text
            style={{
              color: textColor,
              fontSize: 24,
              fontWeight: "600",
            }}
          >
            {word.slice(orp + 1)}
          </Text>
        </Text>
      );
    }
    return (
      <Text
        key={wordIdx}
        style={{
          color: mutedColor,
          fontSize: 24,
          fontWeight: "400",
        }}
      >
        {word}
      </Text>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 py-2"
        style={{ paddingTop: insets.top }}
      >
        <IconButton variant="ghost" onPress={handleBack}>
          <Feather name="x" size={24} color={textColor} />
        </IconButton>

        {hasChapters ? (
          <Pressable
            className="flex-row items-center px-3 py-1 rounded-full"
            style={{ backgroundColor: isDark ? "#1f1f1f" : "#f0f0f0" }}
            onPress={() => setShowChapters(true)}
          >
            <Feather
              name="list"
              size={14}
              color={mutedColor}
              style={{ marginRight: 4 }}
            />
            <Small style={{ color: mutedColor }}>Chapters</Small>
          </Pressable>
        ) : (
          <Small style={{ color: mutedColor }}>{wpm} WPM</Small>
        )}

        <IconButton variant="ghost" onPress={() => {}}>
          <Feather name="more-vertical" size={22} color={textColor} />
        </IconButton>
      </View>

      {/* Main Reading Area */}
      <View className="flex-1 flex-row">
        {/* Left Zone */}
        <Pressable
          className="flex-1 justify-center"
          onPress={() => handleTouch("left")}
        />

        {/* Center Zone */}
        <Pressable
          className="flex-[3] justify-center items-center"
          onPress={() => handleTouch("center")}
        >
          {/* Context View (Paused) */}
          <Animated.View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              opacity: contextOpacity,
              justifyContent: "center",
              alignItems: "center",
            }}
            pointerEvents={isPlaying ? "none" : "auto"}
          >
            {/* Top Fade */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 100,
                zIndex: 10,
              }}
            >
              <View style={{ flex: 1, backgroundColor: bgColor, opacity: 1 }} />
              <View style={{ flex: 1, backgroundColor: bgColor, opacity: 0.9 }} />
              <View style={{ flex: 1, backgroundColor: bgColor, opacity: 0.7 }} />
              <View style={{ flex: 1, backgroundColor: bgColor, opacity: 0.4 }} />
              <View style={{ flex: 1, backgroundColor: bgColor, opacity: 0.1 }} />
            </View>

            {/* Context Lines */}
            <View className="items-center justify-center px-6">
              {contextData.lines.map((line, lineIdx) => {
                const isCurrentLine = lineIdx === contextData.currentLineIndex;
                const distanceFromCenter = Math.abs(
                  lineIdx - contextData.currentLineIndex
                );
                const lineOpacity = 1 - distanceFromCenter * 0.25;

                return (
                  <View
                    key={lineIdx}
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      marginVertical: 8,
                      opacity: lineOpacity,
                      gap: 8,
                    }}
                  >
                    {line.map((word, wordIdx) => {
                      const globalWordIdx =
                        (contextData.currentLineIndex -
                          lineIdx +
                          Math.floor(currentIndex / WORDS_PER_LINE)) *
                          WORDS_PER_LINE +
                        wordIdx;
                      const isCurrentWord =
                        isCurrentLine &&
                        wordIdx === contextData.currentWordInLine;

                      return renderWord(word, isCurrentWord, wordIdx);
                    })}
                  </View>
                );
              })}
            </View>

            {/* Bottom Fade */}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 100,
                zIndex: 10,
              }}
            >
              <View style={{ flex: 1, backgroundColor: bgColor, opacity: 0.1 }} />
              <View style={{ flex: 1, backgroundColor: bgColor, opacity: 0.4 }} />
              <View style={{ flex: 1, backgroundColor: bgColor, opacity: 0.7 }} />
              <View style={{ flex: 1, backgroundColor: bgColor, opacity: 0.9 }} />
              <View style={{ flex: 1, backgroundColor: bgColor, opacity: 1 }} />
            </View>
          </Animated.View>

          {/* Playing View - Single Word with ORP centered */}
          <Animated.View
            style={{
              opacity: focusWordOpacity,
              transform: [{ scale: playingScale }],
              width: "100%",
              alignItems: "center",
            }}
            pointerEvents={isPlaying ? "auto" : "none"}
          >
            {/* Center line indicator (fixed at screen center) */}
            <View
              style={{
                position: "absolute",
                top: -20,
                width: 2,
                height: 12,
                backgroundColor: accentColor,
                opacity: 0.5,
              }}
            />
            
            {/* Word container - uses flexbox to position word around center */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "baseline",
              }}
            >
              {/* Before part - right-aligned to push focus to center */}
              <View style={{ alignItems: "flex-end", minWidth: 120 }}>
                <Text
                  style={{
                    color: textColor,
                    fontSize: 48,
                    lineHeight: 60,
                    fontWeight: "700",
                    letterSpacing: -1,
                  }}
                >
                  {wordParts.before}
                </Text>
              </View>
              
              {/* Focus character - this stays centered */}
              <Text
                style={{
                  color: accentColor,
                  fontSize: 48,
                  lineHeight: 60,
                  fontWeight: "700",
                  letterSpacing: -1,
                }}
              >
                {wordParts.focus}
              </Text>
              
              {/* After part - left-aligned */}
              <View style={{ alignItems: "flex-start", minWidth: 120 }}>
                <Text
                  style={{
                    color: textColor,
                    fontSize: 48,
                    lineHeight: 60,
                    fontWeight: "700",
                    letterSpacing: -1,
                  }}
                >
                  {wordParts.after}
                </Text>
              </View>
            </View>

            {/* Focus Point Indicator (below the ORP) */}
            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: accentColor,
                marginTop: 16,
              }}
            />
          </Animated.View>
        </Pressable>

        {/* Right Zone */}
        <Pressable
          className="flex-1 justify-center items-end"
          onPress={() => handleTouch("right")}
        />
      </View>

      {/* Bottom Control Bar */}
      <View
        className="px-6 py-4"
        style={{
          borderTopWidth: 1,
          borderTopColor: borderColor,
          paddingBottom: insets.bottom + 8,
        }}
      >
        {/* Progress Bar */}
        <View className="mb-4">
          <Progress
            value={progress}
            style={{
              height: 4,
              backgroundColor: isDark ? "#262626" : "#e5e5e5",
            }}
          />
          <View className="flex-row justify-between mt-2">
            <Small style={{ color: mutedColor }}>
              {currentIndex.toLocaleString()} / {words.length.toLocaleString()}
            </Small>
            <Small style={{ color: mutedColor }}>{progress}%</Small>
          </View>
        </View>

        {/* Controls */}
        <View className="flex-row items-center justify-center gap-6">
          <IconButton
            variant="ghost"
            size="lg"
            onPress={() => handleTouch("left")}
          >
            <Feather name="skip-back" size={24} color={textColor} />
          </IconButton>

          <Pressable
            className="w-16 h-16 rounded-full items-center justify-center active:opacity-80"
            style={{ backgroundColor: primaryBg }}
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <Feather
              name={isPlaying ? "pause" : "play"}
              size={28}
              color={primaryFg}
            />
          </Pressable>

          <IconButton
            variant="ghost"
            size="lg"
            onPress={() => handleTouch("right")}
          >
            <Feather name="skip-forward" size={24} color={textColor} />
          </IconButton>
        </View>
      </View>

      {/* Chapters Modal */}
      <ChaptersModal
        visible={showChapters}
        onClose={() => setShowChapters(false)}
        chapters={chapters}
        currentIndex={currentIndex}
        onSelectChapter={handleChapterSelect}
        isDark={isDark}
      />
    </View>
  );
}
