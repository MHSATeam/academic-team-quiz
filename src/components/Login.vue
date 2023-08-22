<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const password = ref("");

const router = useRouter();

const getPasswordHash = async (password: string) => {
  const utf8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((bytes) => bytes.toString(16).padStart(2, "0")).join("");
};
const onSubmit = async () => {
  const hash = await getPasswordHash(password.value);
  console.log(password.value);
  console.log(hash);
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
  }
};
</script>

<template>
  <div class="login-box">
    <h1>Academic Team Quiz</h1>
    <input
      class="password-input"
      type="password"
      name="password"
      id="password"
      placeholder="Password"
      v-model="password"
    />
    <button @click="onSubmit" class="submit-button">Login</button>
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
  font-size: large;
  font-weight: bold;
}

.submit-button:hover {
  cursor: pointer;
}

.submit-button:active {
  background-color: #1a4;
  cursor: pointer;
}
</style>
