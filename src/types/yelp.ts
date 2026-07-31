export interface YelpBusiness {
  id: string;
  name: string;
  rating?: number;
  url?: string;
  location?: {
    city?: string;
  };
}

export interface YelpSearchResponse {
  businesses: YelpBusiness[];
}
