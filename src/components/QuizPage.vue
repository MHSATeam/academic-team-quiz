<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import QuestionBox from "./QuestionBox.vue";
import SetPicker from "./SetPicker.vue";

const setPicker = ref();

const questions = reactive<{ id: number; question: string; answer: string; quiet: boolean }[]>(
  []
);
const nextQuestion = async (quiet: boolean = false, errorCount = 0): Promise<void> => {
  const question = {
    id: 0,
    question: "",
    answer: "",
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
    if (questions.find(q => q.id === response.id)) {
      return nextQuestion(quiet, errorCount + 0.5);
    }
    question.question = response.definition;
    question.id = response.id;
    question.answer = response.term;
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
  <main>
    <QuestionBox v-for="(question, index) in questions" :question="question.question" :answer="question.answer"
      :question-id="question.id" :key="index" @next="nextQuestion()" :quiet="question.quiet" />
    <h1 v-if="(questions.length === 0)" class="loading">Loading...</h1>
  </main>
  <SetPicker @update="swapLastQuestion" ref="setPicker" />
</template>