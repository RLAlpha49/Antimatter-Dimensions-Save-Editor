import React, { useId } from 'react';
import { useTheme } from '../contexts/ThemeContext';

type ThemeInfo = {
  id: string;
  name: string;
  colors: string[];
  description?: string;
};

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const selectId = useId();
  const descriptionId = useId();
  const previewHeadingId = useId();
  
  const themes: ThemeInfo[] = [
    { 
      id: 'light', 
      name: 'Light',
      description: 'Light theme for daytime use',
      colors: ['#6366f1', '#ffffff', '#f9fafb', '#e5e7eb'] 
    },
    { 
      id: 'dark', 
      name: 'Dark',
      description: 'Dark theme to reduce eye fatigue',
      colors: ['#0078d4', '#1e1e1e', '#2a2a2a', '#404040'] 
    },
    { 
      id: 'antimatter', 
      name: 'Antimatter',
      description: 'Inspired by dark matter and antimatter',
      colors: ['#8a2be2', '#130826', '#1e0f38', '#bb86fc'] 
    },
    { 
      id: 'infinity', 
      name: 'Infinity',
      description: 'Cosmic theme with blue and ocean colors',
      colors: ['#3182ce', '#0a1f38', '#0d2b4d', '#4299e1'] 
    },
    { 
      id: 'eternity', 
      name: 'Eternity',
      description: 'Warm orange and brown colors for eternity',
      colors: ['#ff7043', '#301b10', '#3d2216', '#ff8a65'] 
    },
    { 
      id: 'reality', 
      name: 'Reality',
      description: 'Green and nature-inspired theme',
      colors: ['#4caf50', '#1a2e1a', '#243d24', '#81c784'] 
    },
  ];

  const activeTheme = themes.find((themeItem) => themeItem.id === theme) ?? themes[0];

  return (
    <div className="theme-settings">
      <div className="theme-selector">
        <label className="theme-selector-label" htmlFor={selectId}>Active theme</label>
        <select 
          id={selectId}
          className="theme-select"
          value={theme}
          onChange={(e) => setTheme(e.target.value as any)}
          aria-describedby={descriptionId}
        >
          {themes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <p id={descriptionId} className="theme-description">
          {activeTheme.description || "Select a theme to customize the application's appearance"}
        </p>
      </div>

      <div className="theme-preview-header">
        <h4 id={previewHeadingId}>Quick presets</h4>
        <p>Preview each palette and switch immediately without leaving the settings workspace.</p>
      </div>
      
      <div className="theme-previews" aria-labelledby={previewHeadingId}>
        {themes.map((themeItem) => (
          <button
            type="button"
            key={themeItem.id}
            className={`theme-preview-card ${themeItem.id}-theme ${theme === themeItem.id ? 'active' : ''}`}
            onClick={() => setTheme(themeItem.id as any)}
            aria-pressed={theme === themeItem.id}
          >
            <div className="theme-color-preview">
              <div className="color-bar">
                {themeItem.colors.map((color, index) => (
                  <div 
                    key={index}
                    style={{ 
                      backgroundColor: color,
                      flex: index === 0 ? '0 0 30%' : 
                            index === 3 ? '0 0 20%' : '1',
                    }}
                  />
                ))}
              </div>
            </div>
            <span className="theme-name">{themeItem.name}</span>
            {themeItem.description && <span className="theme-preview-description">{themeItem.description}</span>}
            <span className="theme-check" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector; 