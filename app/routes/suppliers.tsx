import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '../components/ComingSoon'

export const Route = createFileRoute('/suppliers')({
  component: SuppliersPage,
})

function SuppliersPage() {
  return (
    <ComingSoon
      title="Supplier Directory Coming Soon"
      description="Our verified supplier directory is being curated to ensure you connect with the best in the industry. Stay tuned for access to top-tier industrial suppliers."
    />
  )
} 