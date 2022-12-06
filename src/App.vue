<script setup lang="ts">
</script>

<template>
  <header>
    <h1>Academic Team Quiz</h1>
    <div class="links">
      <router-link to="quiz" class="link" active-class="active">Quiz yourself!</router-link>
      <router-link to="set" class="link" active-class="active">Create A Set!</router-link>
    </div>
  </header>
  <router-view></router-view>
</template>
