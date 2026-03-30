import { Link } from 'react-router-dom';
import type { SearchResult } from '../types';

interface SearchResultsProps {
  results: SearchResult[];
}

const reasonLabels: Record<SearchResult['reason'], string> = {
  exact: 'Coincidencia exacta',
  synonym: 'Coincidencia por sinónimo',
  lemma: 'Coincidencia por infinitivo',
  partial: 'Coincidencia parcial',
  fuzzy: 'Coincidencia aproximada',
};

export function SearchResults({ results }: SearchResultsProps) {
  if (!results.length) {
    return <p className="empty-state">No se encontraron resultados. Prueba con otra variante.</p>;
  }

  return (
    <ul className="result-list">
      {results.map(({ term, reason, score, matchedBy }) => (
        <li key={term.slug} className="result-card">
          <div>
            <h3>
              <Link to={`/term/${term.slug}`}>{term.term}</Link>
            </h3>
            <p>{term.definition}</p>
          </div>
          <div className="result-meta">
            <span>{reasonLabels[reason]}</span>
            <span>Score: {score}</span>
            <span>Match: {matchedBy}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
