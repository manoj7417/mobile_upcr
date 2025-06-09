import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '../components/ComingSoon'

export const Route = createFileRoute('/solutions')({
  component: SolutionsPage,
})

function SolutionsPage() {
  return (
    <ComingSoon
      title="Solutions Coming Soon"
      description="Our comprehensive B2B solutions platform is under development. We're building powerful tools to streamline your business operations."
    />
  )
} 