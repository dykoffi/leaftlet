interface Trip {
  shapes: [number, number][]
  stops: Stop[]
}

export interface RouteData {
  route_name: string
  agency_id: string
  aller: Trip
  retour: Trip
}
export interface Data {
  [x: string]: RouteData
}

export interface Stop {
  name: string
  lat: number
  lon: number
  times: [string, string][]
}
declare global {
  interface Window {
    gtfsFile: string;
    leaflet: {
      zoom: number;
      center: [number, number];
    }
  }
}
