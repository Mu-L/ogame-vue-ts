import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import type { TutorialStep, TutorialState } from '@/types/game'
import { BuildingType, TechnologyType } from '@/types/game'

// 桌面端引导步骤定义
export const desktopTutorialSteps: TutorialStep[] = [
  // 第1步：欢迎和基础介绍
  {
    id: 'welcome',
    title: 'tutorial.welcome.title',
    content: 'tutorial.welcome.content',
    placement: 'center',
    route: '/',
    action: 'none',
    canSkip: true
  },
  // 第2步：资源栏介绍
  {
    id: 'resources_intro',
    title: 'tutorial.resources.title',
    content: 'tutorial.resources.content',
    target: '.resource-bar',
    placement: 'bottom',
    route: '/',
    action: 'none',
    highlightPadding: 8
  },
  // 第3步：星球选择器介绍
  {
    id: 'planet_info',
    title: 'tutorial.planet.title',
    content: 'tutorial.planet.content',
    target: '[data-tutorial="planet-selector"]',
    placement: 'bottom',
    route: '/',
    action: 'none',
    highlightPadding: 8
  },
  // 第4步：导航菜单介绍
  {
    id: 'navigation',
    title: 'tutorial.navigation.title',
    content: 'tutorial.navigation.content',
    target: '[data-tutorial="navigation"]',
    placement: 'right',
    route: '/',
    action: 'none',
    highlightPadding: 12
  },
  // 第5步：前往建筑页面
  {
    id: 'goto_buildings',
    title: 'tutorial.gotoBuildings.title',
    content: 'tutorial.gotoBuildings.content',
    target: '[data-nav-path="/buildings"]',
    placement: 'right',
    route: '/',
    action: 'click',
    highlightPadding: 8
  },
  // 第6步：建造太阳能电站（提供能源，是所有资源建筑的前置条件）
  {
    id: 'build_solar_plant',
    title: 'tutorial.buildSolarPlant.title',
    content: 'tutorial.buildSolarPlant.content',
    target: `[data-building="${BuildingType.SolarPlant}"]`,
    placement: 'top',
    route: '/buildings',
    action: 'build',
    actionTarget: BuildingType.SolarPlant,
    highlightPadding: 12
  },
  // 第7步：了解建造队列
  {
    id: 'wait_for_build',
    title: 'tutorial.waitBuild.title',
    content: 'tutorial.waitBuild.content',
    target: '[data-tutorial="queue-button"]',
    placement: 'bottom',
    route: '/buildings',
    action: 'none',
    highlightPadding: 8
  },
  // 第8步：建造金属矿（有了太阳能电站后才能建造）
  {
    id: 'build_metal_mine',
    title: 'tutorial.buildMetalMine.title',
    content: 'tutorial.buildMetalMine.content',
    target: `[data-building="${BuildingType.MetalMine}"]`,
    placement: 'top',
    route: '/buildings',
    action: 'build',
    actionTarget: BuildingType.MetalMine,
    highlightPadding: 12
  },
  // 第9步：建造晶体矿
  {
    id: 'build_crystal_mine',
    title: 'tutorial.buildCrystalMine.title',
    content: 'tutorial.buildCrystalMine.content',
    target: `[data-building="${BuildingType.CrystalMine}"]`,
    placement: 'top',
    route: '/buildings',
    action: 'build',
    actionTarget: BuildingType.CrystalMine,
    highlightPadding: 12
  },
  // 第10步：建造重氢合成器
  {
    id: 'build_deuterium',
    title: 'tutorial.buildDeuterium.title',
    content: 'tutorial.buildDeuterium.content',
    target: `[data-building="${BuildingType.DeuteriumSynthesizer}"]`,
    placement: 'top',
    route: '/buildings',
    action: 'build',
    actionTarget: BuildingType.DeuteriumSynthesizer,
    highlightPadding: 12
  },
  // 第11步：升级资源矿到2级（为机器人工厂做准备）
  {
    id: 'upgrade_mines_intro',
    title: 'tutorial.upgradeMines.title',
    content: 'tutorial.upgradeMines.content',
    placement: 'center',
    route: '/buildings',
    action: 'none'
  },
  // 第12步：建造机器人工厂（需要三种资源矿各2级）
  {
    id: 'build_robotics',
    title: 'tutorial.buildRobotics.title',
    content: 'tutorial.buildRobotics.content',
    target: `[data-building="${BuildingType.RoboticsFactory}"]`,
    placement: 'top',
    route: '/buildings',
    action: 'build',
    actionTarget: BuildingType.RoboticsFactory,
    highlightPadding: 12
  },
  // 第13步：继续升级资源矿到3级（为研究实验室做准备）
  {
    id: 'upgrade_mines_for_lab',
    title: 'tutorial.upgradeMinesForLab.title',
    content: 'tutorial.upgradeMinesForLab.content',
    placement: 'center',
    route: '/buildings',
    action: 'none'
  },
  // 第14步：建造研究实验室（需要三种资源矿各3级）
  {
    id: 'build_research_lab',
    title: 'tutorial.buildResearchLab.title',
    content: 'tutorial.buildResearchLab.content',
    target: `[data-building="${BuildingType.ResearchLab}"]`,
    placement: 'top',
    route: '/buildings',
    action: 'build',
    actionTarget: BuildingType.ResearchLab,
    highlightPadding: 12
  },
  // 第15步：前往研究页面
  {
    id: 'goto_research',
    title: 'tutorial.gotoResearch.title',
    content: 'tutorial.gotoResearch.content',
    target: '[data-nav-path="/research"]',
    placement: 'right',
    route: '/buildings',
    action: 'click',
    highlightPadding: 8
  },
  // 第16步：研究能量科技
  {
    id: 'research_energy',
    title: 'tutorial.researchEnergy.title',
    content: 'tutorial.researchEnergy.content',
    target: `[data-tech="${TechnologyType.EnergyTechnology}"]`,
    placement: 'top',
    route: '/research',
    action: 'research',
    actionTarget: TechnologyType.EnergyTechnology,
    highlightPadding: 12
  },
  // 第17步：介绍船坞（需要机器人工厂2级）
  {
    id: 'shipyard_intro',
    title: 'tutorial.shipyardIntro.title',
    content: 'tutorial.shipyardIntro.content',
    placement: 'center',
    route: '/research',
    action: 'none'
  },
  // 第18步：返回建筑页面建造船坞
  {
    id: 'goto_buildings_for_shipyard',
    title: 'tutorial.gotoBuildingsForShipyard.title',
    content: 'tutorial.gotoBuildingsForShipyard.content',
    target: '[data-nav-path="/buildings"]',
    placement: 'right',
    route: '/research',
    action: 'click',
    highlightPadding: 8
  },
  // 第19步：建造船坞
  {
    id: 'build_shipyard',
    title: 'tutorial.buildShipyard.title',
    content: 'tutorial.buildShipyard.content',
    target: `[data-building="${BuildingType.Shipyard}"]`,
    placement: 'top',
    route: '/buildings',
    action: 'build',
    actionTarget: BuildingType.Shipyard,
    highlightPadding: 12
  },
  // 第20步：舰队和探索介绍
  {
    id: 'fleet_intro',
    title: 'tutorial.fleetIntro.title',
    content: 'tutorial.fleetIntro.content',
    placement: 'center',
    route: '/buildings',
    action: 'none'
  },
  // 第21步：银河系探索介绍
  {
    id: 'galaxy_intro',
    title: 'tutorial.galaxyIntro.title',
    content: 'tutorial.galaxyIntro.content',
    target: '[data-nav-path="/galaxy"]',
    placement: 'right',
    route: '/buildings',
    action: 'none',
    highlightPadding: 8
  },
  // 第22步：引导完成
  {
    id: 'tutorial_complete',
    title: 'tutorial.complete.title',
    content: 'tutorial.complete.content',
    placement: 'center',
    route: '/buildings',
    action: 'none'
  }
]

// 移动端引导步骤定义
export const mobileTutorialSteps: TutorialStep[] = [
  // 第1步：欢迎（移动端）
  {
    id: 'welcome_mobile',
    title: 'tutorial.mobile.welcome.title',
    content: 'tutorial.mobile.welcome.content',
    placement: 'center',
    route: '/',
    action: 'none',
    canSkip: true
  },
  // 第2步：顶部资源栏介绍
  {
    id: 'resources_intro_mobile',
    title: 'tutorial.mobile.resources.title',
    content: 'tutorial.mobile.resources.content',
    target: '.resource-bar',
    placement: 'bottom',
    route: '/',
    action: 'none',
    highlightPadding: 8
  },
  // 第3步：汉堡菜单介绍 - 引导玩家手动点击打开菜单
  {
    id: 'menu_intro_mobile',
    title: 'tutorial.mobile.menu.title',
    content: 'tutorial.mobile.menu.content',
    target: '[data-tutorial="mobile-menu"]',
    placement: 'bottom',
    route: '/',
    action: 'none', // 让玩家手动点击汉堡菜单打开侧边栏
    highlightPadding: 8
  },
  // 第4步:前往建筑页面 - 此时侧边栏已打开,让玩家手动点击
  {
    id: 'goto_buildings_mobile',
    title: 'tutorial.mobile.gotoBuildings.title',
    content: 'tutorial.mobile.gotoBuildings.content',
    target: '[data-nav-path="/buildings"]',
    placement: 'right', // 改为right,因为菜单在左侧展开
    route: '/',
    action: 'click', // 使用click,但不会自动触发,只是用来标识这是一个点击操作
    highlightPadding: 8
  },
  // 第5步：建造太阳能电站
  {
    id: 'build_solar_plant_mobile',
    title: 'tutorial.mobile.buildSolarPlant.title',
    content: 'tutorial.mobile.buildSolarPlant.content',
    target: `[data-building="${BuildingType.SolarPlant}"]`,
    placement: 'bottom',
    route: '/buildings',
    action: 'build',
    actionTarget: BuildingType.SolarPlant,
    highlightPadding: 12
  },
  // 第6步：了解建造队列
  {
    id: 'wait_for_build_mobile',
    title: 'tutorial.mobile.waitBuild.title',
    content: 'tutorial.mobile.waitBuild.content',
    target: '[data-tutorial="queue-button"]',
    placement: 'bottom',
    route: '/buildings',
    action: 'none',
    highlightPadding: 8
  },
  // 第7步：建造金属矿
  {
    id: 'build_metal_mine_mobile',
    title: 'tutorial.mobile.buildMetalMine.title',
    content: 'tutorial.mobile.buildMetalMine.content',
    target: `[data-building="${BuildingType.MetalMine}"]`,
    placement: 'bottom',
    route: '/buildings',
    action: 'build',
    actionTarget: BuildingType.MetalMine,
    highlightPadding: 12
  },
  // 第8步：完成教程
  {
    id: 'tutorial_complete_mobile',
    title: 'tutorial.mobile.complete.title',
    content: 'tutorial.mobile.complete.content',
    placement: 'center',
    route: '/buildings',
    action: 'none'
  }
]

// 检测是否为移动端
const isMobileDevice = () => {
  return window.innerWidth < 768
}

// 根据设备类型获取教程步骤
export const getTutorialSteps = (): TutorialStep[] => {
  return isMobileDevice() ? mobileTutorialSteps : desktopTutorialSteps
}

// 导出统一的 tutorialSteps（为了兼容性）
export const tutorialSteps = getTutorialSteps()

const tutorialState = ref<TutorialState>({
  isActive: false,
  currentStepIndex: 0,
  completedSteps: [],
  skipped: false
})

export function useTutorial() {
  const router = useRouter()
  const gameStore = useGameStore()

  // 动态获取教程步骤
  const currentTutorialSteps = computed(() => getTutorialSteps())

  const currentStep = computed(() => {
    if (!tutorialState.value.isActive || tutorialState.value.currentStepIndex >= currentTutorialSteps.value.length) {
      return null
    }
    return currentTutorialSteps.value[tutorialState.value.currentStepIndex]
  })

  const progress = computed(() => {
    return Math.round((tutorialState.value.currentStepIndex / currentTutorialSteps.value.length) * 100)
  })

  const isLastStep = computed(() => {
    return tutorialState.value.currentStepIndex === currentTutorialSteps.value.length - 1
  })

  // 初始化引导
  const startTutorial = () => {
    const player = gameStore.player
    if (!player.tutorialProgress || !player.tutorialProgress.tutorialCompleted) {
      const now = Date.now()
      tutorialState.value = {
        isActive: true,
        currentStepIndex: 0,
        completedSteps: player.tutorialProgress?.completedStepIds || [],
        skipped: false,
        lastActiveTime: now
      }

      // 如果有进度，恢复到上次的步骤
      if (player.tutorialProgress?.currentStep) {
        const stepIndex = currentTutorialSteps.value.findIndex((s: TutorialStep) => s.id === player.tutorialProgress?.currentStep)
        if (stepIndex !== -1) {
          tutorialState.value.currentStepIndex = stepIndex
        }
      }

      // 跳转到当前步骤的路由
      if (currentStep.value?.route) {
        router.push(currentStep.value.route)
      }
    }
  }

  // 下一步
  const nextStep = () => {
    if (!currentStep.value) return

    // 标记当前步骤为已完成
    if (!tutorialState.value.completedSteps.includes(currentStep.value.id)) {
      tutorialState.value.completedSteps.push(currentStep.value.id)
    }

    // 保存进度到store
    saveProgress()

    // 移动到下一步
    if (tutorialState.value.currentStepIndex < currentTutorialSteps.value.length - 1) {
      tutorialState.value.currentStepIndex++

      // 跳转到新步骤的路由
      if (currentStep.value?.route) {
        router.push(currentStep.value.route)
      }
    } else {
      // 引导完成
      completeTutorial()
    }
  }

  // 上一步
  const previousStep = () => {
    if (tutorialState.value.currentStepIndex > 0) {
      tutorialState.value.currentStepIndex--

      // 跳转到新步骤的路由
      if (currentStep.value?.route) {
        router.push(currentStep.value.route)
      }
    }
  }

  // 跳过引导
  const skipTutorial = () => {
    tutorialState.value.isActive = false
    tutorialState.value.skipped = true

    // 保存跳过状态（跳过也视为已完成，避免刷新后重新弹出）
    if (!gameStore.player.tutorialProgress) {
      gameStore.player.tutorialProgress = {
        tutorialCompleted: true,
        completedStepIds: tutorialState.value.completedSteps,
        currentStep: null,
        skippedAt: Date.now()
      }
    } else {
      gameStore.player.tutorialProgress.tutorialCompleted = true
      gameStore.player.tutorialProgress.skippedAt = Date.now()
      gameStore.player.tutorialProgress.currentStep = null
    }
  }

  // 完成引导
  const completeTutorial = () => {
    tutorialState.value.isActive = false

    // 保存完成状态
    gameStore.player.tutorialProgress = {
      tutorialCompleted: true,
      completedStepIds: tutorialState.value.completedSteps,
      currentStep: null
    }
  }

  // 保存进度
  const saveProgress = () => {
    if (!gameStore.player.tutorialProgress) {
      gameStore.player.tutorialProgress = {
        tutorialCompleted: false,
        completedStepIds: [],
        currentStep: null
      }
    }

    gameStore.player.tutorialProgress.completedStepIds = [...tutorialState.value.completedSteps]
    gameStore.player.tutorialProgress.currentStep = currentStep.value?.id || null
  }

  // 检查步骤完成条件
  const checkStepCompletion = (stepId: string): boolean => {
    const step = currentTutorialSteps.value.find((s: TutorialStep) => s.id === stepId)
    if (!step) return false

    const planet = gameStore.currentPlanet
    if (!planet) return false

    switch (step.action) {
      case 'build':
        if (step.actionTarget) {
          // 简单检查队列中是否有该建筑
          const inQueue = planet.buildQueue.some(
            item => item.itemType === step.actionTarget && (item.type === 'building' || item.type === 'demolish')
          )
          return inQueue
        }
        return false

      case 'research':
        if (step.actionTarget) {
          // 简单检查队列中是否有该科技
          const inQueue = planet.buildQueue.some(item => item.itemType === step.actionTarget && item.type === 'technology')
          return inQueue
        }
        return false

      case 'click':
      case 'none':
      default:
        return true
    }
  }

  // 不再自动推进，完全由玩家手动点击"下一步"按钮控制

  // 监听路由变化,自动推进需要导航的教程步骤
  watch(
    () => router.currentRoute.value.path,
    newPath => {
      if (tutorialState.value.isActive && currentStep.value) {
        // 如果当前步骤需要导航到特定页面,且已经到达该页面,自动推进
        if (currentStep.value.action === 'none' && currentStep.value.target && currentStep.value.target.includes('data-nav-path')) {
          // 提取目标路径
          const match = currentStep.value.target.match(/data-nav-path="([^"]+)"/)
          if (match && match[1] === newPath) {
            setTimeout(() => {
              nextStep()
            }, 500)
          }
        }
      }
    }
  )

  return {
    tutorialState,
    currentStep,
    progress,
    isLastStep,
    startTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    completeTutorial,
    checkStepCompletion
  }
}
