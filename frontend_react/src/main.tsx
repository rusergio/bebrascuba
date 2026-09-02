import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios';
// Configuración de rutas 
import { RouterProvider } from 'react-router-dom';
import { router } from './router/router.tsx';
import { UserProvider } from './context/UserContext.tsx';
import { DataProvider } from './context/DataContext.tsx';
import { clearAuthStorage, getToken, isPublicPath } from './lib/auth';

const runtimeApiOrigin = import.meta.env.DEV
  ? '' // same-origin in dev; Vite proxy handles /api -> backend
  : (import.meta.env.VITE_API_ORIGIN || `${window.location.protocol}//${window.location.host}`);

axios.defaults.baseURL = runtimeApiOrigin;

axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/user/login')) {
      const hadSession = Boolean(getToken());
      clearAuthStorage();

      const path = window.location.pathname;
      if (hadSession && !isPublicPath(path) && path !== '/acceso') {
        window.location.href = '/acceso';
      }
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserProvider>
      <DataProvider>
        <RouterProvider router={router} />
      </DataProvider>
    </UserProvider>
  </React.StrictMode>,
)