import { Component, Input, signal, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CityDataService } from '../../services/city-data.service';
import { MapService } from '../../services/map.service';
import { City } from '../../models/city.model';

@Component({
  selector: 'lib-city-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="city-map-container">
      <div class="search-section">
        <div class="input-group">
          <input
            type="text"
            class="city-input"
            placeholder="请输入城市名称 (如: 北京, New York, London...)"
            [value]="cityName()"
            (input)="cityName.set($event.target.value)"
            (keyup.enter)="searchCity()"
            [disabled]="isLoading()"
          />
          <button
            class="search-btn"
            (click)="searchCity()"
            [disabled]="isLoading() || !cityName().trim()"
          >
            <span *ngIf="!isLoading()">搜索</span>
            <span *ngIf="isLoading()">搜索中...</span>
          </button>
        </div>
        
        <div class="map-provider-selector">
          <label class="provider-label">
            <input
              type="radio"
              name="mapProvider"
              value="baidu"
              [checked]="mapProvider() === 'baidu'"
              (change)="mapProvider.set('baidu')"
              [disabled]="isLoading()"
            />
            百度地图
          </label>
          <label class="provider-label">
            <input
              type="radio"
              name="mapProvider"
              value="google"
              [checked]="mapProvider() === 'google'"
              (change)="mapProvider.set('google')"
              [disabled]="isLoading()"
            />
            Google Maps
          </label>
        </div>
      </div>

      <div class="map-section">
        <div 
          id="map-container" 
          class="map-container"
          [class.loading]="isLoading()"
        >
          <div class="loading-overlay" *ngIf="isLoading()">
            <div class="loading-spinner"></div>
            <p>正在定位城市...</p>
          </div>
        </div>
      </div>

      <div class="city-suggestions" *ngIf="availableCities().length > 0">
        <h4>可搜索的城市：</h4>
        <div class="city-tags">
          <span
            *ngFor="let city of availableCities()"
            class="city-tag"
            (click)="selectCity(city.name)"
            [class.active]="cityName() === city.name"
          >
            {{city.name}}
          </span>
        </div>
      </div>
    </div>

    <!-- Error Modal -->
    <div class="error-modal" *ngIf="errorMessage()" (click)="clearError()">
      <div class="error-content" (click)="$event.stopPropagation()">
        <div class="error-header">
          <h3>错误提示</h3>
          <button class="close-btn" (click)="clearError()">&times;</button>
        </div>
        <div class="error-body">
          <p>{{errorMessage()}}</p>
        </div>
        <div class="error-footer">
          <button class="confirm-btn" (click)="clearError()">确定</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .city-map-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f5f5f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .search-section {
      padding: 20px;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 100;
    }

    .input-group {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }

    .city-input {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s ease;
    }

    .city-input:focus {
      outline: none;
      border-color: #007bff;
    }

    .city-input:disabled {
      background: #f8f9fa;
      cursor: not-allowed;
    }

    .search-btn {
      padding: 12px 24px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      min-width: 100px;
    }

    .search-btn:hover:not(:disabled) {
      background: #0056b3;
    }

    .search-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .map-provider-selector {
      display: flex;
      gap: 20px;
      align-items: center;
    }

    .provider-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 14px;
      color: #333;
    }

    .provider-label input[type="radio"] {
      margin: 0;
    }

    .map-section {
      flex: 1;
      position: relative;
      padding: 20px;
    }

    .map-container {
      width: 100%;
      height: 100%;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      background: white;
      position: relative;
      overflow: hidden;
    }

    .map-container.loading {
      filter: blur(2px);
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255,255,255,0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 15px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .city-suggestions {
      padding: 20px;
      background: white;
      border-top: 1px solid #e0e0e0;
    }

    .city-suggestions h4 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 16px;
    }

    .city-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .city-tag {
      padding: 6px 12px;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 16px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .city-tag:hover {
      background: #e9ecef;
      border-color: #adb5bd;
    }

    .city-tag.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    /* Error Modal Styles */
    .error-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .error-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      max-width: 400px;
      width: 90%;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from { transform: translateY(50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .error-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 20px 0 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .error-header h3 {
      margin: 0;
      color: #dc3545;
      font-size: 18px;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #999;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      color: #666;
    }

    .error-body {
      padding: 20px;
    }

    .error-body p {
      margin: 0;
      color: #333;
      line-height: 1.5;
    }

    .error-footer {
      padding: 0 20px 20px 20px;
      display: flex;
      justify-content: flex-end;
    }

    .confirm-btn {
      padding: 8px 16px;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s ease;
    }

    .confirm-btn:hover {
      background: #c82333;
    }
  `]
})
export class CityMapComponent implements OnInit, OnDestroy {
  private cityDataService = inject(CityDataService);
  private mapService = inject(MapService);

  // Signals
  cityName = signal<string>('');
  mapProvider = signal<'baidu' | 'google'>('baidu');
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  availableCities = signal<City[]>([]);

  constructor() {
    // Initialize available cities
    this.availableCities.set(this.cityDataService.getCities());
    
    // Effect to handle map provider changes
    effect(() => {
      const provider = this.mapProvider();
      if (this.mapService) {
        this.initializeMap(provider);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.initializeMap(this.mapProvider());
    } catch (error) {
      this.showError('地图初始化失败: ' + (error as Error).message);
    }
  }

  ngOnDestroy(): void {
    // Cleanup map resources
    this.mapService.clearMap();
  }

  private async initializeMap(provider: 'baidu' | 'google'): Promise<void> {
    try {
      await this.mapService.initializeMap(provider, 'map-container');
    } catch (error) {
      throw new Error(`Failed to initialize ${provider} map: ${(error as Error).message}`);
    }
  }

  async searchCity(): Promise<void> {
    const cityName = this.cityName().trim();
    if (!cityName) {
      this.showError('请输入城市名称');
      return;
    }

    this.isLoading.set(true);
    this.clearError();

    try {
      const city = this.cityDataService.getCityByName(cityName);
      
      if (!city) {
        throw new Error(`未找到城市 "${cityName}"。请尝试输入：北京、上海、New York、London 等`);
      }

      await this.mapService.animateToCity(city);
      
    } catch (error) {
      this.showError((error as Error).message);
    } finally {
      this.isLoading.set(false);
    }
  }

  onMapProviderChange(): void {
    // The effect will handle the map reinitialization
  }

  selectCity(cityName: string): void {
    this.cityName.set(cityName);
    this.searchCity();
  }

  private showError(message: string): void {
    this.errorMessage.set(message);
  }

  clearError(): void {
    this.errorMessage.set('');
  }
}