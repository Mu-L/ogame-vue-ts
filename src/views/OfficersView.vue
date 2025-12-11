<template>
  <div class="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
    <h1 class="text-2xl sm:text-3xl font-bold">{{ t('officersView.title') }}</h1>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
      <Card v-for="officerType in Object.values(OfficerType)" :key="officerType">
        <CardHeader>
          <div class="flex justify-between items-start gap-2">
            <div class="min-w-0 flex-1">
              <CardTitle class="text-lg sm:text-xl">{{ OFFICERS[officerType].name }}</CardTitle>
              <CardDescription class="text-xs sm:text-sm">{{ OFFICERS[officerType].description }}</CardDescription>
            </div>
            <Badge v-if="isOfficerActive(officerType)" variant="default" class="text-xs">{{ t('officersView.activated') }}</Badge>
            <Badge v-else variant="outline" class="text-xs">{{ t('officersView.inactive') }}</Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- 状态信息 -->
          <div v-if="isOfficerActive(officerType)" class="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div class="space-y-1 text-xs sm:text-sm">
              <p class="font-medium text-blue-700 dark:text-blue-300">{{ t('officersView.activeStatus') }}</p>
              <p class="text-muted-foreground">
                {{ t('officersView.expirationTime') }}: {{ formatDate(getOfficerExpiration(officerType)) }}
              </p>
              <p class="text-muted-foreground">{{ t('officersView.remainingTime') }}: {{ formatTime(getRemainingTime(officerType)) }}</p>
            </div>
          </div>

          <!-- 招募成本 -->
          <div class="space-y-2">
            <p class="text-sm font-medium text-muted-foreground">{{ t('officersView.recruitCost') }} (7{{ t('officersView.days') }}):</p>
            <div class="space-y-1.5">
              <div class="flex items-center gap-2">
                <ResourceIcon type="metal" size="sm" />
                <span class="text-xs">{{ t('resources.metal') }}:</span>
                <span
                  class="font-medium text-sm"
                  :class="planet ? getResourceCostColor(planet.resources.metal, OFFICERS[officerType].cost.metal) : ''"
                >
                  {{ formatNumber(OFFICERS[officerType].cost.metal) }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <ResourceIcon type="crystal" size="sm" />
                <span class="text-xs">{{ t('resources.crystal') }}:</span>
                <span
                  class="font-medium text-sm"
                  :class="planet ? getResourceCostColor(planet.resources.crystal, OFFICERS[officerType].cost.crystal) : ''"
                >
                  {{ formatNumber(OFFICERS[officerType].cost.crystal) }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <ResourceIcon type="deuterium" size="sm" />
                <span class="text-xs">{{ t('resources.deuterium') }}:</span>
                <span
                  class="font-medium text-sm"
                  :class="planet ? getResourceCostColor(planet.resources.deuterium, OFFICERS[officerType].cost.deuterium) : ''"
                >
                  {{ formatNumber(OFFICERS[officerType].cost.deuterium) }}
                </span>
              </div>
              <div v-if="OFFICERS[officerType].cost.darkMatter > 0" class="flex items-center gap-2">
                <ResourceIcon type="darkMatter" size="sm" />
                <span class="text-xs">{{ t('resources.darkMatter') }}:</span>
                <span
                  class="font-medium text-sm"
                  :class="planet ? getResourceCostColor(planet.resources.darkMatter, OFFICERS[officerType].cost.darkMatter) : ''"
                >
                  {{ formatNumber(OFFICERS[officerType].cost.darkMatter) }}
                </span>
              </div>
            </div>
          </div>

          <!-- 效果加成 -->
          <div class="space-y-2">
            <p class="text-sm font-medium text-muted-foreground">{{ t('officersView.benefitsBonus') }}:</p>
            <div class="space-y-1 text-xs sm:text-sm">
              <div v-if="OFFICERS[officerType].benefits.resourceProductionBonus" class="flex items-center gap-2">
                <span class="text-green-600 dark:text-green-400">↑</span>
                <span>{{ t('officersView.resourceProduction') }} +{{ OFFICERS[officerType].benefits.resourceProductionBonus }}%</span>
              </div>
              <div v-if="OFFICERS[officerType].benefits.darkMatterProductionBonus" class="flex items-center gap-2">
                <span class="text-green-600 dark:text-green-400">↑</span>
                <span>{{ t('officersView.darkMatterProduction') }} +{{ OFFICERS[officerType].benefits.darkMatterProductionBonus }}%</span>
              </div>
              <div v-if="OFFICERS[officerType].benefits.buildingSpeedBonus" class="flex items-center gap-2">
                <span class="text-green-600 dark:text-green-400">↑</span>
                <span>{{ t('officersView.buildingSpeed') }} +{{ OFFICERS[officerType].benefits.buildingSpeedBonus }}%</span>
              </div>
              <div v-if="OFFICERS[officerType].benefits.researchSpeedBonus" class="flex items-center gap-2">
                <span class="text-green-600 dark:text-green-400">↑</span>
                <span>{{ t('officersView.researchSpeed') }} +{{ OFFICERS[officerType].benefits.researchSpeedBonus }}%</span>
              </div>
              <div v-if="OFFICERS[officerType].benefits.fleetSpeedBonus" class="flex items-center gap-2">
                <span class="text-green-600 dark:text-green-400">↑</span>
                <span>{{ t('officersView.fleetSpeed') }} +{{ OFFICERS[officerType].benefits.fleetSpeedBonus }}%</span>
              </div>
              <div v-if="OFFICERS[officerType].benefits.fuelConsumptionReduction" class="flex items-center gap-2">
                <span class="text-green-600 dark:text-green-400">↓</span>
                <span>{{ t('officersView.fuelConsumption') }} -{{ OFFICERS[officerType].benefits.fuelConsumptionReduction }}%</span>
              </div>
              <div v-if="OFFICERS[officerType].benefits.defenseBonus" class="flex items-center gap-2">
                <span class="text-green-600 dark:text-green-400">↑</span>
                <span>{{ t('officersView.defense') }} +{{ OFFICERS[officerType].benefits.defenseBonus }}%</span>
              </div>
              <div v-if="OFFICERS[officerType].benefits.storageCapacityBonus" class="flex items-center gap-2">
                <span class="text-green-600 dark:text-green-400">↑</span>
                <span>{{ t('officersView.storageCapacity') }} +{{ OFFICERS[officerType].benefits.storageCapacityBonus }}%</span>
              </div>
              <div v-if="OFFICERS[officerType].benefits.additionalBuildQueue" class="flex items-center gap-2">
                <span class="text-green-600 dark:text-green-400">+</span>
                <span>{{ t('officersView.buildQueue') }} +{{ OFFICERS[officerType].benefits.additionalBuildQueue }}</span>
              </div>
              <div v-if="OFFICERS[officerType].benefits.additionalFleetSlots" class="flex items-center gap-2">
                <span class="text-green-600 dark:text-green-400">+</span>
                <span>{{ t('officersView.fleetSlots') }} +{{ OFFICERS[officerType].benefits.additionalFleetSlots }}</span>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-2">
            <Button v-if="!isOfficerActive(officerType)" @click="handleHire(officerType)" :disabled="!canHire(officerType)" class="flex-1">
              {{ t('officersView.hire') }} (7{{ t('officersView.days') }})
            </Button>
            <Button v-if="isOfficerActive(officerType)" @click="handleRenew(officerType)" :disabled="!canHire(officerType)" class="flex-1">
              {{ t('officersView.renew') }} (7{{ t('officersView.days') }})
            </Button>
            <Button v-if="isOfficerActive(officerType)" @click="handleDismiss(officerType)" variant="outline" size="sm">
              {{ t('officersView.dismiss') }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 确认对话框 -->
    <AlertDialog ref="alertDialog" />
    <ConfirmDialog ref="confirmDialog" />
  </div>
</template>

<script setup lang="ts">
  import { useGameStore } from '@/stores/gameStore'
  import { computed, ref } from 'vue'
  import { OfficerType } from '@/types/game'
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import ResourceIcon from '@/components/ResourceIcon.vue'
  import AlertDialog from '@/components/AlertDialog.vue'
  import ConfirmDialog from '@/components/ConfirmDialog.vue'
  import { formatNumber, formatTime, formatDate, getResourceCostColor } from '@/utils/format'
  import * as officerLogic from '@/logic/officerLogic'
  import * as resourceLogic from '@/logic/resourceLogic'
  import { useI18n } from '@/composables/useI18n'
  import { useGameConfig } from '@/composables/useGameConfig'

  const { t } = useI18n()
  const { OFFICERS } = useGameConfig()
  const gameStore = useGameStore()
  const planet = computed(() => gameStore.currentPlanet)
  const alertDialog = ref<InstanceType<typeof AlertDialog> | null>(null)
  const confirmDialog = ref<InstanceType<typeof ConfirmDialog> | null>(null)

  // 检查军官是否激活
  const isOfficerActive = (officerType: OfficerType): boolean => {
    const officer = gameStore.player.officers[officerType]
    const now = Date.now()
    return officer.active && (!officer.expiresAt || officer.expiresAt > now)
  }

  // 获取军官到期时间
  const getOfficerExpiration = (officerType: OfficerType): number => {
    const officer = gameStore.player.officers[officerType]
    return officer.expiresAt || 0
  }

  // 获取剩余时间（秒）
  const getRemainingTime = (officerType: OfficerType): number => {
    const officer = gameStore.player.officers[officerType]
    if (!officer.expiresAt) return 0
    const now = Date.now()
    return Math.max(0, Math.floor((officer.expiresAt - now) / 1000))
  }

  // 检查是否可以招募
  const canHire = (officerType: OfficerType): boolean => {
    if (!planet.value) return false

    const config = OFFICERS.value[officerType]
    return (
      planet.value.resources.metal >= config.cost.metal &&
      planet.value.resources.crystal >= config.cost.crystal &&
      planet.value.resources.deuterium >= config.cost.deuterium &&
      planet.value.resources.darkMatter >= config.cost.darkMatter
    )
  }

  const hireOfficer = (officerType: OfficerType, duration: number = 7): boolean => {
    if (!gameStore.currentPlanet) return false
    const cost = officerLogic.getOfficerCost(officerType)
    if (!resourceLogic.checkResourcesAvailable(gameStore.currentPlanet.resources, cost)) {
      return false
    }
    resourceLogic.deductResources(gameStore.currentPlanet.resources, cost)
    gameStore.player.officers[officerType] = officerLogic.createActiveOfficer(officerType, duration)
    return true
  }

  // 招募军官
  const handleHire = (officerType: OfficerType) => {
    confirmDialog.value?.show({
      title: t('officersView.hireTitle'),
      message: t('officersView.hireMessage').replace('{name}', OFFICERS.value[officerType].name),
      onConfirm: () => {
        const success = hireOfficer(officerType, 7)
        if (!success) {
          alertDialog.value?.show({
            title: t('officersView.hireFailed'),
            message: t('officersView.insufficientResources')
          })
        }
      }
    })
  }

  const renewOfficer = (officerType: OfficerType, duration: number = 7): boolean => {
    if (!gameStore.currentPlanet) return false
    const cost = officerLogic.getOfficerCost(officerType)
    if (!resourceLogic.checkResourcesAvailable(gameStore.currentPlanet.resources, cost)) {
      return false
    }
    resourceLogic.deductResources(gameStore.currentPlanet.resources, cost)
    const now = Date.now()
    gameStore.player.officers[officerType] = officerLogic.renewOfficerExpiration(gameStore.player.officers[officerType], duration, now)
    return true
  }

  // 续约军官
  const handleRenew = (officerType: OfficerType) => {
    confirmDialog.value?.show({
      title: t('officersView.renewTitle'),
      message: t('officersView.renewMessage').replace('{name}', OFFICERS.value[officerType].name),
      onConfirm: () => {
        const success = renewOfficer(officerType, 7)
        if (!success) {
          alertDialog.value?.show({
            title: t('officersView.renewFailed'),
            message: t('officersView.insufficientResources')
          })
        }
      }
    })
  }

  // 解雇军官
  const handleDismiss = (officerType: OfficerType): void => {
    confirmDialog.value?.show({
      title: t('officersView.dismissTitle'),
      message: t('officersView.dismissMessage').replace('{name}', OFFICERS.value[officerType].name),
      onConfirm: () => {
        gameStore.player.officers[officerType] = officerLogic.createInactiveOfficer(officerType)
      }
    })
  }
</script>
