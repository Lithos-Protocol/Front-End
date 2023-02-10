<script setup lang="ts">
import { decimalize, Network } from "@fleet-sdk/common";
import { MoonIcon, SunIcon } from "@zhuowenli/vue-feather-icons";
import { computed } from "vue";
import { ERG_DECIMALS } from "@/constants";
import { useChainStore } from "@/stories";
import { useUIStore } from "@/stories/uiStore";
import { useWalletStore } from "@/stories/walletStore";
import { formatBigNumber, getNetworkType, shortenString } from "@/utils";

const defaultStore = useUIStore();
const chain = useChainStore();
const wallet = useWalletStore();
const isTestnet = getNetworkType() === Network.Testnet;

const ergBalance = computed(() => {
  const balance = wallet.balance.find((x) => x.tokenId === "ERG")?.amount || "0";

  return decimalize(balance, { decimals: ERG_DECIMALS, thousandMark: "," });
});
</script>

<template>
  <div
    class="sticky top-0 z-30 flex h-16 w-full justify-center bg-opacity-50 backdrop-blur transition-all duration-100 bg-base-100 text-base-content shadow-sm">
    <div class="navbar w-full px-4 flex">
      <div class="flex-1 gap-2">
        <router-link to="/" class="btn btn-ghost normal-case text-xl gap-2">
          <div>LITHOS Protocol</div>
          <span v-if="isTestnet" class="badge badge-outline font-normal">testnet</span><span
            class="badge badge-outline font-normal">DEMO</span>
        </router-link>
        <ul class="menu menu-horizontal px-1 gap-2">
          <li>
            <router-link to="/" active-class="active-item">Mining Offerings</router-link>
          </li>
          <li v-if="wallet.connected">
            <router-link to="/dashboard" active-class="active-item">Dashboard</router-link>
          </li>
        </ul>
      </div>

      <div class="flex-1r"></div>

      <div class="flex-2 gap-2">
        <div v-if="chain.tvl?.gt(0)">TVL: ${{ formatBigNumber(chain.tvl, 2) }}</div>

        <ul class="menu menu-horizontal px-1 gap-2">
          <li class="hidden md:block">
            <a class="btn btn-ghost gap-1 bg-base-100 hover:bg-base-100 hover:bg-opacity-50 bg-opacity-50 no-animation h-2"
              :class="{ loading: wallet.loading }">
              <template v-if="!wallet.connected">Connect Wallet</template>
              <template v-else>
                <span class="font-normal">{{ ergBalance }} ERG</span>
                <span class="normal-case py-1 px-2 font-normal opacity-70">
                  {{ shortenString(wallet.changeAddress, 14) }}
                </span>
                <img v-if="wallet.connectedWallet === 'nautilus'" src="/nautilus.svg" width="24" height="24" />
                <img v-else src="@/assets/safew.png" width="24" height="24" />
              </template>
            </a>
            <ul class="p-2 bg-base-100 shadow-md w-full">
              <template v-if="!wallet.connected">
                <li>
                  <a class="opacity-50" :class="{ 'opacity-100': wallet.wallets.nautilus }"
                    @click="wallet.connect('nautilus')">
                    <div class="flex-grow text-left">Nautilus</div>
                    <img src="/nautilus.svg" class="w-5 h-5" />
                  </a>
                </li>
                <li>
                  <a class="opacity-50" :class="{ 'opacity-100': wallet.wallets.safew }"
                    @click="wallet.connect('safew')">
                    <div class="flex-grow text-left">SAFEW</div>
                    <img src="@/assets/safew.png" class="w-5 h-5" />
                  </a>
                </li>
              </template>
              <li v-else><a @click="wallet.disconnect()">Disconnect</a></li>
            </ul>
          </li>
          <li>
            <a class="btn btn-ghost" @click="defaultStore.toggleTheme()">
              <sun-icon v-if="defaultStore.theme.value === 'light'" />
              <moon-icon v-else />
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>


.menu a {
  @apply active:bg-base-100 active:text-base-content;
}
</style>
