<template>
  <div class="space-y-4">
    <!-- 防御基础信息 -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader class="pb-3">
          <CardTitle class="text-sm flex items-center gap-2">
            <Sword class="h-4 w-4" />
            {{ t('defense.attack') }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ formatNumber(config.attack) }}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-3">
          <CardTitle class="text-sm flex items-center gap-2">
            <Shield class="h-4 w-4" />
            {{ t('defense.shield') }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ formatNumber(config.shield) }}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-3">
          <CardTitle class="text-sm flex items-center gap-2">
            <ShieldCheck class="h-4 w-4" />
            {{ t('defense.armor') }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ formatNumber(config.armor) }}</div>
        </CardContent>
      </Card>
    </div>

    <!-- 建造成本和时间 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle class="text-sm">{{ t('defense.buildCost') }}</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <div v-if="config.cost.metal > 0" class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">{{ t('resources.metal') }}:</span>
            <span class="font-medium">{{ formatNumber(config.cost.metal) }}</span>
          </div>
          <div v-if="config.cost.crystal > 0" class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">{{ t('resources.crystal') }}:</span>
            <span class="font-medium">{{ formatNumber(config.cost.crystal) }}</span>
          </div>
          <div v-if="config.cost.deuterium > 0" class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">{{ t('resources.deuterium') }}:</span>
            <span class="font-medium">{{ formatNumber(config.cost.deuterium) }}</span>
          </div>
          <div class="flex items-center justify-between text-sm pt-2 border-t">
            <span class="text-muted-foreground">{{ t('player.points') }}:</span>
            <span class="font-bold text-primary">{{ pointsPerUnit }}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-sm">{{ t('defense.buildTime') }}</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-bold">{{ formatTime(config.buildTime) }}</div>
          <p class="text-xs text-muted-foreground mt-2">{{ t('defense.perUnit') }}</p>
        </CardContent>
      </Card>
    </div>

    <!-- 批量建造计算器 -->
    <Card>
      <CardHeader>
        <CardTitle class="text-sm">{{ t('defense.batchCalculator') }}</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center gap-4">
          <Label class="w-20">{{ t('defense.quantity') }}:</Label>
          <Input v-model.number="quantity" type="number" min="1" class="flex-1" />
        </div>
        <div class="grid grid-cols-2 gap-4 pt-4 border-t">
          <div class="space-y-2">
            <p class="text-sm text-muted-foreground">{{ t('defense.totalCost') }}:</p>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span>{{ t('resources.metal') }}:</span>
                <span class="font-medium">{{ formatNumber(batchCost.metal) }}</span>
              </div>
              <div class="flex justify-between">
                <span>{{ t('resources.crystal') }}:</span>
                <span class="font-medium">{{ formatNumber(batchCost.crystal) }}</span>
              </div>
              <div class="flex justify-between">
                <span>{{ t('resources.deuterium') }}:</span>
                <span class="font-medium">{{ formatNumber(batchCost.deuterium) }}</span>
              </div>
            </div>
          </div>
          <div class="space-y-2">
            <p class="text-sm text-muted-foreground">{{ t('defense.totalTime') }}:</p>
            <div class="text-xl font-bold">{{ formatTime(config.buildTime * quantity) }}</div>
            <p class="text-xs text-muted-foreground">{{ t('player.points') }}: +{{ formatNumber(batchPoints) }}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useI18n } from '@/composables/useI18n'
  import type { DefenseType } from '@/types/game'
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
  import { Input } from '@/components/ui/input'
  import { Label } from '@/components/ui/label'
  import { Sword, Shield, ShieldCheck } from 'lucide-vue-next'
  import * as pointsLogic from '@/logic/pointsLogic'
  import { DEFENSES } from '@/config/gameConfig'

  const { t } = useI18n()

  const props = defineProps<{
    defenseType: DefenseType
  }>()

  const config = computed(() => DEFENSES[props.defenseType])
  const quantity = ref(1)

  // 单个防御的积分
  const pointsPerUnit = computed(() => {
    return pointsLogic.calculateDefensePoints(props.defenseType, 1)
  })

  // 批量建造成本
  const batchCost = computed(() => ({
    metal: config.value.cost.metal * quantity.value,
    crystal: config.value.cost.crystal * quantity.value,
    deuterium: config.value.cost.deuterium * quantity.value
  }))

  // 批量建造积分
  const batchPoints = computed(() => {
    return pointsLogic.calculateDefensePoints(props.defenseType, quantity.value)
  })

  const formatNumber = (num: number): string => {
    return num.toLocaleString()
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}${t('common.timeSecond')}`
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (minutes < 60) return `${minutes}${t('common.timeMinute')}${secs}${t('common.timeSecond')}`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}${t('common.timeHour')}${mins}${t('common.timeMinute')}`
  }
</script>
