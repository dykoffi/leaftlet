import { NOTHING } from "./nothing"

self.onmessage = (e: MessageEvent<string>) => {
    self.postMessage(JSON.stringify(JSON.parse(e.data).map((route:any) => ({ value: String(route.route_id), label: String(route.route_long_name) }))))
}
