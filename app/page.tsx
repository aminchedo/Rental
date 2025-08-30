'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import App from '../App'

export default function HomePage() {
  const router = useRouter()
  
  // Since we're using client-side routing in the original app,
  // we'll render the App component directly
  return <App />
}