<script setup lang="ts">
const { messages, send, status } = useGPT().createChat({ stream: true })
const input = ref<string>('')
</script>

<template>
  <pre>Status: {{ status }}</pre>
  <pre>{{ messages }}</pre>
  <input
    v-model="input"
    type="text"
    @keyup.enter="send(input, () => (input = ''))"
  >
</template>
