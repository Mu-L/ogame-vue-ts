<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <Button data-tutorial="queue-button" variant="outline" size="icon" class="relative">
        <ListOrdered class="h-4 w-4" />
        <Badge
          v-if="totalQueueCount > 0"
          variant="default"
          class="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
        >
          {{ totalQueueCount > 9 ? '9+' : totalQueueCount }}
        </Badge>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-96 p-0" align="end">
      <div class="flex items-center justify-between p-4 border-b">
        <h3 class="font-semibold">{{ t('queue.title') }}</h3>
      </div>
      <ScrollArea class="max-h-96">
        <div v-if="totalQueueCount === 0" class="p-8 text-center text-muted-foreground">
          {{ t('queue.empty') }}
        </div>
        <div v-else class="divide-y p-4 space-y-3">
          <!-- 建造队列 -->
          <div v-for="item in buildQueue" :key="item.id" class="space-y-1.5">
            <div class="flex items-center justify-between text-xs sm:text-sm gap-2">
              <div class="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                <div
                  class="h-2 w-2 rounded-full animate-pulse flex-shrink-0"
                  :class="item.type === 'demolish' ? 'bg-destructive' : 'bg-green-500'"
                />
                <span class="font-medium truncate">{{ getItemName(item) }}</span>
                <span class="text-muted-foreground text-[10px] sm:text-xs">
                  <template v-if="item.type === 'ship' || item.type === 'defense'">
                    → {{ t('queue.quantity') }} {{ item.quantity }}
                  </template>
                  <template v-else-if="item.type === 'demolish'">→ {{ t('queue.demolishing') }}</template>
                  <template v-else>→ {{ t('queue.level') }} {{ item.targetLevel }}</template>
                </span>
              </div>
              <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <span class="text-muted-foreground text-[10px] sm:text-xs whitespace-nowrap">
                  {{ formatTime(getRemainingTime(item)) }}
                </span>
                <Button @click="handleCancel(item)" variant="ghost" size="sm" class="h-5 sm:h-6 px-1.5 sm:px-2 text-[10px] sm:text-xs">
                  {{ t('queue.cancel') }}
                </Button>
              </div>
            </div>
            <Progress :model-value="getQueueProgress(item)" class="h-1.5" />
          </div>

          <!-- 研究队列 -->
          <div v-for="item in researchQueue" :key="item.id" class="space-y-1.5">
            <div class="flex items-center justify-between text-xs sm:text-sm gap-2">
              <div class="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                <div class="h-2 w-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                <span class="font-medium truncate">{{ getItemName(item) }}</span>
                <span class="text-muted-foreground text-[10px] sm:text-xs">→ {{ t('queue.level') }} {{ item.targetLevel }}</span>
              </div>
              <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <span class="text-muted-foreground text-[10px] sm:text-xs whitespace-nowrap">
                  {{ formatTime(getRemainingTime(item)) }}
                </span>
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
      </ScrollArea>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { ListOrdered } from 'lucide-vue-next'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
  import { ScrollArea } from '@/components/ui/scroll-area'
  import { Progress } from '@/components/ui/progress'
  import { useGameStore } from '@/stores/gameStore'
  import { useGameConfig } from '@/composables/useGameConfig'
  import { useI18n } from '@/composables/useI18n'
  import { formatTime } from '@/utils/format'
  import type { BuildQueueItem, BuildingType, ShipType, DefenseType, TechnologyType } from '@/types/game'

  const { t } = useI18n()
  const gameStore = useGameStore()
  const { BUILDINGS, SHIPS, DEFENSES, TECHNOLOGIES } = useGameConfig()

  const isOpen = ref(false)

  // 获取当前星球的建造队列
  const buildQueue = computed(() => {
    return gameStore.currentPlanet?.buildQueue || []
  })

  // 获取研究队列
  const researchQueue = computed(() => {
    return gameStore.player.researchQueue || []
  })

  // 总队列数量
  const totalQueueCount = computed(() => {
    return buildQueue.value.length + researchQueue.value.length
  })

  // 获取队列项名称
  const getItemName = (item: BuildQueueItem): string => {
    if (item.type === 'building' || item.type === 'demolish') {
      return BUILDINGS.value[item.itemType as BuildingType].name
    } else if (item.type === 'ship') {
      return SHIPS.value[item.itemType as ShipType].name
    } else if (item.type === 'defense') {
      return DEFENSES.value[item.itemType as DefenseType].name
    } else if (item.type === 'technology') {
      return TECHNOLOGIES.value[item.itemType as TechnologyType].name
    }
    return ''
  }

  // 获取剩余时间
  const getRemainingTime = (item: BuildQueueItem): number => {
    const now = Date.now()
    return Math.max(0, Math.floor((item.endTime - now) / 1000))
  }

  // 获取队列进度
  const getQueueProgress = (item: BuildQueueItem): number => {
    const now = Date.now()
    const elapsed = now - item.startTime
    const total = item.endTime - item.startTime
    return Math.min(100, (elapsed / total) * 100)
  }

  // 统一的取消处理
  const handleCancel = (item: BuildQueueItem) => {
    let eventName: string
    if (item.type === 'building' || item.type === 'ship' || item.type === 'defense' || item.type === 'demolish') {
      eventName = 'cancel-build'
    } else if (item.type === 'technology') {
      eventName = 'cancel-research'
    } else {
      return
    }

    const event = new CustomEvent(eventName, { detail: item.id })
    window.dispatchEvent(event)
  }

  // 取消研究
  const handleCancelResearch = (queueId: string) => {
    const event = new CustomEvent('cancel-research', { detail: queueId })
    window.dispatchEvent(event)
  }
</script>
