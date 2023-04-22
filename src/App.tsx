import { MapContainer, Marker, Popup, TileLayer, GeoJSON, LayersControl, FeatureGroup, LayerGroup, Circle, Rectangle } from 'react-leaflet'
import geodata from './assets/abidjanGEO.json'
import 'leaflet/dist/leaflet.css'
import geoFeatures from './data/geoFeatures'
import { Autocomplete, Select } from '@mantine/core'
import { GridLayer } from 'leaflet'
const center = [51.505, -0.09]
const rectangle = [
  [51.49, -0.08],
  [51.5, -0.06],
]
function App() {
  return (
    <MapContainer boxZoom style={{ height: "100vh", padding: 0 }} center={[5.37, -4]} zoom={13}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Autocomplete
        label="Your favorite framework/library"
        placeholder="Pick one"
        data={['React', 'Angular', 'Svelte', 'Vue']}
        />
      <LayersControl position='bottomright' sortLayers={true}>
        {
          geoFeatures.map((feature, index) => {
            return <LayersControl.Overlay key={index} name={feature.properties.name.toLowerCase()}>
              <FeatureGroup interactive pathOptions={{ color: 'green', opacity: 0.4, weight: 10 }}>
                <GeoJSON data={{ type: 'Feature', ...feature }} />
                <Popup interactive closeButton={false}  >
                  <p className='font-bold text-xl text-gray-400'>{feature.properties.name}</p>
                  <div className="text-gray-500">
                    <b>Operator : </b> {feature.properties.operator} <br />
                    <b>Network : </b> {feature.properties.network} <br />
                    <b>Opening Hours : </b> {feature.properties.opening_hours} <br />
                    <b>Frequency : </b> {feature.properties.frequency} <br />
                  </div>
                </Popup>
              </FeatureGroup>
            </LayersControl.Overlay>

          })
        }
      </LayersControl>
    </MapContainer>
  )

}
export default App;