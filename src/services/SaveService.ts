import {
  decodeSaveString,
  detectSaveType,
  encodeSaveData,
  validateDecodedSave,
} from '../core/save/serialization';
import { SaveDataRecord, SaveType } from '../core/save/types';

export type SaveData = SaveDataRecord;
export { SaveType } from '../core/save/types';

export class SaveService {
  static detectSaveType(encodedSaveData: string): SaveType {
    return detectSaveType(encodedSaveData);
  }

  static encrypt(saveData: SaveData, saveType: SaveType = SaveType.PC): string | null {
    return encodeSaveData(saveData, saveType);
  }

  static decrypt(encodedSaveData: string): { data: SaveData | null; saveType: SaveType } {
    const result = decodeSaveString(encodedSaveData);
    return {
      data: result.data,
      saveType: result.saveType,
    };
  }

  static validateSave(saveData: SaveData): boolean {
    return validateDecodedSave(saveData).success;
  }
}