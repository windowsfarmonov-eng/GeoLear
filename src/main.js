import { createApp } from 'vue'
import '@fontsource-variable/inter'
import './styles/main.css'
import App from './App.vue'
import { vReveal } from './directives/reveal'

const app = createApp(App)
app.directive('reveal', vReveal)
app.mount('#app')
