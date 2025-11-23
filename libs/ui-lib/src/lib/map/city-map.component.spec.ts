import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CityMapComponent } from './city-map.component';
import { MapService, MapType } from './map.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

// 创建Mock MapService
class MockMapService {
  initMap = jasmine.createSpy('initMap').and.resolveTo();
  locateCity = jasmine.createSpy('locateCity').and.resolveTo();
  switchMapType = jasmine.createSpy('switchMapType').and.resolveTo();
  getAllCities = jasmine.createSpy('getAllCities').and.returnValue([
    { name: '北京', lat: 39.9042, lng: 116.4074, description: '中国首都' },
    { name: '上海', lat: 31.2304, lng: 121.4737, description: '经济中心' }
  ]);
}

describe('CityMapComponent', () => {
  let component: CityMapComponent;
  let fixture: ComponentFixture<CityMapComponent>;
  let mapService: MapService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CityMapComponent, FormsModule, CommonModule],
      providers: [
        { provide: MapService, useClass: MockMapService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CityMapComponent);
    component = fixture.componentInstance;
    mapService = TestBed.inject(MapService);
    
    // 创建地图容器元素
    const mapContainer = document.createElement('div');
    mapContainer.id = 'map-container';
    document.body.appendChild(mapContainer);
    
    fixture.detectChanges();
  });

  afterEach(() => {
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
      document.body.removeChild(mapContainer);
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize map on ngAfterViewInit', async () => {
    component.ngAfterViewInit();
    expect(mapService.initMap).toHaveBeenCalledWith('map-container', 'google');
  });

  it('should show error when city name is empty', async () => {
    component.cityName.set('');
    await component.onLocateCity();
    expect(component.errorMessage()).toBe('请输入城市名称');
    expect(mapService.locateCity).not.toHaveBeenCalled();
  });

  it('should call locateCity when city name is provided', async () => {
    component.cityName.set('北京');
    await component.onLocateCity();
    expect(mapService.locateCity).toHaveBeenCalledWith('北京');
    expect(component.errorMessage()).toBe('');
  });

  it('should handle locateCity error', async () => {
    const error = new Error('城市未找到');
    (mapService.locateCity as jasmine.Spy).and.rejectWith(error);
    component.cityName.set('未知城市');
    await component.onLocateCity();
    expect(component.errorMessage()).toBe('城市未找到');
  });

  it('should switch map type', async () => {
    component.currentMapType.set('google');
    await component.onSwitchMapType();
    expect(component.currentMapType()).toBe('baidu');
    expect(mapService.switchMapType).toHaveBeenCalledWith('baidu', 'map-container');
  });

  it('should handle switchMapType error', async () => {
    const error = new Error('地图切换失败');
    (mapService.switchMapType as jasmine.Spy).and.rejectWith(error);
    component.currentMapType.set('google');
    await component.onSwitchMapType();
    expect(component.errorMessage()).toBe('地图切换失败');
    expect(component.currentMapType()).toBe('google'); // 恢复原类型
  });

  it('should close error message', () => {
    component.errorMessage.set('测试错误');
    component.closeError();
    expect(component.errorMessage()).toBe('');
  });

  it('should render city tags', () => {
    const cityTags = fixture.debugElement.queryAll(By.css('.city-tag'));
    expect(cityTags.length).toBe(2);
    expect(cityTags[0].nativeElement.textContent.trim()).toBe('北京');
    expect(cityTags[1].nativeElement.textContent.trim()).toBe('上海');
  });
});
