/**
 * Emoji Utilities for LinkUp Chat
 */

export const QUICK_EMOJIS = ['❤️', '😂', '🔥', '👍', '🎉', '😍', '👏', '🚀', '🙏', '✨'] as const;

export const REACTION_EMOJIS = ['❤️', '👍', '😂', '🔥', '😮', '😢'] as const;

export interface EmojiOnlyResult {
  isEmojiOnly: boolean;
  count: number;
}

/**
 * Checks if a string contains purely emojis (and optional whitespace)
 * and returns the exact number of emojis.
 */
export function getEmojiOnlyDetails(text: string | undefined | null): EmojiOnlyResult {
  if (!text || typeof text !== 'string') {
    return { isEmojiOnly: false, count: 0 };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return { isEmojiOnly: false, count: 0 };
  }

  // Regex matching emojis, variation selectors, zero-width joiners, skin tones, regional indicators
  const emojiRegex = /^(?:(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\uFE0F|\u200D|\uD83C[\uDFFB-\uDFFF])|\s)+$/u;
  if (!emojiRegex.test(trimmed)) {
    return { isEmojiOnly: false, count: 0 };
  }

  // Count distinct emoji grapheme clusters using Intl.Segmenter if available
  try {
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
      let count = 0;
      for (const segment of segmenter.segment(trimmed)) {
        if (segment.segment.trim().length > 0) {
          count++;
        }
      }
      return { isEmojiOnly: count > 0 && count <= 8, count };
    }
  } catch {
    // Fallback: character array without whitespace
  }

  const cleanChars = [...trimmed.replace(/\s+/g, '')];
  return {
    isEmojiOnly: cleanChars.length > 0 && cleanChars.length <= 8,
    count: cleanChars.length,
  };
}
