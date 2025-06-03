declare namespace L {
  function map(id: string, options?: any): any;
  function tileLayer(url: string, options?: any): any;
  function marker(latlng: [number, number], options?: any): any;
  function divIcon(options?: any): any;
  interface LatLng {
    lat: number;
    lng: number;
  }
  
  interface Map {
    setView: (latlng: [number, number], zoom: number) => void;
    setZoom: (zoom: number) => void;
  }
  
  interface Marker {
    setLatLng: (latlng: [number, number]) => void;
    setIcon: (icon: any) => void;
  }
}
