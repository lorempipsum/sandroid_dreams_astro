export interface ImageData {
  id: string;
  file: File;
  url: string;
  previewUrl: string; // Smaller version for preview
  isFeatured: boolean;
  originalWidth: number;
  originalHeight: number;
}

export interface FlipbookSettings {
  baseDuration: number; // base duration in ms
  featuredDuration: number; // duration for featured images in ms
  transitionDuration: number; // fade transition duration in ms
  previewQuality: 'high' | 'medium' | 'low'; // preview quality for performance
  maxPreviewSize: number; // max width/height for preview images
}

export interface ProgressInfo {
  current: number;
  total: number;
}
