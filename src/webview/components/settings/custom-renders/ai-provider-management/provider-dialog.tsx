import { type AIProvider } from '@shared/entities'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@webview/components/ui/dialog'

import { ProviderForm } from './provider-form'

interface ProviderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider?: AIProvider
  onSubmit: (data: Partial<AIProvider>) => Promise<void>
}

export const ProviderDialog = ({
  open,
  onOpenChange,
  provider,
  onSubmit
}: ProviderDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="w-[calc(100vw-2rem)] h-[calc(100vh-2rem)] max-h-1000px rounded-lg flex flex-col p-4">
      <DialogHeader>
        <DialogTitle>
          {provider ? 'Edit Provider' : 'Add New Provider'}
        </DialogTitle>
      </DialogHeader>
      <ProviderForm
        isEditMode={!!provider}
        initProvider={provider}
        onSubmit={onSubmit}
        onClose={() => onOpenChange(false)}
      />
    </DialogContent>
  </Dialog>
)
