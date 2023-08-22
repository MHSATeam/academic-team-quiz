<script lang="ts" setup>
import { nextTick, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const password = ref("");
const passwordInput = ref<HTMLInputElement | null>(null);
const loading = ref(false);

const router = useRouter();

const getPasswordHash = async (password: string) => {
  const utf8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((bytes) => bytes.toString(16).padStart(2, "0")).join("");
};
const onSubmit = async (event: Event) => {
  event.preventDefault();
  loading.value = true;
  const hash = await getPasswordHash(password.value);
  const response: { success: boolean; error?: string } = await (
    await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ hash }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();

  if (response.success) {
    router.push({
      path: "/",
    });
  } else {
    if (response.error) {
      alert(response.error);
    }
    loading.value = false;
  }
};

onMounted(() => {
  nextTick(() => {
    passwordInput.value?.focus();
  });
});
</script>

<template>
  <div class="login-box">
    <h1>Academic Team Quiz</h1>
    <form @submit="onSubmit" class="login-form">
      <input
        class="password-input"
        type="password"
        name="password"
        id="password"
        placeholder="Password"
        v-model="password"
        ref="passwordInput"
      />
      <button @click="onSubmit" class="submit-button" :disabled="loading">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-loader-2 rotating"
          v-if="loading"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-lock"
          v-else
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Login
      </button>
    </form>
  </div>
</template>

<style>
.login-box {
  display: flex;
  flex-direction: column;
  position: absolute;
  gap: 1.5em;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 1em;
  border: 1px solid black;
  padding: 3em;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5em;
}

.password-input {
  padding: 0.5em;
  border-radius: 0.5em;
  border: 2px solid #ccc;
}

.submit-button {
  padding: 0.5em;
  border-radius: 0.5em;
  border: 2px solid #1a4;
  background-color: #1c4;
  color: #fff;
  font-size: larger;
  align-items: center;
  font-weight: bold;
  display: flex;
  justify-content: center;
  gap: 0.25em;
}

.submit-button:hover {
  cursor: pointer;
}

.submit-button:active {
  background-color: #1a4;
  cursor: pointer;
}

.submit-button:disabled {
  background-color: gray;
  border: 2px solid #999;
  cursor: initial;
}
.rotating {
  animation: rotate 1s linear infinite;
}
@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}
</style>
