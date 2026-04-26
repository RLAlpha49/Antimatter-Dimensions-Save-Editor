import React, { useState } from 'react';
import { SectionProps } from './types';
import { FaExpand, FaTachometerAlt, FaArrowUp } from 'react-icons/fa';
import BigNumberInput from '../BigNumberInput';
import JsonTextareaField from '../JsonTextareaField';
import { SaveType } from '../../services/SaveService';
import { 
  AntimatterDimensionsStruct,
  AndroidStruct as AntimatterDimensionsStructAndroid
} from '../../Struct';

const DilationSection: React.FC<SectionProps> = ({
  saveData,
  handleValueChange,
  renderValidationIndicator,
  saveType
}) => {
  const [activeSubtab, setActiveSubtab] = useState<string>('general');

  // Handle subtab changes
  const handleSubtabClick = (subtabId: string) => {
    setActiveSubtab(subtabId);
  };

  // Helper function to check if we're using PC format
  const isPCFormat = (): boolean => {
    return saveType === SaveType.PC;
  };

  // Helper functions to safely access data based on format
  const getPCData = () => isPCFormat() ? saveData as AntimatterDimensionsStruct : null;
  const getAndroidData = () => !isPCFormat() ? saveData as AntimatterDimensionsStructAndroid : null;

  return (
    <div className="section-pane active" id="dilation">
      <div className="section-content">
        <h3>Dilation</h3>
        
        {/* Subtabs */}
        <nav className="section-subtabs" aria-label="Dilation sections">
          <button 
            type="button"
            className={`subtab-button ${activeSubtab === 'general' ? 'active' : ''}`}
            onClick={() => handleSubtabClick('general')}
            aria-pressed={activeSubtab === 'general'}
          >
            <FaExpand className="subtab-icon" aria-hidden="true" /> General
          </button>
          <button 
            type="button"
            className={`subtab-button ${activeSubtab === 'tachyons' ? 'active' : ''}`}
            onClick={() => handleSubtabClick('tachyons')}
            aria-pressed={activeSubtab === 'tachyons'}
          >
            <FaTachometerAlt className="subtab-icon" aria-hidden="true" /> Tachyons
          </button>
          <button 
            type="button"
            className={`subtab-button ${activeSubtab === 'upgrades' ? 'active' : ''}`}
            onClick={() => handleSubtabClick('upgrades')}
            aria-pressed={activeSubtab === 'upgrades'}
          >
            <FaArrowUp className="subtab-icon" aria-hidden="true" /> Upgrades
          </button>
        </nav>
        
        {/* General Subtab */}
        <div className={`subtab-content ${activeSubtab === 'general' ? 'active' : ''}`}>
          <div className="resource-group">
            <h4>Dilation Status</h4>
            <div className="dilation-grid">
              <div className="form-group">
                <label htmlFor="dilation-active">Active</label>
                <select
                  id="dilation-active"
                  value={saveData.dilation?.active ? 'true' : 'false'}
                  onChange={(e) => handleValueChange('dilation.active', e.target.value === 'true')}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
                {renderValidationIndicator('dilation.active')}
              </div>
              
              <div className="form-group">
                <label htmlFor="dilation-unlocked">Unlocked</label>
                <select
                  id="dilation-unlocked"
                  value={(saveData.dilation as any)?.unlocked ? 'true' : 'false'}
                  onChange={(e) => handleValueChange('dilation.unlocked', e.target.value === 'true')}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
                {renderValidationIndicator('dilation.unlocked')}
              </div>
              
              <div className="form-group">
                <BigNumberInput
                  label="Next Threshold"
                  value={isPCFormat() ? (saveData.dilation?.nextThreshold || '0') : (saveData.dilation?.nextThreshold || {mantissa: 0, exponent: 0})}
                  onChange={(value) => handleValueChange('dilation.nextThreshold', value)}
                  saveType={saveType}
                />
                {renderValidationIndicator('dilation.nextThreshold')}
              </div>
              
              <div className="form-group">
                <BigNumberInput
                  label="Base Dilation"
                  value={isPCFormat() ? ((saveData.dilation as any)?.baseDilation || '0') : ((saveData.dilation as any)?.baseDilation || {mantissa: 0, exponent: 0})}
                  onChange={(value) => handleValueChange('dilation.baseDilation', value)}
                  saveType={saveType}
                />
                {renderValidationIndicator('dilation.baseDilation')}
              </div>
              
              <div className="form-group">
                <BigNumberInput
                  label="Total TP"
                  value={isPCFormat() ? ((saveData.dilation as any)?.totalTachyonParticles || '0') : ((saveData.dilation as any)?.totalTachyonParticles || {mantissa: 0, exponent: 0})}
                  onChange={(value) => handleValueChange('dilation.totalTachyonParticles', value)}
                  saveType={saveType}
                />
                {renderValidationIndicator('dilation.totalTachyonParticles')}
              </div>
            </div>
          </div>
        </div>
        
        {/* Tachyons Subtab */}
        <div className={`subtab-content ${activeSubtab === 'tachyons' ? 'active' : ''}`}>
          <div className="resource-group">
            <h4>Tachyon Particles</h4>
            <div className="dilation-grid">
              <div className="form-group">
                <BigNumberInput
                  label="Current TP"
                  value={isPCFormat() ? (saveData.dilation?.tachyonParticles || '0') : (saveData.dilation?.tachyonParticles || {mantissa: 0, exponent: 0})}
                  onChange={(value) => handleValueChange('dilation.tachyonParticles', value)}
                  saveType={saveType}
                />
                {renderValidationIndicator('dilation.tachyonParticles')}
              </div>
              
              <div className="form-group">
                <BigNumberInput
                  label="Dilated Time"
                  value={isPCFormat() ? (saveData.dilation?.dilatedTime || '0') : (saveData.dilation?.dilatedTime || {mantissa: 0, exponent: 0})}
                  onChange={(value) => handleValueChange('dilation.dilatedTime', value)}
                  saveType={saveType}
                />
                {renderValidationIndicator('dilation.dilatedTime')}
              </div>
            </div>
          </div>
        </div>
        
        {/* Upgrades Subtab */}
        <div className={`subtab-content ${activeSubtab === 'upgrades' ? 'active' : ''}`}>
          <div className="resource-group">
            <h4>Dilation Upgrades</h4>
            <div className="dilation-grid">
              <div className="form-group">
                <JsonTextareaField
                  id="dilation-upgrades"
                  label="Upgrades"
                  value={saveData.dilation?.upgrades || []}
                  onChange={(value) => handleValueChange('dilation.upgrades', value)}
                  expectation="array"
                  rows={3}
                  fallbackValue={[]}
                />
                {renderValidationIndicator('dilation.upgrades')}
              </div>
              
              <div className="form-group">
                <JsonTextareaField
                  id="dilation-rebuyables"
                  label="Rebuyable Upgrades"
                  value={saveData.dilation?.rebuyables || {}}
                  onChange={(value) => handleValueChange('dilation.rebuyables', value)}
                  expectation="object"
                  rows={3}
                  fallbackValue={{}}
                />
                {renderValidationIndicator('dilation.rebuyables')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DilationSection; 