// Chapters Modal Component
// Displays chapter list for navigation

import { Feather } from "@expo/vector-icons";
import React from "react";
import {
    FlatList,
    Modal,
    Pressable,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { H3, Muted, P } from "../../components/ui/text";
import { Chapter } from "../services/book-storage";

interface ChaptersModalProps {
  visible: boolean;
  onClose: () => void;
  chapters: Chapter[];
  currentIndex: number;
  onSelectChapter: (chapterIndex: number, wordIndex: number) => void;
  isDark: boolean;
}

export function ChaptersModal({
  visible,
  onClose,
  chapters,
  currentIndex,
  onSelectChapter,
  isDark,
}: ChaptersModalProps) {
  const insets = useSafeAreaInsets();

  // Theme colors
  const bgColor = isDark ? "#0a0a0a" : "#ffffff";
  const borderColor = isDark ? "#2e2e2e" : "#e5e5e5";
  const textColor = isDark ? "#fafafa" : "#0a0a0a";
  const mutedColor = isDark ? "#a3a3a3" : "#737373";
  const activeColor = isDark ? "#262626" : "#f5f5f5";

  // Find current chapter based on word index
  const getCurrentChapterIndex = () => {
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (currentIndex >= chapters[i].startIndex) {
        return i;
      }
    }
    return 0;
  };

  const currentChapterIdx = getCurrentChapterIndex();

  const renderChapter = ({
    item,
    index,
  }: {
    item: Chapter;
    index: number;
  }) => {
    const isCurrentChapter = index === currentChapterIdx;

    return (
      <Pressable
        className="flex-row items-center px-6 py-4"
        style={{
          backgroundColor: isCurrentChapter ? activeColor : "transparent",
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
        }}
        onPress={() => {
          onSelectChapter(index, item.startIndex);
          onClose();
        }}
      >
        <View className="flex-1">
          <P
            style={{
              color: textColor,
              fontWeight: isCurrentChapter ? "600" : "400",
            }}
            numberOfLines={2}
          >
            {item.title}
          </P>
        </View>
        {isCurrentChapter && (
          <Feather name="check" size={20} color={textColor} />
        )}
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        className="flex-1"
        style={{
          backgroundColor: bgColor,
          paddingTop: insets.top,
        }}
      >
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-4 py-4"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: borderColor,
          }}
        >
          <View className="flex-row items-center">
            <Pressable
              className="p-2 -ml-2"
              onPress={onClose}
              hitSlop={8}
            >
              <Feather name="x" size={24} color={textColor} />
            </Pressable>
            <H3 className="ml-2" style={{ color: textColor }}>
              Chapters
            </H3>
          </View>
          <Muted style={{ color: mutedColor }}>
            {chapters.length} chapters
          </Muted>
        </View>

        {/* Chapter List */}
        <FlatList
          data={chapters}
          renderItem={renderChapter}
          keyExtractor={(_, index) => `chapter-${index}`}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
          initialScrollIndex={currentChapterIdx > 0 ? currentChapterIdx : undefined}
          getItemLayout={(_, index) => ({
            length: 65, // Approximate row height
            offset: 65 * index,
            index,
          })}
        />
      </View>
    </Modal>
  );
}
