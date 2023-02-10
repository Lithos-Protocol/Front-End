<script setup lang="ts">
import { useProgrammatic } from "@oruga-ui/oruga-next";
import { onMounted } from "vue";
import { useUIStore } from "@/stories";
import KYAView from "@/views/KYAView.vue";
const { oruga } = useProgrammatic();

const store = useUIStore();

onMounted(() => {
  if (!store.isKYAAccepted.value) {
    openKYAModal();
  }
});

function openKYAModal() {
  oruga.modal.open({
    component: KYAView,
    canCancel: store.isKYAAccepted.value
  });
}
</script>

<template>
  <footer class="footer p-10 bg-base-300 bg-opacity-50 z-30 text-base-content">
    <div>
      <img src="/Lithos_MARK3.svg" width="200" height="200" class="mb-16" />
    </div>
    <div>
      <span class="footer-title">Open Source</span>
      <a href="https://github.com/Lithos-Protocol" class="link link-hover" target="_blank"
        rel="noopener noreferrer">GitHub</a>
    </div>
    <div>
      <span class="footer-title">Social</span>
      <a class="link link-hover" target="_blank" rel="noopener noreferrer"
        href="https://twitter.com/LITHOSProtocol">Twitter</a>
      <a href="https://github.com/Lithos-Protocol" class="link link-hover" target="_blank"
        rel="noopener noreferrer">GitHub</a>
    </div>
    <div>
      <span class="footer-title">KYA</span>
      <a class="link link-hover" @click="openKYAModal">Know Your Assumptions</a>
    </div>
  </footer>
</template>
