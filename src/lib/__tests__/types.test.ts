import { expect, test, describe } from 'vitest';

// Simulating the type logic found in types or page
const ferramentaTabs = [
  "calculadoras",
  "consultas",
  "outros",
  "procuracao",
  "peticoes",
  "assistente",
  "assinatura",
  "jurisprudencia",
  "financeiro",
  "vademecum",
] as const;

type FerramentaTab = typeof ferramentaTabs[number];

function isFerramentaTab(value: string | null): value is FerramentaTab {
  return value !== null && (ferramentaTabs as readonly string[]).includes(value);
}

describe('Type Utilities', () => {
  describe('isFerramentaTab', () => {
    test('should return true for valid tabs', () => {
      expect(isFerramentaTab('calculadoras')).toBe(true);
      expect(isFerramentaTab('financeiro')).toBe(true);
    });

    test('should return false for invalid tabs', () => {
      expect(isFerramentaTab('invalid-tab')).toBe(false);
      expect(isFerramentaTab(null)).toBe(false);
      expect(isFerramentaTab('')).toBe(false);
    });
  });
});
