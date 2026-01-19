// Shelf - Your PDF Library

import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, CardContent } from "../../components/ui/card";
import { IconButton } from "../../components/ui/icon-button";
import { Progress } from "../../components/ui/progress";
import { H2, Muted, P, Small } from "../../components/ui/text";
import "../../global.css";
import { useTheme } from "../context/theme-context";
import { importBook } from "../services/book-import";
import {
  Book,
  calculateProgress,
  deleteBook,
  getAllBooks,
} from "../services/book-storage";
import { pickDocument } from "../services/document-picker";

export default function ShelfScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState("");

  // Load books when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, []),
  );

  const loadBooks = async () => {
    try {
      const allBooks = await getAllBooks();
      // Sort by most recently read/added
      allBooks.sort((a, b) => (b.lastReadAt || b.addedAt) - (a.lastReadAt || a.addedAt));
      setBooks(allBooks);
    } catch (error) {
      console.error("Error loading books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportBook = async () => {
    try {
      const document = await pickDocument();
      if (!document) return;

      setIsImporting(true);
      setImportStatus("Saving file...");

      const book = await importBook(document, (progress) => {
        setImportStatus(progress.message);
      });

      setBooks((prev) => [book, ...prev]);
      setImportStatus("");
    } catch (error: any) {
      Alert.alert(
        "Import Failed",
        error.message || "Could not import the document. Please try again.",
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteBook = (book: Book) => {
    Alert.alert(
      "Delete Book",
      `Are you sure you want to delete "${book.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteBook(book.id);
            setBooks((prev) => prev.filter((b) => b.id !== book.id));
          },
        },
      ],
    );
  };

  const handleOpenBook = (book: Book) => {
    router.push(`/reading/${book.id}`);
  };

  // Theme-aware colors
  const iconColor = isDark ? "#fafafa" : "#0a0a0a";
  const mutedIconColor = isDark ? "#a1a1a1" : "#737373";
  const fabBgColor = isDark ? "#fafafa" : "#171717";
  const fabIconColor = isDark ? "#0a0a0a" : "#fafafa";
  const bgColor = isDark ? "#0a0a0a" : "#ffffff";
  const borderColor = isDark ? "#2e2e2e" : "#e5e5e5";
  const secondaryBg = isDark ? "#262626" : "#f5f5f5";
  const cardBg = isDark ? "#141414" : "#f5f5f5";

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor, paddingTop: insets.top }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-6 py-4"
        style={{ borderBottomWidth: 1, borderBottomColor: borderColor }}
      >
        <H2 style={{ color: isDark ? "#fafafa" : "#0a0a0a" }}>Your Library</H2>
        <IconButton
          variant="ghost"
          onPress={() => router.push("/settings")}
          accessibilityLabel="Settings"
        >
          <Feather name="settings" size={22} color={iconColor} />
        </IconButton>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color={iconColor} />
          </View>
        ) : books.length === 0 ? (
          /* Empty State */
          <View className="flex-1 items-center justify-center" style={{ paddingVertical: 80 }}>
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-6"
              style={{ backgroundColor: secondaryBg }}
            >
              <Feather name="book-open" size={40} color={mutedIconColor} />
            </View>
            <P
              className="text-center mb-2"
              style={{ color: isDark ? "#a3a3a3" : "#737373" }}
            >
              No books yet
            </P>
            <Muted
              className="text-center px-8"
              style={{ color: isDark ? "#737373" : "#a3a3a3" }}
            >
              Add your first EPUB or PDF to start speed reading. Tap the + button below
              to get started.
            </Muted>
          </View>
        ) : (
          /* Book List */
          <View className="gap-3">
            {books.map((book) => (
              <Pressable
                key={book.id}
                onPress={() => handleOpenBook(book)}
                onLongPress={() => handleDeleteBook(book)}
              >
                <Card
                  style={{
                    backgroundColor: cardBg,
                    borderWidth: 1,
                    borderColor: borderColor,
                    borderRadius: 12,
                  }}
                >
                  <CardContent className="py-4">
                    <View className="flex-row items-start">
                      {/* Icon */}
                      <View
                        className="w-12 h-12 rounded-lg items-center justify-center mr-4"
                        style={{ backgroundColor: secondaryBg }}
                      >
                        <Feather
                          name={book.type === "epub" ? "book" : "file-text"}
                          size={24}
                          color={mutedIconColor}
                        />
                      </View>

                      {/* Content */}
                      <View className="flex-1">
                        <P
                          className="font-semibold mb-1"
                          style={{ color: isDark ? "#fafafa" : "#0a0a0a" }}
                          numberOfLines={2}
                        >
                          {book.title}
                        </P>

                        {book.author && (
                          <Muted
                            className="mb-2"
                            style={{ color: isDark ? "#a3a3a3" : "#737373" }}
                            numberOfLines={1}
                          >
                            {book.author}
                          </Muted>
                        )}

                        {/* Progress */}
                        <View className="flex-row items-center gap-3">
                          <View className="flex-1">
                            <Progress
                              value={calculateProgress(book)}
                              style={{
                                height: 4,
                                backgroundColor: isDark ? "#262626" : "#e5e5e5",
                              }}
                            />
                          </View>
                          <Small style={{ color: isDark ? "#737373" : "#a3a3a3" }}>
                            {calculateProgress(book)}%
                          </Small>
                        </View>
                      </View>

                      {/* Type badge */}
                      <View
                        className="ml-2 px-2 py-1 rounded"
                        style={{ backgroundColor: secondaryBg }}
                      >
                        <Small style={{ color: mutedIconColor, fontSize: 10 }}>
                          {book.type.toUpperCase()}
                        </Small>
                      </View>
                    </View>
                  </CardContent>
                </Card>
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Import Loading Overlay */}
      {isImporting && (
        <View
          className="absolute inset-0 items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          <View
            className="p-6 rounded-xl items-center"
            style={{ backgroundColor: cardBg }}
          >
            <ActivityIndicator size="large" color={iconColor} />
            <P className="mt-4" style={{ color: isDark ? "#fafafa" : "#0a0a0a" }}>
              {importStatus || "Importing..."}
            </P>
          </View>
        </View>
      )}

      {/* Floating Action Button */}
      <View
        className="absolute right-6 bottom-6"
        style={{ marginBottom: insets.bottom }}
      >
        <Pressable
          className="w-14 h-14 rounded-full items-center justify-center active:opacity-80"
          style={{
            backgroundColor: fabBgColor,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
          onPress={handleImportBook}
          disabled={isImporting}
          accessibilityLabel="Add Book"
        >
          <Feather name="plus" size={28} color={fabIconColor} />
        </Pressable>
      </View>
    </View>
  );
}
