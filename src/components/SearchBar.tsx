import { FormEvent } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
}

export function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(value);
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
        placeholder="Ej. condenaron, DDHH, casacion"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
      />
      <button type="submit" className="search-button">
        Buscar
      </button>
    </form>
  );
}
