import { Link, useParams } from 'react-router-dom';
import { TermDetail } from '../components/TermDetail';
import { getAllTerms, getTermBySlug } from '../utils/searchEngine';

const plain = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

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
    const related = getAllTerms().find((item) => plain(item.term) === plain(name));
    return related?.slug ?? null;
  };

  return <TermDetail term={term} relatedSlugByName={relatedSlugByName} />;
}
