import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CityMapComponent } from './city-map.component';
import { CityDataService } from '../../services/city-data.service';
import { MapService } from '../../services/map.service';
import { CommonModule } from '@angular/common';

describe('CityMapComponent', () => {
  let component: CityMapComponent;
  let fixture: ComponentFixture<CityMapComponent>;
  let cityDataService: any;
  let mapService: any;

  beforeEach(async () => {
    const cityDataServiceSpy = {
      getCities: jest.fn(),
      getCityByName: jest.fn()
    };
    const mapServiceSpy = {
      initializeMap: jest.fn(),
      animateToCity: jest.fn(),
      clearMap: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [CityMapComponent, CommonModule],
      providers: [
        { provide: CityDataService, useValue: cityDataServiceSpy },
        { provide: MapService, useValue: mapServiceSpy }
      ]
    }).compileComponents();

    cityDataService = TestBed.inject(CityDataService);
    mapService = TestBed.inject(MapService);
  });

  beforeEach(() => {
    // Setup default mock data BEFORE creating component
    cityDataService.getCities.mockReturnValue([
      {
        name: '北京',
        coordinates: { lat: 39.9042, lng: 116.4074 },
        description: '中国首都',
        country: '中国'
      },
      {
        name: 'New York',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        description: 'Big Apple',
        country: 'USA'
      }
    ]);

    cityDataService.getCityByName.mockImplementation((name: string) => {
      const cities = cityDataService.getCities();
      return cities.find((city: any) => city.name === name);
    });
    
    mapService.initializeMap.mockResolvedValue(undefined);
    mapService.animateToCity.mockResolvedValue(undefined);

    fixture = TestBed.createComponent(CityMapComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.cityName()).toBe('');
    expect(component.mapProvider()).toBe('baidu');
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('');
    expect(component.availableCities().length).toBeGreaterThan(0);
  });

  describe('searchCity', () => {
    it('should show error when city name is empty', async () => {
      component.cityName.set('');
      await component.searchCity();
      
      expect(component.errorMessage()).toBe('请输入城市名称');
      expect(mapService.animateToCity).not.toHaveBeenCalled();
    });

    it('should show error when city is not found', async () => {
      component.cityName.set('NonExistentCity');
      cityDataService.getCityByName.mockImplementation((name: string) => {
      const cities = cityDataService.getCities();
      return cities.find((city: any) => city.name === name);
    });
      
      await component.searchCity();
      
      expect(component.errorMessage()).toContain('未找到城市');
      expect(mapService.animateToCity).not.toHaveBeenCalled();
    });

    it('should successfully search for existing city', async () => {
      const mockCity = {
        name: '北京',
        coordinates: { lat: 39.9042, lng: 116.4074 },
        description: '中国首都',
        country: '中国'
      };
      
      component.cityName.set('北京');
      cityDataService.getCityByName.mockReturnValue(mockCity);
      
      await component.searchCity();
      
      expect(component.isLoading()).toBe(false);
      expect(component.errorMessage()).toBe('');
      expect(mapService.animateToCity).toHaveBeenCalledWith(mockCity);
    });

    it('should handle map service errors', async () => {
      const mockCity = {
        name: '北京',
        coordinates: { lat: 39.9042, lng: 116.4074 },
        description: '中国首都',
        country: '中国'
      };
      
      component.cityName.set('北京');
      cityDataService.getCityByName.mockReturnValue(mockCity);
      mapService.animateToCity.mockRejectedValue(new Error('Map error'));
      
      await component.searchCity();
      
      expect(component.isLoading()).toBe(false);
      expect(component.errorMessage()).toBe('Map error');
    });

    it('should set loading state correctly', async () => {
      const mockCity = {
        name: '北京',
        coordinates: { lat: 39.9042, lng: 116.4074 },
        description: '中国首都',
        country: '中国'
      };
      
      component.cityName.set('北京');
      cityDataService.getCityByName.mockReturnValue(mockCity);
      
      const searchPromise = component.searchCity();
      
      expect(component.isLoading()).toBe(true);
      
      await searchPromise;
      
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('selectCity', () => {
    it('should set city name and trigger search', async () => {
      const searchCitySpy = jest.spyOn(component, 'searchCity').mockReturnValue(Promise.resolve());
      
      component.selectCity('北京');
      
      expect(component.cityName()).toBe('北京');
      expect(searchCitySpy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should clear error message', () => {
      component.errorMessage.set('Test error');
      component.clearError();
      
      expect(component.errorMessage()).toBe('');
    });

    it('should handle map initialization errors', async () => {
      mapService.initializeMap.mockRejectedValue(new Error('Initialization failed'));
      
      await component.ngOnInit();
      
      expect(component.errorMessage()).toContain('地图初始化失败');
    });
  });

  describe('Map Provider Changes', () => {
    it('should handle map provider changes', () => {
      component.mapProvider.set('google');
      fixture.detectChanges();
      
      // The effect should trigger map reinitialization
      expect(mapService.initializeMap).toHaveBeenCalled();
    });
  });

  describe('Component Lifecycle', () => {
    it('should cleanup on destroy', () => {
      component.ngOnDestroy();
      
      expect(mapService.clearMap).toHaveBeenCalled();
    });
  });
});