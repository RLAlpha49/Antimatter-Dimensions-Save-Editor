import { describe, expect, it } from 'vitest';
import {
  readFieldValue,
  resolveFieldPath,
  saveEditorFields,
  validateRegisteredFields,
} from './fieldRegistry';
import { SaveType } from './types';

const breakInfinityField = saveEditorFields.find((field) => field.id === 'breakInfinity');

describe('field registry', () => {
  it('resolves Android-native paths through the central adapter', () => {
    const androidSave = {
      antimatter: { mantissa: 1, exponent: 3 },
      matter: { mantissa: 0, exponent: 0 },
      dimensionBoosts: 0,
      galaxies: 0,
      brake: false,
      version: 30100100,
      lastUpdate: 1744164003113,
    };

    expect(breakInfinityField).toBeDefined();
    expect(resolveFieldPath(androidSave, breakInfinityField!, SaveType.Android)).toBe('brake');
    expect(readFieldValue(androidSave, breakInfinityField!, SaveType.Android)).toBe(false);
  });

  it('reports declarative validation issues for invalid registered values', () => {
    const invalidPcSave = {
      antimatter: '10',
      matter: '0',
      dimensionBoosts: -2,
      galaxies: 0,
      break: false,
      version: -1,
      lastUpdate: 1700000000000,
    };

    const issues = validateRegisteredFields(invalidPcSave, SaveType.PC);
    const codes = issues.map((issue) => issue.code);

    expect(codes).toContain('minimum-value');
    expect(issues.some((issue) => issue.path === 'dimensionBoosts')).toBe(true);
    expect(issues.some((issue) => issue.path === 'version')).toBe(true);
  });
});
