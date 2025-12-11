<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black/50" @click="handleClose" />
      <div class="relative bg-card border rounded-lg shadow-lg p-6 max-w-md w-full mx-4 z-10">
        <h2 class="text-lg font-semibold mb-2">{{ dialogProps?.title }}</h2>
        <p class="text-sm text-muted-foreground mb-6 whitespace-pre-line">{{ dialogProps?.message }}</p>

        <div class="flex justify-end gap-2">
          <Button v-if="dialogProps?.onConfirm" @click="handleClose" variant="outline">{{ t('common.cancel') }}</Button>
          <Button @click="handleConfirm" variant="default">{{ t('common.confirm') }}</Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { Button } from '@/components/ui/button'
  import { useI18n } from '@/composables/useI18n'

  const { t } = useI18n()

  interface AlertDialogProps {
    title: string
    message: string
    onConfirm?: () => void
  }

  const isOpen = ref(false)
  const dialogProps = ref<AlertDialogProps | null>(null)

  const show = (props: AlertDialogProps) => {
    dialogProps.value = props
    isOpen.value = true
  }

  const handleConfirm = () => {
    if (dialogProps.value?.onConfirm) {
      dialogProps.value.onConfirm()
    }
    isOpen.value = false
  }

  const handleClose = () => {
    isOpen.value = false
  }

  defineExpose({ show })
</script>
