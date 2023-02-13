import { createApp } from "vue";
import App from "./App.vue";
import "./assets/scss/main.scss";

import { createRouter, createWebHistory } from "vue-router";
import VueMathjax from "vue-mathjax-next";
import QuizPage from "./components/QuizPage.vue";
import SetPage from "./components/SetPage.vue";
import MathPage from "./components/MathPage.vue";
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/quiz" },
    { path: "/quiz", component: QuizPage },
    { path: "/set", component: SetPage },
    { path: "/math", component: MathPage },
  ],
});

const app = createApp(App);
app.use(VueMathjax);
app.use(router);
app.mount("#app");
