<template>
  <details class="details custom-block" style="max-width: none;">
    <summary>便捷购买</summary>

    <div>
      <div class="iframe-container" ref="iframeContainer">
        <div class="iframe-bg"></div>
        <div class="inline-flex items-center text-black bg-white/70 rounded-xl mb-0.5rem">
          <!-- fullscreen -->
          <div class="p-2" v-if="!isFullscreen" @click="toggleFullscreen">
            <div class="i-bx:fullscreen cursor-pointer"></div>
          </div>

          <!-- exit fullscreen -->
          <div class="p-2" v-if="isFullscreen" @click="toggleFullscreen">
            <div class="i-bx:exit-fullscreen cursor-pointer"></div>
          </div>

          <!-- refresh -->
          <div class="p-2" @click="refreshIframe">
            <div class="i-bx:refresh text-lg cursor-pointer"></div>
          </div>

          <!-- open link -->
          <div class="p-2" @click="openLink">
            <div class="i-bx:bx-world cursor-pointer"></div>
          </div>
        </div>
        <iframe ref="iframe" src="https://key.opendevelop.tech/liebiao/322FECDC5792B7AD"
          class="rounded-2xl overflow-auto w-full  bg-white md:h-1150px h-750px"
          :style="{ height: isFullscreen ? '100%' : '' }" border="0" frameborder="0" scrolling="yes" seamless
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowtransparency
          allowfullscreen></iframe>
      </div>
    </div>
  </details>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isFullscreen = ref(false);
const iframeContainer = ref<HTMLDivElement>();
const iframe = ref<HTMLIFrameElement>();

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    iframeContainer.value?.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};

const refreshIframe = () => {
  if (iframe.value) {
    iframe.value.src = iframe.value.src;
  }
};

const openLink = () => {
  window.open('https://key.opendevelop.tech/liebiao/322FECDC5792B7AD', '_blank');
};

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange);
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
});
</script>

<style scoped>
.iframe-container {
  width: 100%;
  position: relative;
  padding: 0.5rem;
  overflow: hidden;
  border-radius: 1rem;
}

.iframe-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 2rem;
  z-index: -1;
  /* background-image: linear-gradient(-45deg, #8c6bef 50%, #ef7b95 50%); */
  filter: blur(44px);
}

@media (min-width: 640px) {
  .iframe-bg {
    filter: blur(56px);
  }
}

@media (min-width: 960px) {
  .iframe-bg {
    filter: blur(68px);
  }
}
</style>
