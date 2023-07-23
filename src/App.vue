<script setup lang="ts"></script>

<template>
  <header class="no-print">
    <h1>Academic Team Quiz</h1>
    <div class="links">
      <router-link to="quiz" class="link" active-class="active"
        >Quiz Yourself!</router-link
      >
      <router-link to="set" class="link" active-class="active"
        >Create A Set!</router-link
      >
      <router-link to="math" class="link" active-class="active"
        >Practice Math!</router-link
      >
    </div>
  </header>
  <router-view></router-view>
</template>
