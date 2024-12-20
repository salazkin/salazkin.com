<template>
  <svg id="main-svg">
    <Fish v-for="fishId in reversedFishIds" :key="fishId" :fishId="fishId" />
  </svg>
  <Logo />
</template>

<script setup lang="ts">
import Logo from "components/Logo.vue";
import { computed } from "vue";
import { FishViewModel } from "model/FishViewModel";
import Fish from "components/Fish.vue";

const reversedFishIds = computed(() => {
  return Array.from(Array(FishViewModel.totalFishCount).keys()).reverse();
});
</script>

<style>
#main-svg {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
