import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { SearchQuery, findNext, findPrevious, search, setSearchQuery } from '@codemirror/search';
import { EditorView, keymap } from '@codemirror/view';

export interface JsonCursorState {
  offset: number;
  line: number;
  column: number;
}

export interface JsonCodeMirrorHandle {
  focus: () => void;
  jumpToOffset: (offset: number) => void;
  selectRange: (from: number, to: number) => void;
  findNext: () => boolean;
  findPrevious: () => boolean;
}

interface JsonCodeMirrorProps {
  value: string;
  searchQuery: string;
  caseSensitive: boolean;
  invalid: boolean;
  describedBy: string;
  onChange: (value: string) => void;
  onCursorChange: (cursor: JsonCursorState) => void;
  onRequestSearchFocus: () => void;
  onApplyShortcut: () => void;
  onFormatShortcut: () => void;
  onResetShortcut: () => void;
  onUndoShortcut: () => void;
  onRedoShortcut: () => void;
  onNextSearchShortcut: () => void;
  onPreviousSearchShortcut: () => void;
}

interface ShortcutCallbacks {
  onRequestSearchFocus: () => void;
  onApplyShortcut: () => void;
  onFormatShortcut: () => void;
  onResetShortcut: () => void;
  onUndoShortcut: () => void;
  onRedoShortcut: () => void;
  onNextSearchShortcut: () => void;
  onPreviousSearchShortcut: () => void;
}

const JsonCodeMirror = forwardRef<JsonCodeMirrorHandle, JsonCodeMirrorProps>(function JsonCodeMirror(
  {
    value,
    searchQuery,
    caseSensitive,
    invalid,
    describedBy,
    onChange,
    onCursorChange,
    onRequestSearchFocus,
    onApplyShortcut,
    onFormatShortcut,
    onResetShortcut,
    onUndoShortcut,
    onRedoShortcut,
    onNextSearchShortcut,
    onPreviousSearchShortcut,
  },
  ref,
) {
  const viewRef = useRef<EditorView | null>(null);
  const shortcutCallbacksRef = useRef<ShortcutCallbacks>({
    onRequestSearchFocus,
    onApplyShortcut,
    onFormatShortcut,
    onResetShortcut,
    onUndoShortcut,
    onRedoShortcut,
    onNextSearchShortcut,
    onPreviousSearchShortcut,
  });

  useEffect(() => {
    shortcutCallbacksRef.current = {
      onRequestSearchFocus,
      onApplyShortcut,
      onFormatShortcut,
      onResetShortcut,
      onUndoShortcut,
      onRedoShortcut,
      onNextSearchShortcut,
      onPreviousSearchShortcut,
    };
  }, [
    onRequestSearchFocus,
    onApplyShortcut,
    onFormatShortcut,
    onResetShortcut,
    onUndoShortcut,
    onRedoShortcut,
    onNextSearchShortcut,
    onPreviousSearchShortcut,
  ]);

  const reportCursor = useCallback((view: EditorView) => {
    const offset = view.state.selection.main.head;
    const line = view.state.doc.lineAt(offset);
    onCursorChange({
      offset,
      line: line.number,
      column: offset - line.from + 1,
    });
  }, [onCursorChange]);

  useImperativeHandle(ref, () => ({
    focus: () => {
      viewRef.current?.focus();
    },
    jumpToOffset: (offset: number) => {
      if (!viewRef.current) {
        return;
      }

      const safeOffset = Math.max(0, Math.min(offset, viewRef.current.state.doc.length));
      viewRef.current.dispatch({
        selection: { anchor: safeOffset, head: safeOffset },
        scrollIntoView: true,
      });
      viewRef.current.focus();
      reportCursor(viewRef.current);
    },
    selectRange: (from: number, to: number) => {
      if (!viewRef.current) {
        return;
      }

      const safeFrom = Math.max(0, Math.min(from, viewRef.current.state.doc.length));
      const safeTo = Math.max(safeFrom, Math.min(to, viewRef.current.state.doc.length));
      viewRef.current.dispatch({
        selection: { anchor: safeFrom, head: safeTo },
        scrollIntoView: true,
      });
      viewRef.current.focus();
      reportCursor(viewRef.current);
    },
    findNext: () => {
      if (!viewRef.current) {
        return false;
      }

      const didFind = findNext(viewRef.current);
      if (didFind) {
        reportCursor(viewRef.current);
      }
      return didFind;
    },
    findPrevious: () => {
      if (!viewRef.current) {
        return false;
      }

      const didFind = findPrevious(viewRef.current);
      if (didFind) {
        reportCursor(viewRef.current);
      }
      return didFind;
    },
  }), [reportCursor]);

  useEffect(() => {
    if (!viewRef.current) {
      return;
    }

    viewRef.current.dispatch({
      effects: setSearchQuery.of(new SearchQuery({ search: searchQuery, caseSensitive })),
    });
  }, [searchQuery, caseSensitive]);

  const extensions = useMemo(
    () => [
      json(),
      search({ top: false }),
      keymap.of([
        {
          key: 'Mod-f',
          run: () => {
            shortcutCallbacksRef.current.onRequestSearchFocus();
            return true;
          },
        },
        {
          key: 'Mod-s',
          run: () => {
            shortcutCallbacksRef.current.onApplyShortcut();
            return true;
          },
        },
        {
          key: 'Mod-Shift-f',
          run: () => {
            shortcutCallbacksRef.current.onFormatShortcut();
            return true;
          },
        },
        {
          key: 'Mod-Shift-r',
          run: () => {
            shortcutCallbacksRef.current.onResetShortcut();
            return true;
          },
        },
        {
          key: 'Mod-z',
          run: () => {
            shortcutCallbacksRef.current.onUndoShortcut();
            return true;
          },
        },
        {
          key: 'Mod-y',
          run: () => {
            shortcutCallbacksRef.current.onRedoShortcut();
            return true;
          },
        },
        {
          key: 'Mod-Shift-z',
          run: () => {
            shortcutCallbacksRef.current.onRedoShortcut();
            return true;
          },
        },
        {
          key: 'F3',
          run: () => {
            shortcutCallbacksRef.current.onNextSearchShortcut();
            return true;
          },
        },
        {
          key: 'Shift-F3',
          run: () => {
            shortcutCallbacksRef.current.onPreviousSearchShortcut();
            return true;
          },
        },
        {
          key: 'Mod-g',
          run: () => {
            shortcutCallbacksRef.current.onNextSearchShortcut();
            return true;
          },
        },
        {
          key: 'Mod-Shift-g',
          run: () => {
            shortcutCallbacksRef.current.onPreviousSearchShortcut();
            return true;
          },
        },
      ]),
      EditorView.theme({
        '&': {
          height: '100%',
        },
        '.cm-scroller': {
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          overflow: 'auto',
        },
        '.cm-content': {
          minHeight: '100%',
        },
        '.cm-line': {
          padding: '0 10px',
        },
        '.cm-gutters': {
          backgroundColor: 'var(--card-bg-alt)',
          borderRight: '1px solid var(--border-color)',
          color: 'var(--text-muted)',
        },
        '.cm-activeLine': {
          backgroundColor: 'rgba(var(--primary-color-rgb), 0.08)',
        },
        '.cm-activeLineGutter': {
          backgroundColor: 'rgba(var(--primary-color-rgb), 0.08)',
        },
        '&.cm-focused': {
          outline: '2px solid rgba(var(--primary-color-rgb), 0.28)',
          outlineOffset: '-1px',
        },
        '.cm-searchMatch': {
          backgroundColor: 'rgba(var(--warning-color-rgb, 255, 193, 7), 0.2)',
          borderRadius: '4px',
        },
        '.cm-searchMatch.cm-searchMatch-selected': {
          backgroundColor: 'rgba(var(--warning-color-rgb, 255, 193, 7), 0.34)',
        },
      }),
    ],
    [],
  );

  return (
    <CodeMirror
      value={value}
      height="100%"
      basicSetup={{
        foldGutter: true,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        history: false,
        lineNumbers: true,
      }}
      className={`json-editor-codemirror${invalid ? ' is-invalid' : ''}`}
      extensions={extensions}
      onChange={(nextValue) => {
        onChange(nextValue);
      }}
      onCreateEditor={(view) => {
        viewRef.current = view;
        reportCursor(view);
      }}
      onUpdate={(update) => {
        viewRef.current = update.view;
        reportCursor(update.view);
      }}
      aria-label="Full save document JSON"
      aria-describedby={describedBy}
      aria-invalid={invalid}
    />
  );
});

export default JsonCodeMirror;