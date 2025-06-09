import { createFileRoute } from '@tanstack/react-router'
import { DealRoom } from '../components/DealRoom/DealRoom'

export const Route = createFileRoute('/deals')({
  component: DealsPage,
})

function DealsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <DealRoom />
      </div>
    </div>
  )
} 