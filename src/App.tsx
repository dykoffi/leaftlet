import { MapContainer, TileLayer, Polyline, Marker, Tooltip, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Data, Stop } from './data/gtfs'
import { Avatar, Grid, LoadingOverlay, SegmentedControl, Select, Stack, Text, Timeline } from '@mantine/core'
import { useEffect, useState } from 'react'
import { LatLng, LatLngExpression, map } from 'leaflet'
import { IconMap2, IconX } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'


function App() {

  const [loading, setLoading] = useState<boolean>(false)
  const [search, setSearch] = useState<string>("")
  const [gtfsData, setGtfsData] = useState<Data>({})
  const [mapCenter, setMapCenter] = useState<[number, number]>([5.381, -4])
  const [mapZoom, setMapZoom] = useState<number>(12)
  const [currentRoute, setCurrentRoute] = useState<string | null>(null)
  const [currentStop, setCurrentStop] = useState<number>(0)
  const [currentTripDir, setCurrentTripDir] = useState<"aller" | "retour">("aller")

  function MapComponent({ zoom, center }: { zoom: number, center: LatLngExpression }) {

    const map = useMap()
    useEffect(() => {
      map.setZoom(zoom)
      map.setView(center)
    }, [])

    return <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {
        currentRoute === null ? <></> :
          <>
            {
              gtfsData[currentRoute][currentTripDir].stops.map((stop: any, index: number) =>
                <Marker key={index} position={[stop.lat, stop.lon]} eventHandlers={{
                  click: (ev) => {
                    setCurrentStop(index)
                    setMapCenter([stop.lat, stop.lon])
                    setMapZoom(18)
                  }
                }}>
                  <Tooltip direction="top" offset={[-15, -15]} permanent>
                    ({index + 1}) {stop.name}
                  </Tooltip>
                </Marker>)
            }
            <Polyline pathOptions={{ color: "lime", opacity: 0.7, weight: 8 }} positions={gtfsData[currentRoute][currentTripDir].shapes} />
          </>
      }
    </>
  }


  useEffect(() => {
    setLoading(true)
    fetch(import.meta.env.VITE_API_HOST + "/file/data?url=" + window.gtfsFile)
      .then(async (res) => {
        if (res.status == 200) {
          setGtfsData(await res.json());
        } else {
          notifications.show({
            title: 'Erreur',
            message: 'Une erreur s\'est produite lors du traitement du gtfs',
            color: 'red',
            icon: <IconX />
          })
        }
        setLoading(false)
      })
  }, [])

  return (
    <>
      <Grid gutter={0}>
        <Grid.Col span={3} className='h-screen overflow-y-scroll shadow-2xl'>
          <Stack p={25} spacing={25} className='h-full'>
            <Select
              label="Selectionnez une route"
              placeholder="Recherchez une route"
              data={!!gtfsData ? Object.keys(gtfsData) : []}
              size='md'
              variant='filled'
              value={search}
              radius={0}
              onChange={(value: string) => {
                setSearch(value)
                setCurrentRoute(value)
                setCurrentStop(0)
                setMapCenter([gtfsData[value].aller.stops[0].lat, gtfsData[value].aller.stops[0].lon])
                setMapZoom(18)
                setCurrentTripDir('aller')
              }}
              searchable
              maxDropdownHeight={400}
              nothingFound="Aucun resultat"
            />
            {
              currentRoute === null ? <Stack align='center' justify='center' className='h-full'>
                <IconMap2 size={88} opacity={0.2} color='gray' />
                <Text fz={18} opacity={0.5} color='gray'>Aucune route sélectionnée</Text>
              </Stack> :
                <>
                  <Stack spacing={0}>
                    <Text className='text-gray-500' fz={25} fw={800}>
                      {gtfsData[currentRoute].route_name}
                    </Text>
                    <Text className='text-gray-500'>
                      {gtfsData[currentRoute].agency_id}
                    </Text>
                  </Stack>
                  <Stack>
                    <SegmentedControl
                      value={currentTripDir}
                      data={[
                        { label: 'Aller', value: 'aller' },
                        { label: 'Retour', value: 'retour' },
                      ]}
                      color='gray'
                      onChange={(value: "aller" | "retour") => {
                        setCurrentTripDir(value)
                        setCurrentStop(0)
                        setMapCenter([gtfsData[currentRoute][value].stops[0].lat, gtfsData[currentRoute][value].stops[0].lon])
                      }}
                    />
                  </Stack>
                  <Timeline style={{ maxHeight: "100vh" }} active={gtfsData[currentRoute][currentTripDir].stops.length} bulletSize={30} lineWidth={1}>
                    {
                      gtfsData[currentRoute][currentTripDir].stops.map((stop: Stop, index: number) =>
                        <Timeline.Item color='gray' key={index} bullet={<Avatar variant={currentStop == index ? 'filled' : 'light'} color={currentStop == index ? 'green' : 'gray'} className='cursor-pointer' onClick={() => {
                          setMapCenter([stop.lat, stop.lon])
                          setMapZoom(18)
                          setCurrentStop(index)
                        }} > {index + 1}</Avatar>} title={stop.name}>
                          {stop.times.map((time, index) => <Text key={index} size="xs" mt={4}> [{time.join(",")}]</Text>)}
                        </Timeline.Item>)
                    }
                  </Timeline>
                </>
            }
          </Stack>
        </Grid.Col>
        <Grid.Col className='overflow-y-hidden h-screen' span={9}>
          <MapContainer boxZoom style={{ height: "100vh", padding: 0 }} center={mapCenter} zoom={mapZoom}>
            <MapComponent zoom={mapZoom} center={mapCenter} />
          </MapContainer>
        </Grid.Col>
      </Grid>
      <LoadingOverlay loaderProps={{ size: 'lg', color: "teal", variant: 'dots' }} visible={loading} overlayBlur={2} />
    </>
  )

}
export default App;