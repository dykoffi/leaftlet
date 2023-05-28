import { RouteData } from "../data/gtfs";

self.onmessage = (e: MessageEvent<string>) => {

  let data = JSON.parse(e.data);

  let csvFiles = data.csvFiles;
  let routeId = data.routeId;

  let routes = csvFiles["routes.txt"]
  let stops = csvFiles["stops.txt"]
  let trips = csvFiles["trips.txt"]
  let shapes = csvFiles["shapes.txt"]
  let stopTimes = csvFiles["stop_times.txt"]

  routes
    .filter((route: any) => route?.route_id === routeId)
    .forEach((route: any) => {

      let routeId = route?.route_id
      let agencyId = route?.agency_id
      let routeName = route?.route_long_name

      let res: RouteData = {
        agency_id: agencyId,
        route_id: routeId,
        route_name: routeName,
        aller: {
          shapes: [],
          stops: {}
        },
        retour: {
          shapes: [],
          stops: {}
        }
      }

      trips
        .filter((trip: any) => trip?.route_id === routeId)
        .forEach((trip: any) => {

          let tripDir = trip?.direction_id
          shapes
            .filter((shape: any) => shape?.shape_id === trip.shape_id)
            .forEach((shape: any) => {
              if (parseInt(tripDir) == 0) {
                res.aller.shapes.push([parseFloat(shape?.shape_pt_lat), parseFloat(shape?.shape_pt_lon)])
              } else {
                res.retour.shapes.push([parseFloat(shape?.shape_pt_lat), parseFloat(shape?.shape_pt_lon)])
              }
            })

          stopTimes
            .filter((stopTime: any) => stopTime.trip_id === trip.trip_id)
            .forEach((stopTime: any) => {
              stops
                .filter((stop: any) => stop.stop_id === stopTime.stop_id)
                .forEach((stop: any, index: number) => {

                  let lat = parseFloat(stop.stop_lat)
                  let lon = parseFloat(stop.stop_lon)
                  let name = stop.stop_name
                  let sequence = parseInt(stopTime.stop_sequence)
                  let time: string = `${stopTime.arrival_time} - ${stopTime.departure_time}`
                  let times: string[] = []

                  // stop


                  if (parseInt(tripDir) == 0) {
                    if (res.aller.stops[stop.stop_id]) {
                      times = [...res.aller.stops[stop.stop_id].times, time]
                    }
                    res.aller.stops[stop.stop_id] = { lat, lon, name, sequence, times }
                  } else {
                    if (res.aller.stops[stop.stop_id]) {
                      times = [...res.aller.stops[stop.stop_id].times, time]
                    }
                    res.retour.stops[stop.stop_id] = { lat, lon, name, sequence, times }
                  }
                })
            })
        })

      self.postMessage(JSON.stringify(res))

    })
}