<template>
  <div class="max-w-4xl mx-auto">
    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>

    <div v-else-if="profile" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 class="text-xl font-extrabold mb-6">{{ t('clientPortal.profile.title') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <p class="text-xs uppercase tracking-wider font-bold text-gray-500">{{ t('clientPortal.profile.name') }}</p>
          <p class="font-extrabold text-lg mt-1">{{ profile.name }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wider font-bold text-gray-500">{{ t('clientPortal.profile.type') }}</p>
          <p class="font-bold mt-1">{{ profile.type_label }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wider font-bold text-gray-500">{{ t('clientPortal.profile.phone') }}</p>
          <p class="font-bold mt-1">{{ profile.phone || t('clientPortal.profile.notSpecified') }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wider font-bold text-gray-500">{{ t('clientPortal.profile.contactPerson') }}</p>
          <p class="font-bold mt-1">{{ profile.contact_person || t('clientPortal.profile.notSpecified') }}</p>
        </div>
        <div class="md:col-span-2">
          <p class="text-xs uppercase tracking-wider font-bold text-gray-500">{{ t('clientPortal.profile.address') }}</p>
          <p class="font-bold mt-1">{{ profile.address || t('clientPortal.profile.notSpecified') }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wider font-bold text-gray-500">{{ t('clientPortal.profile.driver') }}</p>
          <p class="font-bold mt-1">{{ profile.assigned_driver?.name || t('clientPortal.profile.noDriver') }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wider font-bold text-gray-500">{{ t('clientPortal.profile.debtLimit') }}</p>
          <p class="font-bold mt-1">{{ money(profile.debt_limit) }} ₸</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getClientProfile } from '../../api/clientPortal'
import type { Client } from '../../api/clients'
import { useI18n } from '../../i18n'

const { t } = useI18n()
const loading = ref(true)
const profile = ref<Client | null>(null)
const money = (value: number) => new Intl.NumberFormat('ru-KZ').format(value)

onMounted(async () => {
  try {
    profile.value = await getClientProfile()
  } finally {
    loading.value = false
  }
})
</script>
