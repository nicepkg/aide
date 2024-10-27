import type { DiffAction, DiffEdit } from './types'

export class HistoryManager {
  private actions: DiffAction[] = []

  private position: number = -1

  push(action: DiffAction) {
    this.position++
    this.actions = this.actions.slice(0, this.position)
    this.actions.push(action)
  }

  undo(): DiffAction | undefined {
    if (this.position >= 0) {
      const action = this.actions[this.position]
      this.position--
      return action
    }
    return undefined
  }

  redo(): DiffAction | undefined {
    if (this.position < this.actions.length - 1) {
      this.position++
      return this.actions[this.position]
    }
    return undefined
  }

  getCurrentAction(): DiffAction | undefined {
    return this.actions[this.position]
  }

  getNextAction(): DiffAction | undefined {
    return this.actions[this.position + 1]
  }

  getAllActions(): DiffAction[] {
    return this.actions
  }

  getActionsUpToCurrent(): DiffAction[] {
    return this.actions.slice(0, this.position + 1)
  }

  getEditsUpToCurrent(): DiffEdit[] {
    return this.actions
      .slice(0, this.position + 1)
      .flatMap(action => action.edits)
  }

  clear() {
    this.actions = []
    this.position = -1
  }

  get isEmpty(): boolean {
    return this.actions.length === 0
  }

  get canUndo(): boolean {
    return this.position >= 0
  }

  get canRedo(): boolean {
    return this.position < this.actions.length - 1
  }
}
