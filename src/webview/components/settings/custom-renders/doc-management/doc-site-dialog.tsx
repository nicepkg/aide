import { ReloadIcon } from '@radix-ui/react-icons'
import type { DocSite } from '@shared/entities'
import { Button } from '@webview/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@webview/components/ui/dialog'
import { Input } from '@webview/components/ui/input'

interface DocSiteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  loading: boolean
  siteName: string
  siteUrl: string
  onSiteNameChange: (value: string) => void
  onSiteUrlChange: (value: string) => void
  onSave: () => void
  editingSite?: DocSite
}

export const DocSiteDialog = ({
  open,
  onOpenChange,
  loading,
  siteName,
  siteUrl,
  onSiteNameChange,
  onSiteUrlChange,
  onSave,
  editingSite
}: DocSiteDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-[calc(100vw-2rem)] rounded-lg">
      <DialogHeader>
        <DialogTitle>
          {editingSite ? 'Edit Doc Site' : 'Add New Doc Site'}
        </DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <div className="space-y-4 mt-4">
        <Input
          placeholder="Enter doc site name"
          value={siteName}
          onChange={e => onSiteNameChange(e.target.value)}
          className="text-sm"
        />
        <Input
          placeholder="Enter doc site URL"
          value={siteUrl}
          onChange={e => onSiteUrlChange(e.target.value)}
          className="text-sm"
        />
        <Button onClick={onSave} disabled={loading} className="w-full text-sm">
          {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
          {editingSite ? 'Update Site' : 'Add Site'}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
)
