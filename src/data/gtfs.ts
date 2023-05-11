interface Data {
  name: string
  agency_id: string
  shapes: [number, number][]
  stops: Stop[]
}

interface Stop {
  name: string
  lat: number
  lon: number
  times: string[]
}
declare global {
  interface Window {
    mapData: Data;
  }
}

const data = window.mapData
const shapes = data.shapes
const stops = data.stops

export default {shapes, stops}