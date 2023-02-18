KYA Modal  can add back later if needed 
<!-- <script setup lang="ts">
import { useUIStore } from "@/stories";

const store = useUIStore();
const emit = defineEmits(["close"]);

function accept() {
  store.setAcceptedKYA();
  emit("close");
}
</script>

<template>
  <div class="flex flex-col gap-10 tracking-normal p-2">
    <h1 class="font-semibold text-xl">Know Your Assumptions</h1>
    <div class="space-y-4 px-2">
      <p>
        <span class="font-bold">SigmaFi</span> is an open source UI for interacting with contracts
        on the Ergo Blockchain.
      </p>
      <div class="">
        <span class="font-bold">Notice that:</span>
        <ul class="list-inside">
          <li>- We don't log, collect, profile, share or sell your data;</li>
          <li>
            - SigmaFi operates on a live blockchain, thus transactions are final, and irreversible
            once they have status «<span class="font-semibold">confirmed</span>»;
          </li>
          <li>
            - Every transaction can be viewed via
            <a
              href="https://explorer.ergoplatform.com"
              target="_blank"
              class="link link-hover link-primary"
              >explorer</a
            >;
          </li>
          <li>
            -
            <a
              href="https://github.com/capt-nemo429/sigmafi-ui"
              target="_blank"
              class="link link-hover link-primary"
              >All code is open source and available</a
            >
            for public review.
          </li>
        </ul>
      </div>
      <p class="font-bold">Nautilus Team doesn't guarantee the absence of bugs and errors.</p>
      <p class="font-bold">
        NO assistance can offered if a user is hacked or cheated out of passwords, currency or
        private keys.
      </p>
      <p class="font-bold">
        This is a BETA version, we recommend that you DO NOT use it to make large transactions!
      </p>
      <div>
        <span class="font-bold">By accepting these KYA, you agree that: </span>
        <ul class="list-decimal list-inside indent-xs">
          <li>You will use the product at your own peril and risk;</li>
          <li>Only YOU are responsible for your assets;</li>
          <li>Only YOU are responsible for securely storing your recovery phrase.</li>
        </ul>
      </div>
    </div>
    <button class="btn w-full" @click="accept()">I understand and accept the KYA</button>
  </div>
</template> -->
