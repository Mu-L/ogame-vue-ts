<template>
  <div class="flex h-screen bg-background overflow-hidden">
    <!-- 遮罩层（移动端） -->
    <div v-if="!gameStore.sidebarCollapsed" class="fixed inset-0 bg-black/50 z-30 lg:hidden" @click="toggleSidebar" />

    <!-- 侧边导航栏 -->
    <aside
      :class="[
        'border-r bg-card flex flex-col transition-all duration-300 ease-in-out shadow-lg z-40',
        'fixed lg:relative h-full',
        gameStore.sidebarCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 w-64'
      ]"
    >
      <!-- Logo -->
      <div class="p-4 border-b flex items-center justify-center">
        <h1 v-if="!gameStore.sidebarCollapsed" class="text-xl font-bold flex items-center gap-2">
          <span class="text-2xl">
            <img src="@/assets/logo.svg" class="w-10" />
          </span>
          {{ pkg.title }}
        </h1>
        <span v-else class="text-2xl">
          <img src="@/assets/logo.svg" class="w-10" />
        </span>
      </div>

      <!-- 星球信息 -->
      <div v-if="planet && !gameStore.sidebarCollapsed" class="p-4 border-b">
        <div class="text-sm space-y-2">
          <div>
            <p class="font-semibold mb-1">
              {{ planet.name }}
              <Badge v-if="planet.isMoon" variant="secondary" class="ml-1 text-xs">{{ t('planet.moon') }}</Badge>
            </p>
            <p class="text-muted-foreground text-xs">
              [{{ planet.position.galaxy }}:{{ planet.position.system }}:{{ planet.position.position }}]
            </p>
          </div>
          <!-- 玩家积分显示 -->
          <div class="bg-muted/50 rounded-lg p-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted-foreground">{{ t('player.points') }}</span>
              <span class="text-sm font-bold text-primary">{{ formatNumber(gameStore.player.points) }}</span>
            </div>
          </div>
          <!-- 月球切换按钮 -->
          <div v-if="hasMoon || planet.isMoon" class="flex gap-1">
            <Button v-if="planet.isMoon" @click="switchToParentPlanet" variant="outline" size="sm" class="w-full text-xs h-7">
              {{ t('planet.backToPlanet') }}
            </Button>
            <Button v-else-if="moon" @click="switchToMoon" variant="outline" size="sm" class="w-full text-xs h-7">
              {{ t('planet.switchToMoon') }}
            </Button>
          </div>
        </div>
      </div>

      <!-- 导航菜单 -->
      <nav class="flex-1 p-2 space-y-1 overflow-y-auto">
        <RouterLink v-for="item in navItems" :key="item.path" :to="item.path" v-slot="{ isActive: routeActive }">
          <Button
            :variant="routeActive ? 'secondary' : 'ghost'"
            :class="['w-full transition-all', gameStore.sidebarCollapsed ? 'justify-center px-0' : 'justify-start']"
            :title="gameStore.sidebarCollapsed ? item.name.value : undefined"
          >
            <component :is="item.icon" :class="['h-4 w-4', !gameStore.sidebarCollapsed && 'mr-3']" />
            <span v-if="!gameStore.sidebarCollapsed">{{ item.name.value }}</span>
          </Button>
        </RouterLink>
      </nav>

      <!-- 语言切换 -->
      <div class="p-2 border-t">
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="ghost" class="w-full" size="sm">
              <Languages class="h-4 w-4" />
              <span v-if="!gameStore.sidebarCollapsed" class="ml-2">{{ localeNames[gameStore.locale] }}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-48 p-2" :align="gameStore.sidebarCollapsed ? 'start' : 'center'">
            <div class="space-y-1">
              <Button
                v-for="locale in locales"
                :key="locale"
                @click="gameStore.locale = locale"
                :variant="gameStore.locale === locale ? 'secondary' : 'ghost'"
                class="w-full justify-start"
                size="sm"
              >
                {{ localeNames[locale] }}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <!-- 夜间模式切换 -->
      <div class="p-2 border-t">
        <Button @click="isDark = !isDark" variant="ghost" class="w-full" size="sm">
          <Sun v-if="isDark" class="h-4 w-4" />
          <Moon v-else class="h-4 w-4" />
          <span v-if="!gameStore.sidebarCollapsed" class="ml-2">{{ isDark ? t('sidebar.lightMode') : t('sidebar.darkMode') }}</span>
        </Button>
      </div>
      <div class="p-2 border-t">
        <Button @click="toggleSidebar" variant="ghost" class="w-full" size="sm">
          <ChevronLeft v-if="!gameStore.sidebarCollapsed" class="h-4 w-4" />
          <ChevronRight v-else class="h-4 w-4" />
          <span v-if="!gameStore.sidebarCollapsed" class="ml-2">{{ t('sidebar.collapse') }}</span>
        </Button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 顶部资源栏 -->
      <header v-if="planet" class="bg-card border-b px-4 sm:px-6 py-4.5 shadow-md">
        <div class="flex items-center justify-between gap-3 sm:gap-6">
          <!-- 汉堡菜单（移动端）- 左侧占位 -->
          <div class="lg:flex-1">
            <Button @click="toggleSidebar" variant="ghost" size="icon" class="lg:hidden h-8 w-8">
              <component :is="gameStore.sidebarCollapsed ? Menu : X" class="h-5 w-5" />
            </Button>
          </div>

          <!-- 资源显示 - PC端居中 -->
          <div class="flex items-center gap-3 sm:gap-6 flex-1 lg:flex-none overflow-x-auto lg:justify-center">
            <div v-for="resourceType in resourceTypes" :key="resourceType.key" class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <ResourceIcon :type="resourceType.key" size="md" />
              <div class="min-w-0">
                <!-- 电量显示 -->
                <template v-if="resourceType.key === 'energy'">
                  <p
                    class="text-xs sm:text-sm font-medium truncate"
                    :class="
                      planet.resources[resourceType.key] >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    "
                  >
                    {{ formatNumber(planet.resources[resourceType.key]) }}
                  </p>
                  <p class="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {{ formatNumber(energyProduction || 0) }} / {{ formatNumber(energyConsumption || 0) }}
                  </p>
                </template>
                <!-- 其他资源显示 -->
                <template v-else>
                  <p
                    class="text-xs sm:text-sm font-medium truncate"
                    :class="getResourceColor(planet.resources[resourceType.key], capacity?.[resourceType.key] || Infinity)"
                  >
                    {{ formatNumber(planet.resources[resourceType.key]) }} / {{ formatNumber(capacity?.[resourceType.key] || 0) }}
                  </p>
                  <p class="text-[10px] sm:text-xs text-muted-foreground truncate">
                    +{{ formatNumber(production?.[resourceType.key] || 0) }}/{{ t('resources.perHour') }}
                  </p>
                </template>
              </div>
            </div>
          </div>

          <!-- 右侧状态 - 右侧占位 -->
          <div class="flex items-center gap-2 sm:gap-4 flex-shrink-0 lg:flex-1 lg:justify-end">
            <!-- 建造队列状态 -->
            <div v-if="planet.buildQueue.length > 0" class="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <div class="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span class="text-muted-foreground hidden sm:inline">{{ t('queue.building') }}</span>
            </div>
            <div v-if="gameStore.player.researchQueue.length > 0" class="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <div class="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span class="text-muted-foreground hidden sm:inline">{{ t('queue.researching') }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- 建造队列 -->
      <div
        v-if="planet && (planet.buildQueue.length > 0 || gameStore.player.researchQueue.length > 0)"
        class="bg-card border-b px-4 sm:px-6 py-4.5"
      >
        <div class="space-y-3">
          <!-- 建造队列 -->
          <div v-for="item in planet.buildQueue" :key="item.id" class="space-y-1.5">
            <div class="flex items-center justify-between text-xs sm:text-sm gap-2">
              <div class="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                <div class="h-2 w-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                <span class="font-medium truncate">{{ getItemName(item) }}</span>
                <span class="text-muted-foreground hidden sm:inline flex-shrink-0 text-[10px] sm:text-xs">
                  → {{ t('queue.level') }} {{ item.targetLevel }}
                </span>
              </div>
              <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <span class="text-muted-foreground text-[10px] sm:text-xs whitespace-nowrap">{{ formatTime(getRemainingTime(item)) }}</span>
                <Button
                  @click="handleCancelBuild(item.id)"
                  variant="ghost"
                  size="sm"
                  class="h-5 sm:h-6 px-1.5 sm:px-2 text-[10px] sm:text-xs"
                >
                  {{ t('queue.cancel') }}
                </Button>
              </div>
            </div>
            <Progress :model-value="getQueueProgress(item)" class="h-1.5" />
          </div>
          <!-- 研究队列 -->
          <div v-for="item in gameStore.player.researchQueue" :key="item.id" class="space-y-1.5">
            <div class="flex items-center justify-between text-xs sm:text-sm gap-2">
              <div class="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                <div class="h-2 w-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                <span class="font-medium truncate">{{ getItemName(item) }}</span>
                <span class="text-muted-foreground hidden sm:inline flex-shrink-0 text-[10px] sm:text-xs">
                  → {{ t('queue.level') }} {{ item.targetLevel }}
                </span>
              </div>
              <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <span class="text-muted-foreground text-[10px] sm:text-xs whitespace-nowrap">{{ formatTime(getRemainingTime(item)) }}</span>
                <Button
                  @click="handleCancelResearch(item.id)"
                  variant="ghost"
                  size="sm"
                  class="h-5 sm:h-6 px-1.5 sm:px-2 text-[10px] sm:text-xs"
                >
                  {{ t('queue.cancel') }}
                </Button>
              </div>
            </div>
            <Progress :model-value="getQueueProgress(item)" class="h-1.5" />
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <main class="flex-1 overflow-y-auto">
        <div class="animate-fade-in">
          <RouterView />
        </div>
      </main>
    </div>

    <!-- 确认对话框 -->
    <ConfirmDialog ref="confirmDialog" />

    <!-- 详情弹窗 -->
    <DetailDialog />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, computed, ref } from 'vue'
  import { RouterView, RouterLink } from 'vue-router'
  import { useGameStore } from '@/stores/gameStore'
  import { useTheme } from '@/composables/useTheme'
  import { useI18n } from '@/composables/useI18n'
  import { localeNames, detectBrowserLocale, type Locale } from '@/locales'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import { Progress } from '@/components/ui/progress'
  import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
  import ResourceIcon from '@/components/ResourceIcon.vue'
  import ConfirmDialog from '@/components/ConfirmDialog.vue'
  import DetailDialog from '@/components/DetailDialog.vue'
  import { BuildingType, TechnologyType, ShipType, DefenseType, MissionType } from '@/types/game'
  import type { BuildQueueItem, FleetMission } from '@/types/game'
  import { BUILDINGS, TECHNOLOGIES, SHIPS, DEFENSES } from '@/config/gameConfig'
  import { formatNumber, formatTime, getResourceColor } from '@/utils/format'
  import {
    Moon,
    Sun,
    Home,
    Building2,
    FlaskConical,
    Ship,
    Rocket,
    Shield,
    Mail,
    Globe,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    Users,
    Swords,
    Languages,
    Settings
  } from 'lucide-vue-next'
  import * as gameLogic from '@/logic/gameLogic'
  import * as planetLogic from '@/logic/planetLogic'
  import * as publicLogic from '@/logic/publicLogic'
  import * as officerLogic from '@/logic/officerLogic'
  import * as buildingValidation from '@/logic/buildingValidation'
  import * as resourceLogic from '@/logic/resourceLogic'
  import * as researchValidation from '@/logic/researchValidation'
  import * as fleetLogic from '@/logic/fleetLogic'
  import * as shipLogic from '@/logic/shipLogic'
  import pkg from '../package.json'

  const gameStore = useGameStore()
  const { isDark } = useTheme()
  const { t } = useI18n()
  const confirmDialog = ref<InstanceType<typeof ConfirmDialog> | null>(null)

  // 所有可用的语言选项
  const locales: Locale[] = ['zh-CN', 'zh-TW', 'en', 'de', 'ru', 'ko', 'ja']

  const initGame = () => {
    const shouldInit = gameLogic.shouldInitializeGame(gameStore.player.planets)
    if (!shouldInit) {
      const now = Date.now()
      gameLogic.updatePlanetsLastUpdate(gameStore.player.planets, now)
      gameStore.player.planets.forEach(planet => {
        const key = gameLogic.generatePositionKey(planet.position.galaxy, planet.position.system, planet.position.position)
        gameStore.universePlanets[key] = planet
      })
      generateNPCPlanets()
      return
    }
    gameStore.player = gameLogic.initializePlayer(gameStore.player.id, t('common.playerName'))
    const initialPlanet = planetLogic.createInitialPlanet(gameStore.player.id, t('planet.homePlanet'))
    gameStore.player.planets = [initialPlanet]
    gameStore.currentPlanetId = initialPlanet.id
    const key = gameLogic.generatePositionKey(initialPlanet.position.galaxy, initialPlanet.position.system, initialPlanet.position.position)
    gameStore.universePlanets[key] = initialPlanet
  }

  const generateNPCPlanets = () => {
    const npcCount = 200
    for (let i = 0; i < npcCount; i++) {
      const position = gameLogic.generateRandomPosition()
      const key = gameLogic.generatePositionKey(position.galaxy, position.system, position.position)
      if (gameStore.universePlanets[key]) continue
      const npcPlanet = planetLogic.createNPCPlanet(i, position, t('planet.planetPrefix'))
      gameStore.universePlanets[key] = npcPlanet
    }
  }

  const updateGame = () => {
    if (gameStore.isPaused) return
    const now = Date.now()
    gameStore.gameTime = now
    gameLogic.checkOfficersExpiration(gameStore.player.officers, now)
    const result = gameLogic.processGameUpdate(gameStore.player, now)
    gameStore.player.researchQueue = result.updatedResearchQueue
    gameStore.player.fleetMissions.forEach(mission => {
      if (mission.status === 'outbound' && now >= mission.arrivalTime) {
        processMissionArrival(mission)
      } else if (mission.status === 'returning' && mission.returnTime && now >= mission.returnTime) {
        processMissionReturn(mission)
      }
    })
  }

  const processMissionArrival = (mission: FleetMission) => {
    const targetPlanet = gameStore.player.planets.find(
      p =>
        p.position.galaxy === mission.targetPosition.galaxy &&
        p.position.system === mission.targetPosition.system &&
        p.position.position === mission.targetPosition.position
    )

    if (mission.missionType === MissionType.Transport) {
      fleetLogic.processTransportArrival(mission, targetPlanet)
    } else if (mission.missionType === MissionType.Attack) {
      const attackResult = fleetLogic.processAttackArrival(mission, targetPlanet, gameStore.player, null, gameStore.player.planets)
      if (attackResult) {
        gameStore.player.battleReports.push(attackResult.battleResult)
        if (attackResult.moon) {
          gameStore.player.planets.push(attackResult.moon)
        }
      }
    } else if (mission.missionType === MissionType.Colonize) {
      const newPlanet = fleetLogic.processColonizeArrival(mission, targetPlanet, gameStore.player.id, t('planet.colonyPrefix'))
      if (newPlanet) gameStore.player.planets.push(newPlanet)
    } else if (mission.missionType === MissionType.Spy) {
      const spyReport = fleetLogic.processSpyArrival(mission, targetPlanet, gameStore.player.id)
      if (spyReport) gameStore.player.spyReports.push(spyReport)
    } else if (mission.missionType === MissionType.Deploy) {
      const deployed = fleetLogic.processDeployArrival(mission, targetPlanet, gameStore.player.id)
      if (deployed) {
        const missionIndex = gameStore.player.fleetMissions.indexOf(mission)
        if (missionIndex > -1) gameStore.player.fleetMissions.splice(missionIndex, 1)
        return
      }
    }
  }

  const processMissionReturn = (mission: FleetMission) => {
    const originPlanet = gameStore.player.planets.find(p => p.id === mission.originPlanetId)
    if (!originPlanet) return
    shipLogic.addFleet(originPlanet.fleet, mission.fleet)
    resourceLogic.addResources(originPlanet.resources, mission.cargo)
    const missionIndex = gameStore.player.fleetMissions.indexOf(mission)
    if (missionIndex > -1) gameStore.player.fleetMissions.splice(missionIndex, 1)
  }

  // 初始化游戏
  onMounted(() => {
    // 如果是首次访问（没有星球数据），使用浏览器语言自动检测
    const isFirstVisit = gameStore.player.planets.length === 0
    if (isFirstVisit) {
      gameStore.locale = detectBrowserLocale()
    }

    initGame()

    // 启动游戏循环
    const gameLoop = setInterval(() => {
      updateGame()
    }, 1000) // 每秒更新一次

    // 清理定时器
    onUnmounted(() => {
      clearInterval(gameLoop)
    })
  })

  const navItems = [
    { name: computed(() => t('nav.overview')), path: '/', icon: Home },
    { name: computed(() => t('nav.buildings')), path: '/buildings', icon: Building2 },
    { name: computed(() => t('nav.research')), path: '/research', icon: FlaskConical },
    { name: computed(() => t('nav.shipyard')), path: '/shipyard', icon: Ship },
    { name: computed(() => t('nav.defense')), path: '/defense', icon: Shield },
    { name: computed(() => t('nav.fleet')), path: '/fleet', icon: Rocket },
    { name: computed(() => t('nav.officers')), path: '/officers', icon: Users },
    { name: computed(() => t('nav.simulator')), path: '/battle-simulator', icon: Swords },
    { name: computed(() => t('nav.galaxy')), path: '/galaxy', icon: Globe },
    { name: computed(() => t('nav.messages')), path: '/messages', icon: Mail },
    { name: computed(() => t('nav.settings')), path: '/settings', icon: Settings }
  ]

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
    { key: 'energy' as const },
    { key: 'darkMatter' as const }
  ]

  // 月球相关
  const moon = computed(() => {
    if (!planet.value || planet.value.isMoon) return null
    return gameStore.getMoonForPlanet(planet.value.id)
  })
  const hasMoon = computed(() => !!moon.value)

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

  // 切换侧边栏
  const toggleSidebar = () => {
    gameStore.sidebarCollapsed = !gameStore.sidebarCollapsed
  }

  // 获取队列项的名称
  const getItemName = (item: BuildQueueItem): string => {
    if (item.type === 'building' || item.type === 'demolish') {
      const buildingName = BUILDINGS[item.itemType as BuildingType]?.name || item.itemType
      return item.type === 'demolish' ? `${t('buildingsView.demolish')} - ${buildingName}` : buildingName
    } else if (item.type === 'technology') {
      return TECHNOLOGIES[item.itemType as TechnologyType]?.name || item.itemType
    } else if (item.type === 'ship') {
      return SHIPS[item.itemType as ShipType]?.name || item.itemType
    } else if (item.type === 'defense') {
      return DEFENSES[item.itemType as DefenseType]?.name || item.itemType
    }
    return item.itemType
  }

  // 获取剩余时间
  const getRemainingTime = (item: BuildQueueItem): number => {
    const now = Date.now()
    return Math.max(0, Math.floor((item.endTime - now) / 1000))
  }

  // 获取队列进度
  const getQueueProgress = (item: BuildQueueItem): number => {
    const now = Date.now()
    const total = item.endTime - item.startTime
    const elapsed = now - item.startTime
    return Math.min(100, Math.max(0, (elapsed / total) * 100))
  }

  // 取消建造
  const handleCancelBuild = (queueId: string) => {
    confirmDialog.value?.show({
      title: t('queue.cancelBuild'),
      message: t('queue.confirmCancel'),
      onConfirm: () => {
        if (!gameStore.currentPlanet) return false
        const { item, index } = buildingValidation.findQueueItem(gameStore.currentPlanet.buildQueue, queueId)
        if (!item) return false
        if (item.type === 'building') {
          const refund = buildingValidation.cancelBuildingUpgrade(gameStore.currentPlanet, item)
          resourceLogic.addResources(gameStore.currentPlanet.resources, refund)
        }
        gameStore.currentPlanet.buildQueue.splice(index, 1)
        return true
      }
    })
  }

  // 取消研究
  const handleCancelResearch = (queueId: string) => {
    confirmDialog.value?.show({
      title: t('queue.cancelResearch'),
      message: t('queue.confirmCancel'),
      onConfirm: () => {
        if (!gameStore.currentPlanet) return false
        const { item, index } = buildingValidation.findQueueItem(gameStore.player.researchQueue, queueId)
        if (!item) return false
        if (item.type === 'technology') {
          const refund = researchValidation.cancelTechnologyResearch(item)
          resourceLogic.addResources(gameStore.currentPlanet.resources, refund)
        }
        gameStore.player.researchQueue.splice(index, 1)
        return true
      }
    })
  }
</script>

<style scoped>
  /* 平滑滚动 */
  main {
    scroll-behavior: smooth;
  }
</style>
