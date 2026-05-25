<template>
    <BaseModal title="使用说明" @close="close">
        <div class="info-sections">
            <section class="info-sec">
                <h4><i class="fas fa-mouse-pointer"></i> 基本操作</h4>
                <ul>
                    <li>点击地图标记查看事件详情</li>
                    <li>拖拽时间轴滑块快速定位年份</li>
                    <li>使用播放按钮观看历史足迹动画</li>
                    <li>点击侧边栏中的事件跳转到对应位置</li>
                </ul>
            </section>

            <section class="info-sec">
                <h4><i class="fas fa-keyboard"></i> 快捷键</h4>
                <div class="info-keys">
                    <div class="info-key-row"><kbd>Space</kbd><span>播放 / 暂停</span></div>
                    <div class="info-key-row"><kbd>←</kbd><span>上一个事件</span></div>
                    <div class="info-key-row"><kbd>→</kbd><span>下一个事件</span></div>
                    <div class="info-key-row"><kbd>Ctrl</kbd>+<kbd>K</kbd><span>打开搜索</span></div>
                    <div class="info-key-row"><kbd>Ctrl</kbd>+<kbd>F</kbd><span>打开筛选</span></div>
                    <div class="info-key-row"><kbd>Esc</kbd><span>关闭弹窗</span></div>
                </div>
            </section>

            <section class="info-sec">
                <h4><i class="fas fa-palette"></i> 标记颜色</h4>
                <div class="info-legend">
                    <span class="info-legend-item">
                        <span class="info-legend-dot" style="background:var(--color-historical)"></span>
                        历史事件
                    </span>
                    <span class="info-legend-item">
                        <span class="info-legend-dot" style="background:var(--color-article)"></span>
                        重要文章
                    </span>
                    <span class="info-legend-item">
                        <span class="info-legend-dot" style="background:var(--color-poem)"></span>
                        诗词作品
                    </span>
                </div>
            </section>

            <section class="info-sec">
                <h4><i class="fas fa-info-circle"></i> 关于</h4>
                <p>本项目通过交互式地图展示毛泽东主席1893-1976年波澜壮阔的一生足迹，让历史更加生动。</p>
            </section>
        </div>
    </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue';
import { useUIStore } from '../../stores/ui';

const uiStore = useUIStore();
function close() { uiStore.closeModal(); }
</script>

<style scoped>
.info-sections {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.info-sec h4 {
    font-size: 14px;
    color: var(--color-secondary);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.info-sec ul {
    padding-left: 18px;
    line-height: 1.8;
    color: var(--text-secondary);
    font-size: 13px;
}

.info-sec p {
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.7;
}

.info-keys {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.info-key-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-secondary);
}

kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 6px;
    border-radius: 4px;
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-color);
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-primary);
    box-shadow: 0 2px 0 var(--border-color);
}

.info-legend {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
}

.info-legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-secondary);
}

.info-legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    box-shadow: 0 0 8px currentColor;
}
</style>
