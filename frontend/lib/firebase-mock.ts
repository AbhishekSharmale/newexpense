// Mock Firebase for development without actual Firebase setup
export const auth = {
  currentUser: null
}

export const db = {}
export const storage = {}

// Mock Firebase functions
export const initializeApp = (config: any) => ({})
export const getAuth = (app: any) => auth
export const getFirestore = (app: any) => db
export const getStorage = (app: any) => storage

export default {}