import type { AcronymDictionary } from '../types';

// Future-ready: each acronym maps to an array of possible meanings.
export const ACRONYMS: AcronymDictionary = {
  HR: [{ label: 'Human Rights', targetSlug: 'derechos-humanos' }],
  DDHH: [{ label: 'Derechos Humanos', targetSlug: 'derechos-humanos' }],
  ONU: [{ label: 'Organización de las Naciones Unidas', targetSlug: 'organizacion-de-las-naciones-unidas' }],
};
