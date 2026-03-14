<script setup>
import CreateJobView from './createJob/createJob.vue'
</script>

<template>
  <CreateJobView />
</template>

<style>
/* 3. We removed 'scoped' and cleared out the default Vue CSS 
      so it doesn't mess up our custom 3-column grid layout. */
body {
  margin: 0;
  padding: 0;
  background-color: #f8fafc; /* Matches the background of our UI */
}
</style>