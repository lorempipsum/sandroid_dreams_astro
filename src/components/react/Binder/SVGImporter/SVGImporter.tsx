import React, { useState } from 'react';
import styles from './SVGImporter.module.scss';

interface SVGImporterProps {
  onSVGImport: (svgContent: string) => void;
  minDistance: number;
  maxDistance: number;
  onMinDistanceChange: (value: number) => void;
  onMaxDistanceChange: (value: number) => void;
  maxPoints?: number; // Add this prop
  svgScale: number;
  onSvgScaleChange: (value: number) => void;
}

const SVGImporter: React.FC<SVGImporterProps> = ({
  onSVGImport,
  minDistance,
  maxDistance,
  onMinDistanceChange,
  onMaxDistanceChange,
  maxPoints = 1000, // Default to 1000
  svgScale,
  onSvgScaleChange
}) => {
  const [svgPreview, setSvgPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSvgPreview(content);
      onSVGImport(content); // This now just saves the content to state
    };
    reader.readAsText(file);
  };
  
  // Add live feedback for parameters
  const handleMinDistanceChange = (value: number) => {
    onMinDistanceChange(value);
    // We don't need to trigger a re-import since the parent useEffect will handle it
  };
  
  const handleMaxDistanceChange = (value: number) => {
    onMaxDistanceChange(value);
    // We don't need to trigger a re-import since the parent useEffect will handle it
  };

  const handleScaleChange = (value: number) => {
    onSvgScaleChange(value);
  };

  return (
    <div className={styles.importer}>
      <h3>Import SVG Path</h3>
      
      <div className={styles.fileInput}>
        <input type="file" accept=".svg" onChange={handleFileChange} />
      </div>
      
      <div className={styles.settings}>
        <div className={styles.setting}>
          <label>Min Distance (meters)</label>
          <input 
            type="range" 
            min={1} 
            max={50} 
            value={minDistance}
            onChange={(e) => handleMinDistanceChange(Number(e.target.value))}
          />
          <span>{minDistance}m</span>
        </div>
        
        <div className={styles.setting}>
          <label>Max Distance (meters)</label>
          <input 
            type="range" 
            min={10} 
            max={100} 
            value={maxDistance}
            onChange={(e) => handleMaxDistanceChange(Number(e.target.value))}
          />
          <span>{maxDistance}m</span>
        </div>

        <div className={styles.setting}>
          <label>SVG Scale</label>
          <input 
            type="range" 
            min={0.1} 
            max={50} 
            step={0.1}
            value={svgScale}
            onChange={(e) => handleScaleChange(Number(e.target.value))}
          />
          <span>×{svgScale.toFixed(1)}</span>
        </div>

        <div className={styles.info}>
          <span>Max Points: {maxPoints}</span>
          <p className={styles.note}>
            Complex SVGs will be simplified to stay under the maximum point limit.
          </p>
        </div>
      </div>
      
      {svgPreview && (
        <div className={styles.preview}>
          <div className={styles.previewTitle}>Preview:</div>
          <div dangerouslySetInnerHTML={{ __html: svgPreview }} />
        </div>
      )}
    </div>
  );
};

export default SVGImporter;
