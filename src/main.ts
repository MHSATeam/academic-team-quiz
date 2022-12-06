import { createApp } from "vue";
import App from "./App.vue";

import "./assets/scss/main.scss";

import { createRouter, createWebHistory } from "vue-router";
import QuizPage from "./components/QuizPage.vue";
import SetPage from "./components/SetPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/quiz" },
    { path: "/quiz", component: QuizPage },
    { path: "/set", component: SetPage },
  ],
});

const app = createApp(App);
app.use(router);
app.mount("#app");
