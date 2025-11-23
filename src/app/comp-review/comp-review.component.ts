import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CityMapComponent } from '@study-angular21-comp/ui-lib';

@Component({
  selector: 'app-comp-review',
  standalone: true,
  imports: [CommonModule, CityMapComponent],
  template: `
    <div class="comp-review-container">
      <div class="header">
        <h1>地图组件演示</h1>
        <p class="subtitle">城市定位与信息展示组件</p>
      </div>
      
      <div class="component-showcase">
        <lib-city-map></lib-city-map>
      </div>
      
      <div class="features-info">
        <h3>功能特性：</h3>
        <ul>
          <li>✅ 支持百度地图和Google Maps切换</li>
          <li>✅ 输入城市名称自动定位</li>
          <li>✅ 平滑的缩放动画效果（2秒）</li>
          <li>✅ 气泡信息窗口展示城市简介</li>
          <li>✅ 错误处理和用户友好的提示</li>
          <li>✅ 响应式设计</li>
          <li>✅ Angular v20 Signal API</li>
          <li>✅ Standalone Component架构</li>
        </ul>
        
        <h3>使用说明：</h3>
        <ol>
          <li>在输入框中输入城市名称（如：北京、上海、New York、London等）</li>
          <li>点击"搜索"按钮或按回车键</li>
          <li>选择地图提供商（百度地图或Google Maps）</li>
          <li>也可以直接点击下方的城市标签快速定位</li>
        </ol>
        
        <h3>技术实现：</h3>
        <ul>
          <li>使用Angular v20 Signal API进行状态管理</li>
          <li>Standalone Component架构</li>
          <li>依赖注入模式</li>
          <li>异步地图API加载</li>
          <li>动画效果实现</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .comp-review-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      color: white;
    }

    .header h1 {
      font-size: 3rem;
      margin: 0 0 10px 0;
      font-weight: 700;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .subtitle {
      font-size: 1.2rem;
      opacity: 0.9;
      margin: 0;
    }

    .component-showcase {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
      margin-bottom: 40px;
      height: 80vh;
      min-height: 600px;
    }

    .features-info {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 800px;
      margin: 0 auto;
    }

    .features-info h3 {
      color: #333;
      font-size: 1.5rem;
      margin: 0 0 20px 0;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }

    .features-info ul, .features-info ol {
      margin: 0 0 30px 0;
      padding-left: 20px;
    }

    .features-info li {
      margin-bottom: 10px;
      line-height: 1.6;
      color: #555;
    }

    .features-info ul li::marker {
      color: #667eea;
    }

    .features-info ol li::marker {
      color: #764ba2;
      font-weight: bold;
    }

    @media (max-width: 768px) {
      .header h1 {
        font-size: 2rem;
      }
      
      .subtitle {
        font-size: 1rem;
      }
      
      .component-showcase {
        height: 70vh;
        min-height: 500px;
      }
      
      .features-info {
        padding: 20px;
      }
    }
  `]
})
export class CompReviewComponent {}