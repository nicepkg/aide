import { useState } from 'react'
import { Button } from '@webview/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@webview/components/ui/dialog'
import { Textarea } from '@webview/components/ui/textarea'

interface CreateModelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (modelNames: string[]) => void
}

export const CreateModelDialog = ({
  open,
  onOpenChange,
  onSubmit
}: CreateModelDialogProps) => {
  const [input, setInput] = useState('')

  const handleSubmit = () => {
    const modelNames = input
      .split('\n')
      .map(name => name.trim())
      .filter(Boolean)
    onSubmit(modelNames)
    setInput('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Models</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            placeholder="Enter model names (one per line)"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="min-h-[200px]"
          />
          <Button onClick={handleSubmit} className="w-full">
            Add Models
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
