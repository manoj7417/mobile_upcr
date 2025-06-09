import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '../components/ComingSoon'

export const Route = createFileRoute('/categories')({
  component: CategoriesPage,
})

function CategoriesPage() {
  return (
    <ComingSoon
      title="Categories Coming Soon"
      description="We're organizing our extensive catalog of industrial categories to help you find exactly what you need. Check back soon!"
    />
  )
} 