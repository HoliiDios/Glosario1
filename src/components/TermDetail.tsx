import { Link } from 'react-router-dom';
import type { LegalTerm } from '../types';

interface TermDetailProps {
  term: LegalTerm;
  relatedSlugByName: (name: string) => string | null;
}

export function TermDetail({ term, relatedSlugByName }: TermDetailProps) {
  return (
    <article className="entry">
      <header>
        <h1>{term.term}</h1>
        <p className="entry-meta">
          <strong>{term.grammaticalType}</strong> · <span>{term.legalField}</span>
        </p>
      </header>

      <section>
        <h2>Definición principal</h2>
        <p>{term.mainDefinition}</p>
      </section>

      <section>
        <h2>Definiciones secundarias</h2>
        <ol>
          {term.secondaryDefinitions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section>
        <h2>Etimología</h2>
        <p>{term.etymology}</p>
      </section>

      <section className="entry-columns">
        <div>
          <h3>Sinónimos</h3>
          <p>{term.synonyms.length ? term.synonyms.join(', ') : 'Sin sinónimos registrados.'}</p>
        </div>

        <div>
          <h3>Antónimos</h3>
          <p>{term.antonyms.length ? term.antonyms.join(', ') : 'Sin antónimos registrados.'}</p>
        </div>
      </section>

      <section>
        <h2>Términos relacionados</h2>
        <ul className="related-list">
          {term.relatedTerms.map((name) => {
            const slug = relatedSlugByName(name);
            return (
              <li key={name}>{slug ? <Link to={`/term/${slug}`}>{name}</Link> : <span>{name}</span>}</li>
            );
          })}
        </ul>
      </section>
    </article>
  );
}
