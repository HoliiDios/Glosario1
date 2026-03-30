import type { AcronymDictionary } from '../types';

// Multiple meanings are supported via arrays for future lexical expansion.
export const ACRONYMS: AcronymDictionary = {
  HR: [{ label: 'Human Rights', targetSlug: 'derechos-humanos' }],
  DDHH: [{ label: 'Derechos Humanos', targetSlug: 'derechos-humanos' }],
  ONU: [{ label: 'Organización de las Naciones Unidas', targetSlug: 'organizacion-de-las-naciones-unidas' }],
  CIDH: [{ label: 'Corte Interamericana de Derechos Humanos', targetSlug: 'corte-interamericana-de-derechos-humanos' }],
  MP: [{ label: 'Ministerio Público', targetSlug: 'ministerio-publico' }],
  MASC: [{ label: 'Medios alternativos de solución de conflictos', targetSlug: 'medios-alternativos-de-solucion-de-conflictos' }],
};
