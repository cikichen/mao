<template>
  <BaseModal title="使用说明" @close="close">
    <div class="info-content">
      <div class="info-section">
        <h4><i class="fas fa-mouse-pointer"></i> 基本操作</h4>
        <ul>
          <li>点击地图标记查看事件详情</li>
          <li>拖拽时间轴快速定位到特定年份</li>
          <li>使用播放按钮观看历史足迹动画</li>
        </ul>
      </div>
      
      <div class="info-section">
        <h4><i class="fas fa-keyboard"></i> 快捷键</h4>
        <ul>
          <li><kbd>空格</kbd> - 播放/暂停</li>
          <li><kbd>←</kbd> / <kbd>→</kbd> - 上一个/下一个事件</li>
        </ul>
      </div>

      <div class="info-section">
        <h4><i class="fas fa-palette"></i> 标记说明</h4>
        <ul class="marker-legend">
          <li><span class="marker-dot historical"></span> 历史事件</li>
          <li><span class="marker-dot article"></span> 重要文章</li>
          <li><span class="marker-dot poem"></span> 诗词作品</li>
        </ul>
      </div>

      <div class="info-section">
        <h4><i class="fas fa-info-circle"></i> 关于项目</h4>
        <p>本项目旨在通过现代化的交互方式展示毛主席的生平足迹，让历史更加生动有趣。</p>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue';
import { useUIStore } from '../../stores/ui';

const uiStore = useUIStore();

function close() {
  uiStore.closeModal();
}
</script>

<style scoped>
.info-section {
  margin-bottom: 28px;
}

.info-section h4 {
  color: var(--color-secondary);
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
}

.info-section ul {
  margin: 0;
  padding-left: 20px;
  line-height: 1.8;
  color: var(--text-secondary);
}

.info-section p {
  margin: 0;
  line-height: 1.8;
  color: var(--text-secondary);
}

kbd {
  background: var(--bg-surface-elevated);
  padding: 2px 8px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.9em;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  box-shadow: 0 2px 0 var(--border-color);
}

.marker-legend {
  list-style: none;
  padding: 0 !important;
}

.marker-legend li {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.marker-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-block;
  position: relative;
}

.marker-dot::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  opacity: 0.3;
}

.marker-dot.historical { 
  background: var(--color-primary); 
  box-shadow: 0 0 10px var(--color-primary);
}
.marker-dot.historical::after { background: var(--color-primary); }

.marker-dot.article { 
  background: var(--color-secondary); 
  box-shadow: 0 0 10px var(--color-secondary);
}
.marker-dot.article::after { background: var(--color-secondary); }

.marker-dot.poem { 
  background: var(--color-accent); 
  box-shadow: 0 0 10px var(--color-accent);
}
.marker-dot.poem::after { background: var(--color-accent); }
</style>
