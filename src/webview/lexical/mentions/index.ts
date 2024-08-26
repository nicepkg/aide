import type { IMentionStrategy } from '@webview/types/chat'

import { CodeChunkMentionStrategy } from './code-chunk-mention-strategy'
import { CodeSnippetMentionStrategy } from './code-snippet-mention-strategy'
import { DocMentionStrategy } from './doc-mention-strategy'
import { FileMentionStrategy } from './file-mention-strategy'
import { FolderMentionStrategy } from './folder-mention-strategy'
import { GitCommitMentionStrategy } from './git-commit-mention-strategy'
import { GitDiffMentionStrategy } from './git-diff-mention-strategy'
import { GitPullRequestMentionStrategy } from './git-pull-request-mention-strategy'
import { ImageMentionStrategy } from './image-mention-strategy'
import { WebSearchMentionStrategy } from './web-search-mention-strategy'

export const allMentionStrategies: IMentionStrategy[] = [
  new FileMentionStrategy(),
  new FolderMentionStrategy(),
  new ImageMentionStrategy(),
  new CodeChunkMentionStrategy(),
  new CodeSnippetMentionStrategy(),
  new DocMentionStrategy(),
  new WebSearchMentionStrategy(),
  new GitCommitMentionStrategy(),
  new GitPullRequestMentionStrategy(),
  new GitDiffMentionStrategy()
]
