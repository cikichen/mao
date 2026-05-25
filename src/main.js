import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './style.css';


const app = createApp(App);
app.use(createPinia());
app.mount('#app');

// 移除静态加载动画
const loadingOverlay = document.getElementById('loading');
if (loadingOverlay) {
    loadingOverlay.remove();
}


