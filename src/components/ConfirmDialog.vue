<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black/50" @click="handleCancel" />
      <div class="relative bg-card border rounded-lg shadow-lg p-6 max-w-md w-full mx-4 z-10">
        <h2 class="text-lg font-semibold mb-2">{{ dialogProps?.title }}</h2>
        <p class="text-sm text-muted-foreground mb-6">{{ dialogProps?.message }}</p>

        <div class="flex justify-end gap-3">
          <Button @click="handleCancel" variant="outline">{{ t('common.cancel') }}</Button>
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

  interface ConfirmDialogProps {
    title: string
    message: string
    onConfirm: () => void
  }

  const isOpen = ref(false)
  const dialogProps = ref<ConfirmDialogProps | null>(null)

  const show = (props: ConfirmDialogProps) => {
    dialogProps.value = props
    isOpen.value = true
  }

  const handleConfirm = () => {
    if (dialogProps.value) {
      dialogProps.value.onConfirm()
    }
    isOpen.value = false
  }

  const handleCancel = () => {
    isOpen.value = false
  }

  defineExpose({ show })
</script>
