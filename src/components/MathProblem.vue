<template>
  <div class="question">
    <vue-mathjax :formula="problem.question" :options="TEX_OPTIONS" />
    <p class="correct-answer-text">{{
      problem.answerType === AnswerType.AllOrdered ? "Answers in order:" :
      (problem.answerType === AnswerType.Any) ? "Answers (only one needed):" : "Answer(s):"
    }}&nbsp;
      <button v-if="!answerShown" @click="() => {
        answerShown = true;
      }" class="show-answer"></button>
      <span v-show="answerShown"><vue-mathjax
          :formula="problem.answers.map((a) => '$' + a + '$').join(', ')" :options="TEX_OPTIONS" /></span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { AnswerType, Problem } from '../math-types';

const TEX_OPTIONS = reactive({
  tex2jax: {
    inlineMath: [
      ["$", "$"],
    ],
    displayMath: [
      ["$$", "$$"],
    ],
    processEscapes: true,
    processEnvironments: true,
  },
});

const answerShown = ref(false);

const {problem} = defineProps<{problem: Problem}>();
</script>