import React from 'react';
import type { FlipbookSettings } from './types';
import styles from './FlipbookSettingsComponent.module.scss';

interface FlipbookSettingsProps {
  settings: FlipbookSettings;
  onSettingsChange: (settings: FlipbookSettings) => void;
}

const FlipbookSettingsComponent: React.FC<FlipbookSettingsProps> = ({ 
  settings, 
  onSettingsChange 
}) => {
  const handleSettingChange = (key: keyof FlipbookSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className={styles.settingsSection}>
      <h3>Settings</h3>
      <div className={styles.setting}>
        <label>
          Base Duration (ms):
          <input
            type="number"
            value={settings.baseDuration}
            onChange={(e) => handleSettingChange('baseDuration', parseInt(e.target.value) || 200)}
            min="10"
            max="2000"
            step="10"
          />
        </label>
      </div>
      <div className={styles.setting}>
        <label>
          Featured Duration (ms):
          <input
            type="number"
            value={settings.featuredDuration}
            onChange={(e) => handleSettingChange('featuredDuration', parseInt(e.target.value) || 800)}
            min="100"
            max="5000"
            step="20"
          />
        </label>
      </div>
      <div className={styles.setting}>
        <label>
          Transition Duration (ms):
          <input
            type="number"
            value={settings.transitionDuration}
            onChange={(e) => handleSettingChange('transitionDuration', parseInt(e.target.value) || 100)}
            min="10"
            max="500"
            step="10"
          />
        </label>
      </div>
      <div className={styles.setting}>
        <label>
          Preview Quality:
          <select
            value={settings.previewQuality}
            onChange={(e) => handleSettingChange('previewQuality', e.target.value as 'high' | 'medium' | 'low')}
          >
            <option value="high">High (720p) - Better quality</option>
            <option value="medium">Medium (480p) - Balanced</option>
            <option value="low">Low (360p) - Better performance</option>
          </select>
        </label>
      </div>
      <div className={styles.setting}>
        <label>
          Max Preview Size:
          <input
            type="number"
            value={settings.maxPreviewSize}
            onChange={(e) => handleSettingChange('maxPreviewSize', parseInt(e.target.value) || 800)}
            min="400"
            max="1920"
            step="100"
          />
        </label>
      </div>
    </div>
  );
};

export default FlipbookSettingsComponent;
