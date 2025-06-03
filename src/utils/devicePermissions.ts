type OrientationCallback = (event: DeviceOrientationEvent) => void;

export async function requestDeviceOrientationPermission(): Promise<boolean> {
  // Type guard for requestPermission
  const DeviceOrientationEventAny = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<string>;
  };
  if (typeof DeviceOrientationEventAny.requestPermission === 'function') {
    const permission = await DeviceOrientationEventAny.requestPermission();
    return permission === 'granted';
  }
  // Fallback for browsers that don't require permission
  return true;
}

export const requestOrientationPermission = async (
  onOrientationChange: OrientationCallback,
  onPermissionGranted: () => void
): Promise<void> => {
  const permissionGranted = await requestDeviceOrientationPermission();
  if (permissionGranted) {
    window.addEventListener('deviceorientation', onOrientationChange);
    onPermissionGranted();
  }
};
