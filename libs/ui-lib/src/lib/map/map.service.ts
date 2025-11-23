import { Injectable, signal } from '@angular/core';
import { City } from './city.model';

export type MapType = 'baidu' | 'google';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private mapInstance: any = null;
  private currentMapType = signal<MapType>('google');
  private cityMarker: any = null;
  private cityInfoWindow: any = null;

  // Mock城市数据
  private cities: City[] = [
    {
      name: '北京',
      lat: 39.9042,
      lng: 116.4074,
      description: '中国的首都，历史悠久，是政治、文化中心。'
    },
    {
      name: '上海',
      lat: 31.2304,
      lng: 121.4737,
      description: '中国的经济中心，国际化大都市。'
    },
    {
      name: '广州',
      lat: 23.1291,
      lng: 113.2644,
      description: '南方重要的经济中心和交通枢纽。'
    },
    {
      name: '深圳',
      lat: 22.5431,
      lng: 114.0579,
      description: '中国改革开放的窗口，创新科技中心。'
    },
    {
      name: '杭州',
      lat: 30.2741,
      lng: 120.1551,
      description: '电子商务之都，风景秀丽的历史名城。'
    }
  ];

  constructor() {}

  // 初始化地图
  async initMap(containerId: string, mapType: MapType): Promise<void> {
    this.currentMapType.set(mapType);
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`容器ID ${containerId} 未找到`);
    }

    try {
      if (mapType === 'google') {
        await this.initGoogleMap(container);
      } else {
        await this.initBaiduMap(container);
      }
    } catch (error) {
      throw new Error(`地图初始化失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // 初始化谷歌地图
  private async initGoogleMap(container: HTMLElement): Promise<void> {
    // 模拟谷歌地图API加载
    setTimeout(() => {
      // 模拟地图实例
      this.mapInstance = {
        zoom: (level: number) => console.log(`Google地图缩放到级别: ${level}`),
        panTo: (latLng: { lat: number; lng: number }) => 
          console.log(`Google地图平移到: ${latLng.lat}, ${latLng.lng}`),
        setCenter: (latLng: { lat: number; lng: number }) => 
          console.log(`Google地图设置中心: ${latLng.lat}, ${latLng.lng}`),
        addMarker: (options: any) => {
          console.log(`Google地图添加标记: ${options.position.lat}, ${options.position.lng}`);
          return { setMap: () => {}, setPosition: () => {}, setContent: () => {}, open: () => {} };
        },
        addInfoWindow: (options: any) => {
          console.log(`Google地图添加信息窗口`);
          return { setContent: () => {}, open: () => {}, close: () => {} };
        }
      };
      this.mapInstance.zoom(2); // 初始显示全球
    }, 500);
  }

  // 初始化百度地图
  private async initBaiduMap(container: HTMLElement): Promise<void> {
    // 模拟百度地图API加载
    setTimeout(() => {
      // 模拟地图实例
      this.mapInstance = {
        setZoom: (level: number) => console.log(`百度地图缩放到级别: ${level}`),
        panTo: (point: { lat: number; lng: number }) => 
          console.log(`百度地图平移到: ${point.lat}, ${point.lng}`),
        centerAndZoom: (point: { lat: number; lng: number }, zoom: number) => 
          console.log(`百度地图设置中心并缩放: ${point.lat}, ${point.lng}, ${zoom}`),
        addOverlay: (marker: any) => {
          console.log(`百度地图添加覆盖物`);
          return marker;
        },
        openInfoWindow: (infoWindow: any, marker: any) => {
          console.log(`百度地图打开信息窗口`);
        }
      };
      this.mapInstance.setZoom(2); // 初始显示全球
    }, 500);
  }

  // 根据城市名查找城市信息
  findCityByName(cityName: string): City | undefined {
    return this.cities.find(city => city.name === cityName);
  }

  // 定位到指定城市
  async locateCity(cityName: string): Promise<void> {
    if (!this.mapInstance) {
      throw new Error('地图未初始化');
    }

    const city = this.findCityByName(cityName);
    if (!city) {
      throw new Error(`未找到城市: ${cityName}`);
    }

    // 先缩小到全球范围
    this.zoomOutToWorld();

    // 2秒后放大到指定城市
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.zoomInToCity(city);
  }

  // 缩小到全球范围
  private zoomOutToWorld(): void {
    if (this.currentMapType() === 'google') {
      this.mapInstance.zoom(2);
    } else {
      this.mapInstance.setZoom(2);
    }
  }

  // 放大到指定城市
  private async zoomInToCity(city: City): Promise<void> {
    const latLng = { lat: city.lat, lng: city.lng };

    if (this.currentMapType() === 'google') {
      this.mapInstance.setCenter(latLng);
      this.mapInstance.zoom(10);
      // 模拟添加标记和信息窗口
      this.cityMarker = this.mapInstance.addMarker({ position: latLng });
      this.cityInfoWindow = this.mapInstance.addInfoWindow({ content: city.description });
      this.cityInfoWindow.open(this.mapInstance, this.cityMarker);
    } else {
      // 百度地图的操作
      this.mapInstance.centerAndZoom(latLng, 12);
      // 模拟添加标记和信息窗口
      this.cityMarker = { point: latLng };
      this.mapInstance.addOverlay(this.cityMarker);
      this.cityInfoWindow = { content: city.description };
      this.mapInstance.openInfoWindow(this.cityInfoWindow, this.cityMarker);
    }
  }

  // 切换地图类型
  async switchMapType(mapType: MapType, containerId: string): Promise<void> {
    // 移除现有地图实例
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
    }
    this.mapInstance = null;
    this.cityMarker = null;
    this.cityInfoWindow = null;
    
    // 初始化新地图
    await this.initMap(containerId, mapType);
  }

  // 获取所有城市列表
  getAllCities(): City[] {
    return [...this.cities];
  }
}
