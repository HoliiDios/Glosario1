import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchResults } from '../components/SearchResults';
import { resolveAcronym, searchTerms } from '../utils/searchEngine';

interface HomePageProps {
  query: string;
}

export function HomePage({ query }: HomePageProps) {
  const navigate = useNavigate();
  const acronymHits = useMemo(() => resolveAcronym(query), [query]);
  const results = useMemo(() => searchTerms(query), [query]);

  useEffect(() => {
    if (query && acronymHits.length === 1) {
      navigate(`/term/${acronymHits[0].targetSlug}`, { replace: true });
    }
  }, [acronymHits, navigate, query]);

  return (
    <section>
      <header className="hero">
        <h1>Glosario Jurídico</h1>
        <p>Diccionario jurídico profesional con búsqueda inteligente, normalización lingüística y soporte de acrónimos.</p>
      </header>

      {query ? (
        <>
          {acronymHits.length > 0 && (
            <aside className="acronym-box">
              <p>
                Acrónimo detectado. {acronymHits.length === 1 ? 'Entrada abierta automáticamente:' : 'Seleccione un significado:'}
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
        <p className="empty-state">Escribe un término jurídico para comenzar.</p>
      )}

      <div className="search-help">
        <p>
          Pruebas sugeridas: <code>condenaron</code>, <code>DDHH</code>, <code>sentensia</code>, <code>cautelar</code>,
          <code>responsabilidad</code>.
        </p>
      </div>
    </section>
  );
}
