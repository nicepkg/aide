<template>
  <div>
    <!-- floating button -->
    <button @click="toggleWindow" class="floating-button" :class="{ 'opacity-50': !isWindowOpen }" :style="buttonStyle">
      <div class="floating-button-icon">
        <img src="/logo.svg" alt="logo" />
      </div>
    </button>

    <!-- floating window -->
    <div v-show="isWindowOpen" class="iframe-container" ref="iframeContainer" :style="containerStyle">
      <div class="iframe-bg"></div>
      <iframe ref="iframe" :src="link" class="rounded-2xl overflow-auto w-full bg-white h-full" border="0"
        frameborder="0" scrolling="yes" seamless
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowtransparency
        allowfullscreen></iframe>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const isWindowOpen = ref(false);
const link = "https://base.openai-next.com/chat/share?shareId=9anwaxmtoagnb2x83afymkjv"

// button size variables
const buttonWidth = ref(50);
const buttonHeight = ref(50);

// distance variables
const buttonRightDistance = ref(20);
const buttonBottomDistance = ref(20);

// window size
const windowWidth = ref(window.innerWidth);
const windowHeight = ref(window.innerHeight);

// update window size and buttonRightDistance
const updateWindowSize = () => {
  windowWidth.value = window.innerWidth;
  windowHeight.value = window.innerHeight;
  buttonBottomDistance.value = windowWidth.value >= 640 ? 20 : 40;
};

// listen to window resize
onMounted(() => {
  window.addEventListener('resize', updateWindowSize);
  updateWindowSize(); // Initial call to set correct values
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowSize);
});

const toggleWindow = () => {
  isWindowOpen.value = !isWindowOpen.value;
};

// calculate button style
const buttonStyle = computed(() => ({
  right: `${buttonRightDistance.value}px`,
  bottom: `${buttonBottomDistance.value}px`,
  width: `${buttonWidth.value}px`,
  height: `${buttonHeight.value}px`
}));

// calculate container style
const containerStyle = computed(() => ({
  right: `${buttonRightDistance.value}px`,
  bottom: `${buttonBottomDistance.value + buttonHeight.value + 10}px`,
  maxWidth: `${windowWidth.value - 2 * buttonRightDistance.value}px`,
  maxHeight: `${windowHeight.value - buttonBottomDistance.value - buttonHeight.value - 20}px`,
  width: '400px',
  height: `${windowHeight.value - buttonBottomDistance.value - buttonHeight.value - 20 - 64}px`
}));
</script>

<style scoped>
.floating-button {
  position: fixed;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background-color: var(--vp-c-bg);
}

.floating-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  filter: blur(15px);
  background-image: linear-gradient(-45deg, #8c6bef 50%, #ef7b95 50%);
  animation: rotate 4s linear infinite;
}

.floating-button-icon {
  position: relative;
  z-index: 2;
  color: #fff;
  width: 75%;
  height: 75%;
  border-radius: 50%;
  overflow: hidden;
}

@keyframes rotate {
  100% {
    transform: rotate(1turn);
  }
}

.iframe-container {
  position: fixed;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 999;
  padding: 0.5rem;
  overflow: hidden;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  background-color: var(--vp-c-bg);
}

.iframe-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 2rem;
  z-index: -1;
  background-image: linear-gradient(-45deg, #8c6bef 50%, #ef7b95 50%);
  filter: blur(44px);
  animation: rotate 6s linear infinite;
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
