export interface City {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  country: string;
}

export interface MapProvider {
  type: 'baidu' | 'google';
  apiKey?: string;
}