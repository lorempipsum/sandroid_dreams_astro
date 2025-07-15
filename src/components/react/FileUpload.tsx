import React from 'react';
import styles from './FileUpload.module.scss';

interface FileUploadProps {
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  return (
    <div className={styles.fileInputSection}>
      <label htmlFor="image-input" className={styles.fileInputLabel}>
        Choose Images
      </label>
      <input
        id="image-input"
        type="file"
        accept="image/*"
        multiple
        onChange={onFileSelect}
        className={styles.fileInput}
      />
    </div>
  );
};

export default FileUpload;
