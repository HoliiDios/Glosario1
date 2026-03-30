import { Link, useParams } from 'react-router-dom';
import { TermDetail } from '../components/TermDetail';
import { getAllTerms, getTermBySlug } from '../lib/searchEngine';

export function TermPage() {
  const { slug = '' } = useParams();
  const term = getTermBySlug(slug);

  if (!term) {
    return (
      <section className="not-found">
        <h1>Término no encontrado</h1>
        <p>La entrada solicitada no existe en el glosario actual.</p>
        <Link to="/">Volver al inicio</Link>
      </section>
    );
  }

  const relatedSlugByName = (name: string): string | null => {
    const normalizedName = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const related = getAllTerms().find((item) => {
      const normalizedTerm = item.term
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
      return normalizedTerm === normalizedName;
    });

    return related?.slug ?? null;
  };

  return <TermDetail term={term} relatedSlugByName={relatedSlugByName} />;
}
