<template>
  <Dialog :open="dialogStore.isOpen" @update:open="handleClose">
    <DialogContent class="max-w-[calc(100%-1rem)] sm:max-w-[90vw] md:max-w-3xl lg:max-w-4xl max-h-[90vh] flex flex-col p-0">
      <!-- 建筑详情 -->
      <template v-if="dialogStore.type === 'building' && dialogStore.itemType">
        <DialogHeader class="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle class="flex items-center gap-2">
            {{ t(`buildings.${dialogStore.itemType}`) }}
            <Badge variant="outline">{{ t('common.currentLevel') }} {{ dialogStore.currentLevel || 0 }}</Badge>
          </DialogTitle>
          <DialogDescription>
            {{ t(`buildingDescriptions.${dialogStore.itemType}`) }}
          </DialogDescription>
        </DialogHeader>
        <div class="overflow-y-auto px-6 pb-6">
          <BuildingDetailView :buildingType="dialogStore.itemType as BuildingType" :currentLevel="dialogStore.currentLevel || 0" />
        </div>
      </template>

      <!-- 科技详情 -->
      <template v-else-if="dialogStore.type === 'technology' && dialogStore.itemType">
        <DialogHeader class="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle class="flex items-center gap-2">
            {{ t(`technologies.${dialogStore.itemType}`) }}
            <Badge variant="outline">{{ t('common.currentLevel') }} {{ dialogStore.currentLevel || 0 }}</Badge>
          </DialogTitle>
          <DialogDescription>
            {{ t(`technologyDescriptions.${dialogStore.itemType}`) }}
          </DialogDescription>
        </DialogHeader>
        <div class="overflow-y-auto px-6 pb-6">
          <TechnologyDetailView :technologyType="dialogStore.itemType as TechnologyType" :currentLevel="dialogStore.currentLevel || 0" />
        </div>
      </template>

      <!-- 舰船详情 -->
      <template v-else-if="dialogStore.type === 'ship' && dialogStore.itemType">
        <DialogHeader class="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>{{ t(`ships.${dialogStore.itemType}`) }}</DialogTitle>
          <DialogDescription>
            {{ t(`shipDescriptions.${dialogStore.itemType}`) }}
          </DialogDescription>
        </DialogHeader>
        <div class="overflow-y-auto px-6 pb-6">
          <ShipDetailView :shipType="dialogStore.itemType as ShipType" />
        </div>
      </template>

      <!-- 防御详情 -->
      <template v-else-if="dialogStore.type === 'defense' && dialogStore.itemType">
        <DialogHeader class="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>{{ t(`defenses.${dialogStore.itemType}`) }}</DialogTitle>
          <DialogDescription>
            {{ t(`defenseDescriptions.${dialogStore.itemType}`) }}
          </DialogDescription>
        </DialogHeader>
        <div class="overflow-y-auto px-6 pb-6">
          <DefenseDetailView :defenseType="dialogStore.itemType as DefenseType" />
        </div>
      </template>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
  import { Badge } from '@/components/ui/badge'
  import { useDetailDialogStore } from '@/stores/detailDialogStore'
  import { useI18n } from '@/composables/useI18n'
  import type { BuildingType, TechnologyType, ShipType, DefenseType } from '@/types/game'
  import BuildingDetailView from './detail-views/BuildingDetailView.vue'
  import TechnologyDetailView from './detail-views/TechnologyDetailView.vue'
  import ShipDetailView from './detail-views/ShipDetailView.vue'
  import DefenseDetailView from './detail-views/DefenseDetailView.vue'

  const { t } = useI18n()
  const dialogStore = useDetailDialogStore()

  const handleClose = (open: boolean) => {
    if (!open) {
      dialogStore.close()
    }
  }
</script>
