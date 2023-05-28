import { MapContainer, TileLayer, Polyline, Marker, Tooltip, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { CsvFIles, RouteData, Stop } from './data/gtfs'
import { Avatar, CheckIcon, Grid, LoadingOverlay, Paper, SegmentedControl, Select, Stack, Text, Timeline } from '@mantine/core'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { LatLngExpression, icon } from 'leaflet'
import { IconMap2, IconX } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import _ from "lodash"
import { CheckZipRequiredFiles, extractFiles } from './data/process'

function App(): JSX.Element {

  const [loadingRoute, setLoadingRoute] = useState<boolean>(false)
  const [loadingRouteData, setLoadingRouteData] = useState<boolean>(false)
  const [csvFiles, setCsvFiles] = useState<CsvFIles>({})
  const [gtfsRoutes, setGtfsRoutes] = useState<{ value: string, label: string }[]>([])
  const [mapCenter, setMapCenter] = useState<[number, number]>(window.leaflet.center)
  const [mapZoom, setMapZoom] = useState<number>(window.leaflet.zoom)
  const [currentRoute, setCurrentRoute] = useState<RouteData>()
  const [currentStop, setCurrentStop] = useState<number>(0)
  const [currentStopData, setCurrentStopData] = useState<Stop>()
  const [currentTripDir, setCurrentTripDir] = useState<"aller" | "retour">("aller")
  const getRouteData: Worker = useMemo(
    () => new Worker(new URL("./workers/getRouteData.ts", import.meta.url)
    ),
    []
  );

  const getRoutesList: Worker = useMemo(
    () => new Worker(new URL("./workers/getRoutesList.ts", import.meta.url)
    ),
    []
  );

  function MapComponent() {

    const map = useMap()

    map.flyTo(mapCenter, mapZoom, { animate: true, easeLinearity: 0.25, duration: 1, noMoveStart: true })

    let iconDefault = icon({
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
      shadowUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAApCAQAAAACach9AAACMUlEQVR4Ae3ShY7jQBAE0Aoz/f9/HTMzhg1zrdKUrJbdx+Kd2nD8VNudfsL/Th///dyQN2TH6f3y/BGpC379rV+S+qqetBOxImNQXL8JCAr2V4iMQXHGNJxeCfZXhSRBcQMfvkOWUdtfzlLgAENmZDcmo2TVmt8OSM2eXxBp3DjHSMFutqS7SbmemzBiR+xpKCNUIRkdkkYxhAkyGoBvyQFEJEefwSmmvBfJuJ6aKqKWnAkvGZOaZXTUgFqYULWNSHUckZuR1HIIimUExutRxwzOLROIG4vKmCKQt364mIlhSyzAf1m9lHZHJZrlAOMMztRRiKimp/rpdJDc9Awry5xTZCte7FHtuS8wJgeYGrex28xNTd086Dik7vUMscQOa8y4DoGtCCSkAKlNwpgNtphjrC6MIHUkR6YWxxs6Sc5xqn222mmCRFzIt8lEdKx+ikCtg91qS2WpwVfBelJCiQJwvzixfI9cxZQWgiSJelKnwBElKYtDOb2MFbhmUigbReQBV0Cg4+qMXSxXSyGUn4UbF8l+7qdSGnTC0XLCmahIgUHLhLOhpVCtw4CzYXvLQWQbJNmxoCsOKAxSgBJno75avolkRw8iIAFcsdc02e9iyCd8tHwmeSSoKTowIgvscSGZUOA7PuCN5b2BX9mQM7S0wYhMNU74zgsPBj3HU7wguAfnxxjFQGBE6pwN+GjME9zHY7zGp8wVxMShYX9NXvEWD3HbwJf4giO4CFIQxXScH1/TM+04kkBiAAAAAElFTkSuQmCC",
      iconRetinaUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAABSCAMAAAAhFXfZAAAC91BMVEVMaXEzeak2f7I4g7g3g7cua5gzeKg8hJo3grY4g7c3grU0gLI2frE0daAubJc2gbQwd6QzeKk2gLMtd5sxdKIua5g1frA2f7IydaM0e6w2fq41fK01eqo3grgubJgta5cxdKI1f7AydaQydaMxc6EubJgvbJkwcZ4ubZkwcJwubZgubJcydqUydKIxapgubJctbJcubZcubJcvbJYubJcvbZkubJctbJctbZcubJg2f7AubJcrbZcubJcubJcua5g3grY0fq8ubJcubJdEkdEwhsw6i88vhswuhcsuhMtBjMgthMsrg8srgss6is8qgcs8i9A9iMYtg8spgcoogMo7hcMngMonf8olfso4gr8kfck5iM8jfMk4iM8he8k1fro7itAgesk2hs8eecgzfLcofssdeMg0hc4cd8g2hcsxeLQbdsgZdcgxeLImfcszhM0vda4xgckzhM4xg84wf8Yxgs4udKsvfcQucqhUndROmdM1fK0wcZ8vb5w0eqpQm9MzeKhXoNVcpdYydKNWn9VZotVKltJFjsIwcJ1Rms9OlslLmtH///8+kc9epdYzd6dbo9VHkMM2f7FHmNBClM8ydqVcpNY9hro3gLM9hLczealQmcw3fa46f7A8gLMxc6I3eagyc6FIldJMl9JSnNRSntNNl9JPnNJFi75UnM9ZodVKksg8kM45jc09e6ZHltFBk883gbRBh7pDk9EwcaBzn784g7dKkcY2i81Om9M7j85Llc81is09g7Q4grY/j9A0eqxKmdFFltBEjcXf6fFImdBCiLxJl9FGlNFBi78yiMxVndEvbpo6js74+vx+psPP3+o/ks5HkcpGmNCjwdZCkNDM3ehYoNJEls+lxNkxh8xHks0+jdC1zd5Lg6r+/v/H2ufz9/o3jM3t8/edvdM/k89Th61OiLBSjbZklbaTt9BfptdjmL1AicBHj8hGk9FAgK1dkLNTjLRekrdClc/k7fM0icy0y9tgp9c4jc2NtM9Dlc8zicxeXZn3AAAAQ3RSTlMAHDdTb4yPA+LtnEQmC4L2EmHqB7XA0d0sr478x4/Yd5i1zOfyPkf1sLVq4Nh3FvjxopQ2/STNuFzUwFIwxKaejILpIBEV9wAABhVJREFUeF6s1NdyFEcYBeBeoQIhRAkLlRDGrhIgY3BJL8CVeKzuyXFzzjkn5ZxzzuScg3PO8cKzu70JkO0LfxdTU//pM9vTu7Xgf6KqOVTb9X7toRrVEfBf1HTVjZccrT/2by1VV928Yty9ZbVuucdz90frG8DBjl9pVApbOstvmMuvVgaNXSfAAd6pGxpy6yxf5ph43pS/4f3uoaGm2rdu72S9xzOvMymkZFq/ptDrk90mhW7e4zl7HLzhxGWPR20xmSxJ/VqldG5m9XhaVOA1DadsNh3Pu5L2N6QtPO/32JpqQBVVk20oy/Pi2s23WEvyfHbe1thadVQttvm7Llf65gGmXK67XtupyoM7HQhmXdLS8oGWJNeOJ3C5fG5XCEJnkez3/oFdsvgJ4l2ANZwhrJKk/7OSXa+3Vw2WJMlKnGkobouYk6T0TyX30klOUnTD9HJ5qpckL3EW/w4XF3Xd0FGywXUrstrclVsqz5Pd/sXFYyDnPdrLcQODmGOK47IZb4CmibmMn+MYRzFZ5jg33ZL/EJrWcszHmANy3ARBK/IXtciJy8VsitPSdE3uuHxzougojcUdr8/32atnz/ev3f/K5wtpxUTpcaI45zusVDpYtZi+jg0oU9b3x74h7+n9ABvYEZeKaVq0sh0AtLKsFtqNBdeT0MrSzwwlq9+x6xAO4tgOtSzbCjrNQQiNvQUbUEubvzBUeGw26yDCsRHCoLkTHDa7IdOLIThs/gHvChszh2CimE8peRs47cxANI0lYNB5y1DljpOF0IhzBDPOZnDOqYYbeGKECbPzWnXludPphw5c2YBq5zlwXphIbO4VDCZ0gnPfUO1TwZoYwAs2ExPCedAu9DAjfQUjzITQb3jNj0KG2Sgt6BHaQUdYzWz+XmBktOHwanXjaSTcwwziBcuMOtwBmqPrTOxFQR/DRKKPqyur0aiW6cULYsx6tBm0jXpR/AUWR6HRq9WVW6MRhIq5jLyjbaCTDCijyYJNpCajdyobP/eTw0iexBAKkJ3gA5KcQb2zBXsIBckn+xVv8jkZSaEFHE+jFEleAEfayRU0MouNoBmB/L50Ai/HSLIHxcrpCvnhSQAuakKp2C/YbCylJjXRVy/z3+Kv/RrNcCo+WUzlVEhzKffnTQnxeN9fWF88fiNCUdSTsaufaChKWInHeysygfpIqagoakW+vV20J8uyl6TyNKEZWV4oRSPyCkWpgOLSbkCObT8o2r6tlG58HQquf6O0v50tB7JM7F4EORd2dx/K0w/KHsVkLPaoYrwgP/y7krr3SSMA4zj+OBgmjYkxcdIJQyQRKgg2viX9Hddi9UBb29LrKR7CVVEEEXWojUkXNyfTNDE14W9gbHJNuhjDettN3ZvbOvdOqCD3Jp/9l+/wJE+9PkYGjx/fqkys3S2rMozM/o2106rfMUINo6hVqz+eu/hd1c4xTg0TAfy5kV+4UG6+IthHTU9woWmxuKNbTfuCSfovBCxq7EtHqvYL4Sm6F8GVxsSXHMQ07TOi1DKtZxjWaaIyi4CXWjxPccUw8WVbMYY5wxC1mzEyXMJWkllpRloi+Kkoq69sxBTlElF6aAxYUbjXNlhlDZilDnM4U5SlN5biRsRHnbx3mbeWjEh4mEyiuJDl5XcWVmX5GvNkFgLWZM5qwsop4/AWfLhU1cR7k1VVvcYCWRkOI6Xy5gmnphCYIkvzuNYzHzosq2oNk2RtSs8khfUOfHIDgR6ysYBaMpl4uEgk2U/oJTs9AaTSwma7dT69geAE2ZpEjUsn2ieJNHeKfrI3EcAGJ2ZaNgVuC8EBctCLc57P5u5led6IOBkIYkuQMrmmjChs4VkfOerHqSBkPzZlhe06RslZ3zMjk2sscqKwY0RcjKK+LWbzd7KiHhkncs/siFJ+V5eXxD34B8nVuJEpGJNmxN2gH3vSvp7J70tF+D1Ej8qUJD1TkErAND2GZwTFg/LubvmgiBG3SOvdlsqFQrkEzJCL1rstlnVFROixZoDDSuXQFHESwVGlcuQcMb/b42NgjLowh5MTDFE3vNB5qStRIErdCQEh6pLPR92anSUb/wAIhldAaDMpGgAAAABJRU5ErkJggg==",
      iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbDNpjszW24mRt28p47v7zq/bXZtrp/lWnXr337j3nPCe85NcypgSFdugCpW5YoDAMRaIMqRi6aKq5E3YqDQO3qAwjVWrD8Ncq/RBpykd8oZUb/kaJutow8r1aP9II0WmLKLIsJyv1w/kqw9Ch2MYdB++12Onxee/QMwvf4/Dk/Lfp/i4nxTXtOoQ4pW5Aj7wpici1A9erdAN2OH64x8OSP9j3Ft3b7aWkTg/Fm91siTra0f9on5sQr9INejH6CUUUpavjFNq1B+Oadhxmnfa8RfEmN8VNAsQhPqF55xHkMzz3jSmChWU6f7/XZKNH+9+hBLOHYozuKQPxyMPUKkrX/K0uWnfFaJGS1QPRtZsOPtr3NsW0uyh6NNCOkU3Yz+bXbT3I8G3xE5EXLXtCXbbqwCO9zPQYPRTZ5vIDXD7U+w7rFDEoUUf7ibHIR4y6bLVPXrz8JVZEql13trxwue/uDivd3fkWRbS6/IA2bID4uk0UpF1N8qLlbBlXs4Ee7HLTfV1j54APvODnSfOWBqtKVvjgLKzF5YdEk5ewRkGlK0i33Eofffc7HT56jD7/6U+qH3Cx7SBLNntH5YIPvODnyfIXZYRVDPqgHtLs5ABHD3YzLuespb7t79FY34DjMwrVrcTuwlT55YMPvOBnRrJ4VXTdNnYug5ucHLBjEpt30701A3Ts+HEa73u6dT3FNWwflY86eMHPk+Yu+i6pzUpRrW7SNDg5JHR4KapmM5Wv2E8Tfcb1HoqqHMHU+uWDD7zg54mz5/2BSnizi9T1Dg4QQXLToGNCkb6tb1NU+QAlGr1++eADrzhn/u8Q2YZhQVlZ5+CAOtqfbhmaUCS1ezNFVm2imDbPmPng5wmz+gwh+oHDce0eUtQ6OGDIyR0uUhUsoO3vfDmmgOezH0mZN59x7MBi++WDL1g/eEiU3avlidO671bkLfwbw5XV2P8Pzo0ydy4t2/0eu33xYSOMOD8hTf4CrBtGMSoXfPLchX+J0ruSePw3LZeK0juPJbYzrhkH0io7B3k164hiGvawhOKMLkrQLyVpZg8rHFW7E2uHOL888IBPlNZ1FPzstSJM694fWr6RwpvcJK60+0HCILTBzZLFNdtAzJaohze60T8qBzyh5ZuOg5e7uwQppofEmf2++DYvmySqGBuKaicF1blQjhuHdvCIMvp8whTTfZzI7RldpwtSzL+F1+wkdZ2TBOW2gIF88PBTzD/gpeREAMEbxnJcaJHNHrpzji0gQCS6hdkEeYt9DF/2qPcEC8RM28Hwmr3sdNyht00byAut2k3gufWNtgtOEOFGUwcXWNDbdNbpgBGxEvKkOQsxivJx33iow0Vw5S6SVTrpVq11ysA2Rp7gTfPfktc6zhtXBBC+adRLshf6sG2RfHPZ5EAc4sVZ83yCN00Fk/4kggu40ZTvIEm5g24qtU4KjBrx/BTTH8ifVASAG7gKrnWxJDcU7x8X6Ecczhm3o6YicvsLXWfh3Ch1W0k8x0nXF+0fFxgt4phz8QvypiwCCFKMqXCnqXExjq10beH+UUA7+nG6mdG/Pu0f3LgFcGrl2s0kNNjpmoJ9o4B29CMO8dMT4Q5ox8uitF6fqsrJOr8qnwNbRzv6hSnG5wP+64C7h9lp30hKNtKdWjtdkbuPA19nJ7Tz3zR/ibgARbhb4AlhavcBebmTHcFl2fvYEnW0ox9xMxKBS8btJ+KiEbq9zA4RthQXDhPa0T9TEe69gWupwc6uBUphquXgf+/FrIjweHQS4/pduMe5ERUMHUd9xv8ZR98CxkS4F2n3EUrUZ10EYNw7BWm9x1GiPssi3GgiGRDKWRYZfXlON+dfNbM+GgIwYdwAAAAASUVORK5CYII="
    })

    return <>
      <TileLayer
        url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      {
        currentRoute === undefined ? <></> :
          <>
            {
              Object.values(_.sortBy(currentRoute[currentTripDir].stops, ["sequence"])).map((stop, index: number) =>
                <Marker icon={iconDefault} key={index} position={[stop.lat, stop.lon]} >
                  <Tooltip direction="top" offset={[-15, -15]} permanent>
                    ({stop.sequence}) {stop.name}
                    <br />
                  </Tooltip>
                </Marker>)
            }
            <Polyline pathOptions={{ color: "teal", opacity: 0.45, weight: 10 }} positions={currentRoute[currentTripDir].shapes} />
          </>
      }
    </>
  }

  useEffect(() => {
    const url = window.gtfsFile;
    extractFiles(url)
      .then(result => {
        setLoadingRoute(true)
        setTimeout(() => {
          getRoutesList.postMessage(JSON.stringify(result["routes.txt"]))
        }, 1000)
        setCsvFiles(result)
      })
      .catch(error => {
        console.error('Erreur lors de l\'extraction des fichiers:', error);
      });

  }, [])

  useEffect(() => {
    getRoutesList.onmessage = (e: MessageEvent<string>) => {
      setGtfsRoutes(JSON.parse(e.data))
      setLoadingRoute(false)
    }
    getRouteData.onmessage = (e: MessageEvent<string>) => {
      let route: RouteData = JSON.parse(e.data)
      setCurrentRoute(route)
      setCurrentRoute(route)
      setCurrentStop(0)
      setMapZoom(18)

      if (Object.keys(route.aller.stops).length > 0) {
        setMapCenter([_.sortBy(route.aller.stops, ["sequence"])[0].lat, _.sortBy(route.aller.stops, ["sequence"])[0].lon])
        setCurrentTripDir('aller')
        setCurrentStopData(_.sortBy(route.aller.stops, ["sequence"])[0])
      } else if (Object.keys(route.retour.stops).length) {
        setMapCenter([_.sortBy(route.retour.stops, ["sequence"])[0].lat, _.sortBy(route.retour.stops, ["sequence"])[0].lon])
        setCurrentTripDir('retour')
        setCurrentStopData(_.sortBy(route.retour.stops, ["sequence"])[0])

      }
      setLoadingRouteData(false)

    }
  }, [])

  return (
    <>
      {
        currentStopData != undefined &&
        <Paper style={{ zIndex: 10000, maxHeight: "25vh", overflowY: "scroll", position: "absolute", top: "0.5cm", right: "0.5cm", padding: "0.3cm", width: "15vw", opacity: 0.9 }}>
          <Text fw={800}>({currentStopData.sequence}) {currentStopData.name}</Text>
          <Text color='dimmed' fz={"sm"}>Horaires de passages</Text>
          {currentStopData.times.map((time, index: number) => <Fragment key={index}><small>{time}</small><br /></Fragment>)}
        </Paper>
      }

      <Grid gutter={0}>
        <Grid.Col span={3} className='h-screen overflow-y-scroll shadow-2xl'>
          <Stack p={30} spacing={25} className='h-full'>
            <Select
              disabled={loadingRoute || loadingRouteData}
              label="Selectionnez une route"
              placeholder="Recherchez une route"
              data={gtfsRoutes}
              size='sm'
              variant='filled'
              radius={0}
              onChange={(value: string) => {
                if (currentRoute?.route_id !== value) {
                  setLoadingRouteData(true)
                  getRouteData.postMessage(JSON.stringify({ csvFiles, routeId: value }))
                }
              }}
              searchable
              maxDropdownHeight={400}
              nothingFound="Aucun resultat"
            />
            {
              currentRoute === undefined ? <Stack align='center' justify='center' className='h-full'>
                <IconMap2 className={loadingRoute ? "animate-ping" : ""} size={50} opacity={0.4} color='gray' />
                <Text align='center' fz={15} opacity={0.5} color='gray'>{loadingRoute ? "Chargement des routes ..." : "Aucune route sélectionnée"}</Text>
              </Stack> :
                <>
                  <Stack spacing={0}>
                    <Text className='text-gray-500' fz={20} fw={800}>
                      {currentRoute.route_name}
                    </Text>
                    <Text className='text-gray-500'>
                      {currentRoute.agency_id}
                    </Text>
                  </Stack>
                  <Stack>
                    <SegmentedControl
                      value={currentTripDir}
                      size='sx'
                      data={[
                        { label: 'Aller', value: 'aller', disabled: Object.keys(currentRoute.aller.stops).length === 0 },
                        { label: 'Retour', value: 'retour', disabled: Object.keys(currentRoute.retour.stops).length === 0 },
                      ]}
                      color='cyan'
                      onChange={(value: "aller" | "retour") => {
                        setCurrentTripDir(value)
                        setCurrentStop(0)
                        setMapCenter([_.sortBy(currentRoute[value].stops, ["sequence"])[0].lat, _.sortBy(currentRoute[value].stops, ["sequence"])[0].lon])
                        setCurrentStopData(_.sortBy(currentRoute[value].stops, ["sequence"])[0])
                      }}
                    />
                  </Stack>
                  <Timeline style={{ maxHeight: "100vh" }} active={Object.keys(currentRoute[currentTripDir].stops).length} bulletSize={30} lineWidth={1}>
                    {
                      _.sortBy(currentRoute[currentTripDir].stops, ["sequence"]).map((stop: Stop, index: number) =>
                        <Timeline.Item color='gray' key={index} bullet={<Avatar variant={currentStop == index ? 'filled' : 'light'} color={currentStop == index ? 'cyan' : 'gray'} className='cursor-pointer' onClick={() => {
                          setMapZoom(18)
                          setMapCenter([stop.lat, stop.lon])
                          setCurrentStop(index)
                          setCurrentStopData(stop)
                        }} > {stop.sequence}</Avatar>} title={""}>
                          <small>{stop.name}</small>
                        </Timeline.Item>)
                    }
                  </Timeline>
                </>
            }
          </Stack>
        </Grid.Col>
        <Grid.Col className='overflow-y-hidden h-screen' span={9}>
          <MapContainer zoom={mapZoom} center={mapCenter} boxZoom style={{ height: "100vh", padding: 0 }}>
            <MapComponent />
          </MapContainer>
        </Grid.Col>
      </Grid>
      <LoadingOverlay loaderProps={{ size: 'lg', color: "teal", variant: 'dots' }} visible={loadingRouteData} overlayBlur={2} />
    </>
  )

}
export default App;