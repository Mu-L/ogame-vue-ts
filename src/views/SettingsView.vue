<template>
  <div class="container mx-auto p-4 sm:p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ t('nav.settings') }}</h1>
    </div>

    <!-- 数据管理 -->
    <Card>
      <CardHeader>
        <CardTitle>{{ t('settings.dataManagement') }}</CardTitle>
        <CardDescription>{{ t('settings.dataManagementDesc') }}</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- 导出数据 -->
        <div class="flex items-center justify-between p-4 border rounded-lg">
          <div class="space-y-1">
            <h3 class="font-medium">{{ t('settings.exportData') }}</h3>
            <p class="text-sm text-muted-foreground">{{ t('settings.exportDataDesc') }}</p>
          </div>
          <Button @click="handleExport" :disabled="isExporting">
            <Download class="mr-2 h-4 w-4" />
            {{ isExporting ? t('settings.exporting') : t('settings.export') }}
          </Button>
        </div>

        <!-- 导入数据 -->
        <div class="flex items-center justify-between p-4 border rounded-lg">
          <div class="space-y-1">
            <h3 class="font-medium">{{ t('settings.importData') }}</h3>
            <p class="text-sm text-muted-foreground">{{ t('settings.importDataDesc') }}</p>
          </div>
          <div class="flex gap-2">
            <input ref="fileInputRef" type="file" accept=".json" class="hidden" @change="handleFileSelect" />
            <Button @click="triggerFileInput" variant="outline">
              <Upload class="mr-2 h-4 w-4" />
              {{ t('settings.selectFile') }}
            </Button>
          </div>
        </div>

        <!-- 清除数据 -->
        <div class="flex items-center justify-between p-4 border rounded-lg border-destructive/50">
          <div class="space-y-1">
            <h3 class="font-medium text-destructive">{{ t('settings.clearData') }}</h3>
            <p class="text-sm text-muted-foreground">{{ t('settings.clearDataDesc') }}</p>
          </div>
          <Button @click="handleClearData" variant="destructive">
            <Trash2 class="mr-2 h-4 w-4" />
            {{ t('settings.clear') }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 游戏设置 -->
    <Card>
      <CardHeader>
        <CardTitle>{{ t('settings.gameSettings') }}</CardTitle>
        <CardDescription>{{ t('settings.gameSettingsDesc') }}</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- 玩家名称 -->
        <div class="flex items-center justify-between">
          <Label for="player-name">{{ t('settings.playerName') }}</Label>
          <Input id="player-name" v-model="playerName" @blur="updatePlayerName" class="max-w-xs" />
        </div>

        <!-- 游戏速度 -->
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <Label>{{ t('settings.gameSpeed') }}</Label>
            <p class="text-sm text-muted-foreground">{{ t('settings.gameSpeedDesc') }}</p>
          </div>
          <div class="text-2xl font-bold">1x</div>
        </div>
      </CardContent>
    </Card>

    <!-- 关于 -->
    <Card>
      <CardHeader>
        <CardTitle>{{ t('settings.about') }}</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">{{ t('settings.version') }}:</span>
            <span class="font-medium">{{ pkg.version }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">{{ t('settings.buildDate') }}:</span>
            <span class="font-medium">{{ new Date().toLocaleDateString() }}</span>
          </div>
        </div>

        <!-- 社区链接 -->
        <div class="pt-2 border-t space-y-2">
          <h3 class="text-sm font-medium">{{ t('settings.community') }}</h3>
          <div class="flex flex-col gap-2">
            <!-- GitHub -->
            <Button variant="outline" class="w-full justify-start" @click="openGithub">
              <ExternalLink class="mr-2 h-4 w-4" />
              {{ t('settings.github') }}
            </Button>
            <Button
              v-if="gameStore.locale === 'zh-CN' || gameStore.locale === 'zh-TW'"
              variant="outline"
              class="w-full justify-start"
              @click="openQQGroup"
            >
              <MessagesSquare class="mr-2 h-4 w-4" />
              {{ t('settings.qqGroup') }}
              <span class="ml-auto text-xs text-muted-foreground">{{ pkg.qq }}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 确认对话框 -->
    <AlertDialog :open="showConfirmDialog" @update:open="showConfirmDialog = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ confirmTitle }}</AlertDialogTitle>
          <AlertDialogDescription>{{ confirmMessage }}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="cancelAction">{{ t('common.cancel') }}</AlertDialogCancel>
          <AlertDialogAction @click="confirmAction">{{ t('common.confirm') }}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useGameStore } from '@/stores/gameStore'
  import { useI18n } from '@/composables/useI18n'
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
  import { Button } from '@/components/ui/button'
  import { Input } from '@/components/ui/input'
  import { Label } from '@/components/ui/label'
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
  } from '@/components/ui/alert-dialog'
  import { Download, Upload, Trash2, ExternalLink, MessagesSquare } from 'lucide-vue-next'
  import { saveAs } from 'file-saver'
  import { toast } from 'vue-sonner'
  import pkg from '../../package.json'

  const { t } = useI18n()
  const gameStore = useGameStore()

  const fileInputRef = ref<HTMLInputElement>()
  const isExporting = ref(false)
  const playerName = ref(gameStore.player.name)

  const showConfirmDialog = ref(false)
  const confirmTitle = ref('')
  const confirmMessage = ref('')
  let confirmCallback: (() => void) | null = null

  const openGithub = () => {
    window.open(`https://github.com/${pkg.author}/${pkg.name}`, '_blank')
  }

  const openQQGroup = () => {
    window.open(`https://qm.qq.com/q/${pkg.id}`, '_blank')
  }

  // 导出数据
  const handleExport = async () => {
    try {
      isExporting.value = true
      const data = localStorage.getItem(pkg.name)
      if (!data) {
        toast.error(t('settings.exportFailed'))
        return
      }
      const fileName = `${pkg.name}-${new Date().toISOString().slice(0, 10)}-${Date.now()}.json`
      saveAs(new Blob([data], { type: 'application/json' }), fileName)
      toast.success(t('settings.exportSuccess'))
    } catch (error) {
      console.error('Export failed:', error)
      toast.error(t('settings.exportFailed'))
    } finally {
      isExporting.value = false
    }
  }

  // 触发文件选择
  const triggerFileInput = () => {
    fileInputRef.value?.click()
  }

  // 处理文件选择
  const handleFileSelect = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    confirmTitle.value = t('settings.importConfirmTitle')
    confirmMessage.value = t('settings.importConfirmMessage')
    showConfirmDialog.value = true
    confirmCallback = () => importData(file)
  }

  // 导入数据
  const importData = async (file: File) => {
    try {
      const reader = new FileReader()
      reader.onload = e => {
        try {
          const result = e.target?.result
          if (typeof result === 'string') {
            localStorage.setItem(pkg.name, result)
            toast.success(t('settings.importSuccess'))
            setTimeout(() => location.reload(), 500)
          } else {
            toast.error(t('settings.importFailed'))
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          toast.error(t('settings.importFailed') + ': ' + message)
        }
      }
      reader.readAsText(file)
    } catch (error) {
      console.error('Import failed:', error)
      toast.error(t('settings.importFailed'))
    }
  }

  // 清除数据
  const handleClearData = () => {
    confirmTitle.value = t('settings.clearConfirmTitle')
    confirmMessage.value = t('settings.clearConfirmMessage')
    showConfirmDialog.value = true
    confirmCallback = clearData
  }

  const clearData = () => {
    // 清除localStorage
    localStorage.clear()
    // 重新加载页面
    window.location.reload()
  }

  // 更新玩家名称
  const updatePlayerName = () => {
    if (playerName.value.trim()) {
      gameStore.player.name = playerName.value.trim()
    }
  }

  // 确认操作
  const confirmAction = () => {
    if (confirmCallback) {
      confirmCallback()
      confirmCallback = null
    }
    showConfirmDialog.value = false
  }

  // 取消操作
  const cancelAction = () => {
    confirmCallback = null
    showConfirmDialog.value = false
    // 重置文件输入
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
</script>
