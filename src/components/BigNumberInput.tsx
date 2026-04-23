import React, { useEffect, useId, useState } from 'react';
import { SaveType } from '../services/SaveService';

interface BigNumberInputProps {
  value: unknown;
  onChange: (value: unknown) => void;
  saveType: SaveType;
  label?: string;
  className?: string;
  disabled?: boolean;
  describedBy?: string;
  invalid?: boolean;
}

type AndroidBigNumber = {
  mantissa: number;
  exponent: number;
};

const isAndroidBigNumber = (value: unknown): value is AndroidBigNumber => {
  return typeof value === 'object'
    && value !== null
    && 'mantissa' in value
    && 'exponent' in value;
};

const formatPcDraft = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  if (isAndroidBigNumber(value)) {
    return `${value.mantissa}e${value.exponent}`;
  }

  return '';
};

const formatMantissaDraft = (value: unknown): string => {
  if (!isAndroidBigNumber(value)) {
    return '0';
  }

  return String(value.mantissa);
};

const formatExponentDraft = (value: unknown): string => {
  if (!isAndroidBigNumber(value)) {
    return '0';
  }

  return String(value.exponent);
};

/**
 * Component for handling big numbers in both PC and Android save formats
 * PC format: string like "1e+1500"
 * Android format: {mantissa: number, exponent: number} object
 */
const BigNumberInput: React.FC<BigNumberInputProps> = ({ 
  value, 
  onChange, 
  saveType, 
  label,
  className = '',
  disabled = false,
  describedBy,
  invalid = false,
}) => {
  const baseId = useId();
  const inputId = `${baseId}-value`;
  const mantissaId = `${baseId}-mantissa`;
  const exponentId = `${baseId}-exponent`;
  const [pcDraft, setPcDraft] = useState<string>(() => formatPcDraft(value));
  const [mantissaDraft, setMantissaDraft] = useState<string>(() => formatMantissaDraft(value));
  const [exponentDraft, setExponentDraft] = useState<string>(() => formatExponentDraft(value));

  useEffect(() => {
    if (value && typeof value === 'object' && !isAndroidBigNumber(value)) {
      console.warn('Invalid object value passed to BigNumberInput:', value);
      console.warn('Component stack trace:', new Error().stack);
    }
  }, [value]);

  useEffect(() => {
    setPcDraft(formatPcDraft(value));
  }, [value, saveType]);

  useEffect(() => {
    setMantissaDraft(formatMantissaDraft(value));
    setExponentDraft(formatExponentDraft(value));
  }, [value, saveType]);

  const restoreAndroidDrafts = () => {
    setMantissaDraft(formatMantissaDraft(value));
    setExponentDraft(formatExponentDraft(value));
  };

  const commitPcDraft = () => {
    const nextValue = pcDraft.trim();

    if (!nextValue) {
      setPcDraft(formatPcDraft(value));
      return;
    }

    onChange(nextValue);
  };

  const commitAndroidDraft = () => {
    const nextMantissa = mantissaDraft.trim();
    const nextExponent = exponentDraft.trim();

    if (!nextMantissa || !nextExponent) {
      restoreAndroidDrafts();
      return;
    }

    const parsedMantissa = Number.parseFloat(nextMantissa);
    const parsedExponent = Number.parseInt(nextExponent, 10);

    if (Number.isNaN(parsedMantissa) || Number.isNaN(parsedExponent)) {
      restoreAndroidDrafts();
      return;
    }

    onChange({
      mantissa: parsedMantissa,
      exponent: parsedExponent,
    });
  };

  // Handle PC format (string)
  if (saveType === SaveType.PC) {
    return (
      <div className={`big-number-input pc-format ${className}`}>
        {label && <label className="input-label" htmlFor={inputId}>{label}</label>}
        <input
          id={inputId}
          type="text"
          value={pcDraft}
          onChange={(e) => setPcDraft(e.target.value)}
          onBlur={commitPcDraft}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commitPcDraft();
            }
          }}
          className="input-field"
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={invalid}
        />
      </div>
    );
  }
  
  // Handle Android format (object with mantissa and exponent)
  return (
    <div className={`big-number-input android-format ${className}`}>
      {label && <label className="input-label" htmlFor={mantissaId}>{label}</label>}
      <div className="android-number-inputs">
        <input
          id={mantissaId}
          type="number"
          className="mantissa-input"
          value={mantissaDraft}
          onChange={(e) => setMantissaDraft(e.target.value)}
          onBlur={commitAndroidDraft}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commitAndroidDraft();
            }
          }}
          step="0.01"
          disabled={disabled}
          aria-label={label ? `${label} mantissa` : 'Mantissa'}
          aria-describedby={describedBy}
          aria-invalid={invalid}
        />
        <span className="multiply-symbol">x10</span>
        <input
          id={exponentId}
          type="number"
          className="exponent-input"
          value={exponentDraft}
          onChange={(e) => setExponentDraft(e.target.value)}
          onBlur={commitAndroidDraft}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commitAndroidDraft();
            }
          }}
          disabled={disabled}
          aria-label={label ? `${label} exponent` : 'Exponent'}
          aria-describedby={describedBy}
          aria-invalid={invalid}
        />
      </div>
    </div>
  );
};

export default BigNumberInput; 