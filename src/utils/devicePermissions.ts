type OrientationCallback = (event: DeviceOrientationEvent) => void;

export const requestOrientationPermission = async (
  onOrientationChange: OrientationCallback,
  onPermissionGranted: () => void
): Promise<void> => {
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const permission = await DeviceOrientationEvent.requestPermission();
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
