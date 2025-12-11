<template>
  <div class="container mx-auto p-4 sm:p-6 space-y-6">
    <h1 class="text-2xl sm:text-3xl font-bold">{{ t('simulatorView.title') }}</h1>
    <!-- 标签切换 -->
    <div class="flex gap-2 border-b">
      <Button @click="activeTab = 'attacker'" :variant="activeTab === 'attacker' ? 'default' : 'ghost'" class="rounded-b-none">
        <Sword />
        {{ t('simulatorView.attacker') }}
      </Button>
      <Button @click="activeTab = 'defender'" :variant="activeTab === 'defender' ? 'default' : 'ghost'" class="rounded-b-none">
        <Shield />
        {{ t('simulatorView.defender') }}
      </Button>
    </div>
    <!-- 攻击方配置 -->
    <Card v-if="activeTab === 'attacker'">
      <CardHeader>
        <CardTitle>{{ t('simulatorView.attackerConfig') }}</CardTitle>
        <CardDescription>{{ t('simulatorView.attackerConfigDesc') }}</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- 舰队配置 -->
        <div>
          <h3 class="text-sm font-medium mb-3">{{ t('simulatorView.fleet') }}</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div v-for="shipType in Object.values(ShipType)" :key="shipType" class="space-y-1">
              <Label :for="`attacker-${shipType}`" class="text-xs">{{ SHIPS[shipType].name }}</Label>
              <Input :id="`attacker-${shipType}`" v-model.number="attackerFleet[shipType]" type="number" min="0" class="h-8" />
            </div>
          </div>
        </div>
        <!-- 科技等级 -->
        <div>
          <h3 class="text-sm font-medium mb-3">{{ t('simulatorView.techLevels') }}</h3>
          <div class="grid grid-cols-3 gap-3">
            <div class="space-y-1">
              <Label for="attacker-weapon" class="text-xs">{{ t('simulatorView.weapon') }}</Label>
              <Input id="attacker-weapon" v-model.number="attackerTech.weapon" type="number" min="0" class="h-8" />
            </div>
            <div class="space-y-1">
              <Label for="attacker-shield" class="text-xs">{{ t('simulatorView.shield') }}</Label>
              <Input id="attacker-shield" v-model.number="attackerTech.shield" type="number" min="0" class="h-8" />
            </div>
            <div class="space-y-1">
              <Label for="attacker-armor" class="text-xs">{{ t('simulatorView.armor') }}</Label>
              <Input id="attacker-armor" v-model.number="attackerTech.armor" type="number" min="0" class="h-8" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    <!-- 防守方配置 -->
    <Card v-else>
      <CardHeader>
        <CardTitle>{{ t('simulatorView.defenderConfig') }}</CardTitle>
        <CardDescription>{{ t('simulatorView.defenderConfigDesc') }}</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- 舰队配置 -->
        <div>
          <h3 class="text-sm font-medium mb-3">{{ t('simulatorView.fleet') }}</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div v-for="shipType in Object.values(ShipType)" :key="shipType" class="space-y-1">
              <Label :for="`defender-${shipType}`" class="text-xs">{{ SHIPS[shipType].name }}</Label>
              <Input :id="`defender-${shipType}`" v-model.number="defenderFleet[shipType]" type="number" min="0" class="h-8" />
            </div>
          </div>
        </div>

        <!-- 防御设施 -->
        <div>
          <h3 class="text-sm font-medium mb-3">{{ t('simulatorView.defenseStructures') }}</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div v-for="defenseType in Object.values(DefenseType)" :key="defenseType" class="space-y-1">
              <Label :for="`defense-${defenseType}`" class="text-xs">{{ DEFENSES[defenseType].name }}</Label>
              <Input :id="`defense-${defenseType}`" v-model.number="defenderDefense[defenseType]" type="number" min="0" class="h-8" />
            </div>
          </div>
        </div>

        <!-- 科技等级 -->
        <div>
          <h3 class="text-sm font-medium mb-3">{{ t('simulatorView.techLevels') }}</h3>
          <div class="grid grid-cols-3 gap-3">
            <div class="space-y-1">
              <Label for="defender-weapon" class="text-xs">{{ t('simulatorView.weapon') }}</Label>
              <Input id="defender-weapon" v-model.number="defenderTech.weapon" type="number" min="0" class="h-8" />
            </div>
            <div class="space-y-1">
              <Label for="defender-shield" class="text-xs">{{ t('simulatorView.shield') }}</Label>
              <Input id="defender-shield" v-model.number="defenderTech.shield" type="number" min="0" class="h-8" />
            </div>
            <div class="space-y-1">
              <Label for="defender-armor" class="text-xs">{{ t('simulatorView.armor') }}</Label>
              <Input id="defender-armor" v-model.number="defenderTech.armor" type="number" min="0" class="h-8" />
            </div>
          </div>
        </div>

        <!-- 防守方资源 -->
        <div>
          <h3 class="text-sm font-medium mb-3">{{ t('simulatorView.defenderResources') }}</h3>
          <div class="grid grid-cols-3 gap-3">
            <div class="space-y-1">
              <Label for="defender-metal" class="text-xs flex items-center gap-1">
                <ResourceIcon type="metal" size="sm" />
                {{ t('resources.metal') }}
              </Label>
              <Input id="defender-metal" v-model.number="defenderResources.metal" type="number" min="0" class="h-8" />
            </div>
            <div class="space-y-1">
              <Label for="defender-crystal" class="text-xs flex items-center gap-1">
                <ResourceIcon type="crystal" size="sm" />
                {{ t('resources.crystal') }}
              </Label>
              <Input id="defender-crystal" v-model.number="defenderResources.crystal" type="number" min="0" class="h-8" />
            </div>
            <div class="space-y-1">
              <Label for="defender-deuterium" class="text-xs flex items-center gap-1">
                <ResourceIcon type="deuterium" size="sm" />
                {{ t('resources.deuterium') }}
              </Label>
              <Input id="defender-deuterium" v-model.number="defenderResources.deuterium" type="number" min="0" class="h-8" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 操作按钮 -->
    <div class="flex gap-2">
      <Button @click="runSimulation" class="flex-1" size="lg">
        <Zap class="h-4 w-4 mr-2" />
        {{ t('simulatorView.startSimulation') }}
      </Button>
      <Button @click="resetSimulation" variant="outline" size="lg">
        <RotateCcw class="h-4 w-4 mr-2" />
        {{ t('simulatorView.reset') }}
      </Button>
    </div>

    <!-- 战斗结果对话框 -->
    <Dialog v-model:open="showResultDialog">
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Trophy class="h-5 w-5" />
            {{ t('simulatorView.battleResult') }}
          </DialogTitle>
        </DialogHeader>
        <div v-if="simulationResult" class="space-y-4">
          <!-- 胜利者 -->
          <div class="text-center p-4 rounded-lg" :class="getWinnerStyle(simulationResult.winner)">
            <p class="text-lg font-bold">
              {{
                simulationResult.winner === 'attacker'
                  ? t('simulatorView.attackerVictory')
                  : simulationResult.winner === 'defender'
                  ? t('simulatorView.defenderVictory')
                  : t('simulatorView.draw')
              }}
            </p>
            <p class="text-sm mt-1">{{ t('simulatorView.afterRounds').replace('{rounds}', String(battleRounds)) }}</p>
          </div>
          <!-- 损失对比 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 攻击方损失 -->
            <div class="space-y-2">
              <p class="text-sm font-medium text-red-600 dark:text-red-400">{{ t('simulatorView.attackerLosses') }}</p>
              <div class="p-3 bg-muted rounded-lg space-y-1 text-xs">
                <div v-for="(count, shipType) in simulationResult.attackerLosses" :key="shipType">
                  <span class="text-muted-foreground">{{ SHIPS[shipType].name }}:</span>
                  <span class="ml-2 font-medium">{{ count }}</span>
                </div>
                <p v-if="Object.keys(simulationResult.attackerLosses).length === 0" class="text-muted-foreground">
                  {{ t('simulatorView.noLosses') }}
                </p>
              </div>
            </div>

            <!-- 防守方损失 -->
            <div class="space-y-2">
              <p class="text-sm font-medium text-red-600 dark:text-red-400">{{ t('simulatorView.defenderLosses') }}</p>
              <div class="p-3 bg-muted rounded-lg space-y-1 text-xs">
                <div v-for="(count, shipType) in simulationResult.defenderLosses.fleet" :key="shipType">
                  <span class="text-muted-foreground">{{ SHIPS[shipType].name }}:</span>
                  <span class="ml-2 font-medium">{{ count }}</span>
                </div>
                <div v-for="(count, defenseType) in simulationResult.defenderLosses.defense" :key="defenseType">
                  <span class="text-muted-foreground">{{ DEFENSES[defenseType].name }}:</span>
                  <span class="ml-2 font-medium">{{ count }}</span>
                </div>
                <p
                  v-if="
                    Object.keys(simulationResult.defenderLosses.fleet).length === 0 &&
                    Object.keys(simulationResult.defenderLosses.defense).length === 0
                  "
                  class="text-muted-foreground"
                >
                  {{ t('simulatorView.noLosses') }}
                </p>
              </div>
            </div>
          </div>

          <!-- 剩余单位 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 攻击方剩余 -->
            <div class="space-y-2">
              <p class="text-sm font-medium text-blue-600 dark:text-blue-400">{{ t('simulatorView.attackerRemaining') }}</p>
              <div class="p-3 bg-muted rounded-lg space-y-1 text-xs">
                <div v-for="(count, shipType) in attackerRemaining" :key="shipType">
                  <span class="text-muted-foreground">{{ SHIPS[shipType].name }}:</span>
                  <span class="ml-2 font-medium">{{ count }}</span>
                </div>
                <p v-if="Object.keys(attackerRemaining).length === 0" class="text-muted-foreground">
                  {{ t('simulatorView.allDestroyed') }}
                </p>
              </div>
            </div>

            <!-- 防守方剩余 -->
            <div class="space-y-2">
              <p class="text-sm font-medium text-blue-600 dark:text-blue-400">{{ t('simulatorView.defenderRemaining') }}</p>
              <div class="p-3 bg-muted rounded-lg space-y-1 text-xs">
                <div v-for="(count, shipType) in defenderRemaining.fleet" :key="shipType">
                  <span class="text-muted-foreground">{{ SHIPS[shipType].name }}:</span>
                  <span class="ml-2 font-medium">{{ count }}</span>
                </div>
                <div v-for="(count, defenseType) in defenderRemaining.defense" :key="defenseType">
                  <span class="text-muted-foreground">{{ DEFENSES[defenseType].name }}:</span>
                  <span class="ml-2 font-medium">{{ count }}</span>
                </div>
                <p
                  v-if="Object.keys(defenderRemaining.fleet).length === 0 && Object.keys(defenderRemaining.defense).length === 0"
                  class="text-muted-foreground"
                >
                  {{ t('simulatorView.allDestroyed') }}
                </p>
              </div>
            </div>
          </div>

          <!-- 战利品和残骸 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 掠夺资源 -->
            <div
              v-if="plunder.metal > 0 || plunder.crystal > 0 || plunder.deuterium > 0"
              class="p-3 bg-green-50 dark:bg-green-950 rounded-lg"
            >
              <p class="text-sm font-medium mb-2 text-green-600 dark:text-green-400">{{ t('simulatorView.plunderableResources') }}</p>
              <div class="flex flex-wrap gap-3 text-xs">
                <span v-if="plunder.metal > 0" class="flex items-center gap-1">
                  <ResourceIcon type="metal" size="sm" />
                  {{ formatNumber(plunder.metal) }}
                </span>
                <span v-if="plunder.crystal > 0" class="flex items-center gap-1">
                  <ResourceIcon type="crystal" size="sm" />
                  {{ formatNumber(plunder.crystal) }}
                </span>
                <span v-if="plunder.deuterium > 0" class="flex items-center gap-1">
                  <ResourceIcon type="deuterium" size="sm" />
                  {{ formatNumber(plunder.deuterium) }}
                </span>
              </div>
            </div>

            <!-- 残骸场 -->
            <div v-if="debrisField.metal > 0 || debrisField.crystal > 0" class="p-3 bg-muted rounded-lg">
              <p class="text-sm font-medium mb-2">{{ t('simulatorView.debrisField') }}</p>
              <div class="flex flex-wrap gap-3 text-xs">
                <span v-if="debrisField.metal > 0" class="flex items-center gap-1">
                  <ResourceIcon type="metal" size="sm" />
                  {{ formatNumber(debrisField.metal) }}
                </span>
                <span v-if="debrisField.crystal > 0" class="flex items-center gap-1">
                  <ResourceIcon type="crystal" size="sm" />
                  {{ formatNumber(debrisField.crystal) }}
                </span>
              </div>
              <!-- 月球生成概率 -->
              <p v-if="moonChance > 0" class="text-xs text-muted-foreground mt-2">{{ t('simulatorView.moonChance') }}: {{ moonChance }}%</p>
            </div>
          </div>

          <!-- 回合详情 -->
          <div class="space-y-2">
            <Button @click="showRoundDetails = !showRoundDetails" variant="outline" size="sm" class="w-full">
              {{ showRoundDetails ? t('simulatorView.hideRoundDetails') : t('simulatorView.showRoundDetails') }}
            </Button>

            <div v-if="showRoundDetails" class="relative pl-6 space-y-4">
              <!-- 时间线 -->
              <div class="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />

              <div v-for="detail in roundDetails" :key="detail.round" class="relative">
                <!-- 时间线节点 -->
                <div class="absolute -left-6 top-3 w-4 h-4 rounded-full bg-primary border-2 border-background" />

                <!-- 回合内容卡片 -->
                <div class="border rounded-lg p-3 bg-card hover:shadow-md transition-shadow">
                  <div class="flex items-center justify-between mb-3">
                    <p class="text-sm font-semibold">{{ t('simulatorView.round').replace('{round}', String(detail.round)) }}</p>
                    <div class="flex gap-3 text-xs text-muted-foreground">
                      <span class="flex items-center gap-1" :title="t('simulatorView.attackerRemainingPower')">
                        <Sword class="h-3 w-3" />
                        {{ formatNumber(detail.attackerRemainingPower) }}
                      </span>
                      <span class="flex items-center gap-1" :title="t('simulatorView.defenderRemainingPower')">
                        <Shield class="h-3 w-3" />
                        {{ formatNumber(detail.defenderRemainingPower) }}
                      </span>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <!-- 攻击方本回合损失 -->
                    <div class="bg-red-50 dark:bg-red-950/20 rounded p-2">
                      <p class="text-xs font-medium text-red-600 dark:text-red-400 mb-1.5">{{ t('simulatorView.attackerLosses') }}</p>
                      <div class="text-xs space-y-0.5">
                        <div v-for="(count, shipType) in detail.attackerLosses" :key="shipType" class="flex justify-between">
                          <span class="text-muted-foreground">{{ SHIPS[shipType].name }}</span>
                          <span class="font-medium">-{{ count }}</span>
                        </div>
                        <p v-if="Object.keys(detail.attackerLosses).length === 0" class="text-muted-foreground italic">
                          {{ t('simulatorView.noLosses') }}
                        </p>
                      </div>
                    </div>

                    <!-- 防守方本回合损失 -->
                    <div class="bg-blue-50 dark:bg-blue-950/20 rounded p-2">
                      <p class="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1.5">{{ t('simulatorView.defenderLosses') }}</p>
                      <div class="text-xs space-y-0.5">
                        <div v-for="(count, shipType) in detail.defenderLosses.fleet" :key="shipType" class="flex justify-between">
                          <span class="text-muted-foreground">{{ SHIPS[shipType].name }}</span>
                          <span class="font-medium">-{{ count }}</span>
                        </div>
                        <div v-for="(count, defenseType) in detail.defenderLosses.defense" :key="defenseType" class="flex justify-between">
                          <span class="text-muted-foreground">{{ DEFENSES[defenseType].name }}</span>
                          <span class="font-medium">-{{ count }}</span>
                        </div>
                        <p
                          v-if="
                            Object.keys(detail.defenderLosses.fleet).length === 0 && Object.keys(detail.defenderLosses.defense).length === 0
                          "
                          class="text-muted-foreground italic"
                        >
                          {{ t('simulatorView.noLosses') }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useI18n } from '@/composables/useI18n'
  import { useGameConfig } from '@/composables/useGameConfig'
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
  import { Button } from '@/components/ui/button'
  import { Input } from '@/components/ui/input'
  import { Label } from '@/components/ui/label'
  import { ShipType, DefenseType } from '@/types/game'
  import type { Fleet, BattleResult, Resources } from '@/types/game'
  import { simulateBattle, calculatePlunder, calculateDebrisField } from '@/utils/battleSimulator'
  import ResourceIcon from '@/components/ResourceIcon.vue'
  import { formatNumber } from '@/utils/format'
  import { Sword, Shield, Zap, RotateCcw, Trophy } from 'lucide-vue-next'
  import * as planetLogic from '@/logic/planetLogic'

  const { t } = useI18n()
  const { SHIPS, DEFENSES } = useGameConfig()

  // 攻击方配置
  const attackerFleet = ref<Partial<Fleet>>({
    [ShipType.LightFighter]: 0,
    [ShipType.HeavyFighter]: 0,
    [ShipType.Cruiser]: 0,
    [ShipType.Battleship]: 0,
    [ShipType.SmallCargo]: 0,
    [ShipType.LargeCargo]: 0,
    [ShipType.ColonyShip]: 0,
    [ShipType.Recycler]: 0,
    [ShipType.EspionageProbe]: 0,
    [ShipType.DarkMatterHarvester]: 0
  })

  const activeTab = ref('attacker')

  const attackerTech = ref({
    weapon: 0,
    shield: 0,
    armor: 0
  })

  // 防守方配置
  const defenderFleet = ref<Partial<Fleet>>({
    [ShipType.LightFighter]: 0,
    [ShipType.HeavyFighter]: 0,
    [ShipType.Cruiser]: 0,
    [ShipType.Battleship]: 0,
    [ShipType.SmallCargo]: 0,
    [ShipType.LargeCargo]: 0,
    [ShipType.ColonyShip]: 0,
    [ShipType.Recycler]: 0,
    [ShipType.EspionageProbe]: 0,
    [ShipType.DarkMatterHarvester]: 0
  })

  const defenderDefense = ref<Partial<Record<DefenseType, number>>>({
    [DefenseType.RocketLauncher]: 0,
    [DefenseType.LightLaser]: 0,
    [DefenseType.HeavyLaser]: 0,
    [DefenseType.GaussCannon]: 0,
    [DefenseType.IonCannon]: 0,
    [DefenseType.PlasmaTurret]: 0,
    [DefenseType.SmallShieldDome]: 0,
    [DefenseType.LargeShieldDome]: 0
  })

  const defenderTech = ref({
    weapon: 0,
    shield: 0,
    armor: 0
  })

  const defenderResources = ref({
    metal: 100000,
    crystal: 50000,
    deuterium: 25000,
    darkMatter: 100,
    energy: 0
  })

  // 模拟结果
  const simulationResult = ref<BattleResult | null>(null)
  const battleRounds = ref<number>(0)
  const attackerRemaining = ref<Partial<Fleet>>({})
  const defenderRemaining = ref<{ fleet: Partial<Fleet>; defense: Partial<Record<DefenseType, number>> }>({
    fleet: {},
    defense: {}
  })
  const roundDetails = ref<
    Array<{
      round: number
      attackerLosses: Partial<Fleet>
      defenderLosses: {
        fleet: Partial<Fleet>
        defense: Partial<Record<DefenseType, number>>
      }
      attackerRemainingPower: number
      defenderRemainingPower: number
    }>
  >([])
  const showRoundDetails = ref<boolean>(false)
  const showResultDialog = ref<boolean>(false)

  // 计算掠夺资源
  const plunder = computed(() => {
    if (!simulationResult.value || simulationResult.value.winner !== 'attacker') {
      return { metal: 0, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 }
    }
    return calculatePlunder(defenderResources.value, attackerFleet.value)
  })

  // 计算残骸场
  const debrisField = computed(() => {
    if (!simulationResult.value) {
      return { metal: 0, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 }
    }
    return calculateDebrisField(simulationResult.value.attackerLosses, simulationResult.value.defenderLosses)
  })

  const calculateMoonChance = (debrisField: Resources): number => {
    return planetLogic.calculateMoonChance(debrisField)
  }

  // 计算月球生成概率
  const moonChance = computed(() => {
    if (!debrisField.value) return 0
    return calculateMoonChance(debrisField.value)
  })

  // 运行模拟
  const runSimulation = () => {
    const attackerSide = {
      ships: attackerFleet.value,
      weaponTech: attackerTech.value.weapon,
      shieldTech: attackerTech.value.shield,
      armorTech: attackerTech.value.armor
    }

    const defenderSide = {
      ships: defenderFleet.value,
      defense: defenderDefense.value,
      weaponTech: defenderTech.value.weapon,
      shieldTech: defenderTech.value.shield,
      armorTech: defenderTech.value.armor
    }

    const result = simulateBattle(attackerSide, defenderSide)

    // 保存回合数和剩余单位
    battleRounds.value = result.rounds
    attackerRemaining.value = result.attackerRemaining
    defenderRemaining.value = result.defenderRemaining
    roundDetails.value = result.roundDetails
    showRoundDetails.value = false

    simulationResult.value = {
      id: `sim_${Date.now()}`,
      timestamp: Date.now(),
      attackerId: 'simulator_attacker',
      defenderId: 'simulator_defender',
      attackerPlanetId: 'sim_attacker',
      defenderPlanetId: 'sim_defender',
      attackerFleet: attackerFleet.value,
      defenderFleet: defenderFleet.value,
      defenderDefense: defenderDefense.value,
      attackerLosses: result.attackerLosses,
      defenderLosses: result.defenderLosses,
      winner: result.winner,
      plunder: plunder.value,
      debrisField: debrisField.value
    }

    // 显示结果对话框
    showResultDialog.value = true
  }

  // 重置模拟
  const resetSimulation = () => {
    Object.keys(attackerFleet.value).forEach(key => {
      attackerFleet.value[key as ShipType] = 0
    })
    Object.keys(defenderFleet.value).forEach(key => {
      defenderFleet.value[key as ShipType] = 0
    })
    Object.keys(defenderDefense.value).forEach(key => {
      defenderDefense.value[key as DefenseType] = 0
    })
    attackerTech.value = { weapon: 0, shield: 0, armor: 0 }
    defenderTech.value = { weapon: 0, shield: 0, armor: 0 }
    simulationResult.value = null
    battleRounds.value = 0
    attackerRemaining.value = {}
    defenderRemaining.value = { fleet: {}, defense: {} }
    roundDetails.value = []
    showRoundDetails.value = false
    showResultDialog.value = false
  }

  // 获取胜利者样式
  const getWinnerStyle = (winner: string) => {
    if (winner === 'attacker') return 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'
    if (winner === 'defender') return 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
    return 'bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300'
  }
</script>
