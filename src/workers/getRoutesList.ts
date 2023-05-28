import { NOTHING } from "./nothing"

self.onmessage = (e: MessageEvent<string>) => {
    const csvFiles = JSON.parse(e.data)
    let routesFile = csvFiles["routes.txt"]
    self.postMessage(JSON.stringify(routesFile.map((route:any) => ({ value: String(route.route_id), label: String(route.route_long_name) }))))
}
