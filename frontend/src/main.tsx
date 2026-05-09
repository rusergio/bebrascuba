import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios';
// Configuración de rutas 
import { RouterProvider } from 'react-router-dom';
import { router } from './router/router.tsx';
import { UserProvider } from './context/UserContext.tsx';
import { DataProvider } from './context/DataContext.tsx';

const runtimeApiOrigin = import.meta.env.DEV
  ? '' // same-origin in dev; Vite proxy handles /api -> backend
  : (import.meta.env.VITE_API_ORIGIN || `${window.location.protocol}//${window.location.host}`);

axios.interceptors.request.use((config) => {
  if (!config.baseURL || config.baseURL.includes('localhost:8000') || config.baseURL.includes('127.0.0.1:8000')) {
    config.baseURL = runtimeApiOrigin;
  }
  return config;
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserProvider>
      <DataProvider>
        <RouterProvider router={router} />
      </DataProvider>
    </UserProvider>
  </React.StrictMode>,
)