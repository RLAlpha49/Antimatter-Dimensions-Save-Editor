import { describe, expect, it } from 'vitest';
import androidFixture from '../../../android.json';
import pcFixture from '../../../pc.json';
import { decodeSaveString, detectSaveType, encodeSaveData } from './serialization';
import { SaveType } from './types';

const cloneFixture = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

describe('save serialization', () => {
  it('round-trips the PC fixture', () => {
    const encoded = encodeSaveData(cloneFixture(pcFixture), SaveType.PC);

    expect(encoded).toBeTruthy();
    expect(detectSaveType(encoded!)).toBe(SaveType.PC);

    const decoded = decodeSaveString(encoded!);
    expect(decoded.saveType).toBe(SaveType.PC);
    expect(decoded.validation.success).toBe(true);
    expect(decoded.data?.version).toBe(pcFixture.version);
    expect(decoded.data?.lastUpdate).toBe(pcFixture.lastUpdate);
    expect(decoded.data?.antimatter).toEqual(pcFixture.antimatter);
    expect(decoded.data).toEqual(pcFixture);
  });

  it('round-trips the Android fixture', () => {
    const encoded = encodeSaveData(cloneFixture(androidFixture), SaveType.Android);

    expect(encoded).toBeTruthy();
    expect(detectSaveType(encoded!)).toBe(SaveType.Android);

    const decoded = decodeSaveString(encoded!);
    expect(decoded.saveType).toBe(SaveType.Android);
    expect(decoded.validation.success).toBe(true);
    expect(decoded.data?.version).toBe(androidFixture.version);
    expect(decoded.data?.lastUpdate).toBe(androidFixture.lastUpdate);
    expect(decoded.data?.brake).toBe(androidFixture.brake);
    expect(decoded.data).toEqual(androidFixture);
  });
});
