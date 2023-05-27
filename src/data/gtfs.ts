interface Trip {
  shapes: [number, number][]
  stops: { [x: string]: Stop }
}

export interface CsvFIles { [x: string]: any[] }

export interface RouteData {
  route_name: string
  agency_id: string
  aller: Trip
  retour: Trip
}

export interface Route {
  [x: string]: string
}

export interface Stop {
  name: string
  lat: number
  lon: number
  sequence: number
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
