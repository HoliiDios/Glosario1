export interface LegalTerm {
  term: string;
  slug: string;
  grammaticalType: string;
  legalField: string;
  mainDefinition: string;
  secondaryDefinitions: string[];
  synonyms: string[];
  antonyms: string[];
  etymology: string;
  relatedTerms: string[];
}

export interface AcronymMeaning {
  label: string;
  targetSlug: string;
}

export type AcronymDictionary = Record<string, AcronymMeaning[]>;

export type MatchReason = 'exact' | 'infinitive' | 'synonym' | 'fuzzy';

export interface SearchResult {
  term: LegalTerm;
  reason: MatchReason;
  score: number;
  matchedBy: string;
}
