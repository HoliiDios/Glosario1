export interface GlossaryTerm {
  term: string;
  slug: string;
  type: string;
  definition: string;
  definitions: string[];
  synonyms: string[];
  antonyms: string[];
  relatedTerms: string[];
  origin: string;
  category: string;
}

export interface AcronymMeaning {
  label: string;
  targetSlug: string;
}

export type AcronymDictionary = Record<string, AcronymMeaning[]>;

export interface SearchResult {
  term: GlossaryTerm;
  reason: 'exact' | 'synonym' | 'lemma' | 'partial' | 'fuzzy';
  score: number;
  matchedBy: string;
}
