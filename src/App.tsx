import { useState } from 'react';
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom';
import { SearchBar } from './components/SearchBar';
import { HomePage } from './pages/HomePage';
import { TermPage } from './pages/TermPage';

function AppShell() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    navigate('/');
  };

  return (
    <div className="layout">
      <header className="topbar">
        <Link to="/" className="brand">
          Glosario Jurídico
        </Link>
        <SearchBar value={query} onChange={setQuery} onSearch={handleSearch} />
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage query={query} />} />
          <Route path="/term/:slug" element={<TermPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
