import { Component, OnInit, Input, signal, AfterViewInit, inject } from '@angular/core';
import { MapService, MapType } from './map.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-city-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './city-map.component.html',
  styleUrl: './city-map.component.css',
})
export class CityMapComponent implements OnInit, AfterViewInit {
  @Input() initialMapType: MapType = 'google';
  
  cityName = signal('');
  errorMessage = signal('');
  isLoading = signal(false);
  currentMapType = signal<MapType>('google');
  
  private mapService = inject(MapService);
  
  // 提供公共方法获取所有城市数据，避免在模板中直接访问私有服务
  getAllCities() {
    return this.mapService.getAllCities();
  }
  
  constructor() {
    this.currentMapType.set(this.initialMapType);
  }
  
  ngOnInit(): void {
    this.currentMapType.set(this.initialMapType);
  }
  
  ngAfterViewInit(): void {
    this.initializeMap();
  }
  
  private async initializeMap(): Promise<void> {
    try {
      this.errorMessage.set('');
      await this.mapService.initMap('map-container', this.currentMapType());
      // 地图加载完成后添加loaded类
      this.setMapContainerLoaded();
    } catch (error) {
      this.handleError(error as Error);
    }
  }
  
  private setMapContainerLoaded(): void {
    const container = document.getElementById('map-container');
    if (container) {
      container.classList.add('loaded');
    }
  }
  
  async onLocateCity(): Promise<void> {
    if (!this.cityName().trim()) {
      this.errorMessage.set('请输入城市名称');
      return;
    }
    
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    try {
      await this.mapService.locateCity(this.cityName().trim());
    } catch (error) {
      this.handleError(error as Error);
    } finally {
      this.isLoading.set(false);
    }
  }
  
  async onSwitchMapType(): Promise<void> {
    const newMapType: MapType = this.currentMapType() === 'google' ? 'baidu' : 'google';
    this.currentMapType.set(newMapType);
    this.errorMessage.set('');
    
    // 切换地图前移除loaded类，显示加载提示
    const container = document.getElementById('map-container');
    if (container) {
      container.classList.remove('loaded');
    }
    
    try {
      await this.mapService.switchMapType(newMapType, 'map-container');
      // 地图加载完成后添加loaded类
      this.setMapContainerLoaded();
    } catch (error) {
      this.handleError(error as Error);
      // 切换失败时恢复原地图类型
      this.currentMapType.set(newMapType === 'google' ? 'baidu' : 'google');
    }
  }
  
  private handleError(error: Error): void {
    this.errorMessage.set(error.message);
    console.error('地图操作错误:', error);
  }
  
  closeError(): void {
    this.errorMessage.set('');
  }
}
