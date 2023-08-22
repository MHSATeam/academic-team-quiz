import { createApp } from "vue";
import App from "./App.vue";
import "./assets/scss/main.scss";
import { inject } from "@vercel/analytics";

import { createRouter, createWebHistory } from "vue-router";
import VueMathjax from "vue-mathjax-next";
import QuizPage from "./components/QuizPage.vue";
import SetPage from "./components/SetPage.vue";
import MathPage from "./components/MathPage.vue";
import Login from "./components/Login.vue";
inject();
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/quiz" },
    { path: "/quiz", component: QuizPage },
    { path: "/set", component: SetPage },
    { path: "/math", component: MathPage },
    { path: "/login", component: Login, name: "login" },
  ],
});
router.beforeEach(async (to, from) => {
  const heartbeat = await (await fetch("/api/heartbeat")).json();
  if (!heartbeat.alive) {
    if (to.name !== "login") {
      return { name: "login" };
    }
  }
});

const app = createApp(App);
app.use(VueMathjax);
app.use(router);
app.mount("#app");
