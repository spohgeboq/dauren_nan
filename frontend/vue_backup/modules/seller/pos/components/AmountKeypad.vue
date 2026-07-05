<template>
  <div class="rounded-2xl border border-gray-100 bg-gray-50 p-3">
    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="key in keys"
        :key="key"
        type="button"
        class="flex min-h-14 items-center justify-center rounded-xl border border-gray-200 bg-white text-xl font-extrabold text-gray-800 shadow-sm transition active:scale-[0.98] disabled:opacity-50"
        :disabled="disabled"
        @click="pressKey(key)"
      >
        {{ key }}
      </button>

      <button
        type="button"
        class="flex min-h-14 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-extrabold text-gray-600 shadow-sm transition active:scale-[0.98] disabled:opacity-50"
        :disabled="disabled"
        @click="backspace"
      >
        {{ t('pos.keypad.erase') }}
      </button>
      <button
        type="button"
        class="flex min-h-14 items-center justify-center rounded-xl border border-gray-200 bg-white text-xl font-extrabold text-gray-800 shadow-sm transition active:scale-[0.98] disabled:opacity-50"
        :disabled="disabled"
        @click="pressKey('0')"
      >
        0
      </button>
      <button
        type="button"
        class="flex min-h-14 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-extrabold text-gray-600 shadow-sm transition active:scale-[0.98] disabled:opacity-50"
        :disabled="disabled"
        @click="setValue('')"
      >
        {{ t('pos.keypad.clear') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../../../../i18n';

const props = withDefaults(defineProps<{
  modelValue: string | number;
  disabled?: boolean;
  max?: number | null;
}>(), {
  disabled: false,
  max: null,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
}>();

const { t } = useI18n();
const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

const normalize = (value: string) => {
  const digits = value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  if (digits === '') return '';

  const amount = Number(digits);
  if (props.max !== null && props.max !== undefined) {
    return String(Math.min(amount, props.max));
  }

  return String(amount);
};

const setValue = (value: string) => {
  emit('update:modelValue', normalize(value));
};

const pressKey = (key: string) => {
  setValue(`${props.modelValue || ''}${key}`);
};

const backspace = () => {
  setValue(String(props.modelValue || '').slice(0, -1));
};
</script>
