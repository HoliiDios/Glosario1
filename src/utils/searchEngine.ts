import { ACRONYMS } from '../data/acronyms';
import { TERMS } from '../data/terms';
import type { AcronymMeaning, LegalTerm, MatchReason, SearchResult } from '../types';

interface RankedCandidate {
  reason: MatchReason;
  score: number;
  matchedBy: string;
}

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ñ\s]/gi, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (value: string): string[] => normalize(value).split(' ').filter(Boolean);

const toInfinitiveHeuristic = (word: string): string => {
  const normalized = normalize(word);

  const irregulars: Record<string, string> = {
    condenaron: 'condenar',
    condeno: 'condenar',
    absuelven: 'absolver',
    absolvio: 'absolver',
    impusieron: 'imponer',
    fueron: 'ir',
    hizo: 'hacer',
  };

  if (irregulars[normalized]) return irregulars[normalized];

  const endings: Array<[string, string]> = [
    ['ariamos', 'ar'],
    ['eriamos', 'er'],
    ['iriamos', 'ir'],
    ['aremos', 'ar'],
    ['eremos', 'er'],
    ['iremos', 'ir'],
    ['arian', 'ar'],
    ['erian', 'er'],
    ['irian', 'ir'],
    ['asteis', 'ar'],
    ['isteis', 'er'],
    ['aron', 'ar'],
    ['eron', 'er'],
    ['ieron', 'ir'],
    ['ando', 'ar'],
    ['iendo', 'er'],
    ['ado', 'ar'],
    ['ido', 'er'],
    ['aba', 'ar'],
    ['ia', 'er'],
    ['an', 'ar'],
    ['en', 'er'],
    ['as', 'ar'],
    ['es', 'er'],
  ];

  for (const [suffix, replacement] of endings) {
    if (normalized.length > suffix.length + 2 && normalized.endsWith(suffix)) {
      return `${normalized.slice(0, -suffix.length)}${replacement}`;
    }
  }

  return normalized;
};

const levenshtein = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix = Array.from({ length: a.length + 1 }, (_, row) => [row]);

  for (let col = 1; col <= b.length; col += 1) matrix[0][col] = col;

  for (let row = 1; row <= a.length; row += 1) {
    for (let col = 1; col <= b.length; col += 1) {
      const substitution = a[row - 1] === b[col - 1] ? 0 : 1;
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + substitution,
      );
    }
  }

  return matrix[a.length][b.length];
};

const fuzzySimilarity = (a: string, b: string): number => {
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 1;
  return 1 - levenshtein(a, b) / maxLength;
};

const bestFuzzyScore = (queryTokens: string[], candidates: string[]): { score: number; matchedBy: string } => {
  let bestScore = 0;
  let matchedBy = '';

  queryTokens.forEach((queryToken) => {
    candidates.forEach((candidateToken) => {
      const similarity = fuzzySimilarity(queryToken, candidateToken);
      if (similarity > bestScore) {
        bestScore = similarity;
        matchedBy = candidateToken;
      }
    });
  });

  return { score: bestScore, matchedBy };
};

const evaluateTerm = (query: string, term: LegalTerm): RankedCandidate | null => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return null;

  const queryTokens = tokenize(query);
  const queryInfinitives = queryTokens.map(toInfinitiveHeuristic);

  const normalizedTerm = normalize(term.term);
  const termTokens = tokenize(term.term);
  const synonymTokens = term.synonyms.flatMap((synonym) => tokenize(synonym));

  // 1) Exact match (highest confidence).
  if (normalizedTerm === normalizedQuery || termTokens.includes(normalizedQuery)) {
    return { reason: 'exact', score: 100, matchedBy: term.term };
  }

  // 2) Infinitive match for conjugated verbs.
  const infinitiveHit = queryInfinitives.find((candidate) => candidate === normalizedTerm || termTokens.includes(candidate));
  if (infinitiveHit) {
    return { reason: 'infinitive', score: 92, matchedBy: infinitiveHit };
  }

  // 3) Synonym match (exact or partial inside a synonym phrase).
  const synonymExact = term.synonyms.find((synonym) => normalize(synonym) === normalizedQuery);
  if (synonymExact) {
    return { reason: 'synonym', score: 88, matchedBy: synonymExact };
  }

  const synonymPartial = term.synonyms.find((synonym) => normalize(synonym).includes(normalizedQuery));
  if (synonymPartial) {
    return { reason: 'synonym', score: 81, matchedBy: synonymPartial };
  }

  // Partial term match still considered fuzzy tier but with high fuzzy score.
  if (normalizedTerm.includes(normalizedQuery) || termTokens.some((token) => token.includes(normalizedQuery))) {
    return { reason: 'fuzzy', score: 78, matchedBy: term.term };
  }

  // 4) Fuzzy match across term, synonyms and definitions.
  const searchableTokens = [
    ...termTokens,
    ...synonymTokens,
    ...tokenize(term.mainDefinition),
    ...term.secondaryDefinitions.flatMap((definition) => tokenize(definition)),
  ];

  const { score: fuzzy, matchedBy } = bestFuzzyScore([...queryTokens, ...queryInfinitives], searchableTokens);

  if (fuzzy >= 0.72) {
    return {
      reason: 'fuzzy',
      score: Math.round(55 + fuzzy * 35),
      matchedBy,
    };
  }

  return null;
};

export const resolveAcronym = (query: string): AcronymMeaning[] => {
  const acronym = normalize(query).replace(/\s+/g, '').toUpperCase();
  return ACRONYMS[acronym] ?? [];
};

export const searchTerms = (query: string): SearchResult[] =>
  TERMS.map((term) => {
    const ranked = evaluateTerm(query, term);
    if (!ranked) return null;

    return {
      term,
      reason: ranked.reason,
      score: ranked.score,
      matchedBy: ranked.matchedBy,
    };
  })
    .filter((item): item is SearchResult => item !== null)
    .sort((a, b) => b.score - a.score || a.term.term.localeCompare(b.term.term, 'es'));

export const getTermBySlug = (slug: string): LegalTerm | undefined => TERMS.find((term) => term.slug === slug);

export const getAllTerms = (): LegalTerm[] => TERMS;
