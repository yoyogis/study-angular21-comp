import { Injectable, inject } from '@angular/core';
import { City } from '../models/city.model';

declare const BMapGL: any;
declare const BMapGL_Lib: any;
declare const google: any;

export interface MapMarker {
  position: { lat: number; lng: number };
  title: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private baiduMap: any;
  private googleMap: any;
  private currentProvider: 'baidu' | 'google' = 'baidu';
  private currentMarker: any;

  async initializeMap(provider: 'baidu' | 'google', containerId: string): Promise<void> {
    this.currentProvider = provider;
    
    if (provider === 'baidu') {
      await this.loadBaiduMapScript();
      this.initBaiduMap(containerId);
    } else {
      await this.loadGoogleMapScript();
      this.initGoogleMap(containerId);
    }
  }

  private async loadBaiduMapScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).BMapGL) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://api.map.baidu.com/api?v=1.0&type=webgl&ak=YOUR_BAIDU_API_KEY';
      script.onload = () => {
        // Load the drawing library for Baidu Maps
        const libScript = document.createElement('script');
        libScript.type = 'text/javascript';
        libScript.src = 'https://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js';
        libScript.onload = () => resolve();
        libScript.onerror = () => reject(new Error('Failed to load Baidu Map library'));
        document.head.appendChild(libScript);
      };
      script.onerror = () => reject(new Error('Failed to load Baidu Map'));
      document.head.appendChild(script);
    });
  }

  private async loadGoogleMapScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).google && (window as any).google.maps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_API_KEY';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Map'));
      document.head.appendChild(script);
    });
  }

  private initBaiduMap(containerId: string): void {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id '${containerId}' not found`);
    }

    this.baiduMap = new BMapGL.Map(containerId);
    this.baiduMap.centerAndZoom(new BMapGL.Point(116.404, 39.915), 5);
    this.baiduMap.enableScrollWheelZoom(true);
  }

  private initGoogleMap(containerId: string): void {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id '${containerId}' not found`);
    }

    this.googleMap = new google.maps.Map(document.getElementById(containerId), {
      center: { lat: 39.9042, lng: 116.4074 },
      zoom: 5,
      mapTypeId: 'roadmap'
    });
  }

  async animateToCity(city: City): Promise<void> {
    if (this.currentProvider === 'baidu') {
      await this.animateBaiduMapToCity(city);
    } else {
      await this.animateGoogleMapToCity(city);
    }
  }

  private async animateBaiduMapToCity(city: City): Promise<void> {
    return new Promise((resolve) => {
      // Zoom out to global view
      this.baiduMap.setZoom(2);
      
      setTimeout(() => {
        // Pan to city location
        const point = new BMapGL.Point(city.coordinates.lng, city.coordinates.lat);
        this.baiduMap.panTo(point);
        
        setTimeout(() => {
          // Zoom in to city level
          this.baiduMap.setZoom(12);
          
          setTimeout(() => {
            // Add marker with info window
            this.addBaiduMarker(city);
            resolve();
          }, 1000);
        }, 1000);
      }, 1000);
    });
  }

  private async animateGoogleMapToCity(city: City): Promise<void> {
    return new Promise((resolve) => {
      // Zoom out to global view
      this.googleMap.setZoom(2);
      
      setTimeout(() => {
        // Pan to city location
        this.googleMap.panTo({ lat: city.coordinates.lat, lng: city.coordinates.lng });
        
        setTimeout(() => {
          // Zoom in to city level
          this.googleMap.setZoom(12);
          
          setTimeout(() => {
            // Add marker with info window
            this.addGoogleMarker(city);
            resolve();
          }, 1000);
        }, 1000);
      }, 1000);
    });
  }

  private addBaiduMarker(city: City): void {
    if (this.currentMarker) {
      this.baiduMap.removeOverlay(this.currentMarker);
    }

    const point = new BMapGL.Point(city.coordinates.lng, city.coordinates.lat);
    const marker = new BMapGL.Marker(point);
    
    const infoWindow = new BMapGL.InfoWindow(
      `<div style="padding: 10px; max-width: 200px;">
        <h3 style="margin: 0 0 8px 0; color: #333;">${city.name}</h3>
        <p style="margin: 0 0 5px 0; color: #666; font-size: 12px;">${city.country}</p>
        <p style="margin: 0; color: #555; font-size: 13px; line-height: 1.4;">${city.description}</p>
      </div>`,
      {
        width: 220,
        height: 120,
        title: city.name
      }
    );

    marker.addEventListener('click', () => {
      this.baiduMap.openInfoWindow(infoWindow, point);
    });

    this.baiduMap.addOverlay(marker);
    this.currentMarker = marker;
    
    // Auto open the info window
    this.baiduMap.openInfoWindow(infoWindow, point);
  }

  private addGoogleMarker(city: City): void {
    if (this.currentMarker) {
      this.currentMarker.setMap(null);
    }

    const marker = new google.maps.Marker({
      position: { lat: city.coordinates.lat, lng: city.coordinates.lng },
      map: this.googleMap,
      title: city.name
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; max-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #333;">${city.name}</h3>
          <p style="margin: 0 0 5px 0; color: #666; font-size: 12px;">${city.country}</p>
          <p style="margin: 0; color: #555; font-size: 13px; line-height: 1.4;">${city.description}</p>
        </div>
      `,
      maxWidth: 220
    });

    marker.addListener('click', () => {
      infoWindow.open(this.googleMap, marker);
    });

    this.currentMarker = marker;
    
    // Auto open the info window
    infoWindow.open(this.googleMap, marker);
  }

  clearMap(): void {
    if (this.currentProvider === 'baidu' && this.baiduMap) {
      this.baiduMap.clearOverlays();
    } else if (this.currentProvider === 'google' && this.googleMap) {
      if (this.currentMarker) {
        this.currentMarker.setMap(null);
      }
    }
    this.currentMarker = null;
  }
}