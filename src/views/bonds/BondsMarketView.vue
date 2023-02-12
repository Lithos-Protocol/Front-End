<script setup lang="ts">
import { Box, isEmpty } from "@fleet-sdk/common";
import { useProgrammatic } from "@oruga-ui/oruga-next";
import { onMounted, reactive, ref } from "vue";
import BondOrderCard from "./components/BondOrderCard.vue";
import { VERIFIED_ASSETS } from "@/maps";
import { buildOrderContract } from "@/offchain/plugins";
import { graphQLService } from "@/services/graphqlService";
import { useChainStore } from "@/stories";
import { useWalletStore } from "@/stories/walletStore";
import NewLoanRequestView from "@/views/bonds/NewLoanRequestView.vue";

const { oruga } = useProgrammatic();

const wallet = useWalletStore();
const chain = useChainStore();

const boxes = ref<Box<string>[]>();
const loading = reactive({ boxes: true, metadata: true });

function openNewLoanModal() {
  oruga.modal.open({
    component: NewLoanRequestView,
    width: "30rem"
  });
}

onMounted(async () => {
  loading.boxes = true;
  loading.metadata = true;
  const contracts = VERIFIED_ASSETS.map((a) => buildOrderContract(a.tokenId, "on-close"));
  const rawBoxes = await graphQLService.getBoxes({
    ergoTrees: contracts,
    spent: false
  });
  boxes.value = rawBoxes.filter((x) => contracts.includes(x.ergoTree));
  loading.boxes = false;

  await chain.loadTokensMetadata(boxes.value.flatMap((x) => x.assets.map((t) => t.tokenId)));
  loading.metadata = false;
});
</script>

<template>
  <div class="grid grid-cols-1 gap-8">
    <div class="flex flex-row justify-end">
      <button class="btn btn-primary shadow text-flex-col" :disabled="!wallet.connected || wallet.loading"
        @click="openNewLoanModal()">
        Create Mining Offering
      </button>
    </div>
    <div class="grid grid-cols-1 gap-8 md:gap-12 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <template v-if="loading.boxes">
        <bond-order-card v-for="n in 4" :key="n" :loading-box="loading.boxes" :loading-metadata="loading.metadata" />
      </template>
      <template v-else>
        <bond-order-card v-for="box in boxes" :key="box.boxId" :box="box" :loading-box="loading.boxes"
          :loading-metadata="loading.metadata" />
      </template>
    </div>
    <div v-if="!loading.boxes && isEmpty(boxes)" class="text-7xl text-center w-full pb-20">
      <div class="py-20 opacity-90">Nothing to dispay...</div>
    </div>
  </div>
</template>
