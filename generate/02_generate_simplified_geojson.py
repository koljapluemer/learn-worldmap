import json
import os

def process_geojson():
    # Read the input GeoJSON file
    with open('generate/worldmap.geo.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Create a new FeatureCollection with the same structure but simplified properties
    simplified_data = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "name": feature['properties']['name_long']
                },
                "geometry": feature['geometry']
            }
            for feature in data['features']
        ]
    }

    # Create the output directory if it doesn't exist
    os.makedirs('src/modules/map-data', exist_ok=True)

    # Save the simplified data (compressed)
    output_path = 'src/modules/map-data/map.geo.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(simplified_data, f, ensure_ascii=False, separators=(',', ':'))

    # Create demo file with just one country (pretty printed)
    demo_data = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "name": "Costa Rica"
                },
                "geometry": next(f['geometry'] for f in data['features'] if f['properties']['name'] == "Costa Rica")
            }
        ]
    }
    demo_path = 'src/modules/map-data/map.demo.geo.json'
    with open(demo_path, 'w', encoding='utf-8') as f:
        json.dump(demo_data, f, ensure_ascii=False, indent=2)

    print(f"Processed {len(simplified_data['features'])} countries")
    print(f"Output saved to {output_path}")
    print(f"Demo file saved to {demo_path}")

if __name__ == '__main__':
    process_geojson()
