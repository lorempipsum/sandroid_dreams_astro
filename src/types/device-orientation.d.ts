interface DeviceOrientationEventStatic extends DeviceOrientationEvent {
  requestPermission?: () => Promise<string>;
}

// Extend the standard DeviceOrientationEvent with the webkit-specific properties
interface DeviceOrientationEvent {
  webkitCompassHeading?: number;
  alpha?: number;
}

// Make the DeviceOrientationEvent constructor have the requestPermission method
interface DeviceOrientationEventConstructor {
  prototype: DeviceOrientationEvent;
  new(type: string, eventInitDict?: DeviceOrientationEventInit): DeviceOrientationEvent;
  requestPermission?: () => Promise<string>;
}

interface Window {
  DeviceOrientationEvent: DeviceOrientationEventConstructor;
}
