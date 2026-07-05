<template>
  <div class="min-h-screen bg-gray-50 p-4 font-sans sm:p-6 lg:p-8">
    <div class="mx-auto max-w-7xl">

      <!-- Header -->
      <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-4">
          <router-link to="/dashboard" class="group flex h-12 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 text-gray-700 shadow-sm transition-colors hover:bg-gray-100 active:bg-gray-200 sm:px-4">
            <ArrowLeft class="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span class="hidden text-sm font-bold sm:inline">{{ t('common.backToMenu') }}</span>
          </router-link>
          <div>
            <div class="mb-2 flex items-center gap-3 text-sm text-gray-500">
              <router-link to="/admin" class="transition-colors hover:text-bakery-600">Dashboard</router-link>
              <span>/</span>
              <span class="font-medium text-gray-900">{{ t('adminClients.breadcrumb') }}</span>
            </div>
            <h1 class="text-3xl font-extrabold tracking-tight text-gray-900">{{ t('adminClients.title') }}</h1>
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <LanguageSwitcher />
          <button @click="openCreateModal" class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-bakery-600 px-6 py-3 font-bold text-white shadow-sm transition-colors hover:bg-bakery-700">
            <Plus class="h-5 w-5" />
            {{ t('adminClients.addClient') }}
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-6 flex flex-wrap gap-2 rounded-2xl border border-gray-100 bg-white p-1 shadow-sm">
        <button @click="activeTab = 'clients'" :class="activeTab === 'clients' ? 'bg-bakery-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50'" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold transition-colors">
          <UsersRound class="h-4 w-4" />
          <span>{{ t('adminClients.tabs.clients', { count: clients.length }) }}</span>
        </button>
        <button @click="activeTab = 'transfers'" :class="activeTab === 'transfers' ? 'bg-bakery-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50'" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold transition-colors">
          <Shuffle class="h-4 w-4" />
          <span>{{ t('adminClients.tabs.transfers', { count: transfers.length }) }}</span>
        </button>
        <button @click="activeTab = 'requests'" :class="activeTab === 'requests' ? 'bg-bakery-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50'" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold transition-colors">
          <FileCheck2 class="h-4 w-4" />
          <span>{{ t('adminClients.tabs.requests', { count: pendingRegistrationRequests.length }) }}</span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-bakery-600"></div>
      </div>

      <!-- Clients Tab -->
      <div v-else-if="activeTab === 'clients'" class="overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-sm">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminClients.columns.client') }}</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminClients.columns.type') }}</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminClients.columns.contacts') }}</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminClients.columns.account') }}</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminClients.columns.driver') }}</th>
              <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminClients.columns.debtLimit') }}</th>
              <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminClients.columns.status') }}</th>
              <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminClients.columns.actions') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="client in clients" :key="client.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div class="font-semibold text-gray-900">{{ client.name }}</div>
                <div class="text-xs text-gray-400 mt-0.5" v-if="client.contact_person">{{ client.contact_person }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="typeColor(client.type)" class="px-3 py-1 text-xs font-bold rounded-full">{{ t(`adminClients.clientTypes.${client.type}`) || client.type_label }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-700">{{ client.phone || '—' }}</div>
                <div class="text-xs text-gray-400 truncate max-w-xs">{{ client.address || '' }}</div>
              </td>
              <td class="px-6 py-4">
                <div v-if="client.user" class="text-sm">
                  <div class="font-semibold text-gray-900">{{ client.user.name }}</div>
                  <div class="text-xs text-gray-400">{{ client.user.email }}</div>
                </div>
                <span v-else class="text-gray-400 text-sm italic">{{ t('adminClients.notAssigned') }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="client.assigned_driver" class="flex items-center gap-2">
                  <div class="flex h-8 w-8 items-center justify-center rounded-full border border-bakery-100 bg-bakery-50 text-sm font-bold text-bakery-700">
                    {{ client.assigned_driver.name.charAt(0) }}
                  </div>
                  <span class="text-sm font-medium text-gray-900">{{ client.assigned_driver.name }}</span>
                </div>
                <span v-else class="text-gray-400 text-sm italic">{{ t('adminClients.noDriver') }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="text-sm font-bold" :class="client.current_debt > 0 ? 'text-red-600' : 'text-gray-900'">
                  {{ Number(client.current_debt).toLocaleString('ru-RU') }} ₸
                </div>
                <div class="text-xs text-gray-400">{{ t('adminClients.limit', { amount: Number(client.debt_limit).toLocaleString('ru-RU') }) }}</div>
              </td>
              <td class="px-6 py-4 text-center">
                <span :class="client.is_active ? 'border border-emerald-100 bg-emerald-50 text-emerald-700' : 'border border-gray-200 bg-gray-50 text-gray-500'" class="px-3 py-1 text-xs font-bold rounded-full">
                  {{ client.is_active ? t('adminClients.active') : t('adminClients.inactive') }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex flex-wrap items-center justify-end gap-2">
                  <button v-if="client.current_debt > 0" @click="openPaymentModal(client)" class="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-extrabold text-emerald-700 transition-colors hover:bg-emerald-100" :title="t('adminClients.pay')">
                    <WalletCards class="h-4 w-4" />
                    {{ t('adminClients.pay') }}
                  </button>
                  <button @click="openTransferModal(client)" class="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-bakery-200 bg-bakery-50 px-3 text-xs font-extrabold text-bakery-700 transition-colors hover:bg-bakery-100" :title="t('adminClients.transfer')">
                    <Truck class="h-4 w-4" />
                    {{ t('adminClients.transfer') }}
                  </button>
                  <button @click="openEditModal(client)" class="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-xs font-extrabold text-gray-700 transition-colors hover:bg-gray-50">
                    <Pencil class="h-4 w-4" />
                    {{ t('adminClients.edit') }}
                  </button>
                  <button @click="confirmDelete(client)" class="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-extrabold text-red-700 transition-colors hover:bg-red-100">
                    <Trash2 class="h-4 w-4" />
                    {{ t('adminClients.delete') }}
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="clients.length === 0">
              <td colspan="8" class="px-6 py-12 text-center text-gray-400 text-lg">{{ t('adminClients.emptyClients') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Transfers Tab -->
      <div v-else-if="activeTab === 'transfers'" class="overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-sm">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminClients.columns.client') }}</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminClients.columns.oldDriver') }}</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminClients.columns.newDriver') }}</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminClients.columns.period') }}</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminClients.columns.reason') }}</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{{ t('adminClients.columns.approver') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="transfer in transfers" :key="transfer.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 font-semibold text-gray-900">{{ transfer.client?.name || '—' }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ transfer.old_driver?.name || `(${t('adminClients.noDriver')})` }}</td>
              <td class="px-6 py-4 text-sm font-medium text-bakery-700">{{ transfer.new_driver?.name || '—' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {{ transfer.date_from }} <span class="text-gray-400">→</span> {{ transfer.date_to || 'бессрочно' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{{ transfer.reason || '—' }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ transfer.approver?.name || '—' }}</td>
            </tr>
            <tr v-if="transfers.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-400 text-lg">{{ t('adminClients.emptyTransfers') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Registration Requests Tab -->
      <div v-else-if="activeTab === 'requests'" class="space-y-4">
        <div v-if="registrationRequests.length === 0" class="rounded-3xl border border-dashed border-gray-200 bg-white p-10 text-center text-lg font-bold text-gray-400">
          {{ t('adminClients.emptyRequests') }}
        </div>

        <article
          v-for="request in registrationRequests"
          :key="request.id"
          class="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm"
        >
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0">
              <div class="mb-2 flex flex-wrap items-center gap-2">
                <h2 class="text-xl font-extrabold text-gray-900">{{ request.name }}</h2>
                <span :class="requestStatusClass(request.status)" class="rounded-full px-3 py-1 text-xs font-extrabold">
                  {{ requestStatusLabel(request.status) }}
                </span>
                <span :class="typeColor(request.type)" class="rounded-full px-3 py-1 text-xs font-extrabold">
                  {{ request.type_label }}
                </span>
              </div>
              <div class="grid gap-2 text-sm font-medium text-gray-600 md:grid-cols-2">
                <p><span class="font-bold text-gray-900">{{ t('adminClients.requests.phone') }}</span> {{ request.phone }}</p>
                <p><span class="font-bold text-gray-900">{{ t('adminClients.requests.email') }}</span> {{ request.email || '—' }}</p>
                <p><span class="font-bold text-gray-900">{{ t('adminClients.requests.address') }}</span> {{ request.address }}</p>
                <p><span class="font-bold text-gray-900">{{ t('adminClients.requests.contact') }}</span> {{ request.contact_person || '—' }}</p>
                <p><span class="font-bold text-gray-900">{{ t('adminClients.requests.time') }}</span> {{ request.preferred_delivery_time || '—' }}</p>
                <p><span class="font-bold text-gray-900">{{ t('adminClients.requests.date') }}</span> {{ formatDateTime(request.created_at) }}</p>
              </div>
              <p v-if="request.comment" class="mt-3 rounded-2xl bg-gray-50 p-3 text-sm font-medium text-gray-600">
                {{ request.comment }}
              </p>
            </div>

            <div class="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
              <button
                v-if="request.status === 'pending'"
                type="button"
                class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-bakery-600 px-4 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-bakery-700 disabled:opacity-60"
                :disabled="saving"
                @click="approveRequest(request)"
              >
                <CheckCircle2 class="h-4 w-4" />
                {{ t('adminClients.approveAndCreate') }}
              </button>
              <button
                v-if="request.status === 'pending'"
                type="button"
                class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-extrabold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60"
                :disabled="saving"
                @click="rejectRequest(request)"
              >
                <XCircle class="h-4 w-4" />
                {{ t('adminClients.reject') }}
              </button>
              <button
                v-if="request.client_id"
                type="button"
                class="inline-flex min-h-11 items-center justify-center rounded-xl border border-bakery-200 bg-bakery-50 px-4 text-sm font-extrabold text-bakery-700"
                @click="activeTab = 'clients'"
              >
                {{ t('adminClients.clientNumber', { id: request.client_id }) }}
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- Client Form Modal -->
    <div v-if="showFormModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div class="p-8 overflow-y-auto">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ editingClient ? t('adminClients.modal.editTitle') : t('adminClients.modal.newTitle') }}</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">{{ t('adminClients.modal.name') }}</label>
              <input v-model="form.name" type="text" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 bg-white text-gray-900" placeholder="Магазин Центральный" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">{{ t('adminClients.modal.type') }}</label>
              <select v-model="form.type" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 bg-white text-gray-900">
                <option value="store">{{ t('adminClients.clientTypes.store') }}</option>
                <option value="organization">{{ t('adminClients.clientTypes.organization') }}</option>
                <option value="regular">{{ t('adminClients.clientTypes.regular') }}</option>
                <option value="retail">{{ t('adminClients.clientTypes.retail') }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">{{ t('adminClients.modal.account') }}</label>
              <select v-model="form.user_id" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 bg-white text-gray-900">
                <option :value="null">— {{ t('adminClients.notAssigned') }} —</option>
                <option v-for="user in clientUsers" :key="user.id" :value="user.id">{{ user.name }} · {{ user.email }}</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">{{ t('adminClients.modal.phone') }}</label>
                <input v-maska data-maska="+7 (###) ###-##-##" v-model="form.phone" type="text" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 bg-white text-gray-900" placeholder="+7 (777) 000-00-00" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">{{ t('adminClients.modal.contactPerson') }}</label>
                <input v-model="form.contact_person" type="text" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 bg-white text-gray-900" placeholder="ФИО" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">{{ t('adminClients.modal.address') }}</label>
              <input v-model="form.address" type="text" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 bg-white text-gray-900" placeholder="ул. Ленина, 1" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">{{ t('adminClients.modal.assignDriver') }}</label>
              <select v-model="form.assigned_driver_id" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 bg-white text-gray-900">
                <option :value="null">— {{ t('adminClients.noDriver') }} —</option>
                <option v-for="driver in drivers" :key="driver.id" :value="driver.id">{{ driver.name }}</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">{{ t('adminClients.modal.debtLimit') }}</label>
                <input v-model.number="form.debt_limit" type="number" min="0" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 bg-white text-gray-900" />
              </div>
              <div class="flex items-center gap-3 pt-6">
                <input type="checkbox" v-model="form.is_active" id="is_active" class="w-5 h-5 rounded accent-bakery-600" />
                <label for="is_active" class="text-sm font-semibold text-gray-700">{{ t('adminClients.modal.isActive') }}</label>
              </div>
            </div>
          </div>
          <div class="flex gap-4 mt-8">
            <button @click="showFormModal = false" class="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">{{ t('adminClients.modal.cancel') }}</button>
            <button @click="saveClient" :disabled="saving" class="flex-1 px-6 py-3 rounded-xl bg-bakery-600 hover:bg-bakery-700 text-white font-semibold transition-colors disabled:opacity-60">
              {{ saving ? t('adminClients.modal.saving') : (editingClient ? t('adminClients.modal.save') : t('adminClients.modal.create')) }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Transfer Modal -->
    <div v-if="showTransferModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div class="p-8 overflow-y-auto">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ t('adminClients.modal.transferTitle') }}</h2>
          <p class="text-gray-500 mb-6">{{ t('adminClients.modal.client') }} <span class="font-semibold text-gray-900">{{ transferClient?.name }}</span></p>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">{{ t('adminClients.modal.newDriver') }}</label>
              <select v-model="transferForm.new_driver_id" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 bg-white text-gray-900">
                <option :value="null" disabled>{{ t('adminClients.modal.selectDriver') }}</option>
                <option v-for="driver in drivers" :key="driver.id" :value="driver.id">{{ driver.name }}</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">{{ t('adminClients.modal.dateFrom') }}</label>
                <input v-model="transferForm.date_from" type="date" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 bg-white text-gray-900" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">{{ t('adminClients.modal.dateTo') }}</label>
                <input v-model="transferForm.date_to" type="date" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 bg-white text-gray-900" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">{{ t('adminClients.modal.reason') }}</label>
              <textarea v-model="transferForm.reason" rows="2" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 bg-white text-gray-900 resize-none" :placeholder="t('adminClients.modal.reasonPlaceholder')"></textarea>
            </div>
          </div>
          <div class="flex gap-4 mt-8">
            <button @click="showTransferModal = false" class="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">{{ t('adminClients.modal.cancel') }}</button>
            <button @click="saveTransfer" :disabled="saving" class="flex-1 px-6 py-3 rounded-xl bg-bakery-600 hover:bg-bakery-700 text-white font-semibold transition-colors disabled:opacity-60">
              {{ saving ? t('adminClients.modal.saving') : t('adminClients.modal.transferBtn') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div class="p-8 overflow-y-auto">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ t('adminClients.modal.paymentTitle') }}</h2>
          <p class="text-gray-500 mb-6">{{ t('adminClients.modal.client') }} <span class="font-semibold text-gray-900">{{ paymentClient?.name }}</span></p>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">{{ t('adminClients.modal.amount') }}</label>
              <input v-model.number="paymentForm.amount" type="number" step="0.01" min="0.01" :max="paymentClient?.current_debt" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 bg-white text-gray-900" />
              <div class="text-xs text-gray-500 mt-1">{{ t('adminClients.modal.currentDebt', { amount: Number(paymentClient?.current_debt).toLocaleString('ru-RU') }) }}</div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">{{ t('adminClients.modal.paymentMethod') }}</label>
              <select v-model="paymentForm.payment_method" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 bg-white text-gray-900">
                <option value="cash">{{ t('adminClients.modal.cash') }}</option>
                <option value="kaspi">{{ t('adminClients.modal.kaspi') }}</option>
                <option value="mixed">{{ t('adminClients.modal.mixed') }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">{{ t('adminClients.modal.comment') }}</label>
              <textarea v-model="paymentForm.comment" rows="2" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 bg-white text-gray-900 resize-none" :placeholder="t('adminClients.modal.commentPlaceholder')"></textarea>
            </div>
          </div>
          <div class="flex gap-4 mt-8">
            <button @click="showPaymentModal = false" class="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">{{ t('adminClients.modal.cancel') }}</button>
            <button @click="savePayment" :disabled="saving" class="flex-1 px-6 py-3 rounded-xl bg-bakery-600 hover:bg-bakery-700 text-white font-semibold transition-colors disabled:opacity-60">
              {{ saving ? t('adminClients.modal.waiting') : t('adminClients.modal.acceptPayment') }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import {
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  Pencil,
  Plus,
  Shuffle,
  Trash2,
  Truck,
  UsersRound,
  WalletCards,
  XCircle,
} from 'lucide-vue-next';
import {
  getClients, createClient, updateClient, deleteClient,
  getClientTransfers, transferClientDriver, payClientDebt,
  type Client, type ClientDriverTransfer
} from '../../../api/clients';
import {
  approveClientRegistrationRequest,
  getClientRegistrationRequests,
  rejectClientRegistrationRequest,
  type ClientRegistrationRequest,
  type ClientRegistrationRequestStatus,
} from '../../../api/clientRegistrationRequests';
import api from '../../../api';
import LanguageSwitcher from '../../../components/LanguageSwitcher.vue';
import { useI18n } from '../../../i18n';
import { vMaska } from 'maska/vue';

const { t } = useI18n();
const clients = ref<Client[]>([]);
const transfers = ref<ClientDriverTransfer[]>([]);
const registrationRequests = ref<ClientRegistrationRequest[]>([]);
const drivers = ref<{ id: number; name: string }[]>([]);
const clientUsers = ref<{ id: number; name: string; email: string }[]>([]);
const loading = ref(true);
const saving = ref(false);
const activeTab = ref<'clients' | 'transfers' | 'requests'>('clients');
const pendingRegistrationRequests = computed(() => registrationRequests.value.filter(request => request.status === 'pending'));

// Client form modal
const showFormModal = ref(false);
const editingClient = ref<Client | null>(null);
const form = ref({
  user_id: null as number | null,
  name: '',
  type: 'store' as Client['type'],
  phone: '',
  address: '',
  contact_person: '',
  assigned_driver_id: null as number | null,
  debt_limit: 0,
  is_active: true,
});

// Transfer modal
const showTransferModal = ref(false);
const transferClient = ref<Client | null>(null);
const transferForm = ref({
  new_driver_id: null as number | null,
  date_from: new Date().toISOString().slice(0, 10),
  date_to: '',
  reason: '',
});

// Payment modal
const showPaymentModal = ref(false);
const paymentClient = ref<Client | null>(null);
const paymentForm = ref({
  amount: 0,
  payment_method: 'cash',
  comment: '',
});

const typeColor = (type: string) => {
  const colors: Record<string, string> = {
    store: 'border border-bakery-100 bg-bakery-50 text-bakery-800',
    organization: 'border border-sky-100 bg-sky-50 text-sky-800',
    regular: 'border border-emerald-100 bg-emerald-50 text-emerald-700',
    retail: 'border border-amber-100 bg-amber-50 text-amber-700',
  };
  return colors[type] || 'border border-gray-200 bg-gray-50 text-gray-700';
};

const requestStatusLabel = (status: ClientRegistrationRequestStatus) => ({
  pending: t('adminClients.requests.new'),
  approved: t('adminClients.requests.approved'),
  rejected: t('adminClients.requests.rejected'),
}[status] || status);

const requestStatusClass = (status: ClientRegistrationRequestStatus) => ({
  pending: 'border border-amber-100 bg-amber-50 text-amber-700',
  approved: 'border border-emerald-100 bg-emerald-50 text-emerald-700',
  rejected: 'border border-red-100 bg-red-50 text-red-700',
}[status] || 'border border-gray-200 bg-gray-50 text-gray-700');

const formatDateTime = (value?: string) => {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const roleNames = (user: any): string[] => {
  return (user.roles || []).map((role: any) => typeof role === 'string' ? role : role.name);
};

const fetchData = async () => {
  loading.value = true;
  try {
    const [c, t, u, requests] = await Promise.all([
      getClients(),
      getClientTransfers(),
      api.get('/users').then(r => r.data.data),
      getClientRegistrationRequests(),
    ]);
    clients.value = c;
    transfers.value = t;
    registrationRequests.value = requests;
    drivers.value = u.filter((user: any) => roleNames(user).includes('driver'));
    clientUsers.value = u.filter((user: any) => roleNames(user).includes('client'));
  } catch (e) {
    console.error(e);
    alert(t('adminClients.errors.load'));
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

const openCreateModal = () => {
  editingClient.value = null;
  form.value = { user_id: null, name: '', type: 'store', phone: '', address: '', contact_person: '', assigned_driver_id: null, debt_limit: 0, is_active: true };
  showFormModal.value = true;
};

const openEditModal = (client: Client) => {
  editingClient.value = client;
  form.value = {
    user_id: client.user_id ?? null,
    name: client.name,
    type: client.type,
    phone: client.phone || '',
    address: client.address || '',
    contact_person: client.contact_person || '',
    assigned_driver_id: client.assigned_driver_id ?? null,
    debt_limit: client.debt_limit,
    is_active: client.is_active,
  };
  showFormModal.value = true;
};

const openTransferModal = (client: Client) => {
  transferClient.value = client;
  transferForm.value = {
    new_driver_id: null,
    date_from: new Date().toISOString().slice(0, 10),
    date_to: '',
    reason: '',
  };
  showTransferModal.value = true;
};

const openPaymentModal = (client: Client) => {
  paymentClient.value = client;
  paymentForm.value = {
    amount: Number(client.current_debt),
    payment_method: 'cash',
    comment: '',
  };
  showPaymentModal.value = true;
};

const saveClient = async () => {
  if (!form.value.name) return alert(t('adminClients.errors.enterName'));
  saving.value = true;
  try {
    const payload = { ...form.value, user_id: form.value.user_id || null, assigned_driver_id: form.value.assigned_driver_id || null };
    if (editingClient.value) {
      await updateClient(editingClient.value.id, payload);
    } else {
      await createClient(payload);
    }
    showFormModal.value = false;
    await fetchData();
  } catch (e: any) {
    alert(e.response?.data?.message || t('adminClients.errors.save'));
  } finally {
    saving.value = false;
  }
};

const saveTransfer = async () => {
  if (!transferForm.value.new_driver_id) return alert(t('adminClients.errors.selectNewDriver'));
  if (!transferForm.value.date_from) return alert(t('adminClients.errors.enterDateFrom'));
  saving.value = true;
  try {
    await transferClientDriver({
      client_id: transferClient.value!.id,
      new_driver_id: transferForm.value.new_driver_id!,
      date_from: transferForm.value.date_from,
      date_to: transferForm.value.date_to || null,
      reason: transferForm.value.reason || null,
    });
    showTransferModal.value = false;
    await fetchData();
  } catch (e: any) {
    alert(e.response?.data?.message || t('adminClients.errors.transfer'));
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async (client: Client) => {
  if (confirm(t('adminClients.errors.confirmDelete', { name: client.name }))) {
    try {
      await deleteClient(client.id);
      await fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || t('adminClients.errors.delete'));
    }
  }
};

const approveRequest = async (request: ClientRegistrationRequest) => {
  if (!confirm(t('adminClients.errors.confirmApprove', { name: request.name }))) {
    return;
  }

  saving.value = true;
  try {
    await approveClientRegistrationRequest(request.id);
    await fetchData();
    activeTab.value = 'requests';
  } catch (e: any) {
    alert(e.response?.data?.message || t('adminClients.errors.approve'));
  } finally {
    saving.value = false;
  }
};

const rejectRequest = async (request: ClientRegistrationRequest) => {
  if (!confirm(t('adminClients.errors.confirmReject', { name: request.name }))) {
    return;
  }

  saving.value = true;
  try {
    await rejectClientRegistrationRequest(request.id);
    await fetchData();
    activeTab.value = 'requests';
  } catch (e: any) {
    alert(e.response?.data?.message || t('adminClients.errors.reject'));
  } finally {
    saving.value = false;
  }
};

const savePayment = async () => {
  if (!paymentForm.value.amount || paymentForm.value.amount <= 0) return alert(t('adminClients.errors.enterAmount'));
  if (paymentForm.value.amount > Number(paymentClient.value!.current_debt)) return alert(t('adminClients.errors.amountExceedsDebt'));
  saving.value = true;
  try {
    await payClientDebt(paymentClient.value!.id, paymentForm.value);
    showPaymentModal.value = false;
    await fetchData();
  } catch (e: any) {
    alert(e.response?.data?.message || t('adminClients.errors.payment'));
  } finally {
    saving.value = false;
  }
};
</script>
