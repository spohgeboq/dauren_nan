<template>
  <div v-if="isVisible" class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm transition-opacity">
    <div class="relative w-full max-w-sm transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition-all">
      <div class="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-bakery-100 text-bakery-600">
        <Download v-if="status === 'available'" class="h-7 w-7" />
        <RefreshCw v-else-if="status === 'downloading'" class="h-7 w-7 animate-spin" />
        <CheckCircle2 v-else-if="status === 'downloaded'" class="h-7 w-7 text-green-600" />
        <AlertTriangle v-else-if="status === 'error'" class="h-7 w-7 text-red-600" />
      </div>

      <h3 class="mb-2 text-xl font-bold text-gray-900">
        {{ title }}
      </h3>
      <p class="mb-6 text-sm font-medium text-gray-500 leading-relaxed">
        {{ description }}
      </p>

      <div class="flex flex-col gap-3">
        <button
          v-if="status === 'available'"
          @click="startDownload"
          class="flex w-full min-h-[3rem] items-center justify-center rounded-xl bg-bakery-600 px-4 py-2 font-bold text-white transition hover:bg-bakery-700 active:scale-[0.98]"
        >
          {{ t('updater.downloadBtn') }}
        </button>

        <button
          v-if="status === 'downloaded'"
          @click="installUpdate"
          class="flex w-full min-h-[3rem] items-center justify-center rounded-xl bg-green-600 px-4 py-2 font-bold text-white transition hover:bg-green-700 active:scale-[0.98]"
        >
          {{ t('updater.installBtn') }}
        </button>

        <button
          v-if="status === 'available' || status === 'error'"
          @click="close"
          class="flex w-full min-h-[3rem] items-center justify-center rounded-xl bg-gray-100 px-4 py-2 font-bold text-gray-700 transition hover:bg-gray-200 active:scale-[0.98]"
        >
          {{ t('updater.cancelBtn') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Download, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-vue-next';
import { useI18n } from '../i18n';

const { t } = useI18n();

const status = ref<'idle' | 'available' | 'downloading' | 'downloaded' | 'error'>('idle');
const versionInfo = ref<any>(null);
const errorMessage = ref('');

const isVisible = computed(() => status.value !== 'idle');

const title = computed(() => {
  switch (status.value) {
    case 'available': return t('updater.updateAvailable');
    case 'downloading': return t('updater.downloading');
    case 'downloaded': return t('updater.downloaded');
    case 'error': return t('updater.error');
    default: return '';
  }
});

const description = computed(() => {
  switch (status.value) {
    case 'available': return t('updater.updateAvailableDesc', { version: versionInfo.value?.version || '' });
    case 'downloading': return t('updater.downloadingDesc');
    case 'downloaded': return t('updater.downloadedDesc');
    case 'error': return errorMessage.value || t('updater.error');
    default: return '';
  }
});

const startDownload = async () => {
  const desktop = (window as any).daurennanDesktop;
  if (desktop) {
    status.value = 'downloading';
    await desktop.downloadUpdate();
  }
};

const installUpdate = async () => {
  const desktop = (window as any).daurennanDesktop;
  if (desktop) {
    await desktop.installUpdate();
  }
};

const close = () => {
  status.value = 'idle';
};

onMounted(() => {
  const desktop = (window as any).daurennanDesktop;
  if (desktop) {
    desktop.onUpdateAvailable((info: any) => {
      versionInfo.value = info;
      status.value = 'available';
    });

    desktop.onUpdateDownloaded(() => {
      status.value = 'downloaded';
    });

    desktop.onUpdateError((msg: string) => {
      errorMessage.value = msg;
      status.value = 'error';
    });
  }
});
</script>
