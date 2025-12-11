<template>
  <div v-if="planet" class="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
    <!-- 星球信息 -->
    <div class="text-center">
      <h1 class="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 flex items-center justify-center gap-2">
        {{ planet.name }}
        <Badge v-if="planet.isMoon" variant="secondary">{{ t('planet.moon') }}</Badge>
      </h1>
      <p class="text-xs sm:text-sm text-muted-foreground">
        {{ t('planet.position') }}: [{{ planet.position.galaxy }}:{{ planet.position.system }}:{{ planet.position.position }}]
      </p>
      <!-- 月球信息 -->
      <div v-if="!planet.isMoon && moon" class="mt-2">
        <Button @click="switchToMoon" variant="outline" size="sm">
          <span class="mr-2">🌙</span>
          {{ t('planet.switchToMoon') }}
        </Button>
      </div>
      <div v-if="planet.isMoon" class="mt-2">
        <Button @click="switchToParentPlanet" variant="outline" size="sm">{{ t('planet.backToPlanet') }}</Button>
      </div>
    </div>

    <!-- 资源显示 -->
    <Card>
      <CardHeader>
        <CardTitle>{{ t('overview.resourceOverview') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{{ t('common.resourceType') }}</TableHead>
              <TableHead class="text-right">{{ t('resources.current') }}</TableHead>
              <TableHead class="text-right">{{ t('resources.max') }}</TableHead>
              <TableHead class="text-right">{{ t('resources.production') }}{{ t('resources.perHour') }}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="resourceType in resourceTypes" :key="resourceType.key">
              <TableCell class="font-medium">
                <div class="flex items-center gap-2">
                  <ResourceIcon :type="resourceType.key" size="sm" />
                  {{ t(`resources.${resourceType.key}`) }}
                </div>
              </TableCell>
              <!-- 电量特殊显示 -->
              <template v-if="resourceType.key === 'energy'">
                <TableCell
                  class="text-right"
                  :class="planet.resources[resourceType.key] >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
                >
                  {{ formatNumber(planet.resources[resourceType.key]) }}
                </TableCell>
                <TableCell class="text-right text-muted-foreground">-</TableCell>
                <TableCell class="text-right text-muted-foreground">
                  {{ formatNumber(energyProduction) }} / {{ formatNumber(energyConsumption) }}
                </TableCell>
              </template>
              <!-- 其他资源正常显示 -->
              <template v-else>
                <TableCell
                  class="text-right"
                  :class="getResourceColor(planet.resources[resourceType.key], capacity?.[resourceType.key] || Infinity)"
                >
                  {{ formatNumber(planet.resources[resourceType.key]) }}
                </TableCell>
                <TableCell class="text-right text-muted-foreground">
                  {{ formatNumber(capacity?.[resourceType.key] || 0) }}
                </TableCell>
                <TableCell class="text-right text-muted-foreground">
                  {{ formatNumber(production?.[resourceType.key] || 0) }}
                </TableCell>
              </template>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- 舰队信息 -->
    <Card>
      <CardHeader>
        <CardTitle>{{ t('overview.fleetInfo') }}</CardTitle>
        <CardDescription>{{ t('overview.currentShips') }}</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          <div v-for="(count, shipType) in planet.fleet" :key="shipType">
            <p class="text-xs sm:text-sm text-muted-foreground">{{ SHIPS[shipType].name }}</p>
            <p class="text-lg sm:text-xl font-bold">{{ count }}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
  import { useGameStore } from '@/stores/gameStore'
  import { useI18n } from '@/composables/useI18n'
  import { useGameConfig } from '@/composables/useGameConfig'
  import { computed } from 'vue'
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import ResourceIcon from '@/components/ResourceIcon.vue'
  import { formatNumber, getResourceColor } from '@/utils/format'
  import type { Planet } from '@/types/game'
  import * as publicLogic from '@/logic/publicLogic'
  import * as officerLogic from '@/logic/officerLogic'
  import * as resourceLogic from '@/logic/resourceLogic'

  const gameStore = useGameStore()
  const { t } = useI18n()
  const { SHIPS } = useGameConfig()
  const planet = computed(() => gameStore.currentPlanet)
  const production = computed(() => (planet.value ? publicLogic.getResourceProduction(planet.value, gameStore.player.officers) : null))
  const capacity = computed(() => (planet.value ? publicLogic.getResourceCapacity(planet.value, gameStore.player.officers) : null))

  // 电量产出和消耗
  const energyProduction = computed(() => {
    if (!planet.value) return 0
    const bonuses = officerLogic.calculateActiveBonuses(gameStore.player.officers, Date.now())
    return resourceLogic.calculateEnergyProduction(planet.value, { energyProductionBonus: bonuses.energyProductionBonus })
  })

  const energyConsumption = computed(() => {
    if (!planet.value) return 0
    return resourceLogic.calculateEnergyConsumption(planet.value)
  })

  // 资源类型配置
  const resourceTypes = [
    { key: 'metal' as const },
    { key: 'crystal' as const },
    { key: 'deuterium' as const },
    { key: 'darkMatter' as const },
    { key: 'energy' as const }
  ]

  // 月球相关
  const moon = computed(() => {
    if (!planet.value || planet.value.isMoon) return null
    return getMoonForPlanet(planet.value.id)
  })

  const getMoonForPlanet = (planetId: string): Planet | null => {
    return gameStore.player.planets.find(p => p.isMoon && p.parentPlanetId === planetId) || null
  }

  // 切换到月球
  const switchToMoon = () => {
    if (moon.value) {
      gameStore.currentPlanetId = moon.value.id
    }
  }

  // 切换回母星
  const switchToParentPlanet = () => {
    if (planet.value?.parentPlanetId) {
      gameStore.currentPlanetId = planet.value.parentPlanetId
    }
  }
</script>
