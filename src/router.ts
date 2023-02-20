import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Dashboard from "./views/DashboardView.vue";
import BondsMarketView from "./views/bonds/MiningOfferingView.vue";
import TeamVue from "./components/Team.vue";
import Github from "./components/GitHub.vue";
import YouTube from "./components/YouTube.vue";

const routes: RouteRecordRaw[] = [
  { path: "/", name: "home", component: BondsMarketView },
  { path: "/dashboard/", name: "dashboard", component: Dashboard },
  { path: "/team/", name: "team", component: TeamVue },
  { path: "/youtube/", name: "youtube", component: YouTube },
  {
    path: "/github",
    component: Github,
    beforeEnter(to, from, next) {
      window.location.href = "https://github.com/Lithos-Protocol";
    }
  },
  {
    path: "/twitter",
    component: Github,
    beforeEnter(to, from, next) {
      window.location.href = "https://twitter.com/LITHOSProtocol";
    }
  },
  {
    path: "/telegram",
    component: Github,
    beforeEnter(to, from, next) {
      window.location.href = "https://t.me/LITHOS_Protocol";
    }
  }

];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
});
