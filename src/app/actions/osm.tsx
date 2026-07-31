// app/actions/osm.ts
'use server';

export interface FoodPlace {
  id: number;
  name: string;
  lat: number;
  lon: number;
  cuisine?: string;
  street?: string;
}

interface SearchParams {
  latitude: number;
  longitude: number;
  radius?: number;
  foodType?: string;
}

type SearchPayload = SearchParams | SearchParams[];

function normalizeSearchPayload(payload: SearchPayload | undefined): SearchParams | null {
  if (Array.isArray(payload)) {
    return payload[0] ? normalizeSearchPayload(payload[0]) : null;
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if (typeof payload.latitude !== 'number' || typeof payload.longitude !== 'number') {
    return null;
  }

  return {
    latitude: payload.latitude,
    longitude: payload.longitude,
    radius: typeof payload.radius === 'number' ? payload.radius : 3000,
    foodType: payload.foodType,
  };
}

export async function searchFoodOSMAction(payload: SearchPayload) {
  const normalized = normalizeSearchPayload(payload);

  if (!normalized) {
    return {
      success: false,
      error: 'Invalid search payload.',
    };
  }

  const { latitude, longitude, radius = 3000, foodType } = normalized;
  const query = `[out:json][timeout:25];(nwr["amenity"="restaurant"](around:${radius},${latitude},${longitude}););out center;`;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch data from OpenStreetMap (${response.status}: ${errorText.slice(0, 200)})`);
    }

    const result = await response.json();

    // Map the raw OSM elements into a clean, typed array
    const places: FoodPlace[] = result.elements.map((element: any) => {
      // Ways have centers, nodes have direct lat/lon
      const lat = element.lat ?? element.center?.lat;
      const lon = element.lon ?? element.center?.lon;

      return {
        id: element.id,
        name: element.tags?.name || 'Unnamed Food Spot',
        lat,
        lon,
        cuisine: element.tags?.cuisine,
        street: element.tags?.['addr:street'],
      };
    });

    // Client-side text filter if looking for a specific type of food (e.g. tacos)
    const filteredPlaces = foodType 
      ? places.filter(p => 
          p.name.toLowerCase().includes(foodType.toLowerCase()) || 
          p.cuisine?.toLowerCase().includes(foodType.toLowerCase())
        )
      : places;

    return { success: true, data: filteredPlaces.slice(0, 20) }; // Limit to top 20
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An error occurred' 
    };
  }
}
