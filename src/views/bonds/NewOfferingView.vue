<script setup lang="ts">
import { decimalize, first, isEmpty, TokenAmount } from "@fleet-sdk/common";
import useVuelidate from "@vuelidate/core";
import { helpers, required } from "@vuelidate/validators";
import { BigNumber } from "bignumber.js";
import { differenceBy, remove } from "lodash-es";
import { computed, reactive, ref } from "vue";
import AssetIcon from "@/components/AssetIcon.vue";
import AssetInput from "@/components/AssetInput.vue";
import CleaveInput from "@/components/CleaveInput.vue";
import SigDropdown from "@/components/SigDropdown.vue";
import { ERG_TOKEN_ID } from "@/constants";
import { VERIFIED_ASSETS } from "@/maps";
import { TransactionFactory } from "@/offchain/transactionFactory";
import { useWalletStore } from "@/stories/walletStore";
import { AssetInfo } from "@/types";
import { formatBigNumber, sendTransaction, shortenString, undecimalizeBigNumber } from "@/utils";
import { minValue } from "@/validators/bigNumbers";

const wallet = useWalletStore();
const emit = defineEmits(["close"]);

type CollateralAsset = TokenAmount<string> & {
  info: AssetInfo<bigint>;
};

const loading = ref(false);
const state = reactive({
  loan: {
    amount: "",
    asset: first(VERIFIED_ASSETS)
  },
  term: {
    value: "",
    interval: "days" as "hours" | "days" | "months"
  },
  collateral: [] as CollateralAsset[],
  interest: ""
});

const unselectedAssets = computed(() => {
  if (isEmpty(state.collateral)) {
    return wallet.balance;
  }

  return differenceBy(wallet.balance, state.collateral, (x) => x.tokenId);
});

const blocks = computed(() => {
  let minutes = 0;
  const val = Number(state.term.value);

  switch (state.term.interval) {
    case "hours":
      minutes = val * 60;
      break;
    case "days":
      minutes = val * 24 * 60;
      break;
    case "months":
      minutes = val * 30 * 24 * 60;
      break;
  }

  return minutes / 2;
});

const interestAmount = computed(() => {
  if (
    !state.loan.amount ||
    state.loan.amount === "0" ||
    !state.interest ||
    state.interest === "0"
  ) {
    return new BigNumber(0);
  }

  return BigNumber(state.interest).div(100).multipliedBy(state.loan.amount);
});

const rules = {
  loan: {
    amount: {
      required,
      minValue: minValue("0.1")
    }
  },
  collateral: {
    required: helpers.withMessage("At least one asset should be added as collateral.", required)
  },
  // term: {
  //   value: {
  //     required,
  //     minValue: minValue("1")
  //   },
  //   interval: {
  //     required
  //   }
  // },
  // interest: {
  //   required
  // }                                                      //Will rename #of Blocks and Miner Fee a later date. 
};

const $v = useVuelidate(rules, state, { $lazy: true });

function addCollateral(asset: AssetInfo<bigint>) {
  $v.value.collateral.$touch();
  state.collateral.push({ tokenId: asset.tokenId, amount: "", info: asset });
}

function removeCollateral(asset: AssetInfo<bigint>) {
  $v.value.collateral.$touch();
  remove(state.collateral, (x) => x.tokenId === asset.tokenId);
}

async function submit() {
  const isValid = await $v.value.$validate();
  if (!isValid || loading.value) {
    return;
  }

  // lend
  const loan = undecimalizeBigNumber(
    new BigNumber(state.loan.amount),
    state.loan.asset.metadata.decimals || 0
  );
  const repayment = undecimalizeBigNumber(
    interestAmount.value,
    state.loan.asset.metadata.decimals || 0
  ).plus(loan);

  // collateral
  let tokensCollateral: TokenAmount<string>[] = state.collateral.map((token) => ({
    tokenId: token.tokenId,
    amount: undecimalizeBigNumber(
      new BigNumber(token.amount),
      token.info.metadata?.decimals || 0
    ).toString()
  }));

  const ergCollateral = tokensCollateral.find((x) => x.tokenId === ERG_TOKEN_ID);
  if (ergCollateral) {
    tokensCollateral = tokensCollateral.filter((x) => x.tokenId != ERG_TOKEN_ID);
  }

  const sent = await sendTransaction(async () => {
    return await TransactionFactory.openOrder({
      type: "on-close",
      loan: {
        amount: loan.toString(),
        repayment: repayment.toString(),
        tokenId: state.loan.asset.tokenId
      },
      maturityLength: blocks.value,
      collateral: {
        nanoErgs: ergCollateral?.amount,
        tokens: tokensCollateral
      }
    });
  }, loading);

  if (sent) {
    emit("close");
  }
}
</script>

<template>
  <div class="grid grid-cols-1 gap-6">
    <h3 class="font-semibold text-xl">New Mining Offering</h3>
    <div>
      <div class="form-control">
        <label class="label">
          <span class="label-text big">Mining Fee Amount</span>
        </label>
        <div class="input-group">
          <cleave-input v-model="state.loan.amount" :readonly="loading" :options="{
            numeral: true,
            numeralPositiveOnly: true,
            numeralDecimalScale: state.loan.asset.metadata.decimals || 0
          }" placeholder="0.00" class="input input-bordered w-full input-lg" @blur="$v.loan.$touch()" />
          <select v-model="state.loan.asset" class="select select-bordered select-lg border-l-0">
            <option v-for="asset in VERIFIED_ASSETS.slice(0, 2)" :key="asset.tokenId" :value="asset">
              {{ asset.metadata.name }}
            </option>
          </select>
        </div>
        <label v-if="$v.loan.$error" class="label !pt-1">
          <span class="label-text-alt text-error"> {{ $v.loan.$errors[0].$message }}</span>
        </label>
      </div>
      <!-- <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="form-control">
          <label class="label">
            <span class="label-text"># of Blocks</span> -->
            <!-- <span v-if="blocks > 0n" class="label-text-alt opacity-70">{{ decimalize(blocks.toString(), { -->
            <!-- decimals: 0, -->
            <!-- thousandMark: "," -->
            <!-- }) }} blocks</span> -->
          <!-- </label>
          <div class="input-group">
            <cleave-input v-model="state.term.value" :readonly="loading" :options="{
              blocks: [5],
              numericOnly: true
            }" placeholder="0" class="input input-bordered w-full" @blur="$v.term.$touch()" /> -->
            <!-- <select v-model="state.term.interval" class="select select-bordered border-l-0" @blur="$v.term.$touch()"> -->
            <!-- <option value="hours">Blocks</option> -->
            <!-- <option value="days">Amount</option> -->
            <!-- <option value="months">months</option> -->
            <!-- </select> -->

        
          <!-- </div>
          <label v-if="$v.term.$error" class="label !pt-1">
            <span class="label-text-alt text-error"> {{ $v.term.$errors[0].$message }}</span>
          </label>
        </div> -->
        <!-- <div class="form-control">
          <label class="label">
            <span class="label-text">Mining Fee</span>
            <span v-if="interestAmount.gt(0)" class="label-text-alt opacity-70">{{
              formatBigNumber(interestAmount,
                state.loan.asset.metadata?.decimals)
            }}
              {{ state.loan.asset.metadata.name }}</span>
          </label>
          <div class="input-group">
            <cleave-input v-model="state.interest" :readonly="loading" :options="{
              numeral: true,
              numeralPositiveOnly: true,
              numeralDecimalScale: 3
            }" placeholder="0.00" class="input input-bordered w-full" @blur="$v.interest.$touch()" />
            <span class="!border-l-0">%</span>
          </div>
          <label v-if="$v.interest.$error" class="label !pt-1">
            <span class="label-text-alt text-error"> {{ $v.interest.$errors[0].$message }}</span>
          </label>
        </div> -->
      <!-- </div> -->
    </div>

    <div>
      <div class="form-control">
        <label class="label">
          <span class="label-text big">Collateral</span>
        </label>
        <asset-input v-for="asset in state.collateral" :key="asset.tokenId" v-model="asset.amount" :readonly="loading"
          :asset="asset.info" :disposable="true" class="pb-2" @remove="removeCollateral" />
      </div>
      <sig-dropdown root-class="w-full" menu-class="w-full">
        <button :disabled="loading" class="btn w-full shadow mt-2">Add collateral</button>
        <template #menu>
          <li v-for="asset in unselectedAssets" :key="asset.tokenId">
            <a :key="asset.tokenId" class="flex flex-row" @click="addCollateral(asset)">
              <asset-icon custom-class="h-10 w-10" :token-id="asset.tokenId" :type="asset.metadata?.type" />
              <span class="flex-grow">{{
                shortenString(asset.metadata?.name || asset.tokenId, 20)
              }}</span>
              <span>
                {{
  decimalize(asset.amount, {
  decimals: asset.metadata?.decimals || 0,
    thousandMark: ","
})
                }}
              </span>
            </a>
          </li>
        </template>
      </sig-dropdown>
      <label v-if="$v.collateral.$error" class="label !pt-1">
        <span class="label-text-alt text-error"> {{ $v.collateral.$errors[0].$message }}</span>
      </label>
    </div>

    <div class="modal-action">
      <button class="btn btn-ghost" :disabled="loading" @click="emit('close')">Cancel</button>
      <button class="btn btn-primary" :class="{ loading: loading }" @click="submit()">
        Confirm
      </button>
    </div>
  </div>
</template>
