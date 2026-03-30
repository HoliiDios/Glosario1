import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchResults } from '../components/SearchResults';
import { resolveAcronym, searchTerms } from '../lib/searchEngine';

interface HomePageProps {
  query: string;
}

export function HomePage({ query }: HomePageProps) {
  const navigate = useNavigate();
  const acronymHits = useMemo(() => resolveAcronym(query), [query]);
  const results = useMemo(() => searchTerms(query), [query]);

  return (
    <section>
      <header className="hero">
        <h1>Glosario Jurídico</h1>
        <p>Búsqueda lingüística avanzada: exacta, morfológica, por sinónimos y fuzzy multiseñal.</p>
      </header>

      {query ? (
        <>
          {acronymHits.length > 0 && (
            <aside className="acronym-box">
              <p>
                Acrónimo detectado. {acronymHits.length === 1 ? 'Sugerencia encontrada:' : 'Posibles significados:'}
              </p>
              <ul className="acronym-list">
                {acronymHits.map((hit) => (
                  <li key={`${hit.label}-${hit.targetSlug}`}>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => navigate(`/term/${hit.targetSlug}`)}
                    >
                      {hit.label}
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          )}
          <SearchResults results={results} />
        </>
      ) : (
        <p className="empty-state">Escribe un término para iniciar la búsqueda.</p>
      )}

      <div className="search-help">
        <p>
          Ejemplos útiles: <code>apelaremos</code>, <code>DDHH</code>, <code>presuncion</code>, <code>sentensia</code>,
          <code>fallo judicial</code>.
        </p>
      </div>
    </section>
  );
}
