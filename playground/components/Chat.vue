<template>
  <pre>{{ messages }}</pre>
  <input
    v-model="input"
    type="text"
    @keyup.enter="send(input, () => (input = ''))"
  >
</template>

<script setup lang="ts">
const { messages, send } = useGPT().createChat()
const input = ref<string>('')
</script>
