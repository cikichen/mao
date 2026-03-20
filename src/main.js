import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

// 引入全局样式 (已在 index.html 中通过 link 标签引入)
// CSS loaded via index.html for reliability

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

// Initialize config store
import { useConfigStore } from './stores/config';
const configStore = useConfigStore();

app.mount('#app');

// 移除静态加载动画
const loadingOverlay = document.getElementById('loading');
if (loadingOverlay) {
    loadingOverlay.remove();
}
