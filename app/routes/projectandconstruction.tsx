import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { getProducts } from './api/product'
import { productCategoryEnum } from '../db/schema'

interface Product {
  id: number
  name: string
  description: string
  price: string
  image: string
  category: typeof productCategoryEnum.enumValues[number]
  brand_name: string | null
  model: string | null
  material: string | null
  color: string | null
  packaging_details: string | null
  delivery_info: string | null
  supply_ability: string | null
  moq: number | null
  seller_id: number
  created_at: Date
  updated_at: Date
}

interface Resource {
  name: string
  icon: string
  description: string
  category: typeof productCategoryEnum.enumValues[number]
  products: Product[]
}

export const Route = createFileRoute('/projectandconstruction')({
  component: ProjectAndConstructionPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      category: search.category as string | undefined
    }
  }
})

function ProjectAndConstructionPage() {
  const { category } = useSearch({ from: '/projectandconstruction' })
  const [selectedCategory, setSelectedCategory] = useState<typeof productCategoryEnum.enumValues[number] | 'all'>(
    category as typeof productCategoryEnum.enumValues[number] || 'all'
  )
  const carouselRef = useRef<HTMLDivElement>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await getProducts({ data: {} })
        if (result.success && result.products) {
          setProducts(result.products as Product[])
        } else {
          setError(result.error || 'Failed to fetch products')
        }
      } catch (err) {
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Animate hero text on mount
  useEffect(() => {
    const hero = document.getElementById('hero-text')
    if (hero) {
      hero.classList.add('animate-fadein')
    }
  }, [])

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory)

  // Helper: get product count for each category
  const getProductCount = (cat: typeof productCategoryEnum.enumValues[number]) => {
    return products.filter(p => p.category === cat).length
  }

  // For scroll hint chevrons
  const tabScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!tabScrollRef.current) return
      const { scrollLeft, scrollWidth, clientWidth } = tabScrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1)
    }
    const ref = tabScrollRef.current
    if (ref) {
      ref.addEventListener('scroll', handleScroll)
      handleScroll()
    }
    return () => {
      if (ref) ref.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Add scroll chevron click handlers
  const scrollTabs = (dir: 'left' | 'right') => {
    if (!tabScrollRef.current) return;
    const { clientWidth } = tabScrollRef.current;
    const scrollAmount = Math.floor(clientWidth * 0.7);
    tabScrollRef.current.scrollBy({
      left: dir === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 mb-8">
        <img
          src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Project and Construction"
          className="absolute inset-0 w-full h-full object-cover object-center rounded-b-3xl shadow-lg"
        />
        <div className="absolute inset-0 bg-black/40 rounded-b-3xl" />
        <div id="hero-text" className="absolute bottom-0 left-0 right-0 pb-8 px-4 flex flex-col items-center text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 animate-slidein" style={{textShadow: '0 2px 8px rgba(0,0,0,0.7)'}}>
            Project & Construction Resources
          </h1>
          <p className="text-white text-lg sm:text-xl max-w-2xl animate-slidein delay-150" style={{textShadow: '0 2px 8px rgba(0,0,0,0.6)'}}>
            Access a comprehensive range of construction resources, from land and machinery to materials and skilled manpower.
          </p>
        </div>
      </div>

      {/* Plain Tabs Bar without Background Gradient or Chevrons */}
      <div className="sticky top-0 z-30 bg-white py-4 mb-10 mx-2">
        <div className="relative max-w-5xl mx-auto px-2">
          <div
            ref={tabScrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 px-2 relative snap-x snap-mandatory md:justify-center md:flex-wrap md:overflow-x-visible md:pb-0"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            <button
              onClick={() => setSelectedCategory('all')}
              className={`group relative flex items-center gap-2 px-7 py-2 rounded-full font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95 shadow-md border-2 ${
                selectedCategory === 'all'
                  ? 'bg-white text-blue-700 border-blue-500 shadow-lg ring-2 ring-blue-200'
                  : 'bg-blue-100 text-blue-700 border-blue-100 hover:bg-blue-200 hover:shadow-lg'
              }`}
            >
              <span className="text-xl">🏢</span>
              <span className="text-base font-semibold">All</span>
              {selectedCategory === 'all' && (
                <span className="absolute left-1/2 -bottom-2 w-10 h-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg -translate-x-1/2 animate-tabactive" />
              )}
            </button>
            {productCategoryEnum.enumValues.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`group relative flex items-center gap-2 px-7 py-2 rounded-full font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95 shadow-md border-2 ${
                  selectedCategory === category
                    ? 'bg-white text-blue-700 border-blue-500 shadow-lg ring-2 ring-blue-200'
                    : 'bg-blue-100 text-blue-700 border-blue-100 hover:bg-blue-200 hover:shadow-lg'
                }`}
              >
                <span className="text-xl">{getCategoryIcon(category)}</span>
                <span className="text-base font-semibold">{category}</span>
                {/* Product count badge */}
                <span className="ml-2 bg-yellow-200 text-yellow-800 text-xs font-bold rounded-full px-2 py-0.5 shadow border border-yellow-300">
                  {getProductCount(category)}
                </span>
                {/* Active indicator */}
                {selectedCategory === category && (
                  <span className="absolute left-1/2 -bottom-2 w-10 h-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg -translate-x-1/2 animate-tabactive" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Features Cards Section */}
      <div className="max-w-6xl mx-auto px-4 mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Verified Suppliers */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center border border-blue-100">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 mb-3 shadow">
            <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </div>
          <h3 className="text-lg font-bold text-blue-800 mb-2">Verified Suppliers</h3>
          <p className="text-blue-900/80">All resources are from verified and trusted suppliers in the industry.</p>
        </div>
        {/* Quality Assurance */}
        <div className="bg-gradient-to-br from-green-50 via-white to-green-100 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center border border-green-100">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-100 mb-3 shadow">
            <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 className="text-lg font-bold text-green-800 mb-2">Quality Assurance</h3>
          <p className="text-green-900/80">Every resource meets our strict quality standards and requirements.</p>
        </div>
        {/* 24/7 Support */}
        <div className="bg-gradient-to-br from-yellow-50 via-white to-yellow-100 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center border border-yellow-100">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-yellow-100 mb-3 shadow">
            <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
          </div>
          <h3 className="text-lg font-bold text-yellow-800 mb-2">24/7 Support</h3>
          <p className="text-yellow-900/80">Get assistance anytime with our dedicated support team.</p>
        </div>
      </div>

      {/* Section Divider */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="border-b border-blue-100 mb-8" />
      </div>

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 flex flex-col relative group"
            >
              <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg" title={product.category}>{getCategoryIcon(product.category)}</span>
                    <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-gray-500 font-normal">Price:</span>
                  <span className="text-blue-600 font-medium text-base">₹{product.price}</span>
                </div>
                <button
                  className="w-full mt-3 bg-blue-600 text-white py-1.5 px-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                  onClick={() => navigate({ to: `/product/${product.id}` })}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        .animate-fadein { opacity: 1 !important; transition: opacity 1s; }
        .animate-slidein { 
          animation: slidein 0.7s cubic-bezier(.4,0,.2,1) both;
          opacity: 1;
        }
        .animate-slidein.delay-150 { animation-delay: 0.15s; }
        .animate-slidein.delay-300 { animation-delay: 0.3s; }
        @keyframes slidein {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-tabactive { animation: tabactive 0.3s cubic-bezier(.4,0,.2,1) both; }
        @keyframes tabactive {
          from { width: 0; opacity: 0; }
          to { width: 2rem; opacity: 1; }
        }
        .animate-bounce-x {
          animation: bounce-x 1.2s infinite alternate;
        }
        @keyframes bounce-x {
          0% { transform: translateY(-50%) scale(1); }
          100% { transform: translateY(-50%) scale(1.2) translateX(4px); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}

// Helper function to get category icons
function getCategoryIcon(category: typeof productCategoryEnum.enumValues[number]): string {
  const icons: Record<typeof productCategoryEnum.enumValues[number], string> = {
    'Land': '🌍',
    'Machines': '🚛',
    'Material': '🏗️',
    'Equipment': '⚡',
    'Tools': '🔧',
    'Manpower': '👥'
  }
  return icons[category] || '🏢'
} 