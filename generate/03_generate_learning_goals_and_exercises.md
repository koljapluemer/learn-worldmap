# Generate Learning Goals

This is a python script to generate a data structure representing learning goals based on world map data, as well as exercises.
The data is to be made compatible with ts types, defined in [this file](../src/new-algo/types.ts). Make sure to read and understand them exactly!!

First, for some understanding:

- A learning goal is something abstract, such as "Know where Ghana is" or "Know the countries of Africa"
- An exercise is a concrete challenge to the learner
- A given learning goal may have linked exercises, or may merely be a parent to other learning goals
- Both `Exercise` and `LearningGoal` will be an actual class in the consuming code. However, here we are defining dead, static data. Storage is a concern, which is why for example we store relationships as a list of ids/names (type `string`), instead of as a whole object

## Inputs

### GeoJSON

- We have a `worldmap.geo.json` file with all the countries in the world. It holds some useful properties, such as:

```json
"pop_est": 5047561,
"pop_rank": 13,
"continent": "North America",
"region_un": "Americas",
"subregion": "Central America",
"region_wb": "Latin America & Caribbean"
```

- This file is very large. For testing/checking purposes check `worldmap.demo.geo.json` which has the same format. Note that the data is very nested.


### Zoom Level Data

- We have a file which informs specific properties regarding exercises for each country, called `zoomLevelData.json`. It is structured as such:

```json
[
    {
        "name": "Benin",
        "zoomRegional": "110",
        "zoomNeighborhood": "139"
    },
    {
        "name": "Bermuda",
        "zoomRegional": "101",
        "zoomNeighborhood": ""
    },
    ...
]
```

### Islands?

- We have a simple file `islands.json` which holds whether a given country is an island, structured as such:

```json
{
  "Afghanistan": false,
  "Albania": false,
  "Algeria": false,
  "American Samoa": true,
}
```

### Difficulty

- From a previous version of the game, we have data telling us how difficult it was for first-time learners to find a country, structured as such:
- The file is called `countryErrorRates.json`

```json
{
  "Guam": 90.10989010989012,
  "Norfolk Island": 89.32038834951457,
  "Tonga": 86.80555555555556,
  ...
}
```

- To be precise, it measures the percentage of learners that got the country wrong at first attempt.


## Desired Output

We want to generate two files: `exercises.json` and `learningGoals.json`.

- `learningGoals.json` should be a dictionary, where the key is the learning goal's name, and the value is a valid `MapLearningGoalData` object
- `exercises.json` should be a dictionary, where the key is exercise's id, and the value is a valid `MapExerciseData` object

### Learning Goals to Generate

### Ultimate Learning Goal

First, make one learning goal:

```ts
{
    name: "World"
    description: "Know where all the countries in the world are."
}
```

#### Base Per-Country

This is the core. Start by making one learning goal per country. Should look like this:

```ts
{
    name: "Country: Ghana"
    description: "Know where Ghana is."
    parents: ["World"]
    inherentDifficulty: -2
    data: {
        typeOfGeopoliticalUnit: "Country";
        geopoliticalUnit: "Ghana";    
    }
}
```

- Calculate `inherentDifficulty` via `countryErrorRates.json`
  - the error-rates file tracks float values from 0-1
  - make `inherentDifficulty` a whole number from *minus ten* to *ten* based on this value. If the recorded error is 0.5, difficulty should be 0.

### Country Triplet

#### Learning Goals

##### On the World Map

Then, make one to three learning goals per country, depending on the data in `zoomLevelData.json`.

For every country, no matter what, make one learning goal like this:

```ts
{
    name: "Ghana-World"
    description: "Know where Ghana is on the world map."
    parents: ["Country: Ghana"]
    exercises: []
    data: {
        typeOfGeopoliticalUnit: "Country";
        geopoliticalUnit: "Ghana";    
    }
}
```

Note that we have the previously created general country goal as parent, and we *do not* set an inherent difficulty.

##### Regional

Then, if the `zoomRegional` property for the given country in `zoomLevelData.json` is *not* an empty string, generate the following learning goal:

```ts
{
    name: "Ghana-Region"
    description: "Know where Ghana is in its region."
    parents: ["Country: Ghana"],
    exercises: []
    blockedBy: ["Ghana-World"]
    data: {
        typeOfGeopoliticalUnit: "Country";
        geopoliticalUnit: "Ghana";    
    }
}
```

Notice how this learning goal is *blocked by* the previous one.

##### Neighborhood

At last, if the `zoomNeighborhood` prop for the given country in `zoomLevelData` is not an empty string, generate the following learning goal:

```ts
{
    name: "Ghana-Region"
    description: "Know where Ghana is in its neighborhood."
    exercises: []
    parents: ["Country: Ghana"],
    blockedBy: ["Ghana-World", "Ghana-Region"]
    data: {
        typeOfGeopoliticalUnit: "Country";
        geopoliticalUnit: "Ghana";    
    }
}
```

Note how this goal is blocked by both of the previous goals.

#### Exercises

These one to three goals just generated are the *only* ones which will have attached exercises.

For the first goal, which always exist, generate the following `ExerciseData` object:

```ts

{
  id: "Ghana-World-0"
  instruction: "{{instruction_pre}} Ghana {{instruction_post}}"
  data: {
    zoom: 100;
    country: "Ghana";
  }
}
```

- Note:
  - `zoom` is always 100
  - the `instruction` contains some curly braces. Those are to be generated literally. Dynamic string replacement will follow at a later point.


Now that we have this exercise, go back to the first learning goal of the triplet, and add this exercise's id to the `exercises` array of the learning goal!

Next, *if* we generated a "Regional" learning goal for this country, create *nine* exercises of the following format:

```ts

{
  id: "Ghana-Region-$index"
  instruction: "{{instruction_pre}} Ghana {{instruction_post}}"
  data: {
    zoom: $zoom;
    panIndex: $index;
    country: "Ghana";
  }
}
```

- Note:
  - `zoom` should be set according to the `zoomRegional` prop which can be extracted for the given country from `zoomLevelData.json`. Note that you may need to convert from string to number
  - `$index` should be replaced by the number 0 to 8 for the nine exercises, both in the `id` and in the `panIndex`

The relevant regional learning goal for this country should then have all nine exercise id's added to its `exercises` array.

At last, *if* a "Neighborhood" learning goal was generated, generate another 9 exercises, with the necessary adaptions

### Other Goals

#### Islands

Use `islands.json` to make the following goal:

```ts
{
    name: "Islands"
    description: "Know the islands of the world."
    inherentInterest: -2
}
```

Then, find all the goals for countries that are an island according to the data structure (only the base goal, not the country subgoals for region, neighborhood and so on). 

Append `"Islands"` to their `parents` array.

#### Small Countries

Make the following goal:

```ts
{
    name: "Small"
    description: "Know where the countries with less than 1 million inhabitants are."
    inherentInterest: -2
}
```

As before, make this a parent of all relevant base country goals.
Use the `pop_est` property in the geojson file.


#### Biggest Countries

Make the following goal:

```ts
{
    name: "Biggest"
    description: "Know where the biggest countries in the world are."
    inherentInterest: -1
}
```

This works like the one above, only now check for the `pop_rank` property in the geojson and make sure it's 16 or larger.

#### By Region

Looping the geojson, keep track of the values that occur for  `region_un` and `subregion`.

These should be strictly nested. Each `subregion` should belong to exactly one `region_un`.

Then, reflect this structure as goals.

For example, based on the geojson data for Costa Rica, we want the following learning goals:

```ts
{
    name: "Region: Americas"
    description: "Know where the countries are in Americas."
}

{
    name: "Central America (Americas)"
    description: "Know where the countries are in Central America."
    parents: ["Region: Americas"]
}
```

The base goal for Costa Rica should also include "Central America (Americas)" as a parent (but not "Region: Americas", that would be redundant)