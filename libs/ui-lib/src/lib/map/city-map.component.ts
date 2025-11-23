import { Component, OnInit, Input, signal, AfterViewInit } from '@angular/core';
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
  
  constructor(public mapService: MapService) {
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
    } catch (error) {
      this.handleError(error as Error);
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
    
    try {
      await this.mapService.switchMapType(newMapType, 'map-container');
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
