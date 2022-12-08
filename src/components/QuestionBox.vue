<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import levenshtein from "js-levenshtein";

const emit = defineEmits(["next"]);
const props = defineProps<{
  question: string;
  questionId: number;
  quiet: boolean;
}>();

const correctAnswer = ref("");

const inputRef = ref<HTMLInputElement | null>(null);
const questionBox = ref<HTMLElement | null>(null);

const userAnswer = ref("");
const isCorrect = ref(false);
const isSubmitted = ref(false);
const recievedAnswer = ref(false);
const hadError = ref(false);

const onSubmit = async () => {
  if (userAnswer.value.trim() === "") return;
  isSubmitted.value = true;
  try {
    const response = await fetch("/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: props.questionId,
      }),
    });
    const data = await response.json();
    correctAnswer.value = data.term;
    checkAnswer(data.term, userAnswer.value);
  } catch (error) {
    console.error(error);
    hadError.value = true;
  } finally {
    recievedAnswer.value = true;
    emit("next");
  }
};

const checkAnswer = (correctAnswer: string, answer: string) => {
  // A check to see if the answer is close enough to the term
  var splitAnswer = answer
    .toLowerCase()
    .split(" ")
    .filter((word) => word !== "");
  var splitCorrectAnswer = correctAnswer
    .toLowerCase()
    .replace(/[[(](.*)[\])]/g, "")
    .split(" ")
    .filter((word) => word !== "");
  var points = 0;
  var maxPoints = 0;
  for (var i = 0; i < splitCorrectAnswer.length; i++) {
    const correctAnswerPart = splitCorrectAnswer[i];
    for (var j = 0; j < splitAnswer.length; j++) {
      const answerPart = splitAnswer[j];
      if (correctAnswerPart === answerPart) {
        if (correctAnswerPart.length <= 3) {
          points += 3;
        } else {
          points += 10;
        }
        break;
      }
      if (answerPart.length > 3) {
        var distance = levenshtein(correctAnswerPart, answerPart);
        if (distance < 3) {
          points += 10 - distance;
          break;
        }
      }
    }
    if (correctAnswerPart.length <= 3) {
      maxPoints += 3;
    } else {
      maxPoints += 10;
    }
  }
  var percent = (points / maxPoints) * 100;

  if (percent >= 50) {
    isCorrect.value = true;
  } else {
    isCorrect.value = false;
  }
};
const animate = ref(props.quiet);

onMounted(async () => {
  setTimeout(() => {
    inputRef.value?.focus();
  }, 500);
  nextTick(() => {
    animate.value = true;
    questionBox.value?.scrollIntoView({ behavior: "smooth" });
  });
});
</script>
<template>
  <div ref="questionBox" class="question-box" :class="
    (!animate ? 'hidden-left ' : '') +
    (hadError
      ? 'error'
      : (isSubmitted && recievedAnswer
        ? (isCorrect
          ? 'correct'
          : 'incorrect')
        : ''))
  ">
    <h2>{{ props.question }}</h2>
    <form class="answer-form" @submit.prevent="onSubmit" v-if="!isSubmitted && !hadError">
      <input class="answer-input input" v-model="userAnswer" type="text" ref="inputRef" />
      <button class="answer-button" type="submit">Submit</button>
    </form>
    <div class="correct-answer" v-else-if="!hadError">
      <p class="user-answer-text">Your answer: {{ userAnswer }}</p>
      <p class="correct-answer-text">Correct answer: {{ correctAnswer }}</p>
    </div>
  </div>
</template>
