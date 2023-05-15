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
  times: string[]
}
declare global {
  interface Window {
    getGTFSData: () => Data;
    gtfsFile: string;
  }
}

export function getGTFSData(): Promise<Data> {
  return new Promise((resolve, reject) => {
    resolve(window.getGTFSData())
  })
}
