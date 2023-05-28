import JSZip from "jszip";
import papa from "papaparse"
var requiredFiles: string[] = [
  "agency.txt",
  "stops.txt",
  "routes.txt",
  "trips.txt",
  "shapes.txt",
  "stop_times.txt",
]

interface MapFile { [x: string]: JSZip.JSZipObject }

export function extractFiles(url: string): Promise<{ [x: string]: any[] }> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(url);
      const data = await response.arrayBuffer();
      const ziprc = new JSZip();

      await ziprc.loadAsync(data);

      let missingFiles = []
      let csvFiles: { [x: string]: any[] } = {}

      ziprc.forEach(async (relativePath, file) => {
        if (!requiredFiles.includes(file.name)) {
          missingFiles.push(file.name)
        } else {
          const text = await file.async('text');
          const csvData = papa.parse(text, { header: true }).data;
          csvFiles[file.name] = csvData
        }
      });

      resolve(csvFiles);

    } catch (error) {
      reject(error);
    }
  })
}

export function CheckZipRequiredFiles(Files: MapFile) {
  let missingFiles = requiredFiles.filter((file: string, index: number) => !Files[file])
  if (missingFiles.length > 0) {
    console.log("Missing files: " + missingFiles)
  }
}