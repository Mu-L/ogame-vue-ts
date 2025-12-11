<template>
  <div class="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
    <h1 class="text-2xl sm:text-3xl font-bold">{{ t('messagesView.title') }}</h1>

    <!-- 标签切换 -->
    <div class="flex gap-2 border-b">
      <Button @click="activeTab = 'battles'" :variant="activeTab === 'battles' ? 'default' : 'ghost'" class="rounded-b-none">
        {{ t('messagesView.battleReports') }}
        <Badge v-if="gameStore.player.battleReports.length > 0" variant="secondary" class="ml-1">
          {{ gameStore.player.battleReports.length }}
        </Badge>
      </Button>
      <Button @click="activeTab = 'spy'" :variant="activeTab === 'spy' ? 'default' : 'ghost'" class="rounded-b-none">
        {{ t('messagesView.spyReports') }}
        <Badge v-if="gameStore.player.spyReports.length > 0" variant="secondary" class="ml-1">
          {{ gameStore.player.spyReports.length }}
        </Badge>
      </Button>
    </div>

    <!-- 战斗报告 -->
    <div v-if="activeTab === 'battles'" class="space-y-4">
      <Card v-if="gameStore.player.battleReports.length === 0">
        <CardContent class="py-8 text-center text-muted-foreground">{{ t('messagesView.noBattleReports') }}</CardContent>
      </Card>

      <Card v-for="report in sortedBattleReports" :key="report.id">
        <CardHeader>
          <div class="flex justify-between items-start gap-2">
            <div class="min-w-0 flex-1">
              <CardTitle class="text-base sm:text-lg">{{ t('messagesView.battleReport') }}</CardTitle>
              <CardDescription class="text-xs sm:text-sm">
                {{ formatDate(report.timestamp) }}
              </CardDescription>
            </div>
            <Badge :variant="report.winner === 'attacker' ? 'default' : report.winner === 'defender' ? 'destructive' : 'secondary'">
              {{ report.winner === 'attacker' ? t('messagesView.victory') : report.winner === 'defender' ? t('messagesView.defeat') : t('messagesView.draw') }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- 攻击方舰队 -->
          <div>
            <p class="text-sm font-medium mb-2">{{ t('messagesView.attackerFleet') }}:</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div v-for="(count, shipType) in report.attackerFleet" :key="shipType" class="text-xs sm:text-sm">
                <span class="text-muted-foreground">{{ SHIPS[shipType].name }}:</span>
                <span class="ml-1 font-medium">{{ count }}</span>
              </div>
            </div>
          </div>

          <!-- 防守方舰队 -->
          <div>
            <p class="text-sm font-medium mb-2">{{ t('messagesView.defenderFleet') }}:</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div v-for="(count, shipType) in report.defenderFleet" :key="shipType" class="text-xs sm:text-sm">
                <span class="text-muted-foreground">{{ SHIPS[shipType].name }}:</span>
                <span class="ml-1 font-medium">{{ count }}</span>
              </div>
            </div>
          </div>

          <!-- 防守方防御 -->
          <div v-if="hasDefense(report.defenderDefense)">
            <p class="text-sm font-medium mb-2">{{ t('messagesView.defenderDefense') }}:</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div v-for="(count, defenseType) in report.defenderDefense" :key="defenseType" class="text-xs sm:text-sm">
                <span class="text-muted-foreground">{{ DEFENSES[defenseType].name }}:</span>
                <span class="ml-1 font-medium">{{ count }}</span>
              </div>
            </div>
          </div>

          <!-- 损失 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-3 bg-muted rounded-lg">
              <p class="text-sm font-medium mb-2 text-red-600">{{ t('messagesView.attackerLosses') }}:</p>
              <div class="space-y-1 text-xs">
                <div v-for="(count, shipType) in report.attackerLosses" :key="shipType">{{ SHIPS[shipType].name }}: {{ count }}</div>
                <p v-if="Object.keys(report.attackerLosses).length === 0" class="text-muted-foreground">{{ t('messagesView.noLosses') }}</p>
              </div>
            </div>
            <div class="p-3 bg-muted rounded-lg">
              <p class="text-sm font-medium mb-2 text-red-600">{{ t('messagesView.defenderLosses') }}:</p>
              <div class="space-y-1 text-xs">
                <div v-for="(count, shipType) in report.defenderLosses.fleet" :key="shipType">{{ SHIPS[shipType].name }}: {{ count }}</div>
                <div v-for="(count, defenseType) in report.defenderLosses.defense" :key="defenseType">
                  {{ DEFENSES[defenseType].name }}: {{ count }}
                </div>
                <p
                  v-if="Object.keys(report.defenderLosses.fleet).length === 0 && Object.keys(report.defenderLosses.defense).length === 0"
                  class="text-muted-foreground"
                >
                  {{ t('messagesView.noLosses') }}
                </p>
              </div>
            </div>
          </div>

          <!-- 掠夺资源 -->
          <div
            v-if="report.plunder.metal > 0 || report.plunder.crystal > 0 || report.plunder.deuterium > 0"
            class="p-3 bg-green-50 dark:bg-green-950 rounded-lg"
          >
            <p class="text-sm font-medium mb-2 text-green-600">{{ t('messagesView.plunder') }}:</p>
            <div class="flex flex-wrap gap-3 text-xs sm:text-sm">
              <span v-if="report.plunder.metal > 0" class="flex items-center gap-1">
                <ResourceIcon type="metal" size="sm" />
                {{ formatNumber(report.plunder.metal) }}
              </span>
              <span v-if="report.plunder.crystal > 0" class="flex items-center gap-1">
                <ResourceIcon type="crystal" size="sm" />
                {{ formatNumber(report.plunder.crystal) }}
              </span>
              <span v-if="report.plunder.deuterium > 0" class="flex items-center gap-1">
                <ResourceIcon type="deuterium" size="sm" />
                {{ formatNumber(report.plunder.deuterium) }}
              </span>
            </div>
          </div>

          <!-- 残骸场 -->
          <div v-if="report.debrisField.metal > 0 || report.debrisField.crystal > 0" class="p-3 bg-muted rounded-lg">
            <p class="text-sm font-medium mb-2">{{ t('messagesView.debrisField') }}:</p>
            <div class="flex flex-wrap gap-3 text-xs sm:text-sm">
              <span v-if="report.debrisField.metal > 0" class="flex items-center gap-1">
                <ResourceIcon type="metal" size="sm" />
                {{ formatNumber(report.debrisField.metal) }}
              </span>
              <span v-if="report.debrisField.crystal > 0" class="flex items-center gap-1">
                <ResourceIcon type="crystal" size="sm" />
                {{ formatNumber(report.debrisField.crystal) }}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 间谍报告 -->
    <div v-if="activeTab === 'spy'" class="space-y-4">
      <Card v-if="gameStore.player.spyReports.length === 0">
        <CardContent class="py-8 text-center text-muted-foreground">{{ t('messagesView.noSpyReports') }}</CardContent>
      </Card>

      <Card v-for="report in sortedSpyReports" :key="report.id">
        <CardHeader>
          <div class="flex justify-between items-start gap-2">
            <div>
              <CardTitle class="text-base sm:text-lg">{{ t('messagesView.spyReport') }}</CardTitle>
              <CardDescription class="text-xs sm:text-sm">
                {{ formatDate(report.timestamp) }}
              </CardDescription>
            </div>
            <Badge variant="outline">
              {{ report.targetPlanetId }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- 资源 -->
          <div>
            <p class="text-sm font-medium mb-2">{{ t('messagesView.resources') }}:</p>
            <div class="flex flex-wrap gap-3 text-xs sm:text-sm">
              <span class="flex items-center gap-1">
                <ResourceIcon type="metal" size="sm" />
                {{ formatNumber(report.resources.metal) }}
              </span>
              <span class="flex items-center gap-1">
                <ResourceIcon type="crystal" size="sm" />
                {{ formatNumber(report.resources.crystal) }}
              </span>
              <span class="flex items-center gap-1">
                <ResourceIcon type="deuterium" size="sm" />
                {{ formatNumber(report.resources.deuterium) }}
              </span>
            </div>
          </div>

          <!-- 舰队 -->
          <div v-if="report.fleet">
            <p class="text-sm font-medium mb-2">{{ t('messagesView.fleet') }}:</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div v-for="(count, shipType) in report.fleet" :key="shipType" class="text-xs sm:text-sm">
                <span class="text-muted-foreground">{{ SHIPS[shipType].name }}:</span>
                <span class="ml-1 font-medium">{{ count }}</span>
              </div>
            </div>
          </div>

          <!-- 防御 -->
          <div v-if="report.defense && hasDefense(report.defense)">
            <p class="text-sm font-medium mb-2">{{ t('messagesView.defense') }}:</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div v-for="(count, defenseType) in report.defense" :key="defenseType" class="text-xs sm:text-sm">
                <span class="text-muted-foreground">{{ DEFENSES[defenseType].name }}:</span>
                <span class="ml-1 font-medium">{{ count }}</span>
              </div>
            </div>
          </div>

          <!-- 建筑 -->
          <div v-if="report.buildings">
            <p class="text-sm font-medium mb-2">{{ t('messagesView.buildings') }}:</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <template v-for="(level, buildingType) in report.buildings" :key="buildingType">
                <div v-if="level && level > 0" class="text-xs sm:text-sm">
                  <span class="text-muted-foreground">{{ BUILDINGS[buildingType].name }}:</span>
                  <span class="ml-1 font-medium">Lv {{ level }}</span>
                </div>
              </template>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useGameStore } from '@/stores/gameStore'
  import { useI18n } from '@/composables/useI18n'
  import { useGameConfig } from '@/composables/useGameConfig'
  import { computed, ref } from 'vue'
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import ResourceIcon from '@/components/ResourceIcon.vue'
  import { formatNumber, formatDate } from '@/utils/format'

  const gameStore = useGameStore()
  const { t } = useI18n()
  const { SHIPS, DEFENSES, BUILDINGS } = useGameConfig()
  const activeTab = ref<'battles' | 'spy'>('battles')

  // 排序后的战斗报告（最新的在前）
  const sortedBattleReports = computed(() => {
    return [...gameStore.player.battleReports].sort((a, b) => b.timestamp - a.timestamp)
  })

  // 排序后的间谍报告（最新的在前）
  const sortedSpyReports = computed(() => {
    return [...gameStore.player.spyReports].sort((a, b) => b.timestamp - a.timestamp)
  })

  // 检查是否有防御设施
  const hasDefense = (defense: any): boolean => {
    if (!defense) return false
    return Object.values(defense).some((count: any) => count > 0)
  }
</script>
