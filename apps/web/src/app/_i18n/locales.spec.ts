import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import pt from './locales/pt.json';

type Nested = Record<string, unknown>;

function flattenKeys(obj: Nested, prefix = '', out = new Set<string>()): Set<string> {
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    out.add(full);
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flattenKeys(value as Nested, full, out);
    }
  }
  return out;
}

describe('locale parity', () => {
  const reference = flattenKeys(en as Nested);

  it('has identical key sets across all five locales', () => {
    const locales: Record<string, Nested> = {
      es: es as Nested,
      fr: fr as Nested,
      de: de as Nested,
      pt: pt as Nested,
    };

    for (const translations of Object.values(locales)) {
      expect(flattenKeys(translations)).toEqual(reference);
    }
  });
});
