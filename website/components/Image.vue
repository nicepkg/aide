<template>
  <div class="image-container" :style="style">
    <div class="image-bg" :style="style"></div>
    <img class="rounded-2xl overflow-hidden w-full h-auto max-h-90vh object-contain" :style="style" :src="src" alt="Image" />
  </div>
</template>

<script setup>

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  style: {
    type: Object,
    default: () => ({})
  }
});

</script>

<style scoped>
.image-container {
  width: 100%;
  max-width: 1080px;
  position: relative;
  padding: 0.5rem;
  overflow: hidden;
  border-radius: 1rem;
}

.image-bg {
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
  .image-bg {
    filter: blur(56px);
  }
}

@media (min-width: 960px) {
  .image-bg {
    filter: blur(68px);
  }
}
</style>
