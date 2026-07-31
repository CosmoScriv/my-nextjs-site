// app/actions/yelp.ts
'use server';

import { YelpSearchResponse } from '@/types/yelp';

interface SearchParams {
  term: string;
  latitude: number;
  longitude: number;
}

export async function searchFoodAction({ term, latitude, longitude }: SearchParams) {
  if (!latitude || !longitude) {
    throw new Error('Coordinates are required');
  }

  const apiKey = process.env.YELP_API_KEY;
  if (!apiKey) {
    throw new Error('Yelp API key is missing in environment variables');
  }

  const url = new URL('https://api.yelp.com/v3/businesses/search');
  url.searchParams.set('term', term);
  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set('categories', 'restaurants');
  url.searchParams.set('sort_by', 'distance');
  url.searchParams.set('limit', '10');

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Yelp API error: ${response.statusText}`);
    }

    const data: YelpSearchResponse = await response.json();
    return { success: true, data: data.businesses };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
