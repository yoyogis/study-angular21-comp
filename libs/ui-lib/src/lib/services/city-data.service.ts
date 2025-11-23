import { Injectable } from '@angular/core';
import { City } from '../models/city.model';

@Injectable({
  providedIn: 'root'
})
export class CityDataService {
  private readonly mockCities: City[] = [
    {
      name: '北京',
      coordinates: { lat: 39.9042, lng: 116.4074 },
      description: '中国的首都，拥有悠久的历史和丰富的文化遗产，包括故宫、天安门广场和长城等著名景点。',
      country: '中国'
    },
    {
      name: '上海',
      coordinates: { lat: 31.2304, lng: 121.4737 },
      description: '中国最大的城市，国际金融中心，以其现代化的天际线和繁华的商业区而闻名。',
      country: '中国'
    },
    {
      name: '广州',
      coordinates: { lat: 23.1291, lng: 113.2644 },
      description: '中国南方的重要城市，广东省省会，以美食和贸易而闻名，是海上丝绸之路的起点之一。',
      country: '中国'
    },
    {
      name: 'New York',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      description: 'The largest city in the United States, known as the Big Apple, famous for Times Square, Central Park, and the Statue of Liberty.',
      country: 'USA'
    },
    {
      name: 'London',
      coordinates: { lat: 51.5074, lng: -0.1278 },
      description: 'The capital of England and the United Kingdom, home to iconic landmarks like Big Ben, Tower Bridge, and Buckingham Palace.',
      country: 'UK'
    },
    {
      name: 'Tokyo',
      coordinates: { lat: 35.6762, lng: 139.6503 },
      description: 'The capital of Japan, a bustling metropolis that blends traditional culture with cutting-edge technology.',
      country: 'Japan'
    },
    {
      name: 'Paris',
      coordinates: { lat: 48.8566, lng: 2.3522 },
      description: 'The capital of France, known as the City of Light, famous for the Eiffel Tower, Louvre Museum, and Notre-Dame Cathedral.',
      country: 'France'
    },
    {
      name: 'Sydney',
      coordinates: { lat: -33.8688, lng: 151.2093 },
      description: 'Australia\'s largest city, famous for its harbour, Opera House, and Harbour Bridge.',
      country: 'Australia'
    }
  ];

  getCities(): City[] {
    return this.mockCities;
  }

  getCityByName(name: string): City | undefined {
    return this.mockCities.find(city => 
      city.name.toLowerCase().includes(name.toLowerCase())
    );
  }
}