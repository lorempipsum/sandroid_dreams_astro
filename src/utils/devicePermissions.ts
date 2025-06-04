type OrientationCallback = (event: DeviceOrientationEvent) => void;

export const requestOrientationPermission = async (
  onOrientationChange: OrientationCallback,
  onPermissionGranted: () => void
): Promise<void> => {
  if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
    try {
      const permission = await (
        DeviceOrientationEvent as any
      ).requestPermission();
      if (permission === 'granted') {
        window.addEventListener('deviceorientation', onOrientationChange);
        onPermissionGranted();
      }
    } catch (error) {
      console.error('Error requesting device orientation permission:', error);
    }
  } else {
    // For non-iOS devices or when permission is not required
    window.addEventListener('deviceorientation', onOrientationChange);
    onPermissionGranted();
  }
};
