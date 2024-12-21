<template>
  <svg class="main-svg">
    <Fish v-for="fishId in reversedFishIds" :key="fishId" :fishId="fishId" />
  </svg>
  <LinkButton />
</template>

<script setup lang="ts">
import Fish from "components/Fish.vue";
import LinkButton from "components/LinkButton.vue";
import { FishViewModel } from "model/FishViewModel";
import { computed } from "vue";

const reversedFishIds = computed(() => {
  return Array.from(Array(FishViewModel.totalFishCount).keys()).reverse();
});
</script>

<style scoped>
.main-svg {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
