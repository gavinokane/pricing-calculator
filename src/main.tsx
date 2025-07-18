﻿import React from 'react'
import ReactDOM from 'react-dom/client'
import AccessControlWrapper from './components/AccessControlWrapper.tsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AccessControlWrapper />
  </React.StrictMode>,
)
