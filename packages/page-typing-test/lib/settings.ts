import { Book } from "@keybr/content-books";
import { Language } from "@keybr/layout";
import { enumProp, itemProp, numberProp, type Settings } from "@keybr/settings";
import {
  type TextDisplaySettings,
  type TextInputSettings,
  toTextDisplaySettings,
  toTextInputSettings,
} from "@keybr/textinput";
import { type Duration, DurationType } from "./session/index.ts";

export enum TextSourceType {
  CommonWords = 1,
  PseudoWords = 2,
  Book = 3,
}

export type CommonWordsSource = {
  readonly type: TextSourceType.CommonWords;
  readonly language: Language;
  readonly wordListSize: number;
};

export type PseudoWordsSource = {
  readonly type: TextSourceType.PseudoWords;
  readonly language: Language;
};

export type BookSource = {
  readonly type: TextSourceType.Book;
  readonly book: Book;
  readonly paragraphIndex: number;
};

export type TextSource = CommonWordsSource | PseudoWordsSource | BookSource;

export const typingTestProps = {
  type: enumProp(
    "typingTest.textSource.type",
    TextSourceType,
    TextSourceType.CommonWords,
  ),
  language: itemProp(
    "typingTest.textSource.language",
    Language.ALL,
    Language.EN,
  ),
  wordList: {
    wordListSize: numberProp("typingTest.wordList.wordListSize", 1000, {
      min: 10,
      max: 1000,
    }),
  } as const,
  book: itemProp("typingTest.book", Book.ALL, Book.EN_ALICE_WONDERLAND),
  bookParagraphIndex: numberProp("typingTest.book.paragraphIndex", 0, {
    min: 0,
    max: 1000000,
  }),
  duration: {
    type: enumProp("typingTest.duration.type", DurationType, DurationType.Time),
    value: numberProp("typingTest.duration.value", 0),
  } as const,
} as const;

export function toDuration(settings: Settings): Duration {
  return {
    type: settings.get(typingTestProps.duration.type),
    value: settings.get(typingTestProps.duration.value),
  };
}

export function toTextSource(settings: Settings): TextSource {
  switch (settings.get(typingTestProps.type)) {
    case TextSourceType.CommonWords:
      return {
        type: TextSourceType.CommonWords,
        language: settings.get(typingTestProps.language),
        wordListSize: settings.get(typingTestProps.wordList.wordListSize),
      };
    case TextSourceType.PseudoWords:
      return {
        type: TextSourceType.PseudoWords,
        language: settings.get(typingTestProps.language),
      };
    case TextSourceType.Book:
      return {
        type: TextSourceType.Book,
        book: settings.get(typingTestProps.book),
        paragraphIndex: settings.get(typingTestProps.bookParagraphIndex),
      };
    default:
      throw new Error();
  }
}

export type CompositeSettings = {
  readonly duration: Duration;
  readonly textSource: TextSource;
  readonly textInput: TextInputSettings;
  readonly textDisplay: TextDisplaySettings;
};

export function toCompositeSettings(settings: Settings): CompositeSettings {
  return {
    duration: toDuration(settings),
    textSource: toTextSource(settings),
    textInput: toTextInputSettings(settings),
    textDisplay: toTextDisplaySettings(settings),
  };
}
