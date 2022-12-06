<template>
  <div>
    <div v-if="(set.set !== null)">
      <h1>Catagory Round</h1>
      <div v-for="([catagoryName, catagory]) in catagories" :key="catagoryName" class="indent">
        <h2>{{ displayNames[catagoryName.replace(/-\(.*\)/, "")] }}</h2>
        <div v-for="(question, index) of catagory" :key="question.id" class="indent">
          <h3>Team {{ letters[index] }}:</h3>
          <p>{{ question.definition }}</p>
          <p><b>Answer:</b> {{ question.term }}</p>
        </div>
      </div>
      <h1>Alphabet Round <span style="color: #f44;">(BETA)</span></h1>
      <h2>Letter: {{ set.set.alphabetRound.letter }}</h2>
      <ol class="indent">
        <li v-for="question in set.set.alphabetRound.questions" :key="question.id" class="alphabet-questions">
          <p>{{ question.definition }}</p>
          <p><b>Answer:</b> {{ question.term }}</p>
        </li>
      </ol>
    </div>
    <div v-else>
      <h1 class="loading">Loading...</h1>
    </div>
    <button @click="generateSet" class="generate-button">Regenerate Set</button>
  </div>
  <SetPicker ref="setPicker" />
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue';
import SetPicker from './SetPicker.vue';
import type { QuestionSet } from "../../public/data/";
const letters = reactive("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""));

const setPicker = ref();
const set = reactive<{ set: QuestionSet | null }>({ set: null });

const catagories = computed(() => {
  if (set.set === null) {
    return [];
  }
  return Object.entries(set.set.catagories).sort(([a], [b]) => a.localeCompare(b));
});

const displayNames = reactive<{ [key: string]: string }>({
  "american-government-and-economics": "American Government and Economics",
  "american-history": "American History",
  "american-literature": "American Literature",
  "fine-arts": "Fine Arts",
  geography: "Geography",
  "life-science": "Life Science",
  math: "Math",
  "physical-science": "Physical Science",
  "world-history": "World History",
  "world-literature": "World Literature",
})

const generateSet = async () => {
  const response = await fetch("/api/set", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sets: [...setPicker.value.selectedSets],
    }),
  }).then((response) => response.json());
  set.set = response;
  console.log(response);
};
onMounted(() => {
  generateSet();
});
</script>