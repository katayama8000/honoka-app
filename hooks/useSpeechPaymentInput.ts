import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { useState } from "react";

const KANJI_MAP: Record<string, number> = {
  零: 0,
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
  百: 100,
  千: 1000,
  万: 10000,
};

// Convert full-width digits to half-width (e.g. "２０００" → "2000")
const toHalfWidth = (text: string) => text.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));

// Convert a kanji numeral string to a number (e.g. "三万二千" → 32000)
const kanjiToNumber = (text: string): number | null => {
  let result = 0;
  let current = 0;
  let hasKanji = false;
  for (const ch of text) {
    const val = KANJI_MAP[ch];
    if (val === undefined) return null;
    hasKanji = true;
    if (val >= 10000) {
      result += (current || 1) * val;
      current = 0;
    } else if (val >= 10) {
      current = (current || 1) * val;
    } else {
      current += val;
    }
  }
  return hasKanji ? result + current : null;
};

type SpeechParseResult = { amount: number; item: string | null };

// Parse speech transcript into an amount and optional item name.
// Handles patterns like:
//   "2000 イオン", "イオン 1500円", "千円 コンビニ", "2000", "食費"
export const parseSpeechInput = (raw: string): SpeechParseResult | null => {
  // Normalize full-width digits and strip currency words
  const text = toHalfWidth(raw)
    .replace(/[¥えん]/g, "")
    .trim();

  // Pattern 1: leading half-width number — "2000 イオン" / "2000円 イオン" / "2000"
  const leadingNumber = text.match(/^(\d+)円?\s*(.*)$/);
  if (leadingNumber) {
    return { amount: Number(leadingNumber[1]), item: leadingNumber[2].trim() || null };
  }

  // Pattern 2: trailing half-width number — "イオン 2000" / "イオン 2000円"
  const trailingNumber = text.match(/^(.+?)\s+(\d+)円?$/);
  if (trailingNumber) {
    return { amount: Number(trailingNumber[2]), item: trailingNumber[1].trim() || null };
  }

  // Pattern 3: leading kanji numeral — "千五百 コンビニ"
  const kanjiLead = text.match(/^([零一二三四五六七八九十百千万]+)円?\s*(.*)$/);
  if (kanjiLead) {
    const amount = kanjiToNumber(kanjiLead[1]);
    if (amount !== null) {
      return { amount, item: kanjiLead[2].trim() || null };
    }
  }

  // Pattern 4: trailing kanji numeral — "コンビニ 千円"
  const kanjiTrail = text.match(/^(.+?)\s+([零一二三四五六七八九十百千万]+)円?$/);
  if (kanjiTrail) {
    const amount = kanjiToNumber(kanjiTrail[2]);
    if (amount !== null) {
      return { amount, item: kanjiTrail[1].trim() || null };
    }
  }

  // Pattern 5: kanji numeral only — "千五百"
  const amountOnly = kanjiToNumber(text.replace(/円/g, ""));
  if (amountOnly !== null) return { amount: amountOnly, item: null };

  return null;
};

type UseSpeechPaymentInputOptions = {
  isHalfPrice: boolean;
  onAmount: (amount: number) => void;
  onItem: (item: string) => void;
};

type UseSpeechPaymentInputReturn = {
  isListening: boolean;
  startVoiceInput: () => Promise<void>;
};

export const useSpeechPaymentInput = ({
  isHalfPrice,
  onAmount,
  onItem,
}: UseSpeechPaymentInputOptions): UseSpeechPaymentInputReturn => {
  const [isListening, setIsListening] = useState(false);

  useSpeechRecognitionEvent("start", () => setIsListening(true));
  useSpeechRecognitionEvent("end", () => setIsListening(false));
  useSpeechRecognitionEvent("error", () => setIsListening(false));

  useSpeechRecognitionEvent("result", (e) => {
    const result = e.results[0];
    if (!result?.transcript) return;

    const parsed = parseSpeechInput(result.transcript);
    if (parsed !== null) {
      // When half-price mode is on, store the original price (doubled internally)
      onAmount(isHalfPrice ? parsed.amount * 2 : parsed.amount);
      if (parsed.item) onItem(parsed.item);
    } else {
      onItem(result.transcript);
    }
  });

  const startVoiceInput = async () => {
    if (isListening) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      alert("音声入力の権限が必要です");
      return;
    }
    ExpoSpeechRecognitionModule.start({ lang: "ja-JP", interimResults: false });
  };

  return { isListening, startVoiceInput };
};
