<template>
   <pre>{{ messages }}</pre>
   <input
      type="text"
      v-model="input"
      @keyup.enter="send(input, () => (input = ''))" />
</template>

<script setup lang="ts">
const { messages, send } = useGPT().createChat()
const input = ref<string>('')
</script>
