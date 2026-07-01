// plugins/axios.client.js
import axios from 'axios'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  const api = axios.create({
    baseURL: config.public.apiBase || 'http://localhost:7000',
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: false
  })

  // ✅ แนบ token ทุกครั้งที่ request
  // ใน axios.client.js
axios.interceptors.request.use((config) => {
  // เพิ่มเงื่อนไขว่าถ้าเป็นหน้า login ไม่ต้องพ่น log หรือไม่ต้องใส่ token
  if (config.url.includes('/api/auth/login')) {
    config.headers['ngrok-skip-browser-warning'] = 'true'; // ยัดหัวนี้เข้าไปที่นี่เลย!
    return config;
  }
  
  const token = useCookie('token').value; // หรือวิธีดึง token ของคุณ
  if (!token) {
    console.log("[Axios] ไม่มี token"); 
  } else {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // บังคับข้ามหน้า ngrok warning สำหรับทุก request
  config.headers['ngrok-skip-browser-warning'] = 'true'; 
  
  return config;
});

  // ✅ เพิ่ม debug ถ้า server บอก Missing token
  api.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err?.response?.status === 401) {
        console.warn('[Axios] 401 Unauthorized:', err?.response?.data)
      }
      return Promise.reject(err)
    }
  )

  nuxtApp.provide('api', api)
})
