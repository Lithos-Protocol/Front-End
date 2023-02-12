<script setup lang="ts">
import { Box } from "@fleet-sdk/common";
import { ExternalLinkIcon } from "@zhuowenli/vue-feather-icons";
import { computed, PropType, ref, toRaw } from "vue";
import AssetIcon from "@/components/AssetIcon.vue";
import AssetRow from "@/components/AssetRow.vue";
import { TransactionFactory } from "@/offchain/transactionFactory";
import { useChainStore } from "@/stories";
import { useWalletStore } from "@/stories/walletStore";
import { addressUrlFor, shortenString } from "@/utils";
import { parseBondBox, sendTransaction } from "@/utils";

const chain = useChainStore();
const wallet = useWalletStore();

const props = defineProps({
  box: { type: Object as PropType<Box<string>>, required: false, default: undefined },
  loadingBox: { type: Boolean, default: false },
  loadingMetadata: { type: Boolean, default: false }
});

const loading = ref(false);

const termProgress = computed(() => {
  if (!props.box || !bond.value) {
    return 0;
  }

  let blocksLeft = bond.value.term.blocks;

  if (blocksLeft < 0) {
    return 100;
  }

  const totalTerm = chain.height - props.box.creationHeight + blocksLeft;

  return (((totalTerm - blocksLeft) / totalTerm) * 100).toFixed(1);
});

const bond = computed(() => {
  if (!props.box) {
    return;
  }

  return parseBondBox(props.box, chain.tokensMetadata, chain.height, wallet.usedAddresses);
});

const blocksLeft = computed(() => {
  if (!bond.value) {
    return "";
  }

  let blocks = bond.value?.term.blocks;

  return `${(blocks < 0 ? blocks * -1 : blocks).toLocaleString()} blocks ${
    blocks < 0 ? "passed" : "left"
  }`;
});

async function liquidate() {
  const box = props.box;
  if (!box) {
    return;
  }

  await sendTransaction(async () => {
    return await TransactionFactory.liquidate(toRaw(box));
  }, loading);
}

async function repay() {
  const box = props.box;
  if (!box) {
    return;
  }

  await sendTransaction(async () => {
    return await TransactionFactory.repay(toRaw(box));
  }, loading);
}
</script>

<template>
  <div
    class="stats flex flex-col bg-base-100 stats-vertical shadow"
    :class="{ skeleton: loadingBox }"
  >
    <div class="stat">
      <div class="stat-title skeleton-placeholder">Repayment</div>
      <div class="stat-value text-success flex items-center gap-1">
        <div class="flex-grow">
          <asset-row
            :max-name-len="15"
            :asset="bond?.repayment"
            mode="amount-then-ticker"
            root-class="items-baseline"
            name-class="text-sm"
          />
        </div>
        <div v-if="loadingBox || !bond" class="skeleton-fixed h-10 w-10 skeleton-circular"></div>
        <asset-icon v-else custom-class="h-10 w-10" :token-id="bond.repayment.tokenId" />
      </div>
    </div>

    <div class="stat">
      <div class="stat-title h-fit">Collateral</div>
      <div class="grid grid-cols-1 gap-2 mt-2 items-start">
        <div v-if="loadingBox" class="flex flex-row items-center gap-2">
          <div class="skeleton-fixed h-8 w-8 skeleton-circular"></div>
          <div class="flex-grow skeleton-fixed h-5"></div>
          <div class="skeleton-fixed h-5 w-1/3"></div>
        </div>
        <div v-for="collateral in bond?.collateral" v-else :key="collateral.tokenId">
          <div class="flex flex-row items-center gap-2" :class="{ skeleton: loadingMetadata }">
            <asset-icon
              custom-class="h-8 w-8"
              :token-id="collateral.tokenId"
              :type="collateral.metadata?.type"
            />
            <template v-if="loadingMetadata">
              <div class="flex-grow skeleton-fixed h-5"></div>
              <div class="skeleton-fixed h-5 w-1/3"></div>
            </template>
            <template v-else>
              <div class="flex-grow">
                <asset-row
                  link
                  show-badge
                  :asset="collateral"
                  :max-name-len="15"
                  root-class="flex-row-reverse w-full items-center gap-2"
                  amount-class="w-full text-right"
                  badge-class="w-5 h-5"
                />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-grow opacity-0"></div>

    <div v-if="bond?.type === 'debit'" class="stat">
      <div class="stat-title skeleton-placeholder">Collateral Provider</div>
      <a
        :href="addressUrlFor(bond?.lender)"
        class="link link-hover text-sm skeleton-placeholder"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ shortenString(bond?.lender, 25) }}
        <external-link-icon class="inline pb-1" />
      </a>
    </div>
    <div v-else class="stat">
      <div class="stat-title skeleton-placeholder">Miner</div>
      <a
        :href="addressUrlFor(bond?.borrower)"
        class="link link-hover text-sm skeleton-placeholder"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ shortenString(bond?.borrower, 25) }}
        <external-link-icon class="inline pb-1" />
      </a>
    </div>
    <div class="stat">
      <div class="flex">
        <div class="flex-grow">
          <div class="stat-title skeleton-placeholder"># of Blocks</div>
          <div class="stat-value skeleton-placeholder flex-grow">
            {{ bond?.term.value }} {{ bond?.term.interval }}
          </div>
          <div class="stat-desc skeleton-placeholder">
            {{ blocksLeft }}
          </div>
        </div>
        <div
          class="radial-progress text-xs"
          :style="`--value: ${termProgress}; --size: 3rem; --thickness: 0.2rem;`"
        >
          {{ termProgress }}%
        </div>
      </div>

      <div class="stat-actions text-center flex gap-2">
        <button
          v-if="bond?.liquidable"
          class="btn btn-sm btn-primary flex-grow"
          :class="{ loading }"
          :disabled="!wallet.connected || loadingBox"
          @click="liquidate()"
        >
          Liquidate
        </button>
        <button
          v-else-if="bond?.repayable"
          :class="{ loading }"
          class="btn btn-sm btn-primary flex-grow"
          :disabled="!wallet.connected || loadingBox"
          @click="repay()"
        >
          Repay
        </button>
      </div>
    </div>
  </div>
</template>
