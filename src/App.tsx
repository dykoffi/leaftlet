import { MapContainer, Popup, TileLayer, GeoJSON, LayersControl, FeatureGroup, Polyline, Marker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Data, RouteData, Stop, getGTFSData } from './data/gtfs'
import { icon } from 'leaflet'
import { Avatar, Grid, Loader, LoadingOverlay, SegmentedControl, Select, Stack, Text, TextInput, Timeline } from '@mantine/core'
import { useEffect, useState } from 'react'
import mapIcon from "./assets/marker-icon.png"

function App() {
  // const iconDefault = icon({
  //   iconUrl: mapIcon,


  // })

  const [loading, setLoading] = useState<boolean>(false)
  const [search, setSearch] = useState<string>("")
  const [gtfsData, setGtfsData] = useState<Data>({})
  const [mapCenter, setMapCenter] = useState<[number, number]>([5.31, -4])
  const [currentRoute, setCurrentRoute] = useState<string | null>(null)
  const [currentTripDir, setCurrentTripDir] = useState<"aller" | "retour">("aller")

  useEffect(() => {
    setLoading(true)
    fetch("https://gtfs.onrender.com/file/data?url=http://")
      .then(async (data) => {
        setGtfsData(await data.json());
        // setCurrentRoute(null)
        // setCurrentTripDir("aller")
        // setSearch("")
        setLoading(false)
      })
  }, [])

  return (
    <>
    <Grid gutter={0}>
      <Grid.Col span={3} className='h-screen overflow-y-scroll shadow-2xl'>
        <Stack p={25} spacing={25}>
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
              setCurrentTripDir('aller')
            }}
            searchable
            maxDropdownHeight={400}
            nothingFound="Aucun resultat"

          />
          {
            currentRoute === null ? <></> :
              <>
                <Stack spacing={0}>
                  <Text className='text-gray-500' fz={25} fw={800}>
                    {gtfsData[currentRoute].route_name}
                  </Text>
                  <Text className='text-gray-500'>
                    {gtfsData[currentRoute].agency_id}
                  </Text>

                </Stack>
                {
                  currentRoute != null &&
                  <SegmentedControl
                    value={currentTripDir}
                    data={[
                      { label: 'Aller', value: 'aller' },
                      { label: 'Retour', value: 'retour' },
                    ]}

                    color='blue'

                    onChange={(value: "aller" | "retour") => {
                      setCurrentTripDir(value)
                    }}
                  />
                }

                <Timeline style={{ maxHeight: "100vh" }} active={gtfsData[currentRoute][currentTripDir].stops.length} bulletSize={30} lineWidth={10}>
                  {
                    gtfsData[currentRoute][currentTripDir].stops.map((stop: Stop, index: number) =>
                      <Timeline.Item key={index} bullet={<Avatar color='blue' className='cursor-pointer' onClick={() => {
                        setMapCenter([stop.lat, stop.lon])
                      }} > {index + 1}</Avatar>} title={stop.name}>
                        <Text size="xs" mt={4}>2 hours ago</Text>
                      </Timeline.Item>)
                  }
                </Timeline>
              </>
          }
        </Stack>

      </Grid.Col>
      <Grid.Col className='overflow-y-hidden h-screen' span={9}>
        <MapContainer boxZoom style={{ height: "100vh", padding: 0 }} center={mapCenter} zoom={13}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {
            currentRoute === null ? <></> :
              <>
                {
                  gtfsData[currentRoute][currentTripDir].stops.map((stop: any, index: number) =>
                    <Marker key={index} position={[stop.lat, stop.lon]}>
                      <Tooltip direction="top" offset={[-15, -15]} permanent>
                        ({index + 1}) {stop.name}
                      </Tooltip>
                    </Marker>)
                }
                <Polyline pathOptions={{ color: "lime", opacity: 0.7, weight: 8 }} positions={gtfsData[currentRoute][currentTripDir].shapes} />
              </>
          }

        </MapContainer>
      </Grid.Col>
    </Grid>
    <LoadingOverlay loaderProps={{ size: 'lg', color:"teal", variant: 'dots' }} visible={loading} overlayBlur={2} />
    </>
  )

}
export default App;