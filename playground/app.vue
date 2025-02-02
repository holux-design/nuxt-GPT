<template>
   <Chat />
</template>

<script setup lang="ts">
import { z } from 'zod'
const response = useGPT('Provide 5 alternative search terms')
   .addContextData('sneakers')
   .toStructured(
      z.object({
         suggestions: z.array(z.string()),
      }),
   )
</script>
