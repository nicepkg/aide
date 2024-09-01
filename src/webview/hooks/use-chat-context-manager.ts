import { ChatService } from '@webview/services/chat-service'
import type { ChatContext, Conversation } from '@webview/types/chat'
import { useImmer } from 'use-immer'
import { v4 as uuidv4 } from 'uuid'

import { useAsyncMemo } from './use-async-memo'

const mockData = [
  { id: '1', createdAt: 1625234567890, role: 'human', content: 'Hello!' },
  {
    id: '2',
    createdAt: 1625234567891,
    role: 'ai',
    content: 'Hi there! How can I assist you today?'
  },
  {
    id: '3',
    createdAt: 1625234567892,
    role: 'human',
    content: 'What’s the weather like?'
  },
  {
    id: '4',
    createdAt: 1625234567893,
    role: 'ai',
    content: 'It’s sunny and warm today.'
  },
  { id: '5', createdAt: 1625234567894, role: 'human', content: 'Thank you!' },
  { id: '6', createdAt: 1625234567895, role: 'ai', content: 'You’re welcome!' },
  {
    id: '7',
    createdAt: 1625234567896,
    role: 'human',
    content: 'Can you tell me a joke?'
  },
  {
    id: '8',
    createdAt: 1625234567897,
    role: 'ai',
    content:
      'Why don’t scientists trust atoms? Because they make up everything!'
  },
  {
    id: '9',
    createdAt: 1625234567898,
    role: 'human',
    content: 'Haha, that’s a good one.'
  },
  {
    id: '10',
    createdAt: 1625234567899,
    role: 'ai',
    content: 'Glad you liked it!'
  },
  {
    id: '11',
    createdAt: 1625234567900,
    role: 'human',
    content: 'What’s your favorite color?'
  },
  {
    id: '12',
    createdAt: 1625234567901,
    role: 'ai',
    content: 'I like blue. It reminds me of the sky.'
  },
  {
    id: '13',
    createdAt: 1625234567902,
    role: 'human',
    content: 'Do you have any hobbies?'
  },
  {
    id: '14',
    createdAt: 1625234567903,
    role: 'ai',
    content: 'I enjoy learning new things and helping people!'
  },
  {
    id: '15',
    createdAt: 1625234567904,
    role: 'human',
    content: 'That’s great to hear.'
  },
  { id: '16', createdAt: 1625234567905, role: 'ai', content: 'Thank you!' },
  {
    id: '17',
    createdAt: 1625234567906,
    role: 'human',
    content: 'What’s the capital of France?'
  },
  {
    id: '18',
    createdAt: 1625234567907,
    role: 'ai',
    content: 'The capital of France is Paris.'
  },
  {
    id: '19',
    createdAt: 1625234567908,
    role: 'human',
    content: 'I appreciate your help.'
  },
  {
    id: '20',
    createdAt: 1625234567909,
    role: 'ai',
    content: 'Anytime! Feel free to ask if you have more questions.'
  },
  {
    id: '21',
    createdAt: 1625234567910,
    role: 'human',
    content: 'What’s 2 + 2?'
  },
  { id: '22', createdAt: 1625234567911, role: 'ai', content: '2 + 2 equals 4.' }
] as Conversation[]

export const useChatContextManager = () => {
  const [context, setContext] = useImmer<ChatContext>({
    id: uuidv4(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    settings: {
      allowLongFileScan: false,
      explicitContext: '',
      fastApplyModelName: 'gpt-4o-mini',
      modelName: 'gpt-4o',
      useFastApply: true
    },
    conversations: [...mockData]
  })

  const [newConversation, setNewConversation] = useImmer<Conversation>({
    id: uuidv4(),
    createdAt: Date.now(),
    role: 'human',
    content: '',
    attachments: {
      codeContext: {
        codeChunks: [],
        tmpCodeChunk: []
      },
      codebaseContext: {
        relevantCodeSnippets: []
      },
      docContext: {
        enableTool: false,
        allowSearchDocSiteUrls: [],
        relevantDocs: []
      },
      fileContext: {
        selectedFiles: [],
        selectedFolders: [],
        selectedImages: []
      },
      gitContext: {
        gitCommits: [],
        gitDiffs: [],
        gitPullRequests: []
      },
      webContext: {
        enableTool: false,
        webSearchResults: []
      }
    }
  })

  const [messages] = useAsyncMemo(
    async () => await ChatService.getMessages(context),
    [context]
  )

  return {
    context,
    setContext,
    newConversation,
    setNewConversation,
    messages: messages || []
  }
}
