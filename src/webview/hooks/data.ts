export const users: User[] = [
  {
    id: 1,
    avatar:
      'https://images.freeimages.com/images/large-previews/971/basic-shape-avatar-1632968.jpg?fmt=webp&h=350',
    messages: [],
    name: 'Jane Doe'
  },
  {
    id: 2,
    avatar:
      'https://images.freeimages.com/images/large-previews/fdd/man-avatar-1632964.jpg?fmt=webp&h=350',
    messages: [],
    name: 'John Doe'
  },
  {
    id: 3,
    avatar:
      'https://images.freeimages.com/images/large-previews/d1f/lady-avatar-1632967.jpg?fmt=webp&h=350',
    messages: [],
    name: 'Elizabeth Smith'
  },
  {
    id: 4,
    avatar:
      'https://images.freeimages.com/images/large-previews/023/geek-avatar-1632962.jpg?fmt=webp&h=350',
    messages: [],
    name: 'John Smith'
  },
  {
    id: 5,
    avatar:
      'https://avatars.githubusercontent.com/u/114422072?s=400&u=8a176a310ca29c1578a70b1c33bdeea42bf000b4&v=4',
    messages: [],
    name: 'Jakob Hoeg'
  }
]

export const userData: User[] = [
  {
    id: 1,
    avatar:
      'https://images.freeimages.com/images/large-previews/971/basic-shape-avatar-1632968.jpg?fmt=webp&h=350',
    messages: [
      {
        id: 1,
        avatar:
          'https://images.freeimages.com/images/large-previews/971/basic-shape-avatar-1632968.jpg?fmt=webp&h=350',
        name: 'Jane Doe',
        message: 'Hey, Jakob',
        timestamp: '10:00 AM'
      },
      {
        id: 2,
        avatar:
          'https://avatars.githubusercontent.com/u/114422072?s=400&u=8a176a310ca29c1578a70b1c33bdeea42bf000b4&v=4',
        name: 'Jakob Hoeg',
        message: 'Hey!',
        timestamp: '10:01 AM'
      },
      {
        id: 3,
        avatar:
          'https://images.freeimages.com/images/large-previews/971/basic-shape-avatar-1632968.jpg?fmt=webp&h=350',
        name: 'Jane Doe',
        message: 'How are you?',
        timestamp: '10:02 AM'
      },
      {
        id: 4,
        avatar:
          'https://avatars.githubusercontent.com/u/114422072?s=400&u=8a176a310ca29c1578a70b1c33bdeea42bf000b4&v=4',
        name: 'Jakob Hoeg',
        message: 'I am good, you?',
        timestamp: '10:03 AM'
      },
      {
        id: 5,
        avatar:
          'https://images.freeimages.com/images/large-previews/971/basic-shape-avatar-1632968.jpg?fmt=webp&h=350',
        name: 'Jane Doe',
        message: 'I am good too!',
        timestamp: '10:04 AM'
      },
      {
        id: 6,
        avatar:
          'https://avatars.githubusercontent.com/u/114422072?s=400&u=8a176a310ca29c1578a70b1c33bdeea42bf000b4&v=4',
        name: 'Jakob Hoeg',
        message: 'That is good to hear!',
        timestamp: '10:05 AM'
      },
      {
        id: 7,
        avatar:
          'https://images.freeimages.com/images/large-previews/971/basic-shape-avatar-1632968.jpg?fmt=webp&h=350',
        name: 'Jane Doe',
        message: 'How has your day been so far?',
        timestamp: '10:06 AM'
      },
      {
        id: 8,
        avatar:
          'https://avatars.githubusercontent.com/u/114422072?s=400&u=8a176a310ca29c1578a70b1c33bdeea42bf000b4&v=4',
        name: 'Jakob Hoeg',
        message:
          'It has been good. I went for a run this morning and then had a nice breakfast. How about you?',
        timestamp: '10:10 AM'
      },
      {
        id: 9,
        avatar:
          'https://images.freeimages.com/images/large-previews/971/basic-shape-avatar-1632968.jpg?fmt=webp&h=350',
        name: 'Jane Doe',
        isLoading: true
      }
    ],
    name: 'Jane Doe'
  },
  {
    id: 2,
    avatar:
      'https://images.freeimages.com/images/large-previews/fdd/man-avatar-1632964.jpg?fmt=webp&h=350',
    name: 'John Doe',
    messages: []
  },
  {
    id: 3,
    avatar:
      'https://images.freeimages.com/images/large-previews/d1f/lady-avatar-1632967.jpg?fmt=webp&h=350',
    name: 'Elizabeth Smith',
    messages: []
  },
  {
    id: 4,
    avatar:
      'https://images.freeimages.com/images/large-previews/023/geek-avatar-1632962.jpg?fmt=webp&h=350',
    name: 'John Smith',
    messages: []
  }
]

export const chatBotMessages: Message[] = [
  {
    id: 1,
    avatar: '/chatbot.svg',
    name: 'ChatBot',
    message: 'Hello! How can I help you today?',
    timestamp: '10:00 AM',
    role: 'ai'
  },
  {
    id: 2,
    avatar:
      'https://avatars.githubusercontent.com/u/114422072?s=400&u=8a176a310ca29c1578a70b1c33bdeea42bf000b4&v=4',
    name: 'Jakob Hoeg',
    message: 'I need help with my order',
    timestamp: '10:01 AM',
    role: 'user'
  },
  {
    id: 3,
    avatar: '/chatbot.svg',
    name: 'ChatBot',
    message: 'Sure! Please provide me with your order number',
    timestamp: '10:02 AM',
    role: 'ai'
  },
  {
    id: 4,
    avatar:
      'https://avatars.githubusercontent.com/u/114422072?s=400&u=8a176a310ca29c1578a70b1c33bdeea42bf000b4&v=4',
    name: 'Jakob Hoeg',
    message: '123456',
    timestamp: '10:03 AM',
    role: 'user'
  },
  {
    id: 5,
    avatar: '/chatbot.svg',
    name: 'ChatBot',
    message: 'Thank you! One moment please while I look up your order',
    timestamp: '10:04 AM',
    role: 'ai'
  },
  {
    id: 6,
    avatar: '/chatbot.svg',
    name: 'ChatBot',
    message:
      'I have found your order. It is currently being processed and will be shipped out soon.',
    timestamp: '10:05 AM',
    role: 'ai'
  },
  {
    id: 7,
    avatar:
      'https://avatars.githubusercontent.com/u/114422072?s=400&u=8a176a310ca29c1578a70b1c33bdeea42bf000b4&v=4',
    name: 'Jakob Hoeg',
    message: 'Thank you for your help!',
    timestamp: '10:06 AM',
    role: 'user'
  },
  {
    id: 8,
    avatar: '/chatbot.svg',
    name: 'ChatBot',
    message: 'You are welcome! Have a great day!',
    isLoading: true,
    timestamp: '10:10 AM',
    role: 'ai'
  }
]

export type UserData = (typeof userData)[number]

export const loggedInUserData = {
  id: 5,
  avatar:
    'https://avatars.githubusercontent.com/u/114422072?s=400&u=8a176a310ca29c1578a70b1c33bdeea42bf000b4&v=4',
  name: 'Jakob Hoeg'
}

export type LoggedInUserData = typeof loggedInUserData

export interface Message {
  id: number
  avatar: string
  name: string
  message?: string
  isLoading?: boolean
  timestamp?: string
  role?: string
}

export interface User {
  id: number
  avatar: string
  messages: Message[]
  name: string
}
