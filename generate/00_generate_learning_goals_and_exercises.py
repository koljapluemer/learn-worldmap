import json
from pathlib import Path

# File paths (use demo for testing)
GEOJSON_PATH = Path('worldmap.geo.json')
ZOOM_PATH = Path('zoomLevelData.json')
ERROR_RATES_PATH = Path('countryErrorRates.json')
LEARNING_GOALS_OUT = Path('out/learningGoals.json')
EXERCISES_OUT = Path('out/exercises.json')

# --- Load Data ---
def load_geojson_countries(path):
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    # Use the 'name' property as canonical
    return [feature['properties']['name'] for feature in data['features']]

def load_zoom_data(path):
    with open(path, 'r', encoding='utf-8') as f:
        return {entry['name']: entry for entry in json.load(f)}

def load_error_rates(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def error_rate_to_difficulty(rate):
    # Map 0-100 to -10 to 10, 50=0
    # Clamp to 0-100
    rate = max(0, min(100, rate))
    return int(round((rate - 50) / 5))

# --- Main Generation ---
def write_outputs(learning_goals, exercises):
    # Clean up: remove empty fields
    def clean(d):
        if isinstance(d, dict):
            return {k: clean(v) for k, v in d.items() if v not in (None, [], {}, "")}
        elif isinstance(d, list):
            return [clean(x) for x in d]
        else:
            return d

    # Pretty output
    with open(LEARNING_GOALS_OUT, 'w', encoding='utf-8') as f:
        json.dump(clean(learning_goals), f, indent=2, ensure_ascii=False)
    with open(EXERCISES_OUT, 'w', encoding='utf-8') as f:
        json.dump(clean(exercises), f, indent=2, ensure_ascii=False)

    # Compressed output (always, with .min postfix)
    pretty_lg = LEARNING_GOALS_OUT
    pretty_ex = EXERCISES_OUT
    comp_lg = pretty_lg.with_name(pretty_lg.stem + '.min' + pretty_lg.suffix)
    comp_ex = pretty_ex.with_name(pretty_ex.stem + '.min' + pretty_ex.suffix)
    with open(comp_lg, 'w', encoding='utf-8') as f:
        json.dump(clean(learning_goals), f, separators=(',', ':'), ensure_ascii=False)
    with open(comp_ex, 'w', encoding='utf-8') as f:
        json.dump(clean(exercises), f, separators=(',', ':'), ensure_ascii=False)

def main():
    countries = load_geojson_countries(GEOJSON_PATH)
    zoom_data = load_zoom_data(ZOOM_PATH)
    error_rates = load_error_rates(ERROR_RATES_PATH)

    learning_goals = {}
    exercises = {}

    for country in countries:
        # --- Base per-country learning goal ---
        err = error_rates.get(country, 0)
        inherent_difficulty = error_rate_to_difficulty(err)
        base_goal = {
            'name': country,
            'description': f"Know where {country} is.",
            'inherentDifficulty': inherent_difficulty,
            'data': {
                'typeOfGeopoliticalUnit': 'Country',
                'geopoliticalUnit': country
            }
        }
        learning_goals[country] = base_goal

        # --- Country Triplet ---
        zoom = zoom_data.get(country)
        if not zoom:
            continue  # No zoom data, skip triplet

        # 1. World
        world_goal_name = f"{country}-World"
        world_goal = {
            'name': world_goal_name,
            'description': f"Know where {country} is on the world map.",
            'parents': [country],
            'data': {
                'typeOfGeopoliticalUnit': 'Country',
                'geopoliticalUnit': country
            }
        }
        # Exercise for world
        world_ex_id = f"{country}-World-0"
        world_ex = {
            'id': world_ex_id,
            'instruction': f"{{{{instruction_pre}}}} {country} {{{{instruction_post}}}}",
            'data': {
                'zoom': 100,
                'country': country
            }
        }
        exercises[world_ex_id] = world_ex
        world_goal['exercises'] = [world_ex_id]
        learning_goals[world_goal_name] = world_goal

        # 2. Region
        region_goal = None
        if zoom.get('zoomRegional', '').strip():
            region_goal_name = f"{country}-Region"
            region_goal = {
                'name': region_goal_name,
                'description': f"Know where {country} is in its region.",
                'parents': [country],
                'blockedBy': [world_goal_name],
                'data': {
                    'typeOfGeopoliticalUnit': 'Country',
                    'geopoliticalUnit': country
                }
            }
            # 9 exercises for region
            region_ex_ids = []
            zoom_val = int(zoom['zoomRegional'])
            for i in range(9):
                ex_id = f"{country}-Region-{i}"
                ex = {
                    'id': ex_id,
                    'instruction': f"{{{{instruction_pre}}}} {country} {{{{instruction_post}}}}",
                    'data': {
                        'zoom': zoom_val,
                        'panIndex': i,
                        'country': country
                    }
                }
                exercises[ex_id] = ex
                region_ex_ids.append(ex_id)
            region_goal['exercises'] = region_ex_ids
            learning_goals[region_goal_name] = region_goal

        # 3. Neighborhood
        if zoom.get('zoomNeighborhood', '').strip():
            neigh_goal_name = f"{country}-Neighborhood"
            neigh_goal = {
                'name': neigh_goal_name,
                'description': f"Know where {country} is in its neighborhood.",
                'parents': [country],
                'blockedBy': [world_goal_name],
                'data': {
                    'typeOfGeopoliticalUnit': 'Country',
                    'geopoliticalUnit': country
                }
            }
            if region_goal:
                neigh_goal['blockedBy'].append(region_goal['name'])
            # 9 exercises for neighborhood
            neigh_ex_ids = []
            zoom_val = int(zoom['zoomNeighborhood'])
            for i in range(9):
                ex_id = f"{country}-Neighborhood-{i}"
                ex = {
                    'id': ex_id,
                    'instruction': f"{{{{instruction_pre}}}} {country} {{{{instruction_post}}}}",
                    'data': {
                        'zoom': zoom_val,
                        'panIndex': i,
                        'country': country
                    }
                }
                exercises[ex_id] = ex
                neigh_ex_ids.append(ex_id)
            neigh_goal['exercises'] = neigh_ex_ids
            learning_goals[neigh_goal_name] = neigh_goal

    write_outputs(learning_goals, exercises)

if __name__ == '__main__':
    main()