// app/client.tsx

import { hydrateRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/react-start'
import { createRouter } from './router'
import './styles/globals.css'

// Create router
const router = createRouter()

// Hydrate the app
hydrateRoot(document, <StartClient router={router} />)