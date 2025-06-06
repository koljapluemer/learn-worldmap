import json
import os

def extract_countries_by_population():
    # Get the path to the GeoJSON file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    geo_json_path = 'generate/worldmap.geo.json'
    
    try:
        # Read the GeoJSON file
        with open(geo_json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Initialize lists for different population thresholds
        countries_under_1m = []
        countries_under_200k = []
        
        for feature in data['features']:
            properties = feature['properties']
            country_name = properties.get('name')
            population = properties.get('pop_est')
            
            if country_name and population is not None:
                # Add to appropriate list(s) based on population
                if population < 1000000:
                    countries_under_1m.append({
                        'name': country_name,
                        'population': population
                    })
                if population < 200000:
                    countries_under_200k.append({
                        'name': country_name,
                        'population': population
                    })
        
        # Sort both lists by population
        countries_under_1m.sort(key=lambda x: x['population'])
        countries_under_200k.sort(key=lambda x: x['population'])
        
        # Save to respective JSON files
        output_dir = 'src/modules/map-data/country-lists'
        os.makedirs(output_dir, exist_ok=True)
        
        with open(f'{output_dir}/countries_under_1m.json', 'w', encoding='utf-8') as f:
            json.dump(countries_under_1m, f, indent=2)
            
        with open(f'{output_dir}/countries_under_200k.json', 'w', encoding='utf-8') as f:
            json.dump(countries_under_200k, f, indent=2)
        
        print(f"Found {len(countries_under_1m)} countries with population under 1 million")
        print(f"Found {len(countries_under_200k)} countries with population under 200,000")
        
        # Print the countries found for verification
        if countries_under_1m:
            print("\nCountries under 1 million inhabitants:")
            for country in countries_under_1m:
                print(f"- {country['name']}: {country['population']:,}")
        else:
            print("\nNo countries found under 1 million inhabitants.")
            
    except FileNotFoundError:
        print(f"Error: Could not find the file at {geo_json_path}")
    except json.JSONDecodeError:
        print("Error: The GeoJSON file is not properly formatted")
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")

if __name__ == '__main__':
    extract_countries_by_population()
