import { useEffect } from 'react'
import {
  COMMAND_PRIORITY_HIGH,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  type LexicalEditor
} from 'lexical'

export const useEditorCommands = (
  editor: LexicalEditor,
  isOpen: boolean,
  setIsOpen: (open: boolean) => void
) => {
  useEffect(() => {
    const removeEnterListener = editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event: KeyboardEvent) => {
        if (isOpen) {
          event.preventDefault()
          return true
        }
        return false
      },
      COMMAND_PRIORITY_HIGH
    )

    const removeArrowUpListener = editor.registerCommand(
      KEY_ARROW_UP_COMMAND,
      (event: KeyboardEvent) => {
        if (isOpen) {
          event.preventDefault()
          return true
        }
        return false
      },
      COMMAND_PRIORITY_HIGH
    )

    const removeArrowDownListener = editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if (isOpen) {
          event.preventDefault()
          return true
        }
        return false
      },
      COMMAND_PRIORITY_HIGH
    )

    const removeEscapeListener = editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      () => {
        if (isOpen) {
          setIsOpen(false)
          return true
        }
        return false
      },
      COMMAND_PRIORITY_HIGH
    )

    return () => {
      removeEnterListener()
      removeArrowUpListener()
      removeArrowDownListener()
      removeEscapeListener()
    }
  }, [editor, isOpen, setIsOpen])
}
