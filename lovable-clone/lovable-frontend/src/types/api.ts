export type MessageRole = 'USER' | 'ASSISTANT'
export type MessageType = 'RESULT' | 'ERROR'

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface Project {
  id: string
  name: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Fragment {
  id: string
  messageId: string
  sandboxUrl: string
  title: string
  files: Record<string, string>
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  content: string
  role: MessageRole
  type: MessageType
  projectId: string
  fragment: Fragment | null
  createdAt: string
  updatedAt: string
}

export interface Dashboard {
  projects: Project[]
  projectCount: number
}

export interface Usage {
  key: string
  points: number
  expire: string | null
}
