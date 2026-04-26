import { describe, expect, it } from 'vitest';
import androidFixture from '../../android.json';
import pcFixture from '../../pc.json';
import { encodeSaveData } from '../core/save/serialization';
import { SaveType } from '../core/save/types';
import { checkRealitySection, testSaveData } from './testSave';

const cloneFixture = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

describe('testSaveData', () => {
  it('uses the Android reference shape for Android big-number fields', () => {
    const encoded = encodeSaveData(cloneFixture(androidFixture), SaveType.Android);

    expect(encoded).toBeTruthy();

    const result = testSaveData(encoded!, JSON.stringify(androidFixture));

    expect(result.errors).not.toContainEqual(expect.stringContaining('Incorrect type for antimatter'));
    expect(result.errors).not.toContainEqual(expect.stringContaining('Incorrect type for sacrificed'));
    expect(result.errors).not.toContainEqual(expect.stringContaining('Incorrect type for auto.reality.rm'));
    expect(result.errors).not.toContainEqual(expect.stringContaining('Incorrect type for auto.eternity.amount'));
    expect(result.errors).not.toContainEqual(expect.stringContaining('Incorrect type for auto.eternity.xHighest'));
    expect(result.errors).not.toContainEqual(expect.stringContaining('Incorrect type for auto.bigCrunch.amount'));
    expect(result.errors).not.toContainEqual(expect.stringContaining('Incorrect type for auto.bigCrunch.xHighest'));
    expect(result.errors).not.toContainEqual(expect.stringContaining('Incorrect type for auto.sacrifice.multiplier'));
  });

  it('still validates PC saves against the PC reference shape', () => {
    const encoded = encodeSaveData(cloneFixture(pcFixture), SaveType.PC);

    expect(encoded).toBeTruthy();

    const result = testSaveData(encoded!, JSON.stringify(pcFixture));

    expect(result.errors).not.toContainEqual(expect.stringContaining('Incorrect type for antimatter'));
    expect(result.errors).not.toContainEqual(expect.stringContaining('Incorrect type for sacrificed'));
  });

  it('accepts Android reality-specific fields in the dedicated reality check', () => {
    const result = checkRealitySection(cloneFixture(androidFixture) as never);

    expect(result.issues).not.toContain('The "realities" property is missing');
    expect(result.issues).not.toContainEqual(expect.stringContaining('The "realities" property is of type object instead of number'));
    expect(result.issues).not.toContain('The "partSimulatedReality" property is missing');
    expect(result.issues).not.toContainEqual(expect.stringContaining('The "reality.realityMachines" property is of type object instead of string'));
  });
});