export interface AuthState {
  user: any | null
  session: any | null
  loading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}