import React from 'react'
import ReactDOM from 'react-dom/client'
import PricingCalculator from './components/PricingCalculator.tsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PricingCalculator />
  </React.StrictMode>,
)
