<template>
  <Teleport to="body">
    <div v-if="tutorialState.isActive && currentStep" class="tutorial-overlay">
      <!-- Dark overlay parts (4 rectangles around the highlight) -->
      <template v-if="highlightRect && currentStep.target">
        <!-- Top overlay -->
        <div
          class="tutorial-backdrop-part"
          :style="{
            top: '0',
            left: '0',
            width: '100%',
            height: `${highlightRect.top}px`
          }"
        />
        <!-- Bottom overlay -->
        <div
          class="tutorial-backdrop-part"
          :style="{
            top: `${highlightRect.bottom}px`,
            left: '0',
            width: '100%',
            height: `calc(100% - ${highlightRect.bottom}px)`
          }"
        />
        <!-- Left overlay -->
        <div
          class="tutorial-backdrop-part"
          :style="{
            top: `${highlightRect.top}px`,
            left: '0',
            width: `${highlightRect.left}px`,
            height: `${highlightRect.height}px`
          }"
        />
        <!-- Right overlay -->
        <div
          class="tutorial-backdrop-part"
          :style="{
            top: `${highlightRect.top}px`,
            left: `${highlightRect.right}px`,
            width: `calc(100% - ${highlightRect.right}px)`,
            height: `${highlightRect.height}px`
          }"
        />
        <!-- Highlight border -->
        <div
          class="tutorial-highlight-border"
          :style="{
            top: `${highlightRect.top}px`,
            left: `${highlightRect.left}px`,
            width: `${highlightRect.width}px`,
            height: `${highlightRect.height}px`
          }"
        />
      </template>

      <!-- Full overlay for center placement (no target) -->
      <div v-else class="tutorial-backdrop-full" />

      <!-- Tutorial tooltip -->
      <div
        v-if="tooltipPosition"
        class="tutorial-tooltip"
        :class="`tutorial-tooltip-${currentStep.placement || 'center'}`"
        :style="{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: tooltipPosition.transform
        }"
      >
        <Card class="tutorial-card">
          <CardHeader class="pb-3">
            <div class="flex items-center justify-between">
              <CardTitle class="text-lg">{{ t(currentStep.title) }}</CardTitle>
              <Button v-if="currentStep.canSkip" variant="ghost" size="icon" class="h-6 w-6" @click="skipTutorial">
                <XIcon :size="16" />
              </Button>
            </div>
            <CardDescription class="text-sm mt-2">
              {{ t(currentStep.content) }}
            </CardDescription>
          </CardHeader>

          <CardContent class="pt-0 space-y-3">
            <!-- Progress bar -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs text-muted-foreground">
                <span>{{ t('tutorial.progress') }}</span>
                <span>{{ tutorialState.currentStepIndex + 1 }} / {{ totalSteps }}</span>
              </div>
              <div class="w-full bg-secondary rounded-full h-1.5">
                <div class="bg-primary h-1.5 rounded-full transition-all duration-300" :style="{ width: `${progress}%` }" />
              </div>
            </div>

            <!-- Navigation buttons -->
            <div class="flex gap-2">
              <Button v-if="tutorialState.currentStepIndex > 0" variant="outline" size="sm" @click="previousStep">
                <ChevronLeftIcon :size="16" class="mr-1" />
                {{ t('tutorial.previous') }}
              </Button>

              <Button v-if="!isLastStep" class="ml-auto" size="sm" @click="handleNext" :disabled="!canProceed">
                {{ t('tutorial.next') }}
                <ChevronRightIcon :size="16" class="ml-1" />
              </Button>

              <Button v-else class="ml-auto" size="sm" @click="completeTutorial">
                {{ t('tutorial.completeButton') }}
                <CheckIcon :size="16" class="ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
  import { useTutorial, getTutorialSteps } from '@/composables/useTutorial'
  import { useI18n } from '@/composables/useI18n'
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
  import { Button } from '@/components/ui/button'
  import { XIcon, ChevronLeftIcon, ChevronRightIcon, CheckIcon } from 'lucide-vue-next'

  const { t } = useI18n()
  const { tutorialState, currentStep, progress, isLastStep, nextStep, previousStep, skipTutorial, completeTutorial } = useTutorial()

  const highlightRect = ref<DOMRect | null>(null)
  const tooltipPosition = ref<{ top: string; left: string; transform: string } | null>(null)
  const totalSteps = computed(() => getTutorialSteps().length)
  const isMobile = ref(false)

  // Check if current step can proceed
  const canProceed = computed(() => {
    if (!currentStep.value) return false

    // 所有步骤都允许手动点击下一步
    return true
  })

  // 检测是否为移动端
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 768
  }

  // Calculate highlight and tooltip positions
  const updatePositions = () => {
    if (!currentStep.value) {
      highlightRect.value = null
      tooltipPosition.value = null
      return
    }

    // 检测移动端
    checkMobile()

    // For center placement, no target element needed
    if (!currentStep.value.target || currentStep.value.placement === 'center') {
      highlightRect.value = null
      tooltipPosition.value = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }
      return
    }

    // Find target element
    const targetElement = document.querySelector(currentStep.value.target)
    if (!targetElement) {
      // Fallback to center if target not found
      highlightRect.value = null
      tooltipPosition.value = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }
      return
    }

    // Auto-scroll target element into view
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    })

    // Get target element rect
    const rect = targetElement.getBoundingClientRect()
    const padding = currentStep.value.highlightPadding || 8

    // Set highlight rect with padding
    highlightRect.value = new DOMRect(rect.left - padding, rect.top - padding, rect.width + padding * 2, rect.height + padding * 2)

    // 获取视口尺寸
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // 气泡的预估尺寸（根据视口大小响应式调整）
    const tooltipWidth = isMobile.value ? Math.min(viewportWidth - 32, 360) : 480
    const tooltipHeight = isMobile.value ? 280 : 300 // 预估高度

    // 计算各个方向的可用空间
    const spaceTop = rect.top
    const spaceBottom = viewportHeight - rect.bottom
    const spaceLeft = rect.left
    const spaceRight = viewportWidth - rect.right

    const tooltipOffset = isMobile.value ? 8 : 16 // 移动端使用更小的间距
    const edgeMargin = isMobile.value ? 8 : 16 // 距离边缘的最小距离

    // 根据优先级和可用空间自动选择最佳位置
    let placement = currentStep.value.placement || 'bottom'
    let finalPosition: { top: string; left: string; transform: string }

    // 移动端优先使用 bottom 或 top 位置
    if (isMobile.value) {
      // 移动端强制使用 top/bottom，忽略 left/right
      if (placement === 'left' || placement === 'right') {
        placement = spaceBottom > spaceTop ? 'bottom' : 'top'
      }
    }

    // 智能位置选择：如果指定位置空间不足，自动调整
    const canFitTop = spaceTop >= tooltipHeight + tooltipOffset + edgeMargin
    const canFitBottom = spaceBottom >= tooltipHeight + tooltipOffset + edgeMargin
    const canFitLeft = spaceLeft >= tooltipWidth + tooltipOffset + edgeMargin
    const canFitRight = spaceRight >= tooltipWidth + tooltipOffset + edgeMargin

    // 自动调整位置
    if (placement === 'top' && !canFitTop && canFitBottom) {
      placement = 'bottom'
    } else if (placement === 'bottom' && !canFitBottom && canFitTop) {
      placement = 'top'
    } else if (placement === 'left' && !canFitLeft && canFitRight) {
      placement = 'right'
    } else if (placement === 'right' && !canFitRight && canFitLeft) {
      placement = 'left'
    }

    // 计算位置
    switch (placement) {
      case 'top': {
        let left = rect.left + rect.width / 2
        // 确保不超出左右边界
        left = Math.max(tooltipWidth / 2 + edgeMargin, Math.min(left, viewportWidth - tooltipWidth / 2 - edgeMargin))
        finalPosition = {
          top: `${Math.max(edgeMargin, rect.top - tooltipOffset)}px`,
          left: `${left}px`,
          transform: 'translate(-50%, -100%)'
        }
        break
      }
      case 'bottom': {
        let left = rect.left + rect.width / 2
        // 确保不超出左右边界
        left = Math.max(tooltipWidth / 2 + edgeMargin, Math.min(left, viewportWidth - tooltipWidth / 2 - edgeMargin))
        finalPosition = {
          top: `${Math.min(viewportHeight - tooltipHeight - edgeMargin, rect.bottom + tooltipOffset)}px`,
          left: `${left}px`,
          transform: 'translate(-50%, 0)'
        }
        break
      }
      case 'left': {
        let top = rect.top + rect.height / 2
        // 确保不超出上下边界
        top = Math.max(tooltipHeight / 2 + edgeMargin, Math.min(top, viewportHeight - tooltipHeight / 2 - edgeMargin))
        finalPosition = {
          top: `${top}px`,
          left: `${Math.max(edgeMargin, rect.left - tooltipOffset)}px`,
          transform: 'translate(-100%, -50%)'
        }
        break
      }
      case 'right': {
        let top = rect.top + rect.height / 2
        // 确保不超出上下边界
        top = Math.max(tooltipHeight / 2 + edgeMargin, Math.min(top, viewportHeight - tooltipHeight / 2 - edgeMargin))
        finalPosition = {
          top: `${top}px`,
          left: `${Math.min(viewportWidth - tooltipWidth - edgeMargin, rect.right + tooltipOffset)}px`,
          transform: 'translate(0, -50%)'
        }
        break
      }
      default:
        finalPosition = {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }
    }

    tooltipPosition.value = finalPosition
  }

  // Handle next step
  const handleNext = () => {
    if (canProceed.value) {
      nextStep()
    }
  }

  // Update positions when step changes
  watch(
    () => currentStep.value,
    () => {
      // Wait for DOM update and route change
      setTimeout(() => {
        updatePositions()
      }, 100)
    },
    { immediate: true }
  )

  // Update positions on window resize or scroll
  const handleResize = () => {
    checkMobile()
    updatePositions()
  }

  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize, true)
    updatePositions()
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('scroll', handleResize, true)
  })
</script>

<style scoped>
  .tutorial-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    pointer-events: none;
  }

  .tutorial-backdrop-part {
    position: fixed;
    background: rgba(0, 0, 0, 0.7);
    pointer-events: auto;
    transition: all 0.3s ease;
  }

  .tutorial-backdrop-full {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    pointer-events: auto;
  }

  .tutorial-highlight-border {
    position: fixed;
    background: transparent;
    border: 4px solid rgba(59, 130, 246, 0.5);
    border-radius: 8px;
    pointer-events: none;
    transition: all 0.3s ease;
    z-index: 10000;
  }

  .tutorial-tooltip {
    position: fixed;
    z-index: 10001;
    pointer-events: auto;
    max-width: 480px;
    min-width: 320px;
  }

  /* 移动端样式调整 */
  @media (max-width: 767px) {
    .tutorial-tooltip {
      max-width: calc(100vw - 32px);
      min-width: calc(100vw - 32px);
      width: calc(100vw - 32px);
    }

    .tutorial-tooltip-center {
      max-width: calc(100vw - 32px);
    }

    .tutorial-card {
      font-size: 0.9rem;
    }

    .tutorial-highlight-border {
      border-width: 2px;
    }
  }

  .tutorial-tooltip-center {
    max-width: 560px;
  }

  @media (max-width: 767px) {
    .tutorial-tooltip-center {
      max-width: calc(100vw - 32px);
    }
  }

  .tutorial-card {
    animation: tutorial-fade-in 0.3s ease;
  }

  @keyframes tutorial-fade-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Dark mode adjustments */
  .dark .tutorial-backdrop-part {
    background: rgba(0, 0, 0, 0.85);
  }

  .dark .tutorial-backdrop-full {
    background: rgba(0, 0, 0, 0.85);
  }

  .dark .tutorial-highlight-border {
    border-color: rgba(59, 130, 246, 0.6);
  }
</style>
