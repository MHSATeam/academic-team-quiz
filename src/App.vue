<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import QuestionBox from "./components/QuestionBox.vue";
import SetPicker from "./components/SetPicker.vue";

const setPicker = ref();

const questions = reactive<{ id: number; question: string; quiet: boolean }[]>(
  []
);
const nextQuestion = async (quiet: boolean = false, errorCount = 0) => {
  const question = {
    id: 0,
    question: "",
    quiet,
  };
  try {
    const response = await fetch("/api/question", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sets: [...setPicker.value.selectedSets],
      }),
    }).then((response) => response.json());
    question.question = response.definition;
    question.id = response.id;
  } catch (e) {
    console.error(e);
    if (errorCount < 3) {
      nextQuestion(quiet, errorCount + 1);
    } else {
      alert(
        "There was an error fetching the question. Please try again later."
      );
    }
    return;
  }
  questions.push(question);
};
const swapLastQuestion = async () => {
  await nextQuestion(true);
  questions.splice(questions.length - 2, 1);
};

onMounted(() => {
  nextQuestion();
});
</script>

<template>
  <header>
    <h1>Academic Team Quiz</h1>
  </header>
  <main @click="setPicker.toggle(false)">
    <QuestionBox v-for="(question, index) in questions" :question="question.question" :question-id="question.id"
      :key="index" @next="nextQuestion()" :quiet="question.quiet" />
  </main>
  <SetPicker @update="swapLastQuestion" ref="setPicker" />
</template>
