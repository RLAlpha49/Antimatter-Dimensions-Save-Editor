import React, { useState } from 'react';
import { SectionProps } from './types';
import SectionShell, { SectionShellTab } from './SectionShell';
import { FaHourglassHalf, FaArrowUp, FaTrophy, FaGem } from 'react-icons/fa';
import BigNumberInput from '../BigNumberInput';
import JsonTextareaField from '../JsonTextareaField';

const EternitySection: React.FC<SectionProps> = ({
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

  const tabs: SectionShellTab[] = [
    { id: 'general', title: 'General', icon: <FaHourglassHalf className="subtab-icon" /> },
    { id: 'studies', title: 'Time Studies', icon: <FaGem className="subtab-icon" /> },
    { id: 'challenges', title: 'Challenges', icon: <FaTrophy className="subtab-icon" /> },
  ];

  return (
    <SectionShell
      id="eternity"
      title="Eternity"
      tabs={tabs}
      activeTab={activeSubtab}
      onTabChange={handleSubtabClick}
    >
        
        {/* General Subtab */}
        <div className={`subtab-content ${activeSubtab === 'general' ? 'active' : ''}`}>
          <div className="resource-group">
            <h4>Eternity Resources</h4>
            <div className="eternity-grid">
              <div className="form-group">
                <BigNumberInput
                  label="Eternity Points"
                  value={saveData.eternityPoints || '0'}
                  onChange={(value) => handleValueChange('eternityPoints', value)}
                  saveType={saveType}
                />
                {renderValidationIndicator('eternityPoints')}
              </div>
              
              <div className="form-group">
                <BigNumberInput
                  label="Eternities"
                  value={saveData.eternities || '0'}
                  onChange={(value) => handleValueChange('eternities', value)}
                  saveType={saveType}
                />
                {renderValidationIndicator('eternities')}
              </div>
              
              <div className="form-group">
                <BigNumberInput
                  label="Time Shards"
                  value={saveData.timeShards || '0'}
                  onChange={(value) => handleValueChange('timeShards', value)}
                  saveType={saveType}
                />
                {renderValidationIndicator('timeShards')}
              </div>
              
              <div className="form-group">
                <BigNumberInput
                  label="Tickspeed"
                  value={saveData.tickspeed || '1e+3000'}
                  onChange={(value) => handleValueChange('tickspeed', value)}
                  saveType={saveType}
                />
                {renderValidationIndicator('tickspeed')}
              </div>
              
              <div className="form-group">
                <label htmlFor="totalTickGained">Total Ticks Gained</label>
                <input
                  type="number"
                  id="totalTickGained"
                  value={saveData.totalTickGained || 0}
                  onChange={(e) => handleValueChange('totalTickGained', parseInt(e.target.value))}
                />
                {renderValidationIndicator('totalTickGained')}
              </div>
            </div>
          </div>
          
          <div className="resource-group">
            <h4>Eternity Upgrades</h4>
            <div className="eternity-grid">
              <div className="form-group">
                <label htmlFor="eternity-upgrades">Upgrade Bits</label>
                <input
                  type="number"
                  id="eternity-upgrades"
                  value={saveData.eternityUpgrades?.length || 0}
                  onChange={(e) => handleValueChange('eternityUpgrades', parseInt(e.target.value))}
                />
                {renderValidationIndicator('eternityUpgrades')}
              </div>
            </div>
          </div>
          
          <div className="resource-group">
            <h4>Eternity Milestones</h4>
            <div className="eternity-grid">
              <div className="form-group">
                <label htmlFor="eternity-milestones">Milestone Bits</label>
                <input
                  type="number"
                  id="eternity-milestones"
                  value={saveData.epmultUpgrades || 0}
                  onChange={(e) => handleValueChange('epmultUpgrades', parseInt(e.target.value))}
                />
                {renderValidationIndicator('epmultUpgrades')}
              </div>
            </div>
          </div>
        </div>
        
        {/* Time Studies Subtab */}
        <div className={`subtab-content ${activeSubtab === 'studies' ? 'active' : ''}`}>
          <div className="resource-group">
            <h4>Time Studies</h4>
            <div className="eternity-grid">
              <div className="form-group">
                <label htmlFor="timestudies-studies">Purchased Studies (comma separated)</label>
                <input
                  type="text"
                  id="timestudies-studies"
                  value={saveData.timestudies?.studies?.join(',') || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const studies = value.split(',')
                      .map(s => parseInt(s.trim()))
                      .filter(n => !isNaN(n));
                    handleValueChange('timestudies.studies', studies);
                  }}
                />
                {renderValidationIndicator('timestudies.studies')}
              </div>
              
              <div className="form-group">
                <label htmlFor="timestudies-theorem">Time Theorems</label>
                <input
                  type="number"
                  id="timestudies-theorem"
                  value={saveData.timestudies?.theorem || 0}
                  onChange={(e) => handleValueChange('timestudies.theorem', parseInt(e.target.value))}
                />
                {renderValidationIndicator('timestudies.theorem')}
              </div>
              
              <div className="form-group">
                <label htmlFor="timestudies-eternityChalls">Unlocked Eternity Challenges</label>
                <input
                  type="text"
                  id="timestudies-eternityChalls"
                  value={saveData.timestudies?.eternityChalls?.join(',') || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const challs = value.split(',')
                      .map(s => parseInt(s.trim()))
                      .filter(n => !isNaN(n));
                    handleValueChange('timestudies.eternityChalls', challs);
                  }}
                />
                {renderValidationIndicator('timestudies.eternityChalls')}
              </div>
            </div>
          </div>
        </div>
        
        {/* Challenges Subtab */}
        <div className={`subtab-content ${activeSubtab === 'challenges' ? 'active' : ''}`}>
          <div className="resource-group">
            <h4>Eternity Challenge Status</h4>
            <div className="eternity-grid">
              <div className="form-group">
                <label htmlFor="ec-current">Current Challenge</label>
                <select
                  id="ec-current"
                  value={saveData.challenge?.eternity?.current || 0}
                  onChange={(e) => handleValueChange('challenge.eternity.current', parseInt(e.target.value))}
                >
                  <option value="0">None</option>
                  <option value="1">EC1</option>
                  <option value="2">EC2</option>
                  <option value="3">EC3</option>
                  <option value="4">EC4</option>
                  <option value="5">EC5</option>
                  <option value="6">EC6</option>
                  <option value="7">EC7</option>
                  <option value="8">EC8</option>
                  <option value="9">EC9</option>
                  <option value="10">EC10</option>
                  <option value="11">EC11</option>
                  <option value="12">EC12</option>
                </select>
                {renderValidationIndicator('challenge.eternity.current')}
              </div>
              
              <div className="form-group">
                <JsonTextareaField
                  id="ec-completed"
                  label="Eternity Challenges Completion"
                  placeholder="Format: [1, 0, 0, ...] (12 values)"
                  value={saveData.challenge?.eternity?.completions || []}
                  onChange={(value) => handleValueChange('challenge.eternity.completions', value)}
                  expectation="array"
                  rows={3}
                  fallbackValue={[]}
                />
                {renderValidationIndicator('challenge.eternity.completions')}
              </div>
            </div>
          </div>
        </div>
        
    </SectionShell>
  );
};

export default EternitySection; 