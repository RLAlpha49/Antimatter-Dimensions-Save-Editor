import React, { useEffect, useId, useRef, useState } from 'react';

type JsonTextareaExpectation = 'any' | 'array' | 'object';
type JsonTextareaValue = Record<string, unknown> | unknown[];

interface JsonTextareaFieldProps {
  id: string;
  label: string;
  value: JsonTextareaValue;
  onChange: (value: JsonTextareaValue) => void;
  rows?: number;
  placeholder?: string;
  expectation?: JsonTextareaExpectation;
  stringifySpace?: number;
  fallbackValue?: JsonTextareaValue;
}

const stringifyValue = (value: JsonTextareaValue, fallbackValue: JsonTextareaValue, stringifySpace?: number): string => {
  return JSON.stringify(value ?? fallbackValue, null, stringifySpace);
};

const getExpectationMessage = (expectation: JsonTextareaExpectation): string => {
  switch (expectation) {
    case 'array':
      return 'Value must be a JSON array.';
    case 'object':
      return 'Value must be a JSON object.';
    default:
      return 'Enter valid JSON.';
  }
};

const isExpectedShape = (value: unknown, expectation: JsonTextareaExpectation): boolean => {
  if (expectation === 'array') {
    return Array.isArray(value);
  }

  if (expectation === 'object') {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  return true;
};

const JsonTextareaField: React.FC<JsonTextareaFieldProps> = ({
  id,
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  expectation = 'any',
  stringifySpace,
  fallbackValue = expectation === 'array' ? [] : {},
}) => {
  const errorId = useId();
  const serializedValue = stringifyValue(value, fallbackValue, stringifySpace);
  const lastSyncedValueRef = useRef(serializedValue);
  const [draft, setDraft] = useState(serializedValue);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (serializedValue !== lastSyncedValueRef.current) {
      lastSyncedValueRef.current = serializedValue;
      setDraft(serializedValue);
      setError(null);
    }
  }, [serializedValue]);

  return (
    <div className="json-textarea-field">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        rows={rows}
        value={draft}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => {
          const nextDraft = event.target.value;
          setDraft(nextDraft);

          try {
            const parsed = JSON.parse(nextDraft);

            if (!isExpectedShape(parsed, expectation)) {
              setError(getExpectationMessage(expectation));
              return;
            }

            setError(null);
            lastSyncedValueRef.current = stringifyValue(parsed, fallbackValue, stringifySpace);
            onChange(parsed as JsonTextareaValue);
          } catch {
            setError('Enter valid JSON.');
          }
        }}
      />
      {error ? (
        <p id={errorId} className="field-error-message" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default JsonTextareaField;