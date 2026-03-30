import { ACRONYMS } from '../data/acronyms';
import { TERMS } from '../data/terms';
import type { AcronymMeaning, GlossaryTerm, SearchResult } from '../types';

type MatchKind = 'exact' | 'synonym' | 'lemma' | 'partial' | 'fuzzy';
type IndexedField = 'term' | 'synonym' | 'definition' | 'related';

interface IndexedToken {
  token: string;
  field: IndexedField;
  raw: string;
}

interface QueryAnalysis {
  raw: string;
  normalized: string;
  lemmas: string[];
  variants: string[];
}

const FIELD_WEIGHTS: Record<IndexedField, number> = {
  term: 1,
  synonym: 0.92,
  definition: 0.72,
  related: 0.68,
};

const MIN_ACCEPTABLE_SCORE = 0.43;

const IRREGULAR_LEMMAS: Record<string, string> = {
  fui: 'ir',
  fue: 'ir',
  fueron: 'ir',
  seria: 'ser',
  serián: 'ser',
  soy: 'ser',
  eres: 'ser',
  somos: 'ser',
  estan: 'estar',
  estuvo: 'estar',
  estuvieron: 'estar',
  hizo: 'hacer',
  hicieron: 'hacer',
  dijo: 'decir',
  dijeron: 'decir',
};

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .trim();

const normalizeForAcronym = (value: string): string =>
  normalize(value)
    .replace(/[^a-z0-9]/g, '')
    .toUpperCase();

const splitWords = (value: string): string[] =>
  normalize(value)
    .split(/[^a-z0-9ñ]+/)
    .filter(Boolean);

const unique = (values: string[]): string[] => Array.from(new Set(values.filter(Boolean)));

const levenshteinDistance = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix = Array.from({ length: a.length + 1 }, (_, row) => [row]);

  for (let col = 1; col <= b.length; col += 1) {
    matrix[0][col] = col;
  }

  for (let row = 1; row <= a.length; row += 1) {
    for (let col = 1; col <= b.length; col += 1) {
      const substitutionCost = a[row - 1] === b[col - 1] ? 0 : 1;
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + substitutionCost,
      );
    }
  }

  return matrix[a.length][b.length];
};

const normalizedLevenshtein = (a: string, b: string): number => {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLen;
};

const trigrams = (value: string): string[] => {
  if (value.length < 3) return [value];
  const grams: string[] = [];

  for (let i = 0; i <= value.length - 3; i += 1) {
    grams.push(value.slice(i, i + 3));
  }

  return grams;
};

const diceCoefficient = (a: string, b: string): number => {
  if (a === b) return 1;
  if (!a || !b) return 0;

  const aGrams = trigrams(a);
  const bGrams = trigrams(b);
  const bBag = new Map<string, number>();

  bGrams.forEach((gram) => {
    bBag.set(gram, (bBag.get(gram) ?? 0) + 1);
  });

  let intersection = 0;
  aGrams.forEach((gram) => {
    const count = bBag.get(gram) ?? 0;
    if (count > 0) {
      intersection += 1;
      bBag.set(gram, count - 1);
    }
  });

  return (2 * intersection) / (aGrams.length + bGrams.length);
};

const singularize = (word: string): string => {
  if (word.endsWith('iones')) return `${word.slice(0, -5)}ion`;
  if (word.endsWith('es') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('s') && word.length > 3) return word.slice(0, -1);
  return word;
};

// Heuristic lemmatization designed to be easily replaced by a true NLP model/API.
const toInfinitiveHeuristic = (input: string): string => {
  const word = normalize(input);
  const irregular = IRREGULAR_LEMMAS[word];
  if (irregular) return irregular;

  const endings: Array<{ suffix: string; replacement: string }> = [
    { suffix: 'ariamos', replacement: 'ar' },
    { suffix: 'eriamos', replacement: 'er' },
    { suffix: 'iriamos', replacement: 'ir' },
    { suffix: 'aremos', replacement: 'ar' },
    { suffix: 'eremos', replacement: 'er' },
    { suffix: 'iremos', replacement: 'ir' },
    { suffix: 'abamos', replacement: 'ar' },
    { suffix: 'iamos', replacement: 'er' },
    { suffix: 'arian', replacement: 'ar' },
    { suffix: 'erian', replacement: 'er' },
    { suffix: 'irian', replacement: 'ir' },
    { suffix: 'asteis', replacement: 'ar' },
    { suffix: 'isteis', replacement: 'er' },
    { suffix: 'aron', replacement: 'ar' },
    { suffix: 'eron', replacement: 'er' },
    { suffix: 'ieron', replacement: 'ir' },
    { suffix: 'amos', replacement: 'ar' },
    { suffix: 'emos', replacement: 'er' },
    { suffix: 'imos', replacement: 'ir' },
    { suffix: 'ando', replacement: 'ar' },
    { suffix: 'iendo', replacement: 'er' },
    { suffix: 'aras', replacement: 'ar' },
    { suffix: 'eras', replacement: 'er' },
    { suffix: 'iras', replacement: 'ir' },
    { suffix: 'ado', replacement: 'ar' },
    { suffix: 'ido', replacement: 'er' },
    { suffix: 'aba', replacement: 'ar' },
    { suffix: 'ia', replacement: 'er' },
    { suffix: 'an', replacement: 'ar' },
    { suffix: 'en', replacement: 'er' },
    { suffix: 'as', replacement: 'ar' },
    { suffix: 'es', replacement: 'er' },
  ];

  for (const { suffix, replacement } of endings) {
    if (word.length > suffix.length + 2 && word.endsWith(suffix)) {
      return `${word.slice(0, -suffix.length)}${replacement}`;
    }
  }

  return word;
};

const analyzeQuery = (query: string): QueryAnalysis => {
  const normalized = normalize(query);
  const words = splitWords(query);

  const lemmas = unique(words.map(toInfinitiveHeuristic));
  const singulars = unique(words.map(singularize));

  const variants = unique([normalized, ...words, ...lemmas, ...singulars]);

  return {
    raw: query,
    normalized,
    lemmas,
    variants,
  };
};

const indexTerm = (term: GlossaryTerm): IndexedToken[] => {
  const tokens: IndexedToken[] = [];

  tokens.push({ token: normalize(term.term), field: 'term', raw: term.term });
  splitWords(term.term).forEach((word) => tokens.push({ token: word, field: 'term', raw: term.term }));

  term.synonyms.forEach((syn) => {
    tokens.push({ token: normalize(syn), field: 'synonym', raw: syn });
    splitWords(syn).forEach((word) => tokens.push({ token: word, field: 'synonym', raw: syn }));
  });

  term.definitions.forEach((definition) => {
    splitWords(definition).forEach((word) => tokens.push({ token: word, field: 'definition', raw: definition }));
  });

  splitWords(term.definition).forEach((word) => tokens.push({ token: word, field: 'definition', raw: term.definition }));

  term.relatedTerms.forEach((related) => {
    tokens.push({ token: normalize(related), field: 'related', raw: related });
    splitWords(related).forEach((word) => tokens.push({ token: word, field: 'related', raw: related }));
  });

  return tokens;
};

const classifyMatch = (query: QueryAnalysis, token: IndexedToken, similarity: number): MatchKind => {
  if (token.token === query.normalized) {
    return token.field === 'synonym' ? 'synonym' : 'exact';
  }

  if (query.lemmas.includes(token.token)) {
    return 'lemma';
  }

  if (token.token.includes(query.normalized) || query.normalized.includes(token.token)) {
    return token.field === 'synonym' ? 'synonym' : 'partial';
  }

  return similarity >= 0.72 ? 'fuzzy' : 'partial';
};

const scoreTokenAgainstQuery = (query: QueryAnalysis, indexed: IndexedToken): { score: number; kind: MatchKind } => {
  const exactBoost = indexed.token === query.normalized ? 1 : 0;
  const lemmaBoost = query.lemmas.includes(indexed.token) ? 0.92 : 0;

  const bestVariantSimilarity = query.variants.reduce((max, variant) => {
    const lev = normalizedLevenshtein(variant, indexed.token);
    const dice = diceCoefficient(variant, indexed.token);
    return Math.max(max, lev * 0.55 + dice * 0.45);
  }, 0);

  const partialBoost =
    indexed.token.includes(query.normalized) || query.normalized.includes(indexed.token)
      ? Math.min(0.9, 0.65 + Math.min(indexed.token.length, query.normalized.length) / 20)
      : 0;

  const semanticScore = Math.max(exactBoost, lemmaBoost, partialBoost, bestVariantSimilarity);
  const weightedScore = semanticScore * FIELD_WEIGHTS[indexed.field];

  return {
    score: weightedScore,
    kind: classifyMatch(query, indexed, semanticScore),
  };
};

const scoreResult = (query: QueryAnalysis, term: GlossaryTerm): SearchResult | null => {
  if (!query.normalized) return null;

  const indexed = indexTerm(term);

  let bestScore = 0;
  let bestKind: MatchKind = 'fuzzy';
  let matchedBy = term.term;

  indexed.forEach((token) => {
    const { score, kind } = scoreTokenAgainstQuery(query, token);

    if (score > bestScore) {
      bestScore = score;
      bestKind = kind;
      matchedBy = token.raw;
    }
  });

  // Extra precision boost for full term exact/lemma alignment.
  const normalizedTerm = normalize(term.term);
  if (normalizedTerm === query.normalized) {
    bestScore = 1;
    bestKind = 'exact';
    matchedBy = term.term;
  } else if (query.lemmas.includes(normalizedTerm) && bestScore < 0.9) {
    bestScore = Math.max(bestScore, 0.88);
    bestKind = 'lemma';
    matchedBy = query.lemmas.find((lemma) => lemma === normalizedTerm) ?? matchedBy;
  }

  if (bestScore < MIN_ACCEPTABLE_SCORE) {
    return null;
  }

  return {
    term,
    reason: bestKind,
    score: Math.round(bestScore * 100),
    matchedBy,
  };
};

export const resolveAcronym = (query: string): AcronymMeaning[] => {
  const normalized = normalizeForAcronym(query);
  return ACRONYMS[normalized] ?? [];
};

export const searchTerms = (query: string): SearchResult[] => {
  const analysis = analyzeQuery(query);

  return TERMS.map((term) => scoreResult(analysis, term))
    .filter((result): result is SearchResult => result !== null)
    .sort((a, b) => b.score - a.score || a.term.term.localeCompare(b.term.term, 'es'));
};

export const getTermBySlug = (slug: string): GlossaryTerm | undefined => TERMS.find((term) => term.slug === slug);

export const getAllTerms = (): GlossaryTerm[] => TERMS;
