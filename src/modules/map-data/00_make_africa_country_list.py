import json
import os

def extract_african_countries():
    # Get the path to the GeoJSON file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    geo_json_path = os.path.join(current_dir, 'worldmap.geo.json')
    
    try:
        # Read the GeoJSON file
        with open(geo_json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Extract African countries
        african_countries = []
        for feature in data['features']:
            # Check if the country is in Africa (continent property)
            if feature['properties'].get('continent') == 'Africa':
                country_name = feature['properties'].get('name')
                if country_name:
                    african_countries.append(country_name)
        
        # Sort the list alphabetically
        african_countries.sort()
        
        # Save to africa.json
        output_path = os.path.join(current_dir, 'country-lists', 'africa.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(african_countries, f, indent=2)
        
        print(f"Found {len(african_countries)} African countries")
        print("Countries saved to africa.json")
        
        # Print the countries found for verification
        if african_countries:
            print("\nCountries found:")
            for country in african_countries:
                print(f"- {country}")
        else:
            print("\nNo African countries found in the demo file.")
            print("Note: The demo file currently contains Costa Rica data as a test case.")
            
    except FileNotFoundError:
        print(f"Error: Could not find the file at {geo_json_path}")
    except json.JSONDecodeError:
        print("Error: The GeoJSON file is not properly formatted")
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")

if __name__ == '__main__':
    extract_african_countries()
