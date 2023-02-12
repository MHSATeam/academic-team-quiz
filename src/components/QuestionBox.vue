<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import levenshtein from "js-levenshtein";

const emit = defineEmits(["next"]);
const props = defineProps<{
  question: string;
  questionId: number;
  answer: string
  quiet: boolean;
}>();

const questionBox = ref<HTMLElement | null>(null);

const answerShown = ref(false);
const showAnswer = () => {
  answerShown.value = true;
  emit("next");
}

// const checkAnswer = (correctAnswer: string, answer: string) => {
//   // A check to see if the answer is close enough to the term
//   var splitAnswer = answer
//     .toLowerCase()
//     .split(" ")
//     .filter((word) => word !== "");
//   var splitCorrectAnswer = correctAnswer
//     .toLowerCase()
//     .replace(/[[(](.*)[\])]/g, "")
//     .split(" ")
//     .filter((word) => word !== "");
//   var points = 0;
//   var maxPoints = 0;
//   for (var i = 0; i < splitCorrectAnswer.length; i++) {
//     const correctAnswerPart = splitCorrectAnswer[i];
//     for (var j = 0; j < splitAnswer.length; j++) {
//       const answerPart = splitAnswer[j];
//       if (correctAnswerPart === answerPart) {
//         if (correctAnswerPart.length <= 3) {
//           points += 3;
//         } else {
//           points += 10;
//         }
//         break;
//       }
//       if (answerPart.length > 3) {
//         var distance = levenshtein(correctAnswerPart, answerPart);
//         if (distance < 3) {
//           points += 10 - distance;
//           break;
//         }
//       }
//     }
//     if (correctAnswerPart.length <= 3) {
//       maxPoints += 3;
//     } else {
//       maxPoints += 10;
//     }
//   }
//   var percent = (points / maxPoints) * 100;

//   if (percent >= 50) {
//     isCorrect.value = true;
//   } else {
//     isCorrect.value = false;
//   }
// };
const animate = ref(props.quiet);

onMounted(async () => {
  nextTick(() => {
    animate.value = true;
    questionBox.value?.scrollIntoView({ behavior: "smooth" });
  });
});
</script>
<template>
  <div ref="questionBox" class="question-box" :class="
    (!animate ? 'hidden-left ' : '')
  ">
    <h2>{{ props.question }}</h2>
    <p class="correct-answer-text">Answer:

      <button v-if="!answerShown" @click="showAnswer" class="show-answer"></button>
      <span v-else>{{ props.answer }}</span>
    </p>
  </div>
</template>
