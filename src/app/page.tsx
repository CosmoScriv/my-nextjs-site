'use client';

import { useState, type FormEvent } from 'react';

type SearchState = {
  success: boolean;
  data?: Array<{
    id: number;
    name: string;
    cuisine?: string;
    street?: string;
  }>;
  error?: string;
};

const initialState: SearchState = { success: false };

async function geocodeCityState(city, state) {
  const query = `${city}, ${state}`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=jsonv2&limit=1`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'my-nextjs-site/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed (${response.status})`);
  }

  const data = await response.json();
  const first = data[0];

  if (!first || !first.lat || !first.lon) {
    throw new Error('Could not find that city and state.');
  }

  return {
    latitude: Number(first.lat),
    longitude: Number(first.lon),
  };
}

async function searchFood(params) {
  const latitude = params.latitude;
  const longitude = params.longitude;
  const radius = params.radius || 3000;
  const foodType = params.foodType || 'restaurant';
  const query = `[out:json][timeout:25];(nwr["amenity"="${foodType}"](around:${radius},${latitude},${longitude}););out center;`;

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
      throw new Error(`OpenStreetMap request failed (${response.status}: ${errorText.slice(0, 200)})`);
    }

    const result = await response.json();
    const places = (result?.elements ?? []).map((element: any) => {
      const lat = element.lat ?? element.center?.lat;
      const lon = element.lon ?? element.center?.lon;

      return {
        id: element.id,
        name: element.tags?.name || 'Unnamed Food Spot',
        cuisine: element.tags?.cuisine,
        street: element.tags?.['addr:street'],
        lat,
        lon,
      };
    });

    return {
      success: true,
      data: places.slice(0, 4),
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}

export default function Home() {
  const [state, setState] = useState<SearchState>(initialState);
  const [isPending, setIsPending] = useState(false);

  async function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const city = (formData.get('city') as string | null)?.trim() ?? '';
    const state = (formData.get('state') as string | null)?.trim() ?? '';

    if (!city || !state) {
      setState({ success: false, error: 'Enter both city and state.' });
      return;
    }

    setIsPending(true);

    try {
      const coordinates = await geocodeCityState(city, state);
      const result = await searchFood({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        foodType: 'restaurant',
      });
      setState(result);
    } catch (error) {
      setState({
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-50 font-sans dark:bg-black">
      <div className="absolute inset-0 bg-[url('/eats.png')] bg-contain bg-center bg-no-repeat" />
      <div className="absolute inset-0" />
      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center justify-end pt-105 text-center sm:px-8 sm:pb-12">
        <div className="m-2 w-[80%] max-w-[28rem] rounded-2xl border border-white/30 bg-white/70 p-4 shadow-lg backdrop-blur-sm dark:bg-black/60">
          {state.success && state.data && state.data.length > 0 ? (
            <div className="mb-4 rounded-xl border border-zinc-200 bg-white/90 p-3 text-left text-sm text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-200">
              <p className="mb-2 font-semibold">Nearby restaurants</p>
              <ul className="space-y-2">
                {state.data.map((place) => (
                  <li key={place.id} className="border-b border-zinc-200 pb-2 last:border-b-0 last:pb-0 dark:border-zinc-700">
                    <p className="font-medium">{place.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {place.cuisine ? `${place.cuisine} • ` : ''}
                      {place.street ?? 'Unknown address'}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {state.error ? (
            <div></div>
          ) : null}

          <form onSubmit={submitSearch} className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="site-search-city"
                name="city"
                type="text"
                defaultValue="New York"
                placeholder="City"
                className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <input
                id="site-search-state"
                name="state"
                type="text"
                defaultValue="NY"
                placeholder="State"
                className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="mx-auto w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 sm:w-auto"
            >
              {isPending ? 'Searching…' : 'Search'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
