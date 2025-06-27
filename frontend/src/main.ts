import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(VueVirtualScroller)

app.use(createPinia())
app.use(router)

app.mount('#app')
