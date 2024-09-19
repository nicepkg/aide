import {
  code,
  content,
  content2
} from '@webview/components/chat/messages/markdown/test-data'
import {
  ChatContextType,
  type ChatContext,
  type Conversation
} from '@webview/types/chat'
import { useImmer } from 'use-immer'
import { v4 as uuidv4 } from 'uuid'

// eslint-disable-next-line unused-imports/no-unused-vars
const mockData = [
  { id: '1', createdAt: 1625234567890, role: 'human', contents: 'Hello!' },
  {
    id: '2',
    createdAt: 1625234567891,
    role: 'ai',
    contents: [
      {
        type: 'text',
        text: 'Hi there! How can I assist you today? Hi there! How can I assist you today? Hi there! How can I assist you today? Hi there! How can I assist you today? Hi there! How can I assist you today?'
      }
    ]
  },
  {
    id: '3',
    createdAt: 1625234567892,
    role: 'human',
    contents: [
      {
        type: 'text',
        text: 'What’s the weather like?'
      }
    ]
  },
  {
    id: '4',
    createdAt: 1625234567893,
    role: 'ai',
    contents: [
      {
        type: 'text',
        text: 'It’s sunny and warm today.'
      }
    ]
  },
  {
    id: '5',
    createdAt: 1625234567894,
    role: 'human',
    contents: [
      {
        type: 'text',
        text: 'Thank you!'
      }
    ]
  },
  {
    id: '6',
    createdAt: 1625234567895,
    role: 'ai',
    // contents: 'You’re welcome!'
    contents: [
      {
        type: 'text',
        text: 'You’re welcome!'
      }
    ]
  },
  {
    id: '7',
    createdAt: 1625234567896,
    role: 'human',
    contents: [
      {
        type: 'text',
        text: 'Can you tell me a joke?Can you tell me a joke?Can you tell me a joke?Can you tell me a joke?Can you tell me a joke?Can you tell me a joke?'
      }
    ]
  },
  {
    id: '8',
    createdAt: 1625234567897,
    role: 'ai',
    contents: [
      {
        type: 'text',
        text: 'Why don’t scientists trust atoms? Because they make up everything!'
      }
    ]
  },
  {
    id: '9',
    createdAt: 1625234567898,
    role: 'human',
    contents: [
      {
        type: 'text',
        text: 'Haha, that’s a good one.'
      }
    ]
  },
  {
    id: '10',
    createdAt: 1625234567899,
    role: 'ai',
    contents: [
      {
        type: 'text',
        text: 'Glad you liked it!'
      }
    ]
  },
  {
    id: '11',
    createdAt: 1625234567900,
    role: 'human',
    contents: [
      {
        type: 'text',
        text: 'What’s your favorite color?'
      }
    ]
  },
  {
    id: '12',
    createdAt: 1625234567901,
    role: 'ai',
    contents: [
      {
        type: 'text',
        text: 'I like blue. It reminds me of the sky.'
      }
    ]
  },
  {
    id: '13',
    createdAt: 1625234567902,
    role: 'human',
    contents: [
      {
        type: 'text',
        text: 'Do you have any hobbies?'
      }
    ]
  },
  {
    id: '14',
    createdAt: 1625234567903,
    role: 'ai',
    contents: [
      {
        type: 'text',
        text: 'I enjoy learning new things and helping people!'
      }
    ]
  },
  {
    id: '15',
    createdAt: 1625234567904,
    role: 'human',
    contents: [
      {
        type: 'text',
        text: 'That’s great to hear.'
      }
    ]
  },
  { id: '16', createdAt: 1625234567905, role: 'ai', contents: code },
  {
    id: '17',
    createdAt: 1625234567906,
    role: 'human',
    contents: [
      {
        type: 'text',
        text: 'What’s the capital of France?'
      }
    ]
  },
  {
    id: '18',
    createdAt: 1625234567907,
    role: 'ai',
    contents: [
      {
        type: 'text',
        text: content
      }
    ]
  },
  {
    id: '19',
    createdAt: 1625234567908,
    role: 'human',
    contents: [
      {
        type: 'text',
        text: 'I appreciate your help.'
      }
    ]
  },
  {
    id: '20',
    createdAt: 1625234567909,
    role: 'ai',
    contents: [
      {
        type: 'text',
        text: content2
      }
    ]
  },
  {
    id: '21',
    createdAt: 1625234567910,
    role: 'human',
    contents: [
      {
        type: 'text',
        text: 'What’s 2 + 2?'
      }
    ]
  },
  {
    id: '22',
    createdAt: 1625234567911,
    role: 'ai',
    contents: [
      {
        type: 'text',
        text: '2 + 2 equals 4.'
      }
    ]
  }
] as Conversation[]

export const useChatContextManager = () => {
  const [context, setContext] = useImmer<ChatContext>(() => ({
    id: uuidv4(),
    type: ChatContextType.Chat,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    settings: {
      allowLongFileScan: false,
      explicitContext: '总是用中文回复',
      fastApplyModelName: 'gpt-4o-mini',
      modelName: 'gpt-4o',
      useFastApply: true
    },
    conversations: [] // [...mockData]
  }))

  const getConversation = (id: string) =>
    context.conversations.find(conversation => conversation.id === id)

  const addConversation = (conversation: Conversation) => {
    setContext(draft => {
      draft.conversations.push(conversation)
    })
  }

  const updateConversation = (id: string, conversation: Conversation) => {
    setContext(draft => {
      const index = draft.conversations.findIndex(
        conversation => conversation.id === id
      )
      draft.conversations[index] = conversation
    })
  }

  const deleteConversation = (id: string) => {
    setContext(draft => {
      draft.conversations = draft.conversations.filter(
        conversation => conversation.id !== id
      )
    })
  }

  return {
    context,
    setContext,
    getConversation,
    addConversation,
    updateConversation,
    deleteConversation
  }
}
