<script setup lang="ts">
import { QueryBoxesArgs } from "@ergo-graphql/types";
import { Amount, Box, isDefined, isEmpty, some } from "@fleet-sdk/common";
import { ErgoAddress } from "@fleet-sdk/core";
import { reactive, ref, watch } from "vue";
import BondCard from "./bonds/components/BondCard.vue";
import { VERIFIED_ASSETS } from "@/maps";
import { buildBondContract, buildOrderContract } from "@/offchain/plugins";
import { graphQLService } from "@/services/graphqlService";
import { useChainStore } from "@/stories";
import { useWalletStore } from "@/stories/walletStore";
import BondOrderCard from "@/views/bonds/components/BondOrderCard.vue";
import NewLoanRequestView from "@/views/bonds/NewLoanRequestView.vue";
import { useProgrammatic } from "@oruga-ui/oruga-next";

const { oruga } = useProgrammatic();
const chain = useChainStore();
const wallet = useWalletStore();

type Tab = "orders" | "loans" | "debits";

const selectedTab = ref<Tab>("orders");
const boxes = ref<Box<string>[]>([]);
const loading = reactive({ boxes: true, metadata: true });

function openNewLoanModal() {
  oruga.modal.open({
    component: NewLoanRequestView,
    width: "30rem"
  });
}

let publicKeys: string[] = [];

watch(
  () => {
    return {
      address: wallet.changeAddress,
      tab: selectedTab.value
    };
  },
  async (newVal, oldVal) => {
    if (!newVal || !newVal.address) {
      boxes.value = [];

      return;
    }

    if (newVal.address !== oldVal?.address) {
      publicKeys = [];
    }

    if (isEmpty(publicKeys)) {
      if (isEmpty(wallet.usedAddresses)) {
        setLoading(false);

        return;
      }

      publicKeys = wallet.usedAddresses.map((addr) =>
        ErgoAddress.fromBase58(addr).ergoTree.substring(2)
      );
    }

    switch (newVal.tab) {
      case "loans":
        await loadLoans(newVal.tab);
        break;
      case "debits":
        await loadDebits(newVal.tab);
        break;
      case "orders":
      default:
        await loadOpenOrders(newVal.tab);
        break;
    }
  },
  { immediate: true }
);

async function setLoading(state: boolean) {
  loading.boxes = state;
  loading.metadata = state;
}

async function loadOpenOrders(tab: Tab) {
  await loadData(
    tab,
    publicKeys.map((pk) => ({
      pk,
      args: {
        ergoTrees: VERIFIED_ASSETS.map((a) => buildOrderContract(a.tokenId, "on-close")),
        spent: false,
        registers: { R4: pk }
      }
    })),
    (pk) => (box) => isDefined(box.additionalRegisters.R4) && box.additionalRegisters.R4 === pk
  );
}

async function loadLoans(tab: Tab) {
  await loadData(
    tab,
    publicKeys.map((pk) => ({
      pk,
      args: {
        ergoTrees: VERIFIED_ASSETS.map((a) => buildBondContract(a.tokenId)),
        spent: false,
        registers: { R8: pk }
      }
    })),
    (pk) => (box) => isDefined(box.additionalRegisters.R8) && box.additionalRegisters.R8 === pk
  );
}

async function loadDebits(tab: Tab) {
  await loadData(
    tab,
    publicKeys.map((pk) => ({
      pk,
      args: {
        ergoTrees: VERIFIED_ASSETS.map((a) => buildBondContract(a.tokenId)),
        spent: false,
        registers: { R5: pk }
      }
    })),
    (pk) => (box) => isDefined(box.additionalRegisters.R5) && box.additionalRegisters.R5 === pk
  );
}

async function loadData(
  tab: Tab,
  queries: { args: QueryBoxesArgs; pk: string }[],
  validate: (pk: string) => (box: Box<Amount>) => boolean
) {
  setLoading(true);

  boxes.value = [];
  for (const query of queries) {
    const chunk = await graphQLService.getBoxes(query.args);

    if (selectedTab.value !== tab) {
      break;
    }

    if (some(chunk)) {
      boxes.value = boxes.value.concat(chunk.filter(validate(query.pk)));

      loading.boxes = false;
      await chain.loadTokensMetadata(chunk.flatMap((x) => x.assets.map((t) => t.tokenId)));
      loading.metadata = false;
    }
  }

  setLoading(false);
}
</script>

<template>
  <div class="flex flex-row justify-end">
    <button class="btn btn-primary shadow text-flex-col" :disabled="!wallet.connected || wallet.loading"
      @click="openNewLoanModal()">
      Create Mining Offering
    </button>
  </div>
  <div class="grid grid-cols-1 gap-8">
    <div class="tabs tabs-boxed max-w-max">
      <a class="tab text-md" :class="{ 'tab-active': selectedTab === 'orders' }" @click="selectedTab = 'orders'">Open
        Mining Offerings</a>
      <a class="tab text-md" :class="{ 'tab-active': selectedTab === 'loans' }" @click="selectedTab = 'loans'">Active
        Offerings</a>
      <a class="tab text-md" :class="{ 'tab-active': selectedTab === 'debits' }"
        @click="selectedTab = 'debits'">Completed Offerings</a>
    </div>

    <div class="grid grid-cols-1 gap-8 md:gap-12 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <template v-if="selectedTab === 'orders'">
        <bond-order-card v-if="loading.boxes" :loading-box="loading.boxes" :loading-metadata="loading.metadata" />
        <bond-order-card v-for="box in boxes" v-else :key="box.boxId" :box="box" :loading-box="loading.boxes"
          :loading-metadata="loading.metadata" />
      </template>
      <template v-else>
        <bond-card v-if="loading.boxes" :loading-box="loading.boxes" :loading-metadata="loading.metadata" />
        <bond-card v-for="box in boxes" v-else :key="box.boxId" :box="box" :loading-box="loading.boxes"
          :loading-metadata="loading.metadata" />
      </template>
    </div>
    <div v-if="!loading.boxes && isEmpty(boxes)" class="text-5xl text-center w-full">
      <div class="opacity-90">No Active Offerings...</div>
    </div>
  </div>
</template>
