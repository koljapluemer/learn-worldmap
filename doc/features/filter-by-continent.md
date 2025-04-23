# Continent Filtering Feature

## User-Facing Features

### Basic Functionality
- Users can select/deselect continents to focus their geography practice
- The game will only show countries from selected continents
- All continents are selected by default
- Changes are persisted between sessions using localStorage

### URL Sharing
Users can share links to pre-filtered continent selections:
- Format: `/play-custom?continents=continent1,continent2`
- Example: `/play-custom?continents=africa,europe`
- Multiple continents can be specified, separated by commas
- Case insensitive (e.g., "AFRICA" works the same as "africa")
- Flexible spelling (e.g., "north-america" or "northamerica" for "North America")

### Supported Continents
- Africa
- Antarctica
- Asia
- Europe
- North America
- Oceania
- South America
- Seven seas (open ocean)

## Technical Implementation

### Components
1. `CustomPlay.vue`
   - Main game view component
   - Handles continent selection state
   - Filters countries based on selected continents
   - Manages game state and progress

2. `ContinentFilter.vue`
   - UI component for continent selection
   - Displays continent cards with checkboxes
   - Handles user interactions
   - Shows visual feedback for selected continents

3. `useContinentSelection.ts` (Composable)
   - Manages continent selection state
   - Persists selections in localStorage
   - Provides methods for toggling and setting continents
   - Handles initialization and state updates

### Data Flow
1. URL Parameters → Router → Component Props
   - Router extracts continents from query parameters
   - Passes them as `initialContinents` prop to CustomPlay
   - CustomPlay normalizes and matches continents with available ones

2. Continent Selection → Country Filtering
   - Selected continents determine available countries
   - Country list is filtered based on continent selection
   - Game state updates when filtered countries change

3. State Persistence
   - Continent selections are saved to localStorage
   - Selections are restored on page load
   - Default to all continents if no valid selections exist

### Key Functions
1. Continent Matching
```typescript
// Normalizes continent names for flexible matching
const normalizeContinent = (name: string) => 
  name.toLowerCase().replace(/[^a-z]/g, '')
```

2. Country Filtering
```typescript
// Filters countries based on selected continents
const filteredCountries = computed(() => {
  if (selectedContinents.value.length === 0) return availableCountries.value
  return availableCountries.value.filter(country => {
    const countryData = findCountryData(country)
    return countryData && selectedContinents.value.includes(countryData.properties.continent)
  })
})
```

3. State Management
```typescript
// Saves selections to localStorage
watch(selectedContinents, (newVal) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
}, { deep: true })
```

### Error Handling
- Invalid continent names in URL default to all continents
- Empty or malformed URL parameters default to all continents
- Failed localStorage operations are handled gracefully
- Invalid continent selections are filtered out

### Performance Considerations
- Continent list is static and loaded once
- Country filtering uses computed properties for efficiency
- Continent matching is optimized for quick lookups
- State updates are batched to minimize re-renders
