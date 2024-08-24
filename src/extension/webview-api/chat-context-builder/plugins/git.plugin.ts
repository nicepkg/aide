import { SystemMessage } from '@langchain/core/messages'

import type { ChatContext } from '../types/chat-context'
import type { Message } from '../types/chat-context/message'
import type { LangchainMessageType } from '../types/langchain-message'
import { BasePlugin } from './base.plugin'

export class GitPlugin extends BasePlugin {
  name = 'Git'

  async buildContext(
    context: Partial<ChatContext>
  ): Promise<LangchainMessageType[]> {
    const conversation = context.conversation || []
    const gitInfo: string[] = []

    this.addCommits(conversation, gitInfo)
    this.addPullRequests(conversation, gitInfo)
    this.addGitDiffs(conversation, gitInfo)

    if (gitInfo.length === 0) return []

    return [new SystemMessage(gitInfo.join('\n'))]
  }

  private addCommits(conversation: Message[], gitInfo: string[]) {
    const commits = this.extractFromConversation(conversation, 'commits')
    if (commits.length > 0) {
      gitInfo.push('Relevant commits:')
      commits.forEach(commit => {
        gitInfo.push(`- ${JSON.stringify(commit)}`)
      })
    }
  }

  private addPullRequests(conversation: Message[], gitInfo: string[]) {
    const prs = this.extractFromConversation(conversation, 'pullRequests')
    if (prs.length > 0) {
      gitInfo.push('Relevant pull requests:')
      prs.forEach(pr => {
        gitInfo.push(`- ${JSON.stringify(pr)}`)
      })
    }
  }

  private addGitDiffs(conversation: Message[], gitInfo: string[]) {
    const diffs = this.extractFromConversation(conversation, 'gitDiffs')
    if (diffs.length > 0) {
      gitInfo.push('Git diffs:')
      diffs.forEach(diff => {
        gitInfo.push(`- ${JSON.stringify(diff)}`)
      })
    }
  }

  private extractFromConversation<K extends keyof Message>(
    conversation: Message[],
    key: K
  ): Message[K][] {
    return conversation
      .filter(msg => msg.type === 'human')
      .flatMap(msg => msg[key])
  }
}
