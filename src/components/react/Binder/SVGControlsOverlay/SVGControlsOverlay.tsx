import React, { useState } from 'react';
import styles from './SVGControlsOverlay.module.scss';

interface SVGControlsOverlayProps {
  onClose: () => void;
  svgScale: number;
  onSvgScaleChange: (value: number) => void;
  svgRotation?: number;
  onSvgRotationChange?: (value: number) => void;
  onRecenter: () => void;
  onSVGImport: (svgContent: string) => void;
  minDistance: number;
  maxDistance: number;
  onMinDistanceChange: (value: number) => void;
  onMaxDistanceChange: (value: number) => void;
  progress?: { completed: number; total: number };
  maxPoints?: number;
  showSvgPath: boolean;
  onToggleSvgPath: (value: boolean) => void;
  totalPoints: number;
}

const SVGControlsOverlay: React.FC<SVGControlsOverlayProps> = ({
  onClose,
  svgScale,
  onSvgScaleChange,
  svgRotation = 0,
  onSvgRotationChange,
  onRecenter,
  onSVGImport,
  minDistance,
  maxDistance,
  onMinDistanceChange,
  onMaxDistanceChange,
  progress,
  maxPoints = 1000,
  showSvgPath,
  onToggleSvgPath,
  totalPoints
}) => {
  const [activeTab, setActiveTab] = useState<'controls' | 'import'>('controls');
  const [svgPreview, setSvgPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSvgPreview(content);
      onSVGImport(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className={styles.overlay} onClick={() => onClose()}>
      <div className={styles.controlPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>SVG Path Tool</h3>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close controls"
          >
            ×
          </button>
        </div>
        
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'controls' ? styles.active : ''}`}
            onClick={() => setActiveTab('controls')}
          >
            Controls
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'import' ? styles.active : ''}`}
            onClick={() => setActiveTab('import')}
          >
            Import SVG
          </button>
        </div>
        
        {activeTab === 'controls' && (
          <>
            {progress && (
              <div className={styles.progressSection}>
                <div className={styles.toggleRow}>
                  <span className={styles.statusText}>
                    {showSvgPath ? 'SVG Path Active' : 'SVG Path Hidden'}
                  </span>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox" 
                      checked={showSvgPath}
                      onChange={(e) => onToggleSvgPath(e.target.checked)} 
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                
                <span>Progress: {progress.completed}/{progress.total} points</span>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${(progress.completed / progress.total) * 100}%` }} 
                  />
                </div>
              </div>
            )}
            
            <div className={styles.controlsGrid}>
              <div className={styles.controlGroup}>
                <label>Scale</label>
                <div className={styles.controlRow}>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={svgScale}
                    onChange={(e) => onSvgScaleChange(Number(e.target.value))}
                  />
                  <span>{svgScale.toFixed(1)}×</span>
                </div>
              </div>
              
              {onSvgRotationChange && (
                <div className={styles.controlGroup}>
                  <label>Rotation</label>
                  <div className={styles.controlRow}>
                    <input
                      type="range"
                      min="0"
                      max="359"
                      value={svgRotation}
                      onChange={(e) => onSvgRotationChange(Number(e.target.value))}
                    />
                    <span>{svgRotation}°</span>
                  </div>
                </div>
              )}
              
              <div className={styles.controlGroup}>
                <label>Min Distance</label>
                <div className={styles.controlRow}>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={minDistance}
                    onChange={(e) => onMinDistanceChange(Number(e.target.value))}
                  />
                  <span>{minDistance}m</span>
                </div>
              </div>
              
              <div className={styles.controlGroup}>
                <label>Max Distance</label>
                <div className={styles.controlRow}>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={maxDistance}
                    onChange={(e) => onMaxDistanceChange(Number(e.target.value))}
                  />
                  <span>{maxDistance}m</span>
                </div>
              </div>
            </div>
            
            <div className={styles.statusInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Total Points:</span>
                <span className={styles.infoValue}>{totalPoints}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Max Points:</span>
                <span className={styles.infoValue}>{maxPoints}</span>
              </div>
            </div>
            
            <div className={styles.buttonRow}>
              <button 
                className={styles.recenterButton}
                onClick={onRecenter}
              >
                Recenter SVG
              </button>
            </div>
          </>
        )}
        
        {activeTab === 'import' && (
          <div className={styles.importPanel}>
            <div className={styles.fileInput}>
              <label>Select SVG File</label>
              <input type="file" accept=".svg" onChange={handleFileChange} />
            </div>
            
            {svgPreview && (
              <div className={styles.preview}>
                <h4>Preview:</h4>
                <div className={styles.svgContainer} dangerouslySetInnerHTML={{ __html: svgPreview }} />
              </div>
            )}
            
            <p className={styles.importNote}>
              Import an SVG file to create a path to follow. The path will be centered at your current location.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SVGControlsOverlay;
