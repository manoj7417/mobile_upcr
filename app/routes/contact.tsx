import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '../components/ComingSoon'

export const Route = createFileRoute('/contact')({
  component: ContactPage,
})

function ContactPage() {
  return (
    <ComingSoon
      title="Contact Page Coming Soon"
      description="We're setting up our support channels to better assist you. In the meantime, you can reach us through the Resource Compass platform."
    />
  )
} 