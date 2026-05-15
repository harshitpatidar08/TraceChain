import axios from 'axios'
import { supabase } from '../config/supabase'
import { API_BASE_URL } from '../config'

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    config.headers.Authorization =
      `Bearer ${session.access_token}`
  }
  return config
})

export default api