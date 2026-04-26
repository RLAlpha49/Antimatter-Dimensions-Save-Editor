import React, { useState } from 'react';
import { SectionProps } from './types';
import SectionShell, { SectionShellTab } from './SectionShell';
import { FaCircle, FaArrowUp, FaTrophy } from 'react-icons/fa';
import BigNumberInput from '../BigNumberInput';
import JsonTextareaField from '../JsonTextareaField';
import { SaveType } from '../../services/SaveService';
import { 
  AntimatterDimensionsStruct,
  AndroidStruct as AntimatterDimensionsStructAndroid
} from '../../Struct';

const InfinitySection: React.FC<SectionProps> = ({ 
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

  // Helper function to safely access PC-specific properties
  const isPCFormat = (): boolean => {
    return saveType === SaveType.PC;
  };

  // Cast saveData to specific type when needed
  const pcSaveData = isPCFormat() ? saveData as AntimatterDimensionsStruct : null;
  const androidSaveData = !isPCFormat() ? saveData as AntimatterDimensionsStructAndroid : null;
  const typedSaveData = saveData as any;

  const tabs: SectionShellTab[] = [
    { id: 'general', title: 'General', icon: <FaCircle className="subtab-icon" /> },
    { id: 'upgrades', title: 'Upgrades', icon: <FaArrowUp className="subtab-icon" /> },
    { id: 'challenges', title: 'Challenges', icon: <FaTrophy className="subtab-icon" /> },
  ];

  return (
    <SectionShell
      id="infinity"
      title="Infinity"
      tabs={tabs}
      activeTab={activeSubtab}
      onTabChange={handleSubtabClick}
    >
        
        {/* General Subtab */}
        <div className={`subtab-content ${activeSubtab === 'general' ? 'active' : ''}`}>
          <div className="resource-group">
            <h4>Infinity Resources</h4>
            <div className="infinity-grid">
              <div className="form-group">
                <BigNumberInput
                  label="Infinity Points"
                  value={isPCFormat() ? 
                    (pcSaveData?.infinityPoints || '0') : 
                    (typedSaveData.infinityPoints || {mantissa: 0, exponent: 0})}
                  onChange={(value) => handleValueChange(isPCFormat() ? 
                    'infinityPoints' : 'infinityPoints', value)}
                  saveType={saveType}
                />
                {renderValidationIndicator('infinityPoints')}
              </div>
              
              <div className="form-group">
                <BigNumberInput
                  label="Infinities"
                  value={isPCFormat() ? 
                    (pcSaveData?.infinities || '0') : 
                    (typedSaveData.infinities || {mantissa: 0, exponent: 0})}
                  onChange={(value) => handleValueChange(isPCFormat() ? 
                    'infinities' : 'infinities', value)}
                  saveType={saveType}
                />
                {renderValidationIndicator('infinities')}
              </div>
              
              {isPCFormat() && (
                <div className="form-group">
                  <BigNumberInput
                    label="Infinities Banked"
                    value={pcSaveData?.infinitiesBanked || '0'}
                    onChange={(value) => handleValueChange('infinitiesBanked', value)}
                    saveType={saveType}
                  />
                  {renderValidationIndicator('infinitiesBanked')}
                </div>
              )}
              
              <div className="form-group">
                <BigNumberInput
                  label="Infinity Power"
                  value={isPCFormat() ? 
                    (pcSaveData?.infinityPower || '0') : 
                    (typedSaveData.infinityPower || {mantissa: 0, exponent: 0})}
                  onChange={(value) => handleValueChange('infinityPower', value)}
                  saveType={saveType}
                />
                {renderValidationIndicator('infinityPower')}
              </div>
              
              <div className="form-group">
                <label htmlFor="IPMultPurchases">{isPCFormat() ? 'IP Multiplier Purchases' : 'IP Multiplier Upgrades'}</label>
                <input
                  type="number"
                  id="IPMultPurchases"
                  value={isPCFormat() ? (pcSaveData?.IPMultPurchases || 0) : ((saveData as any).ipMultUpgrades || 0)}
                  onChange={(e) => handleValueChange(isPCFormat() ? 'IPMultPurchases' : 'ipMultUpgrades', parseInt(e.target.value, 10) || 0)}
                />
                {renderValidationIndicator(isPCFormat() ? 'IPMultPurchases' : 'ipMultUpgrades')}
              </div>
            </div>
          </div>
          
          <div className="resource-group">
            <h4>Break Infinity</h4>
            <div className="infinity-grid">
              {isPCFormat() ? (
                <div className="form-group">
                  <label htmlFor="break">Break Infinity</label>
                  <select
                    id="break"
                    value={pcSaveData?.break ? 'true' : 'false'}
                    onChange={(e) => handleValueChange('break', e.target.value === 'true')}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {renderValidationIndicator('break')}
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="brake">Break Infinity</label>
                  <select
                    id="brake"
                    value={typedSaveData.brake ? 'true' : 'false'}
                    onChange={(e) => handleValueChange('brake', e.target.value === 'true')}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {renderValidationIndicator('brake')}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Upgrades Subtab */}
        <div className={`subtab-content ${activeSubtab === 'upgrades' ? 'active' : ''}`}>
          <div className="resource-group">
            <h4>Infinity Upgrades</h4>
            <div className="infinity-grid">
              {isPCFormat() && (
                <>
                  <div className="form-group">
                    <label htmlFor="inf-upgradeBits">Upgrade Bits</label>
                    <input
                      type="number"
                      id="inf-upgradeBits"
                      value={isPCFormat() && pcSaveData?.infinity && 'upgradeBits' in pcSaveData.infinity ? 
                        pcSaveData.infinity.upgradeBits || 0 : 0}
                      onChange={(e) => handleValueChange('infinity.upgradeBits', parseInt(e.target.value))}
                    />
                    {renderValidationIndicator('infinity.upgradeBits')}
                  </div>
                  
                  <div className="form-group">
                    <JsonTextareaField
                      id="inf-generatorUpgradeBits"
                      label="Infinity Upgrades"
                      value={pcSaveData?.infinityUpgrades || []}
                      onChange={(value) => handleValueChange('infinityUpgrades', value)}
                      expectation="array"
                      rows={3}
                      fallbackValue={[]}
                    />
                    {renderValidationIndicator('infinityUpgrades')}
                  </div>
                </>
              )}
              
              {!isPCFormat() && (
                <>
                  <div className="form-group">
                    <label htmlFor="inf-upgradeBits">Upgrade Bits</label>
                    <input
                      type="number"
                      id="inf-upgradeBits"
                      value={(saveData as any).infinityUpgradeBits || 0}
                      onChange={(e) => handleValueChange('infinityUpgradeBits', parseInt(e.target.value, 10) || 0)}
                    />
                    {renderValidationIndicator('infinityUpgradeBits')}
                  </div>

                  <div className="form-group">
                    <JsonTextareaField
                      id="inf-upgrades"
                      label="Infinity Upgrades"
                      value={androidSaveData?.infinity?.upgrades || []}
                      onChange={(value) => handleValueChange('infinity.upgrades', value)}
                      expectation="array"
                      rows={3}
                      fallbackValue={[]}
                    />
                    {renderValidationIndicator('infinity.upgrades')}
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="resource-group">
            <h4>Post-Break Upgrades</h4>
            <div className="infinity-grid">
              <div className="form-group">
                <label htmlFor="postBreak">Post-Break Upgrades</label>
                <input
                  type="number"
                  id="postBreak"
                  value={isPCFormat() 
                    ? (pcSaveData?.break ? 1 : 0) 
                    : (androidSaveData?.infinity?.break ? 1 : 0)}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Challenges Subtab */}
        <div className={`subtab-content ${activeSubtab === 'challenges' ? 'active' : ''}`}>
          <div className="resource-group">
            <h4>Infinity Challenge Status</h4>
            <div className="infinity-grid">
              <div className="form-group">
                <label htmlFor="ic-completed">Completed Challenges</label>
                <input
                  type="number"
                  id="ic-completed"
                  value={isPCFormat() 
                    ? (pcSaveData?.challenge?.infinity?.completedBits || 0)
                    : (androidSaveData?.infinity?.challenge?.unlocked?.length || 0)}
                  onChange={isPCFormat() ? (e) => handleValueChange('challenge.infinity.completedBits', parseInt(e.target.value, 10) || 0) : undefined}
                  readOnly={!isPCFormat()}
                />
                {isPCFormat() && renderValidationIndicator('challenge.infinity.completedBits')}
              </div>
              
              <div className="form-group">
                <label htmlFor="ic-current">Current Challenge</label>
                <select
                  id="ic-current"
                  value={isPCFormat() 
                    ? (pcSaveData?.challenge?.infinity?.current || 0)
                    : (androidSaveData?.infinity?.challenge?.current || 0)}
                  onChange={(e) => handleValueChange(isPCFormat() 
                    ? 'challenge.infinity.current' 
                    : 'infinity.challenge.current', parseInt(e.target.value))}
                >
                  <option value="0">None</option>
                  <option value="1">IC1</option>
                  <option value="2">IC2</option>
                  <option value="3">IC3</option>
                  <option value="4">IC4</option>
                  <option value="5">IC5</option>
                  <option value="6">IC6</option>
                  <option value="7">IC7</option>
                  <option value="8">IC8</option>
                </select>
                {renderValidationIndicator(isPCFormat() 
                  ? 'challenge.infinity.current' 
                  : 'infinity.challenge.current')}
              </div>
            </div>
          </div>
          
          <div className="resource-group">
            <h4>Challenge Records</h4>
            <div className="infinity-grid">
              {Array.from({ length: 8 }, (_, i) => (
                <div className="form-group" key={`ic-${i+1}`}>
                  <label htmlFor={`ic-${i+1}-record`}>IC{i+1} Best</label>
                  <input
                    type="number"
                    id={`ic-${i+1}-record`}
                    value={isPCFormat() 
                      ? (pcSaveData?.challenge?.infinity?.bestTimes?.[i] || 0)
                      : (androidSaveData?.infinity?.challenge?.icr?.[`ic${i+1}`]?.comp || 0)}
                    onChange={(e) => handleValueChange(isPCFormat() 
                      ? `challenge.infinity.bestTimes.${i}` 
                      : `infinity.challenge.icr.ic${i+1}.comp`, parseInt(e.target.value))}
                  />
                  {renderValidationIndicator(isPCFormat() 
                    ? `challenge.infinity.bestTimes.${i}` 
                    : `infinity.challenge.icr.ic${i+1}.comp`)}
                </div>
              ))}
            </div>
          </div>
        </div>
        
    </SectionShell>
  );
};

export default InfinitySection;