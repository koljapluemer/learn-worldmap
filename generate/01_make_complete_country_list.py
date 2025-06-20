import json
import os

def extract_all_countries():
    # Get the path to the GeoJSON file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    geo_json_path = 'generate/worldmap.geo.json'
    
    try:
        # Read the GeoJSON file
        with open(geo_json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Extract all countries
        all_countries = []
        for feature in data['features']:
            country_name = feature['properties'].get('name_long')
            if country_name:
                all_countries.append(country_name)
        
        # Sort the list alphabetically
        all_countries.sort()
        
        # Save to all-countries.json
        output_path = 'src/modules/map-data/country-lists/all-countries.json'
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(all_countries, f, indent=2)
        
        print(f"Found {len(all_countries)} countries")
        print("Countries saved to all-countries.json")
        
        # Print the countries found for verification
        if all_countries:
            print("\nCountries found:")
            for country in all_countries:
                print(f"- {country}")
        else:
            print("\nNo countries found in the GeoJSON file.")
            
    except FileNotFoundError:
        print(f"Error: Could not find the file at {geo_json_path}")
    except json.JSONDecodeError:
        print("Error: The GeoJSON file is not properly formatted")
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")

if __name__ == '__main__':
    extract_all_countries()
