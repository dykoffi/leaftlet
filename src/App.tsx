import { MapContainer, Popup, TileLayer, GeoJSON, LayersControl, FeatureGroup, Polyline, Marker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import geoFeatures from './data/geoFeatures'
import gtfs from './data/gtfs'
import { icon } from 'leaflet'
import { Grid, Input, Stack, Text, TextInput, Timeline } from '@mantine/core'
import { IconCurrentLocation } from "@tabler/icons-react"

function App() {
  const iconDefault = icon({

    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png"
  })
  return (
    <Grid gutter={0}>
      <Grid.Col span={3}>
        <TextInput size='lg' className='' radius={0} placeholder="Rechercher une route" />
        <Stack p={25} spacing={25}>
          <Stack spacing={0}>
            <Text className='text-gray-500' fz={35} fw={800}>
              Areoport - Gare sud
            </Text>
            <Text className='text-gray-500'>SOTRA, Monbus</Text>
          </Stack>

          <Timeline style={{ maxHeight: "100vh" }} active={1} bulletSize={30} lineWidth={10}>
            {
              gtfs.stops.map((stop) =>
                <Timeline.Item bullet={<IconCurrentLocation />} title={stop.name}>
                  <Text size="xs" mt={4}>2 hours ago</Text>
                </Timeline.Item>)
            }

          </Timeline>
        </Stack>
      </Grid.Col>
      <Grid.Col span={9}>
        <MapContainer boxZoom style={{ height: "100vh", padding: 0 }} center={[5.37, -4]} zoom={13}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {
            gtfs.stops.map((stop) =>
              <Marker position={[stop.lat, stop.lon]}>
                <Tooltip>
                  {stop.name}
                </Tooltip>
              </Marker>)
          }
          <Polyline pathOptions={{ color: "lime", opacity: 0.6, weight: 8 }} positions={gtfs.shapes} />
        </MapContainer>
      </Grid.Col>
    </Grid>
  )

}
export default App;