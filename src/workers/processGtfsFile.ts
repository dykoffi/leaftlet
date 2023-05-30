import JSZip from "jszip";
import papa from "papaparse"

var requiredFiles: string[] = [
  "stops.txt",
  "routes.txt",
  "trips.txt",
  "shapes.txt",
  "stop_times.txt",
]

self.onmessage = (e: MessageEvent<string>) => {

  fetch(e.data)
    .then(async (response) => {
      if (response.status > 399) {
        self.postMessage(JSON.stringify({ error: "Impossible de telecharger le fichier GTFS" }))
      } else {
        const data = await response.arrayBuffer();

        let missingFiles = []
        let csvFiles: { [x: string]: any[] } = {}

        const ziprc = new JSZip();
        ziprc.loadAsync(data)
          .then(result => {
            ziprc.forEach(async (relativePath, file) => {
              if (!requiredFiles.includes(file.name)) {
                missingFiles.push(file.name)
              } else {
                const text = await file.async('text');
                const csvData = papa.parse(text, { header: true }).data;
                csvFiles[file.name] = csvData
              }
            });
            setTimeout(() => {
              self.postMessage(JSON.stringify(csvFiles))
            }, 500);
          }).catch(error => {
            self.postMessage(JSON.stringify({ error: error.message }))
          })
      }
    })
    .catch(error => { self.postMessage(JSON.stringify({ error: "Impossible de telecharger le fichier GTFS" })) })
}