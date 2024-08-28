import { create } from 'zustand'

import { chatBotMessages, Message, UserData, userData, users } from './data'

export interface Example {
  name: string
  url: string
}

interface State {
  selectedExample: Example
  examples: Example[]
  input: string
  chatBotMessages: Message[]
  messages: Message[]
  hasInitialAIResponse: boolean
  hasInitialResponse: boolean
}

interface Actions {
  selectedUser: UserData
  setSelectedExample: (example: Example) => void
  setExamples: (examples: Example[]) => void
  setInput: (input: string) => void
  handleInputChange: (text: string) => void
  setChatBotMessages: (fn: (chatBotMessages: Message[]) => Message[]) => void
  setMessages: (fn: (messages: Message[]) => Message[]) => void
  setHasInitialAIResponse: (hasInitialAIResponse: boolean) => void
  setHasInitialResponse: (hasInitialResponse: boolean) => void
}

const useChatStore = create<State & Actions>()(set => ({
  selectedUser: users[4]!,

  selectedExample: { name: 'Messenger example', url: '/' },

  examples: [
    { name: 'Messenger example', url: '/' },
    { name: 'Chatbot example', url: '/chatbot' },
    { name: 'Chatbot2 example', url: '/chatbot2' }
  ],

  input: '',

  setSelectedExample: selectedExample => set({ selectedExample }),

  setExamples: examples => set({ examples }),

  setInput: input => set({ input }),
  handleInputChange: (text: string) => set({ input: text }),

  chatBotMessages,
  setChatBotMessages: fn =>
    set(({ chatBotMessages }) => ({ chatBotMessages: fn(chatBotMessages) })),

  messages: userData[0]!.messages,
  setMessages: fn => set(({ messages }) => ({ messages: fn(messages) })),

  hasInitialAIResponse: false,
  setHasInitialAIResponse: hasInitialAIResponse =>
    set({ hasInitialAIResponse }),

  hasInitialResponse: false,
  setHasInitialResponse: hasInitialResponse => set({ hasInitialResponse })
}))

export default useChatStore
