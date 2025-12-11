<template>
  <div class="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
    <h1 class="text-2xl sm:text-3xl font-bold">{{ t('galaxyView.title') }}</h1>

    <!-- 坐标选择器 -->
    <Card>
      <CardHeader>
        <CardTitle>{{ t('galaxyView.selectCoordinates') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div class="space-y-2">
            <Label for="select-galaxy" class="text-xs sm:text-sm">{{ t('galaxyView.galaxy') }}</Label>
            <Select
              :key="gameStore.locale"
              :model-value="String(selectedGalaxy)"
              @update:model-value="
                val => {
                  selectedGalaxy = Number(val)
                  loadSystem()
                }
              "
            >
              <SelectTrigger id="select-galaxy" class="w-full">
                <SelectValue :placeholder="t('galaxyView.selectGalaxy')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="g in 9" :key="g" :value="String(g)">{{ t('galaxyView.galaxy') }} {{ g }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="select-system" class="text-xs sm:text-sm">{{ t('galaxyView.system') }}</Label>
            <Select
              :key="`${gameStore.locale}-system`"
              :model-value="String(selectedSystem)"
              @update:model-value="
                val => {
                  selectedSystem = Number(val)
                  loadSystem()
                }
              "
            >
              <SelectTrigger id="select-system" class="w-full">
                <SelectValue :placeholder="t('galaxyView.selectSystem')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="s in 10" :key="s" :value="String(s)">{{ t('galaxyView.system') }} {{ s }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="col-span-2 sm:col-span-1 flex items-end">
            <Button @click="goToCurrentPlanet" variant="outline" class="w-full">
              <Home class="h-4 w-4 mr-2" />
              {{ t('galaxyView.myPlanet') }}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 星系视图 -->
    <Card>
      <CardHeader>
        <CardTitle>{{ t('galaxyView.galaxy') }} {{ currentGalaxy }}:{{ currentSystem }}</CardTitle>
        <CardDescription>{{ t('galaxyView.totalPositions') }}</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-2">
          <div
            v-for="slot in systemSlots"
            :key="slot.position"
            class="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            :class="{
              'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700': isMyPlanet(slot.planet),
              'bg-muted/30': !slot.planet
            }"
          >
            <!-- 位置编号 -->
            <div class="w-8 sm:w-12 text-center">
              <Badge variant="outline" class="text-xs sm:text-sm">{{ slot.position }}</Badge>
            </div>

            <!-- 星球信息 -->
            <div class="flex-1 min-w-0">
              <div v-if="slot.planet" class="space-y-1">
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold text-sm sm:text-base truncate">{{ slot.planet.name }}</h3>
                  <Badge v-if="isMyPlanet(slot.planet)" variant="default" class="text-xs">{{ t('galaxyView.mine') }}</Badge>
                  <Badge v-else variant="secondary" class="text-xs">{{ t('galaxyView.hostile') }}</Badge>
                </div>
                <p class="text-xs text-muted-foreground">
                  [{{ slot.planet.position.galaxy }}:{{ slot.planet.position.system }}:{{ slot.planet.position.position }}]
                </p>
              </div>
              <div v-else class="text-sm text-muted-foreground">{{ t('galaxyView.emptySlot') }}</div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-1 sm:gap-2 flex-shrink-0">
              <Button
                v-if="slot.planet && !isMyPlanet(slot.planet)"
                @click="showPlanetActions(slot.planet, 'spy')"
                variant="outline"
                size="sm"
                class="h-8 w-8 p-0"
                :title="t('galaxyView.scout')"
              >
                <Eye class="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                v-if="slot.planet && !isMyPlanet(slot.planet)"
                @click="showPlanetActions(slot.planet, 'attack')"
                variant="outline"
                size="sm"
                class="h-8 w-8 p-0"
                :title="t('galaxyView.attack')"
              >
                <Sword class="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                v-if="!slot.planet"
                @click="showPlanetActions(null, 'colonize', slot.position)"
                variant="outline"
                size="sm"
                class="h-8 w-8 p-0"
                :title="t('galaxyView.colonize')"
              >
                <Rocket class="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                v-if="slot.planet && isMyPlanet(slot.planet)"
                @click="switchToPlanet(slot.planet.id)"
                variant="outline"
                size="sm"
                class="h-8 w-8 p-0"
                :title="t('galaxyView.switch')"
              >
                <Home class="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 快速派遣对话框 -->
    <AlertDialog ref="actionDialog" />
  </div>
</template>

<script setup lang="ts">
  import { useGameStore } from '@/stores/gameStore'
  import { useI18n } from '@/composables/useI18n'
  import { ref, onMounted } from 'vue'
  import type { Planet } from '@/types/game'
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
  import { Button } from '@/components/ui/button'
  import { Label } from '@/components/ui/label'
  import { Badge } from '@/components/ui/badge'
  import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
  import AlertDialog from '@/components/AlertDialog.vue'
  import { Home, Eye, Sword, Rocket } from 'lucide-vue-next'
  import { useRouter } from 'vue-router'
  import * as gameLogic from '@/logic/gameLogic'

  const gameStore = useGameStore()
  const router = useRouter()
  const { t } = useI18n()
  const actionDialog = ref<InstanceType<typeof AlertDialog> | null>(null)

  const selectedGalaxy = ref(1)
  const selectedSystem = ref(1)
  const currentGalaxy = ref(1)
  const currentSystem = ref(1)

  const systemSlots = ref<Array<{ position: number; planet: Planet | null }>>([])

  onMounted(() => {
    // 默认显示当前星球所在的星系
    if (gameStore.currentPlanet) {
      currentGalaxy.value = gameStore.currentPlanet.position.galaxy
      currentSystem.value = gameStore.currentPlanet.position.system
      selectedGalaxy.value = currentGalaxy.value
      selectedSystem.value = currentSystem.value
      loadSystem()
    }
  })

  const getSystemPlanets = (galaxy: number, system: number): Array<{ position: number; planet: Planet | null }> => {
    const positions = gameLogic.generateSystemPositions(galaxy, system)
    return positions.map(pos => {
      const key = gameLogic.generatePositionKey(galaxy, system, pos.position)
      const planet = gameStore.universePlanets[key] || null
      return { position: pos.position, planet }
    })
  }

  // 加载星系
  const loadSystem = () => {
    currentGalaxy.value = selectedGalaxy.value
    currentSystem.value = selectedSystem.value
    systemSlots.value = getSystemPlanets(currentGalaxy.value, currentSystem.value)
  }

  // 跳转到当前星球
  const goToCurrentPlanet = () => {
    if (gameStore.currentPlanet) {
      currentGalaxy.value = gameStore.currentPlanet.position.galaxy
      currentSystem.value = gameStore.currentPlanet.position.system
      selectedGalaxy.value = currentGalaxy.value
      selectedSystem.value = currentSystem.value
      loadSystem()
    }
  }

  // 判断是否为我的星球
  const isMyPlanet = (planet: Planet | null): boolean => {
    if (!planet) return false
    return planet.ownerId === gameStore.player.id
  }

  // 切换到指定星球
  const switchToPlanet = (planetId: string) => {
    gameStore.currentPlanetId = planetId
    router.push('/overview')
  }

  // 显示星球操作
  const showPlanetActions = (planet: Planet | null, action: 'spy' | 'attack' | 'colonize', position?: number) => {
    const targetPos = planet ? planet.position : { galaxy: currentGalaxy.value, system: currentSystem.value, position: position! }
    const coordinates = `${targetPos.galaxy}:${targetPos.system}:${targetPos.position}`

    let message = ''
    let title = ''
    if (action === 'spy') {
      title = t('galaxyView.scoutPlanetTitle')
      message = t('galaxyView.scoutPlanetMessage').replace('{coordinates}', coordinates)
    } else if (action === 'attack') {
      title = t('galaxyView.attackPlanetTitle')
      message = t('galaxyView.attackPlanetMessage').replace('{coordinates}', coordinates)
    } else if (action === 'colonize') {
      title = t('galaxyView.colonizePlanetTitle')
      message = t('galaxyView.colonizePlanetMessage').replace('{coordinates}', coordinates)
    }

    actionDialog.value?.show({
      title,
      message,
      onConfirm: () => {
        // 跳转到舰队页面并填充目标坐标
        router.push({
          path: '/fleet',
          query: {
            galaxy: targetPos.galaxy,
            system: targetPos.system,
            position: targetPos.position,
            mission: action
          }
        })
      }
    })
  }
</script>
