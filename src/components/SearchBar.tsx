import { FormEvent, useState } from 'react';

interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
}

export function SearchBar({ initialValue = '', onSearch }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(query);
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <label htmlFor="search" className="search-label">
        Buscar término jurídico
      </label>
      <input
        id="search"
        className="search-input"
        type="search"
        placeholder="Ej. apelaremos, DDHH, sentensia"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoComplete="off"
      />
      <button type="submit" className="search-button">
        Buscar
      </button>
    </form>
  );
}
