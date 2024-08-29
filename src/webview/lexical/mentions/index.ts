import { MentionCategory, type MentionOption } from '@webview/types/chat'

import { CodeChunksMentionStrategy } from './code/code-chunks-mention-strategy'
import { RelevantCodeSnippetsMentionStrategy } from './codebase/relevant-code-snippets-mention-strategy'
import { AllowSearchDocSiteUrlsToolMentionStrategy } from './docs/allow-search-doc-site-urls-mention-strategy'
import { SelectedFilesMentionStrategy } from './files/selected-files-mention-strategy'
import { SelectedImagesMentionStrategy } from './files/selected-images-mention-strategy'
import { SelectedFoldersMentionStrategy } from './folders/selected-folders-mention-strategy'
import { GitCommitsMentionStrategy } from './git/git-commits-mention-strategy'
import { GitDiffsMentionStrategy } from './git/git-diffs-mention-strategy'
import { GitPullRequestsMentionStrategy } from './git/git-pull-requests-mention-strategy'
import { EnableWebToolMentionStrategy } from './web/enable-web-tool-mention-strategy'

export const createMentionOptions = (): MentionOption[] => [
  {
    label: 'Files',
    category: MentionCategory.Files,
    mentionStrategies: [
      new SelectedFilesMentionStrategy(),
      new SelectedImagesMentionStrategy()
    ]
  },
  {
    label: 'Folders',
    category: MentionCategory.Folders,
    mentionStrategies: [new SelectedFoldersMentionStrategy()]
  },
  {
    label: 'Code',
    category: MentionCategory.Code,
    mentionStrategies: [new CodeChunksMentionStrategy()]
  },
  {
    label: 'Web',
    category: MentionCategory.Web,
    mentionStrategies: [new EnableWebToolMentionStrategy()]
  },
  {
    label: 'Docs',
    category: MentionCategory.Docs,
    mentionStrategies: [new AllowSearchDocSiteUrlsToolMentionStrategy()]
  },
  {
    label: 'Git',
    category: MentionCategory.Git,
    mentionStrategies: [
      new GitCommitsMentionStrategy(),
      new GitDiffsMentionStrategy(),
      new GitPullRequestsMentionStrategy()
    ]
  },
  {
    label: 'Codebase',
    category: MentionCategory.Codebase,
    mentionStrategies: [new RelevantCodeSnippetsMentionStrategy()]
  }
]
