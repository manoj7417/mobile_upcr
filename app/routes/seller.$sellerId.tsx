import { createFileRoute, Link } from '@tanstack/react-router'
import { getSellerById } from '@/routes/api/seller'
import { getSellerAnnouncements } from '@/routes/api/announcements'
import { getSellerProducts } from '@/routes/api/product'
import { getSellerGigs, getSellerPortfolio } from '@/routes/api/seller'
import { useState } from 'react'

// Define the PortfolioItem type
type PortfolioItem = {
  image_url: string;
  title: string;
  description: string;
};

// Define the Seller type to match the schema
type Seller = {
  id: number
  user_id: string
  company_name: string
  business_type: string
  address: string
  phone: string
  email?: string | null
  website?: string | null
  description?: string | null
  profile_picture_url?: string | null
  aadhar_url?: string | null
  gst_certificate_url?: string | null
  work_photos_urls?: string[] | null
  owner_photos_urls?: string[] | null
  skills?: string[]
  languages?: string[]
  portfolio_urls?: string[]
  portfolio?: PortfolioItem[]
  is_verified: boolean
  created_at: string
  updated_at: string
}

export const Route = createFileRoute('/seller/$sellerId')({
  component: SellerProfile,
  loader: async ({ params }) => {
    console.log('Loading seller profile for ID:', params.sellerId);
    const sellerResult = await getSellerById({ data: { sellerId: parseInt(params.sellerId) } })
    if (!sellerResult.success) {
      throw new Error(sellerResult.error)
    }
    const productsResult = await getSellerProducts({ data: { sellerId: parseInt(params.sellerId) } })
    if (!productsResult.success) {
      throw new Error(productsResult.error)
    }
    const gigsResult = await getSellerGigs({ data: { sellerId: parseInt(params.sellerId) } })
    if (!gigsResult.success) {
      throw new Error(gigsResult.error)
    }
    // Fetch portfolio
    console.log('Fetching portfolio for seller ID:', params.sellerId);
    const portfolioResult = await getSellerPortfolio({ data: { sellerId: parseInt(params.sellerId) } })
    console.log('Portfolio result:', portfolioResult);
    
    // Ensure portfolio is an array and has the correct structure
    const portfolio = portfolioResult.success && Array.isArray(portfolioResult.portfolio)
      ? portfolioResult.portfolio.map(item => ({
          image_url: item.image_url,
          title: item.title,
          description: item.description
        }))
      : []
    console.log('Processed portfolio:', portfolio);

    return {
      seller: sellerResult.seller,
      products: productsResult.products || [],
      gigs: gigsResult.gigs || [],
      portfolio
    }
  }
})

function SellerProfile() {
  const { seller, gigs, portfolio } = Route.useLoaderData()
  const skills = seller.skills || []
  const languages = seller.languages || []
  const [currentPortfolio, setCurrentPortfolio] = useState(0)
  const [openGigModal, setOpenGigModal] = useState<number | null>(null)
  const [openPortfolioModal, setOpenPortfolioModal] = useState<number | null>(null)
  const [openContactModal, setOpenContactModal] = useState(false)

  // Contact Modal Component
  const ContactModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-0 relative overflow-hidden animate-fadeIn">
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10" 
          onClick={() => setOpenContactModal(false)}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="bg-gradient-to-br from-blue-100 to-blue-300 p-6">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={seller.profile_picture_url || '/avatar-placeholder.png'}
              alt={seller.company_name}
              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow"
            />
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">{seller.company_name}</h2>
              <p className="text-neutral-600">{seller.business_type}</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-neutral-700">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Phone Number</p>
                <a href={`tel:${seller.phone}`} className="text-lg font-medium text-neutral-900 hover:text-blue-600 transition">
                  {seller.phone}
                </a>
              </div>
            </div>
            
            {seller.website && (
              <div className="flex items-center gap-3 text-neutral-700">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Website</p>
                  <a 
                    href={seller.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-lg font-medium text-neutral-900 hover:text-blue-600 transition"
                  >
                    {seller.website}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-neutral-700">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Address</p>
                <p className="text-lg font-medium text-neutral-900">{seller.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Update all Contact Me buttons to use the modal
  const handleContactClick = () => {
    setOpenContactModal(true)
  }

  return (
    <div className="bg-neutral-50 min-h-screen py-8">
      {/* Back Navigation */}
      <div className="container mx-auto px-4 mb-6">
        <Link to="/" className="inline-flex items-center gap-2  hover:text-blue-800 font-medium text-base">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          Back to Home
        </Link>
      </div>
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Column */}
        <div className="lg:col-span-2 flex flex-col items-start">
          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-10 w-full">
            <img
              src={seller.profile_picture_url || '/avatar-placeholder.png'}
              alt={seller.company_name}
              className="w-28 h-28 rounded-full object-cover border-4 border-neutral-100 shadow"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-neutral-900 mb-1 truncate">{seller.company_name}</h1>
              <div className="flex items-center gap-2 text-yellow-500 mb-1">
                <span className="text-xl">★</span>
                <span className="text-base text-neutral-600">No ratings yet</span>
              </div>
              <div className="text-neutral-600 text-base">{seller.business_type}</div>
              <div className="text-neutral-500 text-sm mt-1 truncate">📍 {seller.address}</div>
            </div>
          </div>

          {/* About Me + Languages + Skills */}
          <div className="mb-8 w-full">
            <h2 className="text-xl font-bold mb-4 text-black">About Me</h2>
            <div className="text-neutral-700 mb-6">
              {seller.description || <span className="italic text-neutral-400">No description provided</span>}
            </div>
            {/* Languages Section */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-black">Languages</h3>
              {languages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang, idx) => (
                    <span key={idx} className="px-3 py-1 border border-black text-black rounded-full text-sm">{lang}</span>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-neutral-400">No languages added</div>
              )}
            </div>
            {/* Skills Section */}
            <div>
              <h3 className="text-lg font-semibold mb-2 text-black">Skills</h3>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 border border-black text-black rounded-full text-sm">{skill}</span>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-neutral-400">No skills added</div>
              )}
            </div>
          </div>

          {/* Gigs Section */}
          <div className="mb-8 w-full">
            <h2 className="text-xl font-bold mb-4 text-black">My Work</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {gigs.length > 0 ? gigs.map((gig, idx) => (
                <div
                  key={gig.id}
                  className="bg-white rounded-2xl flex flex-col overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400 transition"
                  onClick={() => setOpenGigModal(idx)}
                >
                  <div className="relative">
                    <img
                      src={gig.image_url || '/gig-placeholder.png'}
                      alt={gig.title}
                      className="w-full h-40 object-cover rounded-t-2xl"
                    />
                  </div>
                  <div className="px-4 pt-2 pb-3 flex-1 flex flex-col gap-1">
                    <div className="font-bold text-neutral-900 text-base truncate mb-1">{gig.title}</div>
                    <div className="text-lg font-bold text-green-700 mb-1">₹{gig.price}</div>
                    <div className="text-neutral-600 text-sm line-clamp-2">{gig.description}</div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-12 text-neutral-400">No gigs available</div>
              )}
            </div>
          </div>

          {/* Gig Modal */}
          {openGigModal !== null && gigs[openGigModal] && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-0 relative overflow-hidden animate-fadeIn">
                <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10" onClick={() => setOpenGigModal(null)}>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="bg-gradient-to-br from-blue-100 to-blue-300 p-6 flex flex-col items-center">
                  <img src={gigs[openGigModal].image_url || '/gig-placeholder.png'} alt={gigs[openGigModal].title} className="w-full max-w-xs h-48 object-cover rounded-xl shadow mb-4 border-4 border-white" />
                  <div className="inline-block px-4 py-1 bg-green-100 text-green-700 font-bold rounded-full text-lg shadow mb-2">₹{gigs[openGigModal].price}</div>
                  <div className="text-2xl font-bold text-neutral-900 mb-1 text-center">{gigs[openGigModal].title}</div>
                </div>
                <div className="px-6 pb-6 pt-4">
                  <div className="text-neutral-700 mb-6 text-center whitespace-pre-line">{gigs[openGigModal].description}</div>
                  <div className="flex justify-center">
                    <button 
                      onClick={handleContactClick}
                      className="w-full max-w-xs py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 text-lg shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 8.25V6.75A2.25 2.25 0 0018.75 4.5h-13.5A2.25 2.25 0 003 6.75v10.5A2.25 2.25 0 005.25 19.5h13.5A2.25 2.25 0 0021 17.25v-1.5" />
                      </svg>
                      Contact Me
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Portfolio Section */}
          <div className="mb-10 w-full">
            <h2 className="text-xl font-bold mb-4 text-black">Portfolio</h2>
            {portfolio && portfolio.length > 0 ? (
              <div className="relative w-full">
                {/* Slider */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-lg border border-neutral-200">
                  <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${currentPortfolio * 100}%)` }}>
                    {portfolio.map((item: PortfolioItem, idx: number) => (
                      <div
                        key={idx}
                        className="min-w-full flex flex-col md:flex-row items-stretch cursor-pointer hover:ring-2 hover:ring-blue-400 transition"
                        onClick={() => setOpenPortfolioModal(idx)}
                      >
                        {/* Image */}
                        <div className="md:w-2/5 w-full flex items-center justify-center p-4 md:p-8 bg-gradient-to-br ">
                          <img
                            src={item.image_url}
                            alt={item.title || 'Portfolio Image'}
                            className="w-full h-56 md:h-72 object-contain rounded-xl shadow"
                          />
                        </div>
                        {/* Details */}
                        <div className="md:w-3/5 w-full flex flex-col justify-center p-4 md:p-8">
                          <div className="text-xl md:text-2xl font-bold text-neutral-900 mb-2">{item.title}</div>
                          <div className="text-neutral-700 text-sm md:text-base mb-3">{item.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Arrows */}
                {portfolio.length > 1 && (
                  <>
                    <button
                      className="absolute top-1/2 left-0 -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-700 rounded-full p-2 shadow transition disabled:opacity-30"
                      onClick={() => setCurrentPortfolio((prev) => Math.max(prev - 1, 0))}
                      disabled={currentPortfolio === 0}
                      aria-label="Previous"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                      className="absolute top-1/2 right-0 -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-700 rounded-full p-2 shadow transition disabled:opacity-30"
                      onClick={() => setCurrentPortfolio((prev) => Math.min(prev + 1, portfolio.length - 1))}
                      disabled={currentPortfolio === portfolio.length - 1}
                      aria-label="Next"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </>
                )}
                {/* Dots */}
                {portfolio.length > 1 && (
                  <div className="flex justify-center mt-4 gap-2">
                    {portfolio.map((_, idx) => (
                      <button
                        key={idx}
                        className={`w-3 h-3 rounded-full ${currentPortfolio === idx ? 'bg-blue-600' : 'bg-gray-300'} transition`}
                        onClick={() => setCurrentPortfolio(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-neutral-400 text-center py-8">No portfolio items available</div>
            )}
          </div>

          {/* Portfolio Modal */}
          {openPortfolioModal !== null && portfolio[openPortfolioModal] && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-0 relative overflow-hidden animate-fadeIn">
                <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10" onClick={() => setOpenPortfolioModal(null)}>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-6 flex flex-col items-center">
                  <img src={portfolio[openPortfolioModal].image_url} alt={portfolio[openPortfolioModal].title} className="w-full max-w-xs h-48 object-contain rounded-xl shadow mb-4 border-4 border-white" />
                  <div className="text-2xl font-bold text-neutral-900 mb-1 text-center">{portfolio[openPortfolioModal].title}</div>
                </div>
                <div className="px-6 pb-6 pt-4">
                  <div className="text-neutral-700 mb-6 text-center whitespace-pre-line">{portfolio[openPortfolioModal].description}</div>
                  <div className="flex justify-center">
                    <button 
                      onClick={handleContactClick}
                      className="w-full max-w-xs py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 text-lg shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 8.25V6.75A2.25 2.25 0 0018.75 4.5h-13.5A2.25 2.25 0 003 6.75v10.5A2.25 2.25 0 005.25 19.5h13.5A2.25 2.25 0 0021 17.25v-1.5" />
                      </svg>
                      Contact Me
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1 lg:sticky lg:top-10 flex flex-col items-start bg-white rounded-2xl shadow p-6 h-fit mt-10 lg:mt-0 border border-neutral-200">
          <div className="flex items-center gap-4 mb-4 w-full">
            <img
              src={seller.profile_picture_url || '/avatar-placeholder.png'}
              alt={seller.company_name}
              className="w-14 h-14 rounded-full object-cover border-2 border-neutral-100 shadow"
            />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-neutral-900 leading-tight">{seller.company_name}</h1>
              <div className="text-sm text-neutral-600 mt-1">Business Type: <span className="font-medium text-neutral-800">{seller.business_type}</span></div>
            </div>
          </div>
          <button 
            onClick={handleContactClick}
            className="w-full px-5 py-2 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-700 transition mb-4"
          >
            Contact Me
          </button>
          <div className="w-full flex flex-col gap-2 text-neutral-700 text-sm">
            {seller.website && (
              <a href={seller.website} target="_blank" rel="noopener noreferrer" className="hover:underline">🌐 {seller.website}</a>
            )}
            {seller.phone && <span>📞 {seller.phone}</span>}
          </div>
        </aside>
      </div>

      {/* Add the Contact Modal */}
      {openContactModal && <ContactModal />}
    </div>
  )
} 