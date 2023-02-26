<script setup lang="ts">
import { Box } from "@fleet-sdk/common";
import { useProgrammatic } from "@oruga-ui/oruga-next";
import BigNumber from "bignumber.js";
import { computed, PropType, ref, toRaw } from "vue";
import CloseOrderConfirm from "./CloseOfferingConfirm.vue";
import AssetIcon from "@/components/AssetIcon.vue";
import AssetRow from "@/components/AssetRow.vue";
import SigTooltip from "@/components/SigTooltip.vue";
import { TransactionFactory } from "@/offchain/transactionFactory";
import { useChainStore } from "@/stories";
import { useWalletStore } from "@/stories/walletStore";
import { formatBigNumber, parseOpenOrderBox, sendTransaction } from "@/utils";

const { oruga } = useProgrammatic();

const chain = useChainStore();
const wallet = useWalletStore();

const props = defineProps({
  box: { type: Object as PropType<Box<string>>, required: false, default: undefined },
  loadingBox: { type: Boolean, default: false },
  loadingMetadata: { type: Boolean, default: false }
});

const cancelling = ref(false);

const order = computed(() => {
  if (!props.box) {
    return;
  }

  return parseOpenOrderBox(props.box, chain.tokensMetadata, wallet.usedAddresses);
});

const ratio = computed(() => {
  if (!order.value) {
    return undefined;
  }

  const blockreward = 43 
  const collateral = order.value.collateral.reduce((acc, val) => {
    return acc.plus(val.amount);
  }, BigNumber(0));

  return collateral.div(blockreward).times(100);
});

function openModal() {
  oruga.modal.open({
    component: CloseOrderConfirm,
    props: { box: props.box },
    width: "30rem"
  });
}

async function cancelOrder() {
  const box = props.box;
  if (!box) {
    return;
  }

  await sendTransaction(async () => {
    return await TransactionFactory.cancelOrder(toRaw(box));
  }, cancelling);
}
</script>

<template>
  <div class="stats flex flex-col bg-[#37415176] text-white stats-vertical shadow" :class="{ skeleton: loadingBox }">
    <div class="stat">
      <div class="stat-title">Fees
  
      </div>
      <div class="stat-value text-success flex items-center gap-1">
        <div class="flex-grow">
          <asset-row mode="amount-then-ticker" :max-name-len="15" :asset="order?.loan" root-class="items-baseline"
            name-class="text-sm" />
        </div>
        <div v-if="loadingBox || !order" class="skeleton-fixed h-10 w-10 skeleton-circular"></div>
        <asset-icon v-else custom-class="h-10 w-10" :token-id="order.loan.tokenId" />
      </div>
    </div>

    <div class="stat">
      <div class="h-fit flex justify-between items-center">
        <span class="stat-title">Collateral</span>
        <sig-tooltip v-if="ratio" tip="Collateral/Loan ratio" class="tooltip-left">
          <span :class="{
            'badge-error': ratio.lt(100),
            'badge-warning': ratio.lt(150),
            'badge-info': ratio.gt(200)
          }" class="badge text-base-100">
            {{ formatBigNumber(ratio, 2) }}%</span>
        </sig-tooltip>
      </div>

      <div class="grid grid-cols-1 gap-2 mt-2 items-start">
        <div v-if="loadingBox" class="flex flex-row items-center gap-2">
          <div class="skeleton-fixed h-8 w-8 py-3 skeleton-circular"></div>
          <div class="flex-grow skeleton-fixed h-5"></div>
          <div class="skeleton-fixed h-5 w-1/3"></div>
        </div>
        <div v-for="collateral in order?.collateral" v-else :key="collateral.tokenId">
          <div class="flex flex-row items-center gap-2" :class="{ skeleton: loadingMetadata }">
            <asset-icon custom-class="h-8 w-8" :token-id="collateral.tokenId" :type="collateral.metadata?.type" />
            <template v-if="loadingMetadata">
              <div class="flex-grow skeleton-fixed h-5"></div>
              <div class="skeleton-fixed h-5 w-1/3"></div>
            </template>
            <template v-else>
              <asset-row link show-badge mode="ticker-then-amount" :asset="collateral" :max-name-len="15" class="w-full"
                root-class="flex-row-reverse w-full items-center gap-2" amount-class="w-full text-right"
                badge-class="w-5 h-5" />
            </template>
          </div>
        </div>
      </div>




       <div class="stat-actions text-center">
        <button v-if="order?.cancellable" class="btn btn-sm btn-center btn-primary" :class="{ loading: cancelling }"
          :disabled="!wallet.connected || loadingBox" @click="cancelOrder()">
          Cancel Offering
        </button>
        <!-- <button
          class="btn btn-sm btn-primary flex-grow"
          :disabled="!wallet.connected || loadingBox"
          @click="openModal()"
        >
          Lend
        </button> -->
      </div>
    </div>
  </div>
</template>
