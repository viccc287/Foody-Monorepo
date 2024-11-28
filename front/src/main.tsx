import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Layout from './Layout.tsx'
import tokenService from "@/services/tokenService.ts";
import {setupFetchInterceptor} from "@/services/tokenInterceptor.ts";

setupFetchInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Layout />
  </StrictMode>,
)
