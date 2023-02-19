import { Config, Modal, Notification } from "@oruga-ui/oruga-next";
import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import { setSystemTheme } from "./utils";
import Particles from "particles.vue3";
import "@oruga-ui/oruga-next/dist/oruga.css";
import "./style.css";
setSystemTheme();

const orugaSettings = {
  modal: {
    trapFocus: true,
    overlayClass: "opacity-80",
    rootClass: "outline-none",
    contentClass: "modal-box"
  }
};

const pinia = createPinia();
const app = createApp(App);

app.use(router).use(pinia).use(Config, orugaSettings).use(Modal).use(Notification).use(Particles as any).mount("#app");



