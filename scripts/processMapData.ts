import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { countries } from 'countries-list'

// Promisify exec for better error handling
const execAsync = promisify(exec)

// Get current directory in ES modules
const currentFilePath = fileURLToPath(import.meta.url)
const currentDirPath = dirname(currentFilePath)

// Create a mapping from ISO codes to country names
const countryMappings = Object.entries(countries).reduce((acc, [code, country]) => {
  acc[code] = country.name
  return acc
}, {} as Record<string, string>)

// Create a reverse mapping from country names to ISO codes
const reverseCountryMappings = Object.entries(countries).reduce((acc, [code, country]) => {
  acc[country.name.toLowerCase()] = code
  return acc
}, {} as Record<string, string>)

async function downloadFile(url: string, outputPath: string): Promise<void> {
  try {
    await execAsync(`curl -L "${url}" -o "${outputPath}"`)
  } catch (error) {
    throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function unzipFile(zipPath: string, outputDir: string): Promise<void> {
  try {
    await execAsync(`unzip -o "${zipPath}" -d "${outputDir}"`)
  } catch (error) {
    throw new Error(`Failed to unzip file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function convertToGeoJSON(inputPath: string, outputPath: string): Promise<void> {
  try {
    await execAsync(`mapshaper "${inputPath}" -simplify 10% -o format=geojson "${outputPath}"`)
  } catch (error) {
    throw new Error(`Failed to convert to GeoJSON: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function cleanupFiles(files: string[]): Promise<void> {
  for (const file of files) {
    try {
      await fs.unlink(file)
    } catch (error) {
      console.warn(`Warning: Failed to delete ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

async function processMapData(): Promise<void> {
  const downloadUrl = 'https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/50m/cultural/ne_50m_admin_0_countries.zip'
  const rawDataPath = path.join(currentDirPath, '../map-data/raw')
  const processedDataPath = path.join(currentDirPath, '../map-data/processed')
  const zipPath = path.join(rawDataPath, 'countries.zip')
  const shapefilePath = path.join(rawDataPath, 'ne_50m_admin_0_countries.shp')
  const outputPath = path.join(processedDataPath, 'countries.geojson')

  try {
    // Create directories
    console.log('Creating directories...')
    await fs.mkdir(rawDataPath, { recursive: true })
    await fs.mkdir(processedDataPath, { recursive: true })

    // Download and process data
    console.log('Downloading Natural Earth data...')
    await downloadFile(downloadUrl, zipPath)

    console.log('Unzipping file...')
    await unzipFile(zipPath, rawDataPath)

    console.log('Converting to GeoJSON and simplifying...')
    await convertToGeoJSON(shapefilePath, outputPath)

    // Process the GeoJSON
    console.log('Processing country names...')
    const geojsonContent = await fs.readFile(outputPath, 'utf-8')
    const geojson = JSON.parse(geojsonContent)

    geojson.features = geojson.features.map((feature: any) => {
      const isoCode = feature.properties.ISO_A2
      const countryName = countryMappings[isoCode]
      
      if (countryName) {
        feature.properties.name = countryName
      } else {
        console.warn(`No mapping found for ISO code: ${isoCode}`)
      }
      
      return feature
    })

    // Write the processed GeoJSON
    await fs.writeFile(outputPath, JSON.stringify(geojson, null, 2))

    // Clean up
    console.log('Cleaning up...')
    const filesToClean = [
      zipPath,
      shapefilePath,
      path.join(rawDataPath, 'ne_50m_admin_0_countries.dbf'),
      path.join(rawDataPath, 'ne_50m_admin_0_countries.prj'),
      path.join(rawDataPath, 'ne_50m_admin_0_countries.shx')
    ]
    await cleanupFiles(filesToClean)

    console.log('Processing complete!')
  } catch (error) {
    console.error('Error processing map data:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
}

// Run the processing with proper error handling
processMapData().catch((error) => {
  console.error('Fatal error:', error instanceof Error ? error.message : 'Unknown error')
  process.exit(1)
}) 