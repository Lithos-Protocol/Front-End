<script setup lang="ts">
import { isDefined } from "@fleet-sdk/common";

defineProps({ tip: { type: String, default: undefined } });
</script>

<template>
  <div :class="{ tooltip: isDefined(tip) }" :data-tip="tip" v-bind="$.attrs">
    <slot />
  </div>
</template>
