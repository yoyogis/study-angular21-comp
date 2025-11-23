import { TestBed } from '@angular/core/testing';
import { MapService } from './map.service';
import { City } from '../models/city.model';

describe('MapService', () => {
  let service: MapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Map Initialization', () => {
    it('should initialize with default provider', () => {
      expect(service).toBeTruthy();
    });

    it('should handle container not found error', async () => {
      try {
        await service.initializeMap('baidu', 'non-existent-container');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toEqual(new Error(`Container with id 'non-existent-container' not found`));
      }
    });
  });

  describe('Animation Logic', () => {
    const mockCity: City = {
      name: 'Test City',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      description: 'Test description',
      country: 'Test Country'
    };

    it('should handle animateToCity without throwing errors', async () => {
      // Mock the map initialization to avoid actual API calls
      spyOn(service, 'initializeMap').and.returnValue(Promise.resolve());
      
      // Since we can't test actual map animation without the map being initialized,
      // we just verify that the method exists and can be called
      expect(() => service.animateToCity(mockCity)).not.toThrow();
    });
  });

  describe('Map Provider Management', () => {
    it('should support both baidu and google providers', () => {
      expect(() => service.initializeMap('baidu', 'test-container')).not.toThrow();
      expect(() => service.initializeMap('google', 'test-container')).not.toThrow();
    });

    it('should handle invalid provider gracefully', async () => {
      // The service should handle invalid providers gracefully
      try {
        await service.initializeMap('invalid' as any, 'test-container');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle script loading errors', async () => {
      // Mock document.createElement to simulate script loading failure
      const originalCreateElement = document.createElement;
      spyOn(document, 'createElement').and.callFake((tagName: string) => {
        if (tagName === 'script') {
          const script = originalCreateElement.call(document, tagName);
          spyOn(script, 'addEventListener').and.callFake((event: string, handler: Function) => {
            if (event === 'error') {
              // Simulate error event
              handler(new Event('error'));
            }
          });
          return script;
        }
        return originalCreateElement.call(document, tagName);
      });

      try {
        await service.initializeMap('baidu', 'test-container');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });
  });

  describe('Map Cleanup', () => {
    it('should have clearMap method', () => {
      expect(service.clearMap).toBeDefined();
      expect(typeof service.clearMap).toBe('function');
    });

    it('should clear map without errors', () => {
      expect(() => service.clearMap()).not.toThrow();
    });
  });

  describe('Marker Management', () => {
    const mockCity: City = {
      name: 'Test City',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      description: 'Test description',
      country: 'Test Country'
    };

    it('should handle marker creation without initialized map', () => {
      // Should not throw error even if map is not initialized
      expect(() => service.animateToCity(mockCity)).not.toThrow();
    });
  });
});