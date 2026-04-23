import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
  ReactNode,
} from 'react';
import { SaveService, SaveType } from '../services/SaveService';
import { createSaveEditorStore, SaveEditorStore } from '../core/document/store';
import { SaveDataRecord, SaveEditorState, SaveTestResults } from '../core/save/types';
import { getValueAtPath } from '../core/document/path';
import { testSaveData, checkRealitySection } from "../utils/testSave";

// Interface for save context
export interface SaveContextType {
  originalSaveData: SaveDataRecord | null;
  modifiedSaveData: SaveDataRecord | null;
  encryptedSave: string;
  rawSaveData: string;
  encodedOutputData: string;
  isLoaded: boolean;
  saveType: SaveType;
  testResults: { success: boolean; errors: string[] } | null;
  errorMessage: string | null;
  decryptSave: () => void;
  encryptSave: () => string;
  updateSaveData: (path: string, value: any) => void;
  setRawSaveData: (data: string) => void;
  testSave: () => void;
}

interface SaveActions {
  setRawSaveData: (data: string) => void;
  decryptSave: () => void;
  encryptSave: () => string;
  updateSaveData: (path: string, value: any) => void;
  replaceSaveData: (data: SaveDataRecord) => void;
  testSave: () => Promise<void>;
  setTestResults: (results: SaveTestResults | null) => void;
}

const SaveStoreContext = createContext<SaveEditorStore | null>(null);
const SaveActionsContext = createContext<SaveActions | null>(null);

const useSaveStore = (): SaveEditorStore => {
  const store = useContext(SaveStoreContext);
  if (!store) {
    throw new Error('useSaveStore must be used within a SaveProvider');
  }

  return store;
};

export const useSaveSelector = <T,>(selector: (state: SaveEditorState) => T): T => {
  const store = useSaveStore();
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState())
  );
};

export const useSaveActions = (): SaveActions => {
  const actions = useContext(SaveActionsContext);
  if (!actions) {
    throw new Error('useSaveActions must be used within a SaveProvider');
  }

  return actions;
};

export const useSaveFieldValue = <T = unknown,>(path: string): T | undefined => {
  return useSaveSelector((state) => {
    if (!state.document) {
      return undefined;
    }

    return getValueAtPath<T>(state.document.workingData, path);
  });
};

export const useSave = (): SaveContextType => {
  const originalSaveData = useSaveSelector((state) => state.document?.originalData ?? null);
  const modifiedSaveData = useSaveSelector((state) => state.document?.workingData ?? null);
  const encryptedSave = useSaveSelector((state) => state.encryptedSave);
  const rawSaveData = useSaveSelector((state) => state.rawSaveData);
  const encodedOutputData = useSaveSelector((state) => state.encodedOutputData);
  const isLoaded = useSaveSelector((state) => state.isLoaded);
  const saveType = useSaveSelector((state) => state.saveType);
  const testResults = useSaveSelector((state) => state.testResults);
  const errorMessage = useSaveSelector((state) => state.errorMessage);
  const actions = useSaveActions();

  return {
    originalSaveData,
    modifiedSaveData,
    encryptedSave,
    rawSaveData,
    encodedOutputData,
    isLoaded,
    saveType,
    testResults,
    errorMessage,
    decryptSave: actions.decryptSave,
    encryptSave: actions.encryptSave,
    updateSaveData: actions.updateSaveData,
    setRawSaveData: actions.setRawSaveData,
    testSave: actions.testSave,
  };
};

// Props for the context provider
interface SaveProviderProps {
  children: ReactNode;
}

// Save context provider
export const SaveProvider: React.FC<SaveProviderProps> = ({ children }) => {
  const storeRef = useRef<SaveEditorStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createSaveEditorStore();
  }

  const actions = useMemo<SaveActions>(() => {
    const store = storeRef.current!;

    const runTestSave = async (): Promise<void> => {
      const snapshot = store.getState();
      const modifiedSaveData = snapshot.document?.workingData ?? null;

      if (!modifiedSaveData) {
        store.setTestResults({
          success: false,
          errors: ['No save to test'],
        });
        return;
      }

      try {
        let saveJsonContent = '';

        try {
          const response = await fetch('./pc.json');
          if (!response.ok) {
            throw new Error(`Error retrieving pc.json file: ${response.status}`);
          }

          saveJsonContent = await response.text();
        } catch (fetchError) {
          console.error('Error with fetch, trying with import:', fetchError);

          try {
            const saveJsonModule = await import('../../pc.json');
            saveJsonContent = JSON.stringify(saveJsonModule.default);
          } catch (importError) {
            store.setTestResults({
              success: false,
              errors: [`Unable to load pc.json file: ${importError}`],
            });
            return;
          }
        }

        const encrypted = SaveService.encrypt(modifiedSaveData, snapshot.saveType);
        if (!encrypted) {
          store.setTestResults({
            success: false,
            errors: ['Failed to encrypt data'],
          });
          return;
        }

        const results = testSaveData(encrypted, saveJsonContent);
        const realityCheck = checkRealitySection(modifiedSaveData as any);

        store.setTestResults({
          success: results.success && realityCheck.issues.length === 0,
          errors: [...results.errors, ...realityCheck.issues],
        });
      } catch (error) {
        store.setTestResults({
          success: false,
          errors: [`Error during test: ${error}`],
        });
      }
    };

    return {
      setRawSaveData: (data: string) => store.setRawSaveData(data),
      decryptSave: () => {
        store.loadFromEncoded();
      },
      encryptSave: () => store.encodeWorkingData(),
      updateSaveData: (path: string, value: any) => {
        if (!path) {
          store.replaceWorkingData(value as SaveDataRecord, 'json');
          return;
        }

        store.updateDocumentAtPath(path, value, 'structured');
      },
      replaceSaveData: (data: SaveDataRecord) => store.replaceWorkingData(data, 'json'),
      testSave: runTestSave,
      setTestResults: (results) => store.setTestResults(results),
    };
  }, []);

  return (
    <SaveStoreContext.Provider value={storeRef.current}>
      <SaveActionsContext.Provider value={actions}>
        {children}
      </SaveActionsContext.Provider>
    </SaveStoreContext.Provider>
  );
};
