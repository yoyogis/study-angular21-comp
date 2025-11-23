import { TestBed } from '@angular/core/testing';
import { CityDataService } from './city-data.service';

describe('CityDataService', () => {
  let service: CityDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CityDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCities', () => {
    it('should return all cities', () => {
      const cities = service.getCities();
      expect(cities).toBeInstanceOf(Array);
      expect(cities.length).toBeGreaterThan(0);
    });

    it('should return cities with required properties', () => {
      const cities = service.getCities();
      const firstCity = cities[0];
      
      expect(firstCity).toHaveProperty('name');
      expect(firstCity).toHaveProperty('coordinates');
      expect(firstCity).toHaveProperty('description');
      expect(firstCity).toHaveProperty('country');
      expect(firstCity.coordinates).toHaveProperty('lat');
      expect(firstCity.coordinates).toHaveProperty('lng');
    });

    it('should return consistent data on multiple calls', () => {
      const cities1 = service.getCities();
      const cities2 = service.getCities();
      
      expect(cities1.length).toBe(cities2.length);
      expect(cities1[0].name).toBe(cities2[0].name);
    });
  });

  describe('getCityByName', () => {
    it('should find existing city by exact name', () => {
      const city = service.getCityByName('北京');
      expect(city).toBeTruthy();
      expect(city?.name).toBe('北京');
    });

    it('should find city by partial name (case insensitive)', () => {
      const city = service.getCityByName('new');
      expect(city).toBeTruthy();
      expect(city?.name.toLowerCase()).toContain('new');
    });

    it('should return undefined for non-existent city', () => {
      const city = service.getCityByName('NonExistentCity');
      expect(city).toBeUndefined();
    });

    it('should handle empty string', () => {
      const city = service.getCityByName('');
      // Empty string matches all cities, so it should return the first city
      expect(city).toBeTruthy();
      expect(city?.name).toBe('北京');
    });

    it('should handle case insensitive search', () => {
      const cityLower = service.getCityByName('london');
      const cityUpper = service.getCityByName('LONDON');
      const cityMixed = service.getCityByName('LoNdOn');
      
      expect(cityLower?.name).toBe('London');
      expect(cityUpper?.name).toBe('London');
      expect(cityMixed?.name).toBe('London');
    });

    it('should find cities with Chinese names', () => {
      const cities = ['北京', '上海', '广州'];
      cities.forEach(cityName => {
        const city = service.getCityByName(cityName);
        expect(city).toBeTruthy();
        expect(city?.name).toBe(cityName);
      });
    });

    it('should find cities with English names', () => {
      const cities = ['New York', 'London', 'Tokyo', 'Paris', 'Sydney'];
      cities.forEach(cityName => {
        const city = service.getCityByName(cityName);
        expect(city).toBeTruthy();
        expect(city?.name).toBe(cityName);
      });
    });
  });

  describe('Data Integrity', () => {
    it('should have valid coordinates for all cities', () => {
      const cities = service.getCities();
      
      cities.forEach(city => {
        expect(city.coordinates.lat).toBeGreaterThanOrEqual(-90);
        expect(city.coordinates.lat).toBeLessThanOrEqual(90);
        expect(city.coordinates.lng).toBeGreaterThanOrEqual(-180);
        expect(city.coordinates.lng).toBeLessThanOrEqual(180);
      });
    });

    it('should have non-empty descriptions for all cities', () => {
      const cities = service.getCities();
      
      cities.forEach(city => {
        expect(city.description).toBeTruthy();
        expect(city.description.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty country names for all cities', () => {
      const cities = service.getCities();
      
      cities.forEach(city => {
        expect(city.country).toBeTruthy();
        expect(city.country.length).toBeGreaterThan(0);
      });
    });

    it('should have unique city names', () => {
      const cities = service.getCities();
      const cityNames = cities.map(city => city.name);
      const uniqueNames = new Set(cityNames);
      
      expect(cityNames.length).toBe(uniqueNames.size);
    });
  });
});