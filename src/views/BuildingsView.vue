<template>
  <div v-if="planet" class="container mx-auto p-4 sm:p-6">
    <div class="flex justify-between items-center mb-4 sm:mb-6 gap-2">
      <h1 class="text-2xl sm:text-3xl font-bold">{{ t('buildingsView.title') }}</h1>
      <div class="text-xs sm:text-sm">
        <span class="flex items-center gap-1.5 text-muted-foreground">
          <Grid3x3 :size="14" />
          {{ getUsedSpace(planet) }} / {{ planet.maxSpace }}
        </span>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <Card v-for="buildingType in availableBuildings" :key="buildingType">
        <CardHeader>
          <div class="flex justify-between items-start gap-2">
            <div class="min-w-0 flex-1">
              <CardTitle
                class="text-base sm:text-lg cursor-pointer hover:text-primary transition-colors"
                @click="detailDialog.openBuilding(buildingType, getBuildingLevel(buildingType))"
              >
                {{ BUILDINGS[buildingType].name }}
              </CardTitle>
              <CardDescription class="text-xs sm:text-sm">{{ BUILDINGS[buildingType].description }}</CardDescription>
            </div>
            <Badge variant="secondary" class="text-xs whitespace-nowrap flex-shrink-0">Lv {{ getBuildingLevel(buildingType) }}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div class="text-xs sm:text-sm space-y-1.5 sm:space-y-2">
              <p class="text-muted-foreground mb-1 sm:mb-2">{{ t('buildingsView.upgradeCost') }}:</p>
              <div class="space-y-1 sm:space-y-1.5">
                <div class="flex items-center gap-1.5 sm:gap-2">
                  <ResourceIcon type="metal" size="sm" />
                  <span class="text-xs">{{ t('resources.metal') }}:</span>
                  <span
                    class="font-medium text-xs sm:text-sm"
                    :class="
                      getResourceCostColor(planet.resources.metal, getBuildingCost(buildingType, getBuildingLevel(buildingType) + 1).metal)
                    "
                  >
                    {{ formatNumber(getBuildingCost(buildingType, getBuildingLevel(buildingType) + 1).metal) }}
                  </span>
                </div>
                <div class="flex items-center gap-1.5 sm:gap-2">
                  <ResourceIcon type="crystal" size="sm" />
                  <span class="text-xs">{{ t('resources.crystal') }}:</span>
                  <span
                    class="font-medium text-xs sm:text-sm"
                    :class="
                      getResourceCostColor(
                        planet.resources.crystal,
                        getBuildingCost(buildingType, getBuildingLevel(buildingType) + 1).crystal
                      )
                    "
                  >
                    {{ formatNumber(getBuildingCost(buildingType, getBuildingLevel(buildingType) + 1).crystal) }}
                  </span>
                </div>
                <div class="flex items-center gap-1.5 sm:gap-2">
                  <ResourceIcon type="deuterium" size="sm" />
                  <span class="text-xs">{{ t('resources.deuterium') }}:</span>
                  <span
                    class="font-medium text-xs sm:text-sm"
                    :class="
                      getResourceCostColor(
                        planet.resources.deuterium,
                        getBuildingCost(buildingType, getBuildingLevel(buildingType) + 1).deuterium
                      )
                    "
                  >
                    {{ formatNumber(getBuildingCost(buildingType, getBuildingLevel(buildingType) + 1).deuterium) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="text-xs sm:text-sm space-y-0.5 sm:space-y-1">
              <div class="flex items-center gap-1.5 text-muted-foreground">
                <Clock :size="14" class="flex-shrink-0" />
                <span>{{ formatTime(getBuildingTime(buildingType, getBuildingLevel(buildingType) + 1)) }}</span>
              </div>
              <div class="flex items-center gap-1.5 text-muted-foreground">
                <Grid3x3 :size="14" class="flex-shrink-0" />
                <span>{{ BUILDINGS[buildingType].spaceUsage }}</span>
              </div>
            </div>

            <!-- 升级按钮 -->
            <Button @click="handleUpgrade(buildingType)" :disabled="!canUpgrade(buildingType)" class="w-full">
              {{ t('buildingsView.upgrade') }}
            </Button>

            <!-- 拆除按钮 -->
            <Button
              v-if="getBuildingLevel(buildingType) > 0"
              @click="handleDemolish(buildingType)"
              :disabled="!canDemolish(buildingType)"
              variant="destructive"
              class="w-full"
            >
              {{ t('buildingsView.demolish') }}
            </Button>

            <!-- 拆除信息提示 -->
            <div v-if="getBuildingLevel(buildingType) > 0" class="text-xs text-muted-foreground">
              <p>{{ t('buildingsView.demolishRefund') }}:</p>
              <div class="flex gap-2 flex-wrap">
                <span>{{ formatNumber(getDemolishRefund(buildingType).metal) }} {{ t('resources.metal') }}</span>
                <span>{{ formatNumber(getDemolishRefund(buildingType).crystal) }} {{ t('resources.crystal') }}</span>
                <span>{{ formatNumber(getDemolishRefund(buildingType).deuterium) }} {{ t('resources.deuterium') }}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 提示对话框 -->
    <AlertDialog ref="alertDialog" />
  </div>
</template>

<script setup lang="ts">
  import { useGameStore } from '@/stores/gameStore'
  import { useDetailDialogStore } from '@/stores/detailDialogStore'
  import { useI18n } from '@/composables/useI18n'
  import { useGameConfig } from '@/composables/useGameConfig'
  import { computed, ref } from 'vue'
  import { BuildingType } from '@/types/game'
  import type { Resources, Planet } from '@/types/game'
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import ResourceIcon from '@/components/ResourceIcon.vue'
  import AlertDialog from '@/components/AlertDialog.vue'
  import { Clock, Grid3x3 } from 'lucide-vue-next'
  import { formatNumber, formatTime, getResourceCostColor } from '@/utils/format'
  import * as buildingLogic from '@/logic/buildingLogic'
  import * as buildingValidation from '@/logic/buildingValidation'

  const gameStore = useGameStore()
  const detailDialog = useDetailDialogStore()
  const { t } = useI18n()
  const { BUILDINGS } = useGameConfig()
  const planet = computed(() => gameStore.currentPlanet)
  const alertDialog = ref<InstanceType<typeof AlertDialog> | null>(null)

  // 根据星球类型过滤可用建筑
  const availableBuildings = computed(() => {
    if (!planet.value) return []
    return Object.values(BuildingType).filter(buildingType => {
      const config = BUILDINGS.value[buildingType]
      if (planet.value!.isMoon) {
        // 月球只能建造月球专属建筑
        return config.moonOnly === true
      } else {
        // 行星不能建造月球专属建筑
        return config.moonOnly !== true
      }
    })
  })

  const upgradeBuilding = (buildingType: BuildingType): boolean => {
    if (!gameStore.currentPlanet) return false
    const validation = buildingValidation.validateBuildingUpgrade(
      gameStore.currentPlanet,
      buildingType,
      gameStore.player.technologies,
      gameStore.player.officers
    )
    if (!validation.valid) return false
    const queueItem = buildingValidation.executeBuildingUpgrade(gameStore.currentPlanet, buildingType, gameStore.player.officers)
    gameStore.currentPlanet.buildQueue.push(queueItem)
    return true
  }

  const getUsedSpace = (planet: Planet): number => {
    return buildingLogic.calculateUsedSpace(planet)
  }

  // 升级建筑
  const handleUpgrade = (buildingType: BuildingType) => {
    const success = upgradeBuilding(buildingType)
    if (!success) {
      alertDialog.value?.show({
        title: t('buildingsView.upgradeFailed'),
        message: t('buildingsView.upgradeFailedMessage')
      })
    }
  }

  // 获取建筑等级
  const getBuildingLevel = (buildingType: BuildingType): number => {
    return planet.value?.buildings[buildingType] || 0
  }

  // 检查是否可以升级
  const canUpgrade = (buildingType: BuildingType): boolean => {
    if (!planet.value) return false
    if (planet.value.buildQueue.length > 0) return false

    const currentLevel = getBuildingLevel(buildingType)
    const cost = getBuildingCost(buildingType, currentLevel + 1)

    return (
      planet.value.resources.metal >= cost.metal &&
      planet.value.resources.crystal >= cost.crystal &&
      planet.value.resources.deuterium >= cost.deuterium
    )
  }

  const getBuildingCost = (buildingType: BuildingType, targetLevel: number): Resources => {
    return buildingLogic.calculateBuildingCost(buildingType, targetLevel)
  }

  const getBuildingTime = (buildingType: BuildingType, targetLevel: number): number => {
    return buildingLogic.calculateBuildingTime(buildingType, targetLevel)
  }

  // 拆除建筑
  const demolishBuilding = (buildingType: BuildingType): boolean => {
    if (!gameStore.currentPlanet) return false
    const validation = buildingValidation.validateBuildingDemolish(gameStore.currentPlanet, buildingType, gameStore.player.officers)
    if (!validation.valid) return false
    const queueItem = buildingValidation.executeBuildingDemolish(gameStore.currentPlanet, buildingType, gameStore.player.officers)
    gameStore.currentPlanet.buildQueue.push(queueItem)
    return true
  }

  const handleDemolish = (buildingType: BuildingType) => {
    const success = demolishBuilding(buildingType)
    if (!success) {
      alertDialog.value?.show({
        title: t('buildingsView.demolishFailed'),
        message: t('buildingsView.demolishFailedMessage')
      })
    }
  }

  // 检查是否可以拆除
  const canDemolish = (buildingType: BuildingType): boolean => {
    if (!planet.value) return false
    if (planet.value.buildQueue.length > 0) return false
    return getBuildingLevel(buildingType) > 0
  }

  // 获取拆除返还资源
  const getDemolishRefund = (buildingType: BuildingType): Resources => {
    const currentLevel = getBuildingLevel(buildingType)
    return buildingLogic.calculateDemolishRefund(buildingType, currentLevel)
  }
</script>
