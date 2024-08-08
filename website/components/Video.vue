<template>
  <div class="video-container">
    <div class="video-bg"></div>
    <video ref="video" class="rounded-2xl overflow-hidden w-full h-auto max-h-90vh" autoplay muted playsinline loop
      @click="enableControls">
      <source :src="src" type="video/mp4">
      Your browser does not support the video tag.
    </video>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const video = ref(null);
const props = defineProps({
  src: {
    type: String,
    required: true
  }
});

const enableControls = () => {
  if (video.value) {
    video.value.controls = true;
  }
};
</script>

<style scoped>
.video-container {
  width: 100%;
  max-width: 1080px;
  position: relative;
  padding: 0.5rem;
  overflow: hidden;
  border-radius: 1rem;
}

.video-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 2rem;
  z-index: -1;
  background-image: linear-gradient(-45deg, #8c6bef 50%, #ef7b95 50%);
  filter: blur(44px);
}

@media (min-width: 640px) {
  .video-bg {
    filter: blur(56px);
  }
}

@media (min-width: 960px) {
  .video-bg {
    filter: blur(68px);
  }
}
</style>
