import { Injectable, signal } from '@angular/core';
import { City } from './city.model';

export type MapType = 'baidu' | 'google';

// 为了TypeScript识别百度地图和谷歌地图的全局变量
declare global {
  interface Window {
    BMapGL: any;
    google: any;
  }
}

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

  // 加载地图脚本
  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`无法加载脚本: ${src}`));
      
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (!existingScript) {
        document.head.appendChild(script);
      } else {
        resolve();
      }
    });
  }

  // 初始化谷歌地图
  private async initGoogleMap(container: HTMLElement): Promise<void> {
    // 加载谷歌地图API
    // 注意：这里使用的是开发测试用的密钥，请在生产环境中替换为真实的密钥
    await this.loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyCkUOdZ5y7hMm0yrcCQoCvLwzdM6M8s5qk&libraries=places');
    
    if (!window.google || !window.google.maps) {
      throw new Error('谷歌地图API加载失败');
    }
    
    // 创建地图实例
    const mapOptions = {
      center: { lat: 35.8617, lng: 104.1954 }, // 中国中心点
      zoom: 2,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP
    };
    
    this.mapInstance = new window.google.maps.Map(container, mapOptions);
  }

  // 初始化百度地图
  private async initBaiduMap(container: HTMLElement): Promise<void> {
    // 加载百度地图API
    // 注意：这里使用的是开发测试用的密钥，请在生产环境中替换为真实的密钥
    await this.loadScript('https://api.map.baidu.com/api?v=3.0&ak=E4805d16520de693a3fe707cdc962045');
    
    if (!window.BMapGL) {
      throw new Error('百度地图API加载失败');
    }
    
    // 创建地图实例
    const mapOptions = {
      center: new window.BMapGL.Point(104.1954, 35.8617), // 中国中心点
      zoom: 2
    };
    
    this.mapInstance = new window.BMapGL.Map(container);
    this.mapInstance.centerAndZoom(mapOptions.center, mapOptions.zoom);
    // 开启鼠标滚轮缩放
    this.mapInstance.enableScrollWheelZoom(true);
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
    if (!this.mapInstance) return;
    
    if (this.currentMapType() === 'google') {
      this.mapInstance.setZoom(2);
    } else {
      this.mapInstance.setZoom(2);
    }
  }

  // 放大到指定城市
  private async zoomInToCity(city: City): Promise<void> {
    if (!this.mapInstance) return;
    
    if (this.currentMapType() === 'google') {
      // 谷歌地图操作
      const latLng = new window.google.maps.LatLng(city.lat, city.lng);
      
      // 平滑过渡到目标城市
      this.mapInstance.setCenter(latLng);
      this.mapInstance.setZoom(10);
      
      // 移除之前的标记和信息窗口
      if (this.cityMarker) {
        this.cityMarker.setMap(null);
      }
      if (this.cityInfoWindow) {
        this.cityInfoWindow.close();
      }
      
      // 添加新标记
      this.cityMarker = new window.google.maps.Marker({
        position: latLng,
        map: this.mapInstance,
        title: city.name
      });
      
      // 添加信息窗口
      this.cityInfoWindow = new window.google.maps.InfoWindow({
        content: `<div style="padding: 10px;"><h3>${city.name}</h3><p>${city.description}</p></div>`
      });
      
      // 打开信息窗口
      this.cityInfoWindow.open(this.mapInstance, this.cityMarker);
      
      // 添加点击标记显示信息窗口的事件
      this.cityMarker.addListener('click', () => {
        this.cityInfoWindow.open(this.mapInstance, this.cityMarker);
      });
    } else {
      // 百度地图操作
      const point = new window.BMapGL.Point(city.lng, city.lat);
      
      // 平滑过渡到目标城市
      this.mapInstance.panTo(point);
      this.mapInstance.setZoom(12);
      
      // 移除之前的标记和信息窗口
      if (this.cityMarker) {
        this.mapInstance.removeOverlay(this.cityMarker);
      }
      if (this.cityInfoWindow) {
        this.mapInstance.closeInfoWindow(this.cityInfoWindow);
      }
      
      // 添加新标记
      this.cityMarker = new window.BMapGL.Marker(point);
      this.mapInstance.addOverlay(this.cityMarker);
      
      // 添加信息窗口
      const opts = {
        width: 250,
        height: 120,
        title: city.name
      };
      this.cityInfoWindow = new window.BMapGL.InfoWindow(
        `<p>${city.description}</p>`, 
        opts
      );
      
      // 打开信息窗口
      this.mapInstance.openInfoWindow(this.cityInfoWindow, point);
      
      // 添加点击标记显示信息窗口的事件
      this.cityMarker.addEventListener('click', () => {
        this.mapInstance.openInfoWindow(this.cityInfoWindow, point);
      });
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
