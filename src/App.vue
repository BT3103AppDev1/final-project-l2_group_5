<!-- src/App.vue -->
<template>
  <router-view />
</template>

<script setup>
// App.vue is the root — routing handles which view to show
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Space+Mono:wght@400;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --cs-navy:    #0D1B3E;
  --cs-blue:    #1E6FEB;
  --cs-blue-lt: #4A90F5;
  --cs-teal:    #00C2A8;
  --cs-bg:      #F4F7FD;
  --cs-surface: #FFFFFF;
  --cs-border:  #E2E8F6;
  --cs-text:    #1A2340;
  --cs-muted:   #6B7A99;
  --cs-green:   #22C55E;
  --cs-red:     #EF4444;
  --cs-amber:   #F59E0B;
  --radius:     12px;
  --shadow-sm:  0 1px 3px rgba(13,27,62,.08);
  --shadow-md:  0 4px 16px rgba(13,27,62,.12);
  --shadow-lg:  0 8px 32px rgba(13,27,62,.16);
  font-family: 'DM Sans', sans-serif;
  color: var(--cs-text);
  background: var(--cs-bg);
}

body { min-height: 100vh; }

a { color: inherit; text-decoration: none; }

button { font-family: inherit; cursor: pointer; }
</style>
