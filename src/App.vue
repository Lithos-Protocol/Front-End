<script setup lang="ts">
import { BoxIcon } from "@zhuowenli/vue-feather-icons";
import AppFooter from "./components/AppFooter.vue";
import AppHeader from "./components/AppHeader.vue";
import Sidebar from "./components/Sidebar.vue";
import { useChainStore } from "./stories";
import CustomParticles from "./components/Particles.vue";

const chain = useChainStore();
</script>

<template>




  <div class="min-h-screen flex flex-col justify-between">

   <div classs="fixed">
    <app-header />
  </div>
    <div class="app">
      <!-- Sidebar -->
      <Sidebar />


      <main class="flex-grow py-8 px-4 md:px-8 sm:px-8">
        <CustomParticles /> 
        <router-view />
      </main>
    </div>
    <app-footer />
    <div v-if="chain.height"
      class="flex items-center gap-1 text-sm cursor-default text-[#45EBFD] fixed right-3 bottom-2 drop-shadow-md opacity-50 hover:opacity-100">
      <box-icon /> <span>{{ chain.height.toLocaleString() }}</span>
    </div>
  </div>


</template>
<style lang="scss">
:root {
  --primary: #45EBFD;
  --primary-alt: #4e138a;
  --grey: #64748b;
  --dark: #37415176;
  --dark-alt: #334155;
  --light: #f1f5f9;
  --sidebar-width: 150px;
  --sidebar-height: 100%;

}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Fira sans', sans-serif;

}

// body {

//   background: url("../Trianglify.png") center center fixed;
//   -webkit-background-size: cover;
//   -moz-background-size: cover;
//   -o-background-size: cover;
//   background-size: cover;
// }

button {
  cursor: pointer;
  appearance: none;
  border: none;
  outline: none;
  background: none;
}

#sidebar {

  position: fixed;
}

.app {
  display: flex;

  main {
    flex: 1 1 0;
    padding: 2rem;

    @media (max-width: 600px) {
      padding-left: 6rem;
    }
  }
}
</style>
