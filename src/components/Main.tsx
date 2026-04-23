import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { useSave, useSaveSelector } from '../contexts/SaveContext';
import StructuredEditor from './StructuredEditor';
import 'font-awesome/css/font-awesome.min.css';
import ThemeSelector from './ThemeSelector';
const JsonEditor = lazy(() => import('./JsonEditor'));

type WorkspaceView = 'structured' | 'json' | 'settings';

const formatChangeTime = (timestamp: number | null): string => {
  if (!timestamp) {
    return 'No changes yet';
  }

  return new Date(timestamp).toLocaleString();
};

const Main: React.FC = () => {
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>('structured');
  const [hasMountedJsonEditor, setHasMountedJsonEditor] = useState(false);
  const structuredPanelRef = useRef<HTMLDivElement | null>(null);
  const jsonPanelRef = useRef<HTMLDivElement | null>(null);
  const settingsPanelRef = useRef<HTMLDivElement | null>(null);
  const hasFocusedWorkspacePanel = useRef(false);
  const structuredTabId = 'workspace-tab-structured';
  const jsonTabId = 'workspace-tab-json';
  const settingsTabId = 'workspace-tab-settings';
  const structuredPanelId = 'workspace-panel-structured';
  const jsonPanelId = 'workspace-panel-json';
  const settingsPanelId = 'workspace-panel-settings';

  const handleWorkspaceViewChange = (nextView: WorkspaceView) => {
    setWorkspaceView(nextView);
    if (nextView === 'json') {
      setHasMountedJsonEditor(true);
    }
  };

  useEffect(() => {
    if (!hasFocusedWorkspacePanel.current) {
      hasFocusedWorkspacePanel.current = true;
      return;
    }

    const nextPanel = workspaceView === 'structured'
      ? structuredPanelRef.current
      : workspaceView === 'json'
        ? jsonPanelRef.current
        : settingsPanelRef.current;
    nextPanel?.focus();
  }, [workspaceView]);

  const { 
    rawSaveData, 
    setRawSaveData, 
    decryptSave, 
    encryptSave, 
    encodedOutputData,
    errorMessage,
    isLoaded,
    saveType,
    testResults,
    testSave,
  } = useSave();
  const document = useSaveSelector((state) => state.document);
  const lastChange = useSaveSelector((state) => state.lastChange);
  const isDirty = useSaveSelector((state) => state.isDirty);

  const validationIssues = document?.validation.issues ?? [];
  const validationErrors = validationIssues.filter((issue) => issue.severity === 'error');
  const validationWarnings = validationIssues.filter((issue) => issue.severity === 'warning');
  const reviewMessage = !isLoaded
    ? 'Import and decode a save before generating an export string.'
    : encodedOutputData
      ? 'Encoded export is ready to copy.'
      : isDirty
        ? 'Changes are pending encryption.'
        : 'No encoded export has been generated yet.';
  
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRawSaveData(text);
    } catch (error) {
      console.error('Failed to read clipboard contents:', error);
    }
  };
  
  const handleDecrypt = () => {
    decryptSave();
  };
  
  const handleEncrypt = () => {
    encryptSave();
  };
  
  const handleCopy = async () => {
    try {
      if (encodedOutputData) {
        await navigator.clipboard.writeText(encodedOutputData);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };
  
  return (
    <main className="editor-container workflow-shell" id="save-editor">
      <div className="main-content">
        <section className="card workflow-hero">
          <div className="card-body">
            <div className="workflow-hero-header">
              <div>
                <p className="workflow-kicker">Phase 3 workflow</p>
                <h2>Import, validate, edit, then review the export</h2>
                <p className="workflow-summary">
                  The shell now tracks format, validation, and dirty state directly from the centralized document store.
                </p>
              </div>
              <div className="workflow-status-strip" aria-label="Save status overview">
                <span className={`status-chip ${isLoaded ? 'success' : 'neutral'}`}>{isLoaded ? 'Save loaded' : 'Awaiting import'}</span>
                <span className={`status-chip ${isDirty ? 'warning' : 'success'}`}>{isDirty ? 'Dirty edits' : 'Clean workspace'}</span>
                <span className="status-chip neutral">Format: {isLoaded ? saveType.toUpperCase() : 'Unknown'}</span>
                <span className={`status-chip ${validationErrors.length > 0 ? 'danger' : validationWarnings.length > 0 ? 'warning' : 'success'}`}>
                  {validationIssues.length > 0 ? `${validationIssues.length} validation issue${validationIssues.length === 1 ? '' : 's'}` : 'Validation clear'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            <strong>Error:</strong> {errorMessage}
          </div>
        )}
        
        <div className="alert alert-info">
          <strong><i className="fa fa-android pulse-subtle" aria-hidden="true"></i> Save support:</strong> PC and Android saves share the same workflow now. Import a save, verify the summary, then choose the structured workspace or JSON editor for deeper edits.
        </div>
        
        <section className="card workflow-step-card">
          <div className="card-header">
            <div>
              <p className="step-label">Step 1</p>
              <h2>Import save</h2>
            </div>
            <span className="status-chip neutral">Raw input</span>
          </div>
          <div className="card-body">
            <p className="section-summary">Paste encrypted save data, then decode it into the shared document store.</p>
            <div className="input-group">
              <label htmlFor="save-import-input">Encrypted save</label>
              <textarea
                id="save-import-input"
                className="save-textarea"
                placeholder="Paste your encrypted save data here..."
                aria-label="Save data input"
                spellCheck="false"
                value={rawSaveData}
                onChange={(e) => setRawSaveData(e.target.value)}
              />
            </div>
            <div className="button-group">
              <button id="pasteButton" className="btn primary" onClick={handlePaste}>
                <i className="fa fa-paste"></i> Paste
              </button>
              <button id="decryptButton" className="btn secondary" onClick={handleDecrypt}>
                <i className="fa fa-unlock"></i> Decrypt
              </button>
            </div>
          </div>
        </section>
        
        <section className="card workflow-step-card">
          <div className="card-header">
            <div>
              <p className="step-label">Step 2</p>
              <h2>Validation summary</h2>
            </div>
            <button className="btn secondary" onClick={() => testSave()} disabled={!isLoaded}>
              <i className="fa fa-check-circle"></i> Run structure test
            </button>
          </div>
          <div className="card-body">
            {!isLoaded || !document ? (
              <div className="editor-empty-state compact">
                <h3>No decoded save yet</h3>
                <p>Decrypt a save to populate stage detection, registry validation, and review status.</p>
              </div>
            ) : (
              <div className="validation-summary-grid">
                <div className="validation-summary-card">
                  <span className="summary-label">Progress stage</span>
                  <strong>{document.validation.stage}</strong>
                </div>
                <div className="validation-summary-card">
                  <span className="summary-label">Errors</span>
                  <strong>{validationErrors.length}</strong>
                </div>
                <div className="validation-summary-card">
                  <span className="summary-label">Warnings</span>
                  <strong>{validationWarnings.length}</strong>
                </div>
                <div className="validation-summary-card">
                  <span className="summary-label">Last change</span>
                  <strong>{formatChangeTime(lastChange?.timestamp ?? null)}</strong>
                </div>
              </div>
            )}

            {validationIssues.length > 0 && (
              <div className="workflow-list-block">
                <h3>Registry validation findings</h3>
                <ul className="workflow-list">
                  {validationIssues.slice(0, 8).map((issue) => (
                    <li key={`${issue.code}-${issue.path ?? issue.message}`}>
                      <strong>{issue.severity.toUpperCase()}</strong> {issue.message}
                      {issue.path && <span className="issue-path">{issue.path}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {testResults && (
              <div className="workflow-list-block">
                <h3>Structure test</h3>
                <p className={`structure-test-summary ${testResults.success ? 'success' : 'danger'}`}>
                  {testResults.success ? 'External structure check passed.' : `External structure check found ${testResults.errors.length} issue${testResults.errors.length === 1 ? '' : 's'}.`}
                </p>
                {testResults.errors.length > 0 && (
                  <ul className="workflow-list">
                    {testResults.errors.slice(0, 8).map((error, index) => (
                      <li key={`${index}-${error}`}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="card workflow-step-card">
          <div className="card-header">
            <div>
              <p className="step-label">Step 3</p>
              <h2>Edit workspace</h2>
            </div>
            <div className="workspace-view-switcher" role="tablist" aria-label="Workspace views">
              <button 
                id={structuredTabId}
                type="button"
                role="tab"
                className={`tab-button ${workspaceView === 'structured' ? 'active' : ''}`}
                onClick={() => handleWorkspaceViewChange('structured')}
                aria-selected={workspaceView === 'structured'}
                aria-controls={structuredPanelId}
                tabIndex={workspaceView === 'structured' ? 0 : -1}
              >
                <i className="fa fa-th-large" aria-hidden="true"></i>
                <span>Structured</span>
              </button>
              <button 
                id={jsonTabId}
                type="button"
                role="tab"
                className={`tab-button ${workspaceView === 'json' ? 'active' : ''}`}
                onClick={() => handleWorkspaceViewChange('json')}
                disabled={!isLoaded}
                aria-selected={workspaceView === 'json'}
                aria-controls={jsonPanelId}
                tabIndex={workspaceView === 'json' ? 0 : -1}
              >
                <i className="fa fa-code" aria-hidden="true"></i>
                <span>JSON</span>
              </button>
              <button 
                id={settingsTabId}
                type="button"
                role="tab"
                className={`tab-button ${workspaceView === 'settings' ? 'active' : ''}`}
                onClick={() => handleWorkspaceViewChange('settings')}
                aria-selected={workspaceView === 'settings'}
                aria-controls={settingsPanelId}
                tabIndex={workspaceView === 'settings' ? 0 : -1}
              >
                <i className="fa fa-cog" aria-hidden="true"></i>
                <span>Preferences</span>
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="workspace-meta-bar">
              <span className={`status-chip ${isDirty ? 'warning' : 'success'}`}>{isDirty ? 'Unsaved edits in memory' : 'No staged edits'}</span>
              <span className={`status-chip ${errorMessage ? 'danger' : 'neutral'}`}>{errorMessage ? 'Store error present' : 'Store healthy'}</span>
              <span className="status-chip neutral">Format: {isLoaded ? saveType.toUpperCase() : 'Unknown'}</span>
              <span className="status-chip neutral">Last source: {lastChange?.source ?? 'none'}</span>
            </div>

            <div className="workspace-panel">
              <div
                id={structuredPanelId}
                ref={structuredPanelRef}
                role="tabpanel"
                aria-labelledby={structuredTabId}
                hidden={workspaceView !== 'structured'}
                tabIndex={-1}
              >
                {workspaceView === 'structured' && <StructuredEditor isActive={workspaceView === 'structured'} />}
              </div>

              {(workspaceView === 'json' || hasMountedJsonEditor) && (
                <div
                  id={jsonPanelId}
                  ref={jsonPanelRef}
                  className="json-workspace-shell"
                  role="tabpanel"
                  aria-labelledby={jsonTabId}
                  hidden={workspaceView !== 'json'}
                  tabIndex={-1}
                >
                  {!hasMountedJsonEditor ? (
                    <div className="editor-empty-state compact">
                      <h3>JSON editor will mount on demand</h3>
                      <p>Open the JSON workspace once to load the heavy editor only when you need it.</p>
                    </div>
                  ) : (
                    <Suspense
                      fallback={
                        <div className="editor-empty-state compact">
                          <h3>Loading JSON workspace</h3>
                          <p>Preparing the tree and text editor for the current save snapshot.</p>
                        </div>
                      }
                    >
                      <JsonEditor isActive={workspaceView === 'json'} />
                    </Suspense>
                  )}
                </div>
              )}

              <div
                id={settingsPanelId}
                ref={settingsPanelRef}
                role="tabpanel"
                aria-labelledby={settingsTabId}
                hidden={workspaceView !== 'settings'}
                tabIndex={-1}
              >
                {workspaceView === 'settings' && (
                <div className="workspace-settings-panel">
                  <div className="settings-block">
                    <h3>Theme</h3>
                    <p>Theme preferences stay compatible with the existing selector and local storage behavior.</p>
                    <ThemeSelector />
                  </div>

                  <div className="settings-block">
                    <h3>Workflow notes</h3>
                    <ul className="workflow-list">
                      <li>The structured workspace is generated from the registry in core save metadata.</li>
                      <li>The JSON editor mounts lazily to avoid paying its cost until you open it.</li>
                      <li>Dirty, error, and format state are surfaced in the shell instead of being hidden inside tabs.</li>
                    </ul>
                  </div>
                </div>
                )}
              </div>
            </div>
          </div>
        </section>
        
        <section className="card workflow-step-card">
          <div className="card-header">
            <div>
              <p className="step-label">Step 4</p>
              <h2>Export review</h2>
            </div>
            <span className={`status-chip ${encodedOutputData ? 'success' : 'neutral'}`}>{encodedOutputData ? 'Ready to copy' : 'Not generated'}</span>
          </div>
          <div className="card-body">
            <div className="export-review-grid">
              <div className="export-review-card">
                <span className="summary-label">Format</span>
                <strong>{isLoaded ? saveType.toUpperCase() : 'Unknown'}</strong>
              </div>
              <div className="export-review-card">
                <span className="summary-label">Dirty state</span>
                <strong>{isDirty ? 'Pending export' : 'Matches imported snapshot'}</strong>
              </div>
              <div className="export-review-card">
                <span className="summary-label">Last path</span>
                <strong>{lastChange?.path || 'Root document'}</strong>
              </div>
              <div className="export-review-card">
                <span className="summary-label">Export status</span>
                <strong>{reviewMessage}</strong>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="save-export-output">Encoded export</label>
              <textarea
                id="save-export-output"
                className="save-textarea"
                placeholder="Your encrypted save will appear here..."
                aria-label="Save data output"
                spellCheck="false"
                readOnly
                value={encodedOutputData}
              />
            </div>
            <div className="button-group">
              <button id="encryptButton" className="btn primary" onClick={handleEncrypt} disabled={!isLoaded}>
                <i className="fa fa-lock"></i> Encrypt
              </button>
              <button id="copyButton" className="btn secondary" onClick={handleCopy} disabled={!encodedOutputData}>
                <i className="fa fa-copy"></i> Copy
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Main; 