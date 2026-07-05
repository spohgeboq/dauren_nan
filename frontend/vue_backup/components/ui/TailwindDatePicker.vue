<template>
  <div class="relative text-left" ref="container">
    <button @click="toggle" type="button" class="flex w-full items-center gap-2 bg-white px-3 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 transition-all">
      <CalendarIcon class="w-4 h-4 text-gray-500" />
      <span>{{ formattedRange }}</span>
    </button>

    <div v-if="isOpen" :class="[
      'absolute mt-2 p-4 bg-white rounded-xl shadow-2xl border border-gray-200 z-[60] flex flex-col md:flex-row gap-4 md:gap-6 w-[300px] md:w-max transition-all',
      alignRight ? 'left-0 sm:left-auto sm:right-0 origin-top-left sm:origin-top-right' : 'left-0 origin-top-left'
    ]">
      
      <!-- Presets -->
      <div class="flex flex-col gap-1 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6 min-w-[140px]">
        <button v-for="preset in presets" :key="preset.label" @click="applyPreset(preset)" 
                class="text-left px-3 py-2 rounded-md text-sm font-medium transition-colors"
                :class="{'bg-bakery-50 text-bakery-700': isPresetActive(preset), 'text-gray-600 hover:bg-gray-50': !isPresetActive(preset)}">
          {{ preset.label }}
        </button>
      </div>

      <!-- Calendar -->
      <div class="w-full sm:w-64">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <button @click="prevMonth" type="button" class="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeftIcon class="w-5 h-5"/>
          </button>
          <div class="font-bold text-gray-900 text-sm">{{ formatMonthYear(currentViewDate) }}</div>
          <button @click="nextMonth" type="button" class="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronRightIcon class="w-5 h-5"/>
          </button>
        </div>
        
        <!-- Days of week -->
        <div class="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400 mb-2">
          <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
        </div>
        
        <!-- Days Grid -->
        <div class="grid grid-cols-7 gap-y-1">
          <div v-for="(day, idx) in days" :key="idx" 
               class="relative flex justify-center py-0.5"
               :class="getRangeBackgroundClass()">
             <button @click="selectDate(day.date)"
                     type="button"
                     :disabled="!day.isCurrentMonth"
                     class="w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all focus:outline-none"
                     :class="getDayClass(day.date, day.isCurrentMonth)">
               {{ day.dayNum }}
             </button>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next';

const props = defineProps<{
  modelValue: string | null;
  alignRight?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const isOpen = ref(false);
const container = ref<HTMLElement | null>(null);

const internalDate = ref<Date | null>(props.modelValue ? new Date(props.modelValue) : new Date());
const currentViewDate = ref(new Date());

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    internalDate.value = new Date(newVal);
    currentViewDate.value = new Date(newVal);
  }
});

const toggle = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && internalDate.value) {
    currentViewDate.value = new Date(internalDate.value);
  }
};

const close = (e: MouseEvent) => {
  if (container.value && !container.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => document.addEventListener('click', close));
onUnmounted(() => document.removeEventListener('click', close));

// Date Math
const prevMonth = () => {
  currentViewDate.value = new Date(currentViewDate.value.getFullYear(), currentViewDate.value.getMonth() - 1, 1);
};
const nextMonth = () => {
  currentViewDate.value = new Date(currentViewDate.value.getFullYear(), currentViewDate.value.getMonth() + 1, 1);
};

const days = computed(() => {
  const year = currentViewDate.value.getFullYear();
  const month = currentViewDate.value.getMonth();
  
  const date = new Date(year, month, 1);
  const result = [];
  
  let firstDay = date.getDay() - 1;
  if (firstDay === -1) firstDay = 6;
  
  const prevMonthDays = new Date(year, month, 0).getDate();
  for(let i = firstDay - 1; i >= 0; i--) {
     result.push({ dayNum: prevMonthDays - i, isCurrentMonth: false, date: new Date(year, month-1, prevMonthDays - i) });
  }
  
  const numDays = new Date(year, month + 1, 0).getDate();
  for(let i = 1; i <= numDays; i++) {
     result.push({ dayNum: i, isCurrentMonth: true, date: new Date(year, month, i) });
  }
  
  let remain = 42 - result.length;
  for(let i = 1; i <= remain; i++) {
     result.push({ dayNum: i, isCurrentMonth: false, date: new Date(year, month+1, i) });
  }
  return result;
});

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
};

const selectDate = (date: Date) => {
  internalDate.value = date;
  const tzOffset = date.getTimezoneOffset() * 60000;
  const isoDate = new Date(date.getTime() - tzOffset).toISOString().slice(0, 10);
  emit('update:modelValue', isoDate);
  isOpen.value = false;
};

// Styling
const getDayClass = (date: Date, isCurrentMonth: boolean) => {
  if (!isCurrentMonth) return 'text-gray-300 cursor-default';
  
  if (internalDate.value && isSameDay(date, internalDate.value)) {
    return 'bg-bakery-600 text-white font-bold hover:bg-bakery-700 shadow-sm';
  }
  
  const today = new Date();
  if (isSameDay(date, today)) {
    return 'text-bakery-600 font-bold hover:bg-gray-100 ring-1 ring-inset ring-bakery-500';
  }
  
  return 'text-gray-700 hover:bg-gray-100';
};

const getRangeBackgroundClass = () => {
  return '';
};

// Formatting
const pad = (n: number) => n < 10 ? '0' + n : n;
const formatDate = (date: Date) => `${pad(date.getDate())}.${pad(date.getMonth()+1)}.${date.getFullYear()}`;

const formattedRange = computed(() => {
  if (!internalDate.value) return 'Выберите дату';
  return formatDate(internalDate.value);
});

const monthsRu = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const formatMonthYear = (date: Date) => {
  return `${monthsRu[date.getMonth()]} ${date.getFullYear()}`;
};

// Presets
const presets = [
  { label: 'Сегодня', getDate: () => new Date() },
  { label: 'Вчера', getDate: () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d;
  }},
];

const applyPreset = (preset: any) => {
  const date = preset.getDate();
  internalDate.value = date;
  const tzOffset = date.getTimezoneOffset() * 60000;
  const isoDate = new Date(date.getTime() - tzOffset).toISOString().slice(0, 10);
  emit('update:modelValue', isoDate);
  isOpen.value = false;
};

const isPresetActive = (preset: any) => {
  if (!internalDate.value) return false;
  return isSameDay(internalDate.value, preset.getDate());
};
</script>
