<template>
  <div class="container mx-auto p-4 sm:p-6 space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold">{{ t('diplomacy.title') }}</h1>
        <p class="text-sm text-muted-foreground mt-1">{{ t('diplomacy.description') }}</p>
      </div>
    </div>

    <!-- 关系状态过滤标签 -->
    <Tabs v-model="activeTab" class="w-full">
      <TabsList class="grid w-full grid-cols-4">
        <TabsTrigger value="all">
          {{ t('diplomacy.tabs.all') }}
          <Badge
            variant="outline"
            class="ml-2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
          >
            {{ allNpcs.length }}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="friendly">
          {{ t('diplomacy.tabs.friendly') }}
          <Badge
            variant="outline"
            class="ml-2 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700"
          >
            {{ friendlyNpcs.length }}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="neutral">
          {{ t('diplomacy.tabs.neutral') }}
          <Badge
            variant="outline"
            class="ml-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
          >
            {{ neutralNpcs.length }}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="hostile">
          {{ t('diplomacy.tabs.hostile') }}
          <Badge
            variant="outline"
            class="ml-2 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700"
          >
            {{ hostileNpcs.length }}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <!-- 全部NPC -->
      <TabsContent value="all" class="space-y-4 mt-6">
        <div v-if="allNpcs.length === 0" class="text-center py-12 text-muted-foreground">
          {{ t('diplomacy.noNpcs') }}
        </div>
        <template v-else>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NpcRelationCard
              v-for="npc in paginatedAllNpcs"
              :key="npc.id"
              :npc="npc"
              :relation="getRelation(npc.id)"
              :data-npc-id="npc.id"
            />
          </div>
          <Pagination
            v-if="totalPagesAll > 1"
            v-model:page="currentPage.all"
            :total="allNpcs.length"
            :items-per-page="ITEMS_PER_PAGE"
            :sibling-count="1"
            show-edges
            class="mt-6"
          >
            <PaginationContent>
              <PaginationPrevious>{{ t('pagination.previous') }}</PaginationPrevious>

              <template v-for="(pageNum, index) in pageNumbersAll" :key="index">
                <PaginationItem v-if="typeof pageNum === 'number'" :value="pageNum" :is-active="pageNum === currentPage.all">
                  {{ pageNum }}
                </PaginationItem>
                <span v-else class="px-2 text-muted-foreground">{{ pageNum }}</span>
              </template>

              <PaginationNext>{{ t('pagination.next') }}</PaginationNext>
            </PaginationContent>
          </Pagination>
        </template>
      </TabsContent>

      <!-- 友好NPC -->
      <TabsContent value="friendly" class="space-y-4 mt-6">
        <div v-if="friendlyNpcs.length === 0" class="text-center py-12 text-muted-foreground">
          {{ t('diplomacy.noFriendlyNpcs') }}
        </div>
        <template v-else>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NpcRelationCard
              v-for="npc in paginatedFriendlyNpcs"
              :key="npc.id"
              :npc="npc"
              :relation="getRelation(npc.id)"
              :data-npc-id="npc.id"
            />
          </div>
          <Pagination
            v-if="totalPagesFriendly > 1"
            v-model:page="currentPage.friendly"
            :total="friendlyNpcs.length"
            :items-per-page="ITEMS_PER_PAGE"
            :sibling-count="1"
            show-edges
            class="mt-6"
          >
            <PaginationContent>
              <PaginationPrevious>{{ t('pagination.previous') }}</PaginationPrevious>

              <template v-for="(pageNum, index) in pageNumbersFriendly" :key="index">
                <PaginationItem v-if="typeof pageNum === 'number'" :value="pageNum" :is-active="pageNum === currentPage.friendly">
                  {{ pageNum }}
                </PaginationItem>
                <span v-else class="px-2 text-muted-foreground">{{ pageNum }}</span>
              </template>

              <PaginationNext>{{ t('pagination.next') }}</PaginationNext>
            </PaginationContent>
          </Pagination>
        </template>
      </TabsContent>

      <!-- 中立NPC -->
      <TabsContent value="neutral" class="space-y-4 mt-6">
        <div v-if="neutralNpcs.length === 0" class="text-center py-12 text-muted-foreground">
          {{ t('diplomacy.noNeutralNpcs') }}
        </div>
        <template v-else>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NpcRelationCard
              v-for="npc in paginatedNeutralNpcs"
              :key="npc.id"
              :npc="npc"
              :relation="getRelation(npc.id)"
              :data-npc-id="npc.id"
            />
          </div>
          <Pagination
            v-if="totalPagesNeutral > 1"
            v-model:page="currentPage.neutral"
            :total="neutralNpcs.length"
            :items-per-page="ITEMS_PER_PAGE"
            :sibling-count="1"
            show-edges
            class="mt-6"
          >
            <PaginationContent>
              <PaginationPrevious>{{ t('pagination.previous') }}</PaginationPrevious>

              <template v-for="(pageNum, index) in pageNumbersNeutral" :key="index">
                <PaginationItem v-if="typeof pageNum === 'number'" :value="pageNum" :is-active="pageNum === currentPage.neutral">
                  {{ pageNum }}
                </PaginationItem>
                <span v-else class="px-2 text-muted-foreground">{{ pageNum }}</span>
              </template>

              <PaginationNext>{{ t('pagination.next') }}</PaginationNext>
            </PaginationContent>
          </Pagination>
        </template>
      </TabsContent>

      <!-- 敌对NPC -->
      <TabsContent value="hostile" class="space-y-4 mt-6">
        <div v-if="hostileNpcs.length === 0" class="text-center py-12 text-muted-foreground">
          {{ t('diplomacy.noHostileNpcs') }}
        </div>
        <template v-else>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NpcRelationCard
              v-for="npc in paginatedHostileNpcs"
              :key="npc.id"
              :npc="npc"
              :relation="getRelation(npc.id)"
              :data-npc-id="npc.id"
            />
          </div>
          <Pagination
            v-if="totalPagesHostile > 1"
            v-model:page="currentPage.hostile"
            :total="hostileNpcs.length"
            :items-per-page="ITEMS_PER_PAGE"
            :sibling-count="1"
            show-edges
            class="mt-6"
          >
            <PaginationContent>
              <PaginationPrevious>{{ t('pagination.previous') }}</PaginationPrevious>

              <template v-for="(pageNum, index) in pageNumbersHostile" :key="index">
                <PaginationItem v-if="typeof pageNum === 'number'" :value="pageNum" :is-active="pageNum === currentPage.hostile">
                  {{ pageNum }}
                </PaginationItem>
                <span v-else class="px-2 text-muted-foreground">{{ pageNum }}</span>
              </template>

              <PaginationNext>{{ t('pagination.next') }}</PaginationNext>
            </PaginationContent>
          </Pagination>
        </template>
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
  import { useGameStore } from '@/stores/gameStore'
  import { useNPCStore } from '@/stores/npcStore'
  import { useI18n } from '@/composables/useI18n'
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
  import { Badge } from '@/components/ui/badge'
  import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
  import NpcRelationCard from '@/components/NpcRelationCard.vue'
  import { RelationStatus } from '@/types/game'
  import type { DiplomaticRelation } from '@/types/game'

  const gameStore = useGameStore()
  const npcStore = useNPCStore()
  const { t } = useI18n()

  const activeTab = ref('all')

  // 检测并生成NPC盟友
  const initializeNPCAllies = () => {
    const npcs = npcStore.npcs
    if (npcs.length < 2) return // 至少需要2个NPC才能生成盟友关系

    npcs.forEach(npc => {
      // 如果NPC没有盟友列表,初始化为空数组
      if (!npc.allies) {
        npc.allies = []
      }

      // 如果NPC没有盟友,随机生成1-2个盟友
      if (npc.allies.length === 0) {
        const otherNpcs = npcs.filter(n => n.id !== npc.id)
        if (otherNpcs.length === 0) return

        // 随机选择1-2个盟友
        const allyCount = Math.min(Math.floor(Math.random() * 2) + 1, otherNpcs.length)
        const shuffled = [...otherNpcs].sort(() => Math.random() - 0.5)
        const selectedAllies = shuffled.slice(0, allyCount)

        selectedAllies.forEach(ally => {
          // 添加双向盟友关系
          if (!npc.allies!.includes(ally.id)) {
            npc.allies!.push(ally.id)
          }

          // 确保盟友也有盟友列表
          if (!ally.allies) {
            ally.allies = []
          }

          // 确保双向关系
          if (!ally.allies.includes(npc.id)) {
            ally.allies.push(npc.id)
          }
        })
      }
    })
  }

  // 组件挂载时初始化NPC盟友
  onMounted(() => {
    initializeNPCAllies()

    // 监听滚动到NPC卡片的事件
    const handleScrollToNpc = (event: Event) => {
      const customEvent = event as CustomEvent<{ npcId: string }>
      const npcId = customEvent.detail.npcId

      // 切换到"全部"标签
      activeTab.value = 'all'

      // 等待DOM更新后再滚动
      nextTick(() => {
        // 找到目标NPC在列表中的索引
        const npcIndex = allNpcs.value.findIndex(npc => npc.id === npcId)
        if (npcIndex === -1) return

        // 计算目标NPC所在的页面
        const targetPage = Math.floor(npcIndex / ITEMS_PER_PAGE) + 1
        currentPage.value.all = targetPage

        // 再次等待分页更新后滚动到卡片
        nextTick(() => {
          // 使用data属性来标识卡片
          const cards = document.querySelectorAll('[data-npc-id]')
          const targetCard = Array.from(cards).find(card => card.getAttribute('data-npc-id') === npcId)

          if (targetCard) {
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // 添加高亮效果
            targetCard.classList.add('ring-2', 'ring-primary', 'ring-offset-2')
            setTimeout(() => {
              targetCard.classList.remove('ring-2', 'ring-primary', 'ring-offset-2')
            }, 2000)
          }
        })
      })
    }

    document.addEventListener('scrollToNpc', handleScrollToNpc)

    // 清理事件监听器
    onUnmounted(() => {
      document.removeEventListener('scrollToNpc', handleScrollToNpc)
    })
  })

  // 分页状态
  const ITEMS_PER_PAGE = 20
  const currentPage = ref<Record<string, number>>({
    all: 1,
    friendly: 1,
    neutral: 1,
    hostile: 1
  })

  // 获取玩家对NPC的关系
  const getRelation = (npcId: string): DiplomaticRelation | undefined => {
    return gameStore.player.diplomaticRelations?.[npcId]
  }

  // 按关系状态分类NPC
  const allNpcs = computed(() => npcStore.npcs)

  const friendlyNpcs = computed(() => {
    return npcStore.npcs.filter(npc => {
      const relation = getRelation(npc.id)
      return relation?.status === RelationStatus.Friendly
    })
  })

  const neutralNpcs = computed(() => {
    return npcStore.npcs.filter(npc => {
      const relation = getRelation(npc.id)
      return !relation || relation.status === RelationStatus.Neutral
    })
  })

  const hostileNpcs = computed(() => {
    return npcStore.npcs.filter(npc => {
      const relation = getRelation(npc.id)
      return relation?.status === RelationStatus.Hostile
    })
  })

  // 分页辅助函数
  const getPaginatedNpcs = (npcs: typeof allNpcs.value, tabKey: string) => {
    const page = currentPage.value[tabKey] || 1
    const start = (page - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return npcs.slice(start, end)
  }

  const getTotalPages = (npcs: typeof allNpcs.value) => {
    return Math.ceil(npcs.length / ITEMS_PER_PAGE)
  }

  // 分页后的NPC列表
  const paginatedAllNpcs = computed(() => getPaginatedNpcs(allNpcs.value, 'all'))
  const paginatedFriendlyNpcs = computed(() => getPaginatedNpcs(friendlyNpcs.value, 'friendly'))
  const paginatedNeutralNpcs = computed(() => getPaginatedNpcs(neutralNpcs.value, 'neutral'))
  const paginatedHostileNpcs = computed(() => getPaginatedNpcs(hostileNpcs.value, 'hostile'))

  // 总页数
  const totalPagesAll = computed(() => getTotalPages(allNpcs.value))
  const totalPagesFriendly = computed(() => getTotalPages(friendlyNpcs.value))
  const totalPagesNeutral = computed(() => getTotalPages(neutralNpcs.value))
  const totalPagesHostile = computed(() => getTotalPages(hostileNpcs.value))

  // 生成页码列表（用于分页UI）
  const getPageNumbers = (currentPageNum: number, totalPages: number) => {
    const pages: (number | string)[] = []
    const maxVisible = 5 // 最多显示5个页码

    if (totalPages <= maxVisible) {
      // 如果总页数少于等于5，显示全部
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 总是显示第1页
      pages.push(1)

      if (currentPageNum > 3) {
        pages.push('...')
      }

      // 计算中间显示的页码范围
      const start = Math.max(2, currentPageNum - 1)
      const end = Math.min(totalPages - 1, currentPageNum + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPageNum < totalPages - 2) {
        pages.push('...')
      }

      // 总是显示最后一页
      pages.push(totalPages)
    }

    return pages
  }

  // 各标签页的页码列表
  const pageNumbersAll = computed(() => getPageNumbers(currentPage.value.all || 1, totalPagesAll.value))
  const pageNumbersFriendly = computed(() => getPageNumbers(currentPage.value.friendly || 1, totalPagesFriendly.value))
  const pageNumbersNeutral = computed(() => getPageNumbers(currentPage.value.neutral || 1, totalPagesNeutral.value))
  const pageNumbersHostile = computed(() => getPageNumbers(currentPage.value.hostile || 1, totalPagesHostile.value))
</script>
