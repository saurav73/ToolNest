/* Shared text-analysis helpers used across the text tools. */

export const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'of', 'at', 'by', 'for', 'with',
  'to', 'from', 'in', 'on', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'it', 'its', 'this', 'that', 'these', 'those', 'as', 'i', 'you', 'he', 'she',
  'we', 'they', 'them', 'his', 'her', 'their', 'our', 'your', 'my', 'me', 'him',
  'us', 'am', 'do', 'does', 'did', 'have', 'has', 'had', 'not', 'no', 'so',
  'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now', 'into',
  'over', 'after', 'before', 'there', 'here', 'when', 'where', 'which', 'who',
  'what', 'how', 'all', 'any', 'each', 'other', 'some', 'such', 'only', 'own',
  'same', 'then', 'once', 'out', 'up', 'down', 'about', 'between', 'through',
]);

/** Split text into word tokens (letters/numbers, keeps internal apostrophes). */
export function tokenizeWords(text) {
  if (!text) return [];
  const matches = text.toLowerCase().match(/[a-z0-9]+(?:'[a-z0-9]+)?/g);
  return matches || [];
}

/** Count sentences: runs of text ending in . ! or ? (falls back to 1 for a lone fragment). */
export function countSentences(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return 0;
  const matches = trimmed.match(/[^.!?]+[.!?]+["')\]]*\s*/g);
  if (matches && matches.length) {
    const remainder = trimmed.slice(matches.join('').length).trim();
    return matches.length + (remainder ? 1 : 0);
  }
  return 1;
}

/** Count paragraphs: blocks separated by one or more blank lines. */
export function countParagraphs(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return 0;
  return trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
}

/** Map of word -> count for the given token list. */
export function wordCounts(tokens) {
  const map = new Map();
  for (const t of tokens) map.set(t, (map.get(t) || 0) + 1);
  return map;
}

/** Top keywords by frequency, stopwords removed, as [{word, count, density}]. */
export function topKeywords(tokens, total, limit = 10) {
  const map = wordCounts(tokens.filter((t) => !STOPWORDS.has(t) && t.length > 1));
  return [...map.entries()]
    .map(([word, count]) => ({ word, count, density: total ? (count / total) * 100 : 0 }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, limit);
}

/** Format seconds as "1 min 30 sec" style text. */
export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  if (s < 60) return `${s} sec`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m < 60) return rem ? `${m} min ${rem} sec` : `${m} min`;
  const h = Math.floor(m / 60);
  return `${h} hr ${m % 60} min`;
}

/** Copy text to the clipboard; resolves true on success. */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      return true;
    } catch {
      return false;
    }
  }
}

/** Heuristic syllable count for one word, for the readability formulas. */
export function countSyllables(word) {
  const w = (word || '').toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const groups = w.replace(/e$/, '').match(/[aeiouy]+/g);
  return Math.max(1, groups ? groups.length : 1);
}

/** Total syllables across a token list. */
export function totalSyllables(tokens) {
  return tokens.reduce((n, t) => n + countSyllables(t), 0);
}

/** Flesch Reading Ease: 0-100, higher means easier to read. Null when there is nothing to score. */
export function fleschReadingEase(wordCount, sentenceCount, syllableCount) {
  if (!wordCount || !sentenceCount) return null;
  return 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);
}

/** Flesch-Kincaid Grade Level: the US school grade the text reads at. Null when there is nothing to score. */
export function fleschKincaidGrade(wordCount, sentenceCount, syllableCount) {
  if (!wordCount || !sentenceCount) return null;
  return 0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59;
}

/** Plain-language label for a Flesch Reading Ease score. */
export function readingEaseLabel(score) {
  if (score == null) return '';
  if (score >= 90) return 'Very easy';
  if (score >= 80) return 'Easy';
  if (score >= 70) return 'Fairly easy';
  if (score >= 60) return 'Standard';
  if (score >= 50) return 'Fairly difficult';
  if (score >= 30) return 'Difficult';
  return 'Very confusing';
}
