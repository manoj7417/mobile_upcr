import { createFileRoute, redirect, useRouteContext, Outlet, useRouter } from '@tanstack/react-router'
import { validateAccessToken } from './api/auth'
import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from '../components/Sidebar/Sidebar'
import { createSellerProfile, getSellerStatus, getSellerPortfolio, getSellerGigs } from './api/seller'
import { getSellerProducts, getProducts } from './api/product'
import { createAnnouncement, getSellerAnnouncements, updateAnnouncement, deactivateAnnouncement } from './api/announcements'
import { updateUserProfile } from './api/auth'
import { EditSellerModal } from '../components/EditSellerModal'
import { CreateProductModal } from '../components/CreateProductModal'
import { EditProductModal } from '../components/EditProductModal'
import { EditCompleteProfileModal } from '../components/EditCompleteProfileModal'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@supabase/supabase-js'
import { getCookie } from '@tanstack/react-start/server'
import { eq, and } from 'drizzle-orm'
import { db } from '../db'
import { sellers, portfolios, gigs } from '../db/schema'
import { getAuditLogs } from './api/audit-logs'
import { formatDistanceToNow } from 'date-fns'
import type { Product } from '../types'
import { products } from '../db/schema'
import { createAuditLog } from '../utils/auditLogger'

// Initialize S3 client with Supabase storage credentials
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/s3`,
  credentials: {
    accessKeyId: import.meta.env.VITE_SUPABASE_ACCESS_KEY,
    secretAccessKey: import.meta.env.VITE_SUPABASE_SECRET_ACCESS_KEY
  },
  forcePathStyle: true
})

// Zod schemas must be defined before usage in server functions
const updateSellerCompleteProfileSchema = z.object({
  sellerId: z.number(),
  skills: z.array(z.string()),
  languages: z.array(z.string()),
  portfolio: z.array(z.object({
    image_url: z.string(),
    title: z.string(),
    description: z.string(),
  })),
  gigs: z.array(z.object({
    title: z.string(),
    description: z.string(),
    image_url: z.string(),
    price: z.number(),
  })),
});

const uploadProfileImageSchema = z.object({
  file: z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
    data: z.string(),
  }),
  userId: z.string(),
});

// Add updateProductStatus schema and function
const updateProductStatusSchema = z.object({
  productId: z.number(),
  status: z.enum(['active', 'inactive'])
});

export const updateProductStatus = createServerFn({
  method: 'POST',
  response: 'data',
})
  .validator((data: unknown) => updateProductStatusSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      // Validate user token
      const authResult = await validateAccessToken()
      if (!authResult.success || !authResult.user) {
        return { success: false, error: 'Unauthorized' }
      }

      // Get the seller ID for the authenticated user
      const seller = await db
        .select()
        .from(sellers)
        .where(eq(sellers.user_id, parseInt(authResult.user.id, 10)))
        .limit(1)
        .then(res => res[0])

      if (!seller) {
        return { success: false, error: 'Seller profile not found' }
      }

      // Get the current product status
      const existingProduct = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.id, data.productId),
            eq(products.seller_id, seller.id)
          )
        )
        .limit(1)
        .then(res => res[0])

      if (!existingProduct) {
        return { success: false, error: 'Product not found or unauthorized' }
      }

      // Update product status in the database
      const [updatedProduct] = await db
        .update(products)
        .set({
          status: data.status,
          updated_at: new Date()
        })
        .where(eq(products.id, data.productId))
        .returning();

      if (!updatedProduct) {
        throw new Error('Product not found');
      }

      // Convert Date to string for type compatibility
      const productWithStringDates = {
        ...updatedProduct,
        created_at: updatedProduct.created_at.toISOString(),
        updated_at: updatedProduct.updated_at.toISOString()
      };

      // Create audit log for status change
      await createAuditLog({
        userId: parseInt(authResult.user.id, 10),
        sellerId: seller.id,
        entityType: 'PRODUCT',
        entityId: data.productId,
        action: data.status === 'active' ? 'ACTIVATE' : 'DEACTIVATE',
        changes: {
          status: {
            from: existingProduct.status,
            to: data.status
          }
        }
      })

      return { success: true, product: productWithStringDates };
    } catch (error) {
      console.error('Error updating product status:', error);
      return { success: false, error: 'Failed to update product status' };
    }
  });

type User = {
  id: string
  name: string
  email: string
  profile_image_url?: string | null
  resources?: string[]
  primaryResource?: string[]
  is_admin?: boolean
}

type Seller = {
  id: number
  user_id: string
  company_name: string
  business_type: string
  address: string
  phone: string
  website?: string | null
  description?: string | null
  is_verified: boolean
  created_at: string
  updated_at: string
  aadhar_url?: string | null
  gst_certificate_url?: string | null
  work_photos_urls?: string[] | null
  owner_photos_urls?: string[] | null
  skills?: string[]
  languages?: string[]
  portfolio_urls?: string[]
  gigs?: {
    image_url: string
    title: string
    description: string
    price: number
  }[]
  portfolio?: { image_url: string; title: string; description: string }[]
}

// Add type for API response
type APIAnnouncement = {
  id: number;
  seller_id: number;
  category: string;
  subcategory: string;
  title: string;
  description: string;
  icon: string;
  details: string;
  ad_type?: 'scroll' | 'flip';
  status: 'active' | 'inactive' | 'pending';
  start_date: string;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
}

type AppSearch = {
  tab?: 'seller' | 'profile' | 'audit-logs' | 'dashboard'
}

// Define category structure for the form dropdowns
const announcementCategories = {
  'PROJECT & CONSTRUCTION RESOURCES': ['Land', 'Machines', 'Material', 'Equipment', 'Tools', 'Manpower'],
  'BUSINESS RESOURCES': ['Finance', 'Tenders', 'Showcase', 'Auction'],
  'STUDENT RESOURCES': ['Jobs', 'E-Stores']
} as const; // Use 'as const' for stricter typing if needed elsewhere

type AnnouncementCategory = keyof typeof announcementCategories;

type ProfileForm = {
  name: string
  profile_image_url: string | null | undefined
  resources: string[]
  primaryResource: string[]
}

type AnnouncementFormState = {
  title: string;
  description: string;
  icon: string;
  details: string;
  category: string;
  subcategory: string;
  ad_type: 'scroll' | 'flip';
  start_date: string;
  end_date: string;
}

const initialAnnouncementFormState: AnnouncementFormState = {
  title: '',
  description: '',
  icon: '',
  details: '',
  category: '',
  subcategory: '',
  ad_type: 'scroll',
  start_date: '',
  end_date: '',
};

// Add this helper function at the top level
const getReadableErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  
  // If it's a validation error array
  if (Array.isArray(error)) {
    return error.map(err => {
      if (err.path && err.message) {
        const field = err.path[err.path.length - 1];
        switch (field) {
          case 'icon': return 'Please upload an image or provide an icon';
          case 'title': return 'Please enter a title';
          case 'description': return 'Please provide a short description';
          case 'details': return 'Please provide full details';
          case 'category': return 'Please select a category';
          case 'subcategory': return 'Please select a subcategory';
          case 'start_date': return 'Please select a valid start date';
          case 'end_date': return 'Please select a valid end date';
          default: return err.message;
        }
      }
      return err.message || 'An error occurred';
    }).join('. ');
  }

  // If it's an object with an error message
  if (error?.message) return error.message;
  
  return 'An unexpected error occurred. Please try again.';
}

export const Route = createFileRoute('/app')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    const validTabs = ['seller', 'profile', 'audit-logs', 'dashboard'] as const
    const tab = search.tab as string
    const isValidTab = validTabs.includes(tab as any)
    
    return {
      tab: isValidTab ? (tab as 'seller' | 'profile' | 'audit-logs' | 'dashboard') : 'seller'
    }
  },
  beforeLoad: async () => {
    const result = await validateAccessToken()
    if (!result.success || !result.user) {
      throw redirect({
        to: '/login',
        search: { redirect: '/app' }
      })
    }
    return { user: result.user }
  }
})

export function RouteComponent() {
  const { user, search } = useRouteContext({ from: '/app' }) as { user: User, search: AppSearch }
  const router = useRouter()
  const { state: { location } } = router
  const isMainAppRoute = location.pathname === '/app' || location.pathname === '/app/'
  
  const [activeTab, setActiveTab] = useState<'seller' | 'profile' | 'audit-logs' | 'dashboard'>(search?.tab || 'seller')
  const [showCreateProductModal, setShowCreateProductModal] = useState(false)
  const [showEditProductModal, setShowEditProductModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  // Add audit logs state
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [selectedEntityType, setSelectedEntityType] = useState<string>('')
  const [selectedAction, setSelectedAction] = useState<string>('')
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  
  const [isSeller, setIsSeller] = useState<boolean>(false)
  const [seller, setSeller] = useState<Seller | null>(null)
  const [isLoadingSellerStatus, setIsLoadingSellerStatus] = useState(true)
  const [isSubmittingOnboarding, setIsSubmittingOnboarding] = useState(false)
  const [onboardingError, setOnboardingError] = useState<string | null>(null)
  const [sellerStatusError, setSellerStatusError] = useState<string | null>(null);
  const [productCount, setProductCount] = useState<number>(0);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // --- Announcement Form State ---
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [isSubmittingAnnouncement, setIsSubmittingAnnouncement] = useState(false);
  const [announcementError, setAnnouncementError] = useState<string | null>(null);
  const [announcementForm, setAnnouncementForm] = useState<AnnouncementFormState>(initialAnnouncementFormState);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<number | null>(null); // State to track editing

  // Announcements List
  const [announcements, setAnnouncements] = useState<APIAnnouncement[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);
  const [announcementsError, setAnnouncementsError] = useState<string | null>(null);
  const [isDeactivating, setIsDeactivating] = useState<{[key: number]: boolean}>({}); // Track deactivation state per announcement

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: user.name,
    profile_image_url: user.profile_image_url,
    resources: user.resources || [],
    primaryResource: user.primaryResource || []
  })
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const [onboardingForm, setOnboardingForm] = useState({
    company_name: '',
    business_type: '',
    address: '',
    phone: '',
    website: '',
    description: '',
    aadhar: null as File | null,
    gst_certificate: null as File | null,
    work_photos: [] as File[],
    owner_photos: [] as File[]
  })

  const [previewUrls, setPreviewUrls] = useState({
    aadhar: null as string | null,
    gst_certificate: null as string | null,
    work_photos: [] as string[],
    owner_photos: [] as string[]
  })

  const [isEditCompleteProfileOpen, setIsEditCompleteProfileOpen] = useState(false)

  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(false)
  const [auditLogsError, setAuditLogsError] = useState<string | null>(null)

  const [products, setProducts] = useState<Product[]>([]);

  const fetchSellerStatusServer = useCallback(async () => {
    setIsLoadingSellerStatus(true);
    setSellerStatusError(null);
    try {
      const result = await getSellerStatus({ data: { userId: user.id } }); 
      if (result.success && result.seller) {
        let sellerObj = result.seller;
        // Fetch portfolio
        const portfolioRes = await getSellerPortfolio({ data: { sellerId: sellerObj.id } });
        let portfolio: { image_url: string; title: string; description: string }[] = [];
        if (portfolioRes.success && Array.isArray(portfolioRes.portfolio)) {
          portfolio = portfolioRes.portfolio.map((item: any) => ({
            image_url: item.image_url,
            title: item.title || '',
            description: item.description || ''
          }));
        }
        // Fetch gigs
        const gigsRes = await getSellerGigs({ data: { sellerId: sellerObj.id } });
        let gigsArr: any[] = [];
        if (gigsRes.success && Array.isArray(gigsRes.gigs)) {
          gigsArr = gigsRes.gigs.map((gig: any) => ({
            title: gig.title,
            description: gig.description,
            image_url: gig.image_url,
            price: parseFloat(gig.price)
          }));
        }
        // Fetch products count
        setIsLoadingProducts(true);
        const productsRes = await getSellerProducts({ data: { sellerId: sellerObj.id } });
        if (productsRes.success && Array.isArray(productsRes.products)) {
          setProductCount(productsRes.products.length);
        }
        setIsLoadingProducts(false);

        setIsSeller(result.isSeller);
        setSeller({ ...sellerObj, portfolio, gigs: gigsArr });
      } else if (result.success) {
        setIsSeller(result.isSeller);
        setSeller(null);
        setSellerStatusError(null);
      } else {
        setIsSeller(false);
        setSeller(null);
        setSellerStatusError(result.error || 'Failed to check seller status.');
      }
    } catch (error) {
      setSellerStatusError(error instanceof Error ? error.message : 'Client-side error checking status.');
      setIsSeller(false);
      setSeller(null);
    } finally {
      setIsLoadingSellerStatus(false);
    }
  }, [user.id]);

  // Inside the fetchAnnouncements function
  const fetchAnnouncements = useCallback(async () => {
    if (!seller || typeof seller.id !== 'number') { 
      setAnnouncements([]); 
      return; 
    }
    
    setIsLoadingAnnouncements(true);
    setAnnouncementsError(null);
    try {
      const result = await getSellerAnnouncements({ data: { sellerId: seller.id } }); 
      
      if (result.success) {
        // Transform the response to ensure ad_type is present
        const announcements = (result.announcements as APIAnnouncement[]).map(announcement => ({
          ...announcement,
          ad_type: announcement.ad_type || 'scroll'
        }));
        setAnnouncements(announcements);
      } else {
        if (result.error?.includes('Unauthorized')) {
          setAnnouncementsError('Your session has expired. Please log in again.');
          const searchString = location.search ? new URLSearchParams(location.search as Record<string, string>).toString() : '';
          const redirectTarget = searchString ? `${location.pathname}?${searchString}` : location.pathname;
          router.navigate({ to: '/login', search: { redirect: redirectTarget }, replace: true });
        } else {
          setAnnouncementsError(result.error || 'Failed to load announcements.');
        }
        setAnnouncements([]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Client error fetching announcements.';
      if (message.includes('Unauthorized')) { 
        setAnnouncementsError('Your session has expired. Please log in again.');
        const searchString = location.search ? new URLSearchParams(location.search as Record<string, string>).toString() : '';
        const redirectTarget = searchString ? `${location.pathname}?${searchString}` : location.pathname;
        router.navigate({ to: '/login', search: { redirect: redirectTarget }, replace: true });
      } else {
        setAnnouncementsError(message);
      }
      setAnnouncements([]);
    } finally {
      setIsLoadingAnnouncements(false);
    }
  }, [seller, location.pathname, location.search, router]);

  useEffect(() => {
    fetchSellerStatusServer();
  }, [fetchSellerStatusServer]);

  useEffect(() => {
    if (isSeller && seller) {
      fetchAnnouncements(); // Uncommented call
    }
    if (!isSeller) {
        setAnnouncements([]);
    }
  }, [isSeller, seller, fetchAnnouncements]);

  useEffect(() => {
    if (activeTab === 'audit-logs' && user.is_admin) {
      // Fetch audit logs when the tab is selected
      fetchAuditLogs();
    }
  }, [activeTab, selectedEntityType, selectedAction, fromDate, toDate]);

  useEffect(() => {
    if (seller?.id) {
      fetchProducts();
    }
  }, [seller?.id]);

  const fetchProducts = async () => {
    if (!seller?.id) return;
    
    setIsLoadingProducts(true);
    try {
      const result = await getSellerProducts({ data: { sellerId: seller.id } });
      if (result.success && result.products) {
        // Convert Date objects to strings and show all products without filtering by status
        setProducts(result.products.map(p => ({
          ...p,
          image: p.image || '',
          created_at: p.created_at.toISOString(),
          updated_at: p.updated_at.toISOString()
        })));
        setProductCount(result.products.length);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowEditProductModal(true)
  }

  const handleCreateProduct = () => {
    setSelectedProduct(null)
    setShowCreateProductModal(true)
  }

  const handleDeactivateProduct = async (productId: number, newStatus: 'active' | 'inactive') => {
    try {
      const result = await updateProductStatus({ 
        data: { 
          productId, 
          status: newStatus
        } 
      });
      
      if (result.success) {
        // Update the product status in the local state
        setProducts(prevProducts => 
          prevProducts.map(p => 
            p.id === productId 
              ? { ...p, status: newStatus }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await getAuditLogs({
        data: {
          entityType: selectedEntityType || undefined,
          entityId: undefined,
          sellerId: undefined,
          action: selectedAction || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined
        }
      })
      if (response.success && response.logs) {
        setAuditLogs(response.logs)
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    }
  }

  const handleTabChange = (tab: 'seller' | 'profile' | 'audit-logs' | 'dashboard') => {
    setActiveTab(tab);
  };

  const handleUnderConstruction = (feature?: string) => {
    alert(feature ? `${feature} is under construction` : 'This feature is under construction');
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingOnboarding(true)
    setOnboardingError(null)

    try {
      // Upload Aadhar if provided
      let aadharUrl = null
      if (onboardingForm.aadhar) {
        const reader = new FileReader()
        reader.readAsDataURL(onboardingForm.aadhar)
        const base64Data = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string)
        })

        const uploadResult = await uploadProfileImage({
          data: {
            file: {
              name: onboardingForm.aadhar.name,
              type: onboardingForm.aadhar.type,
              size: onboardingForm.aadhar.size,
              data: base64Data
            },
            userId: user.id
          }
        })

        if (!uploadResult.success) {
          throw new Error('Failed to upload Aadhar')
        }
        aadharUrl = uploadResult.url
      }

      // Upload GST Certificate if provided
      let gstCertificateUrl = null
      if (onboardingForm.gst_certificate) {
        const reader = new FileReader()
        reader.readAsDataURL(onboardingForm.gst_certificate)
        const base64Data = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string)
        })

        const uploadResult = await uploadProfileImage({
          data: {
            file: {
              name: onboardingForm.gst_certificate.name,
              type: onboardingForm.gst_certificate.type,
              size: onboardingForm.gst_certificate.size,
              data: base64Data
            },
            userId: user.id
          }
        })

        if (!uploadResult.success) {
          throw new Error('Failed to upload GST Certificate')
        }
        gstCertificateUrl = uploadResult.url
      }

      // Upload Work Photos if provided
      const workPhotoUrls = []
      if (onboardingForm.work_photos.length > 0) {
        for (const photo of onboardingForm.work_photos) {
          const reader = new FileReader()
          reader.readAsDataURL(photo)
          const base64Data = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string)
          })

          const uploadResult = await uploadProfileImage({
            data: {
              file: {
                name: photo.name,
                type: photo.type,
                size: photo.size,
                data: base64Data
              },
              userId: user.id
            }
          })

          if (!uploadResult.success) {
            throw new Error('Failed to upload work photo')
          }
          workPhotoUrls.push(uploadResult.url)
        }
      }

      // Upload Owner Photos if provided
      const ownerPhotoUrls = []
      if (onboardingForm.owner_photos.length > 0) {
        for (const photo of onboardingForm.owner_photos) {
          const reader = new FileReader()
          reader.readAsDataURL(photo)
          const base64Data = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string)
          })

          const uploadResult = await uploadProfileImage({
            data: {
              file: {
                name: photo.name,
                type: photo.type,
                size: photo.size,
                data: base64Data
              },
              userId: user.id
            }
          })

          if (!uploadResult.success) {
            throw new Error('Failed to upload owner photo')
          }
          ownerPhotoUrls.push(uploadResult.url)
        }
      }

      const payload = {
        userId: user.id,
        company_name: onboardingForm.company_name,
        business_type: onboardingForm.business_type,
        address: onboardingForm.address,
        phone: onboardingForm.phone,
        website: onboardingForm.website || null,
        description: onboardingForm.description || null,
        aadhar_url: aadharUrl,
        gst_certificate_url: gstCertificateUrl,
        work_photos_urls: workPhotoUrls.length > 0 ? workPhotoUrls : null,
        owner_photos_urls: ownerPhotoUrls.length > 0 ? ownerPhotoUrls : null
      }

      const result = await createSellerProfile({ data: payload })

      if (result.success) {
        setIsSeller(true)
        setSeller(result.seller)
      } else {
        if (result.error?.includes('Unauthorized')) {
          setOnboardingError('Your session has expired. Please log in again.')
          const searchString = location.search ? new URLSearchParams(location.search as Record<string, string>).toString() : ''
          const redirectTarget = searchString ? `${location.pathname}?${searchString}` : location.pathname
          
          router.navigate({
            to: '/login',
            search: { redirect: redirectTarget },
            replace: true
          })
        } else {
          setOnboardingError(result.error || 'Failed to create profile.')
        }
      }
    } catch (error) {
      setOnboardingError('An unexpected error occurred while uploading files.')
    } finally {
      setIsSubmittingOnboarding(false)
    }
  }

  // Add this helper function for handling file changes
  const handleFileChange = (field: keyof typeof onboardingForm, files: FileList | null) => {
    if (!files) return

    if (field === 'work_photos' || field === 'owner_photos') {
      const newFiles = Array.from(files)
      setOnboardingForm(prev => ({
        ...prev,
        [field]: [...prev[field], ...newFiles]
      }))

      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file))
      setPreviewUrls(prev => ({
        ...prev,
        [field]: [...prev[field], ...newPreviewUrls]
      }))
    } else {
      const file = files[0]
      if (!file) return

      setOnboardingForm(prev => ({
        ...prev,
        [field]: file
      }))

      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setPreviewUrls(prev => ({
        ...prev,
        [field]: previewUrl
      }))
    }
  }

  // Add this helper function to remove files
  const removeFile = (field: keyof typeof onboardingForm, index: number) => {
    if (field === 'work_photos' || field === 'owner_photos') {
      setOnboardingForm(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }))
      setPreviewUrls(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }))
    } else {
      setOnboardingForm(prev => ({
        ...prev,
        [field]: null
      }))
      setPreviewUrls(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  // --- Helper function to prepare form for editing ---
  const handleEditAnnouncementClick = (ad: APIAnnouncement) => {
    setEditingAnnouncementId(ad.id);
    setAnnouncementForm({
      title: ad.title,
      description: ad.description,
      icon: ad.icon,
      details: ad.details,
      category: ad.category,
      subcategory: ad.subcategory,
      ad_type: ad.ad_type || 'scroll',
      start_date: ad.start_date.substring(0, 16),
      end_date: ad.end_date ? ad.end_date.substring(0, 16) : ''
    });
    setAnnouncementError(null);
    setShowAnnouncementForm(true);
  };

  // --- Modified Announcement Submit Handler ---
  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!seller) { 
      setAnnouncementError("Please complete your seller profile first.")
      return
    }

    // Client-side Date Validation
    if (announcementForm.end_date && announcementForm.start_date && 
        new Date(announcementForm.end_date) < new Date(announcementForm.start_date)) {
      setAnnouncementError("End date must be after the start date.")
      return
    }

    // Validate image is provided for new announcements
    if (!selectedImage && !announcementForm.icon) {
      setAnnouncementError("Please upload an image for your announcement.")
      return
    }

    setIsSubmittingAnnouncement(true)
    setAnnouncementError(null)

    const isEditing = editingAnnouncementId !== null

    try {
      let iconUrl = announcementForm.icon || ''

      // Handle image upload if a new image is selected
      if (selectedImage) {
        try {
          // Convert file to base64
          const reader = new FileReader()
          reader.readAsDataURL(selectedImage)
          const base64Data = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string)
          })

          const uploadResult = await uploadProfileImage({
            data: {
              file: {
                name: selectedImage.name,
                type: selectedImage.type,
                size: selectedImage.size,
                data: base64Data
              },
              userId: String(seller.id) // Use seller.id as userId for image uploads
            }
          })

          if (!uploadResult.success) {
            setAnnouncementError('Failed to upload image. Please try again.')
            setIsSubmittingAnnouncement(false)
            return
          }

          iconUrl = uploadResult.url || ''
        } catch (error) {
          setAnnouncementError('Failed to upload image. Please try again.')
          setIsSubmittingAnnouncement(false)
          return
        }
      }

      // Prepare payload
      const basePayload = {
        category: announcementForm.category,
        subcategory: announcementForm.subcategory,
        title: announcementForm.title.trim(),
        description: announcementForm.description.trim(),
        icon: iconUrl,
        details: announcementForm.details.trim(),
        ad_type: announcementForm.ad_type,
        start_date: announcementForm.start_date ? new Date(announcementForm.start_date).toISOString() : '',
        end_date: announcementForm.end_date ? new Date(announcementForm.end_date).toISOString() : undefined,
      }

      // Add specific fields for create or update
      const payload = isEditing
        ? { ...basePayload, announcementId: editingAnnouncementId!, sellerId: seller.id }
        : { ...basePayload, sellerId: seller.id }

      // Conditionally call create or update
      const result = isEditing 
        ? await updateAnnouncement({ data: payload })
        : await createAnnouncement({ data: payload })

      if (result.success) {
        const action = isEditing ? 'updated' : 'published'
        alert(`Announcement ${action} successfully!`)
        setShowAnnouncementForm(false)
        setAnnouncementForm(initialAnnouncementFormState)
        setEditingAnnouncementId(null)
        setSelectedImage(null)
        setImagePreview(null)
        fetchAnnouncements()
      } else {
        const errorMessage = getReadableErrorMessage(result.error)
        setAnnouncementError(errorMessage)
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'submitting'} announcement:`, error)
      const errorMessage = getReadableErrorMessage(error)
      setAnnouncementError(errorMessage)
    } finally {
      setIsSubmittingAnnouncement(false)
    }
  }
  
  // --- Modified Close/Cancel Form Logic ---
  const closeAnnouncementForm = () => {
    setShowAnnouncementForm(false)
    setAnnouncementError(null)
    setEditingAnnouncementId(null)
    setAnnouncementForm(initialAnnouncementFormState)
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingProfile(true)
    setProfileError(null)

    try {
      let profileImageUrl = profileForm.profile_image_url

      // Upload new image if selected
      if (selectedImage) {
        setIsUploadingImage(true)
        // Convert file to base64
        const reader = new FileReader()
        reader.readAsDataURL(selectedImage)
        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result
            if (typeof result === 'string') {
              resolve(result)
            } else {
              reject(new Error('Failed to read file'))
            }
          }
          reader.onerror = () => reject(new Error('Failed to read file'))
        })
        
        try {
          const result = await uploadProfileImage({ 
            data: {
              file: {
                name: selectedImage.name,
                type: selectedImage.type,
                size: selectedImage.size,
                data: base64Data
              }, 
              userId: user.id 
            }
          })
          if (!result.success || !result.url) {
            setProfileError(result.error || 'Failed to upload image')
            setIsUploadingImage(false)
            return
          }
          profileImageUrl = result.url
        } catch (error) {
          setProfileError(error instanceof Error ? error.message : 'Failed to upload image')
          setIsUploadingImage(false)
          return
        }
        setIsUploadingImage(false)
      }

      const result = await updateUserProfile({ 
        data: {
          name: profileForm.name,
          profile_image_url: profileImageUrl || null,
          resources: profileForm.resources,
          primaryResource: profileForm.primaryResource
        }
      })

      if (result.success) {
        router.invalidate()
        setIsEditingProfile(false)
        setSelectedImage(null)
        setImagePreview(null)
      } else {
        setProfileError(result.error || 'Failed to update profile')
      }
    } catch (error) {
      setProfileError('An unexpected error occurred')
    } finally {
      setIsSubmittingProfile(false)
    }
  }

  // Add this function near other handler functions
  const handleCompleteProfileSuccess = () => {
    fetchSellerStatusServer()
  }

  const handleDeactivateAnnouncement = async (id: number) => {
    if (!seller?.id) return;
    
    setIsDeactivating(prev => ({ ...prev, [id]: true }));
    try {
      const result = await deactivateAnnouncement({ 
        data: { 
          announcementId: id,
          sellerId: seller.id
        } 
      });
      if (result.success) {
        setIsDeactivating(prev => ({ ...prev, [id]: false }));
        fetchAnnouncements();
      } else {
        setIsDeactivating(prev => ({ ...prev, [id]: false }));
        console.error('Failed to deactivate announcement:', result.error);
      }
    } catch (error) {
      console.error('Error deactivating announcement:', error);
      setIsDeactivating(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleActivateAnnouncement = async (id: number) => {
    if (!seller?.id) return;
    
    setIsDeactivating(prev => ({ ...prev, [id]: true }));
    try {
      const result = await updateAnnouncement({ 
        data: { 
          announcementId: id,
          sellerId: seller.id,
          isActive: true
        } 
      });
      if (result.success) {
        setIsDeactivating(prev => ({ ...prev, [id]: false }));
        fetchAnnouncements();
      } else {
        setIsDeactivating(prev => ({ ...prev, [id]: false }));
        console.error('Failed to activate announcement:', result.error);
      }
    } catch (error) {
      console.error('Error activating announcement:', error);
      setIsDeactivating(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar - Hidden on mobile, shown on desktop */}
          <div className="hidden md:block">
            <Sidebar user={user} activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
          
          <div className="flex-1 px-6 pb-10 md:py-0">
            {isMainAppRoute && (
              <div className="space-y-6">
                {activeTab === 'dashboard' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-bold">Dashboard</h1>
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleUnderConstruction('New Message')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          New Message
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold mb-2">Active Deals</h3>
                        <p className="text-3xl font-bold text-blue-600">0</p>
                        <p className="text-sm text-gray-500 mt-2">Your ongoing deals</p>
                      </div>
                      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold mb-2">Messages</h3>
                        <p className="text-3xl font-bold text-green-600">0</p>
                        <p className="text-sm text-gray-500 mt-2">Unread messages</p>
                      </div>
                      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold mb-2">Published Ads</h3>
                        <p className="text-3xl font-bold text-purple-600">
                          {isLoadingAnnouncements ? '...' : announcements.length}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">Your active announcements</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Recent Messages */}
                      <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Recent Messages</h3>
                          <button
                            onClick={() => handleUnderConstruction('View All Messages')}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            View All
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div className="text-center py-8 text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <p>No messages yet</p>
                            <button
                              onClick={() => handleUnderConstruction('Start a Conversation')}
                              className="mt-2 text-blue-600 hover:text-blue-700"
                            >
                              Start a conversation
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Active Deals */}
                      <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Active Deals</h3>
                          <button
                            onClick={() => handleUnderConstruction('View All Deals')}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            View All
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div className="text-center py-8 text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p>No active deals</p>
                            <button
                              onClick={() => handleUnderConstruction('Start a Deal')}
                              className="mt-2 text-blue-600 hover:text-blue-700"
                            >
                              Start a new deal
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button
                          onClick={() => handleUnderConstruction('New Message')}
                          className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                        >
                          <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          <p className="font-medium">New Message</p>
                          <p className="text-sm text-gray-500">Start a conversation</p>
                        </button>
                        <button
                          onClick={() => handleUnderConstruction('New Deal')}
                          className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                        >
                          <svg className="w-6 h-6 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p className="font-medium">New Deal</p>
                          <p className="text-sm text-gray-500">Start a new deal</p>
                        </button>
                        <button
                          onClick={() => handleUnderConstruction('View Resources')}
                          className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                        >
                          <svg className="w-6 h-6 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <p className="font-medium">Resources</p>
                          <p className="text-sm text-gray-500">Browse available resources</p>
                        </button>
                        <button
                          onClick={() => handleUnderConstruction('View Announcements')}
                          className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                        >
                          <svg className="w-6 h-6 text-yellow-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.354a1.76 1.76 0 011.174-2.344l6.353-2.147a1.76 1.76 0 012.344 1.174l.466 1.376M11 5.882l4.06-.406a1.76 1.76 0 012.12 2.12l-.406 4.06M11 5.882l-.406 4.06m4.466-4.466l-4.06-.406" />
                          </svg>
                          <p className="font-medium">Announcements</p>
                          <p className="text-sm text-gray-500">View all announcements</p>
                        </button>
                      </div>
                    </div>
                  </>
                ) : activeTab === 'seller' ? (
                  <>
                    {isLoadingSellerStatus ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    ) : !isSeller ? (
                      <div className="max-w-2xl mx-auto px-4 sm:px-6">
                        <h1 className="text-2xl font-bold mb-6">Become a Seller</h1>
                        {sellerStatusError && !onboardingError && (
                          <div className="mb-4 p-4 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-lg">
                            {sellerStatusError}
                          </div>
                        )}
                        {onboardingError && (
                          <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
                            {onboardingError}
                          </div>
                        )}
                        <form onSubmit={handleOnboardingSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Company Name
                              </label>
                              <input
                                type="text"
                                required
                                value={onboardingForm.company_name}
                                onChange={(e) => setOnboardingForm(prev => ({ ...prev, company_name: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Business Type
                              </label>
                              <input
                                type="text"
                                required
                                value={onboardingForm.business_type}
                                onChange={(e) => setOnboardingForm(prev => ({ ...prev, business_type: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                              </label>
                              <input
                                type="text"
                                required
                                value={onboardingForm.address}
                                onChange={(e) => setOnboardingForm(prev => ({ ...prev, address: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone
                              </label>
                              <input
                                type="tel"
                                required
                                value={onboardingForm.phone}
                                onChange={(e) => setOnboardingForm(prev => ({ ...prev, phone: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Website (Optional)
                              </label>
                              <input
                                type="url"
                                value={onboardingForm.website}
                                onChange={(e) => setOnboardingForm(prev => ({ ...prev, website: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description (Optional)
                              </label>
                              <textarea
                                value={onboardingForm.description}
                                onChange={(e) => setOnboardingForm(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                rows={4}
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Aadhar Card (Optional)
                              </label>
                              <div className="flex items-center gap-4">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileChange('aadhar', e.target.files)}
                                  className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-lg file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                />
                                {previewUrls.aadhar && (
                                  <div className="relative">
                                    <img
                                      src={previewUrls.aadhar}
                                      alt="Aadhar preview"
                                      className="w-20 h-20 object-cover rounded-lg"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeFile('aadhar', 0)}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                GST Certificate (Optional)
                              </label>
                              <div className="flex items-center gap-4">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileChange('gst_certificate', e.target.files)}
                                  className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-lg file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                />
                                {previewUrls.gst_certificate && (
                                  <div className="relative">
                                    <img
                                      src={previewUrls.gst_certificate}
                                      alt="GST Certificate preview"
                                      className="w-20 h-20 object-cover rounded-lg"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeFile('gst_certificate', 0)}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Photos of Work Done (Optional)
                              </label>
                              <div className="space-y-4">
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => handleFileChange('work_photos', e.target.files)}
                                  className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-lg file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                />
                                <div className="flex flex-wrap gap-4">
                                  {previewUrls.work_photos.map((url, index) => (
                                    <div key={index} className="relative">
                                      <img
                                        src={url}
                                        alt={`Work photo ${index + 1}`}
                                        className="w-20 h-20 object-cover rounded-lg"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeFile('work_photos', index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Owner Photos (Optional)
                              </label>
                              <div className="space-y-4">
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => handleFileChange('owner_photos', e.target.files)}
                                  className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-lg file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                />
                                <div className="flex flex-wrap gap-4">
                                  {previewUrls.owner_photos.map((url, index) => (
                                    <div key={index} className="relative">
                                      <img
                                        src={url}
                                        alt={`Owner photo ${index + 1}`}
                                        className="w-20 h-20 object-cover rounded-lg"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeFile('owner_photos', index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <button
                            type="submit"
                            disabled={isSubmittingOnboarding}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmittingOnboarding ? 'Submitting...' : 'Submit Application'}
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {!showAnnouncementForm && (
                          <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <h1 className="text-2xl font-bold">Seller Dashboard</h1>
                              <div className="flex gap-4">
                                <button
                                  onClick={handleCreateProduct}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  New Listing
                                </button>
                                <button
                                  onClick={() => { setShowAnnouncementForm(true); setAnnouncementError(null); } }
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.354a1.76 1.76 0 011.174-2.344l6.353-2.147a1.76 1.76 0 012.344 1.174l.466 1.376M11 5.882l4.06-.406a1.76 1.76 0 012.12 2.12l-.406 4.06M11 5.882l-.406 4.06m4.466-4.466l-4.06-.406" />
                                  </svg>
                                  Publish Ad
                                </button>
                                <button
                                  onClick={() => setIsEditCompleteProfileOpen(true)}
                                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  Complete Profile
                                </button>
                                {seller && (
                                  <EditSellerModal 
                                    seller={seller}
                                    onSuccess={() => {
                                      fetchSellerStatusServer();
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      <div className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-semibold mb-2">Active Listings</h3>
                                <p className="text-3xl font-bold text-blue-600">
                                  {isLoadingProducts ? '...' : productCount}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">Your active product listings</p>
                      </div>
                      <div className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-semibold mb-2">Published Ads</h3>
                                <p className="text-3xl font-bold text-indigo-600">
                                  {isLoadingAnnouncements ? '...' : announcements.length}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">Your published announcements</p>
                      </div>
                            </div>

                            {/* New Complete Profile Section */}
                            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-6">
                                <div>
                                  <h3 className="text-xl font-semibold text-gray-900">Your Seller Profile</h3>
                                  <p className="text-sm text-gray-500 mt-1">Enhance your profile to attract more clients</p>
                                </div>
                                <button
                                  onClick={() => setIsEditCompleteProfileOpen(true)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit Seller Profile
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Skills Section */}
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-medium text-gray-900">Skills</h4>
                                    <span className="text-sm text-gray-500">
                                      {seller?.skills?.length || 0} skills added
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {seller?.skills?.slice(0, 5).map((skill, index) => (
                                      <span
                                        key={index}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                    {seller?.skills && seller.skills.length > 5 && (
                                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                        +{seller.skills.length - 5} more
                                      </span>
                                    )}
                                    {(!seller?.skills || seller.skills.length === 0) && (
                                      <p className="text-sm text-gray-500">No skills added yet</p>
                                    )}
                                  </div>
                                </div>

                                {/* Languages Section */}
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-medium text-gray-900">Languages</h4>
                                    <span className="text-sm text-gray-500">
                                      {seller?.languages?.length || 0} languages added
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {seller?.languages?.slice(0, 5).map((language, index) => (
                                      <span
                                        key={index}
                                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                                      >
                                        {language}
                                      </span>
                                    ))}
                                    {seller?.languages && seller.languages.length > 5 && (
                                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                        +{seller.languages.length - 5} more
                                      </span>
                                    )}
                                    {(!seller?.languages || seller.languages.length === 0) && (
                                      <p className="text-sm text-gray-500">No languages added yet</p>
                                    )}
                                  </div>
                                </div>

                                {/* Portfolio Section */}
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-medium text-gray-900">Portfolio</h4>
                                    <span className="text-sm text-gray-500">
                                      {seller?.portfolio?.length || 0} items
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
                                    {seller?.portfolio && seller.portfolio.length > 0 ? (
                                      seller.portfolio.slice(0, 6).map((item, index) => (
                                        <div key={index} className="bg-white border rounded-lg shadow-sm overflow-hidden flex flex-col">
                                          <div className="aspect-square sm:aspect-video bg-gray-100 overflow-hidden flex items-center justify-center">
                                            <img
                                              src={item.image_url}
                                              alt={item.title || `Portfolio ${index + 1}`}
                                              className="w-full h-full object-cover rounded-md sm:rounded-lg"
                                              style={{ maxHeight: '120px', maxWidth: '100%' }}
                                            />
                                          </div>
                                          <div className="p-2 sm:p-3 flex-1 flex flex-col">
                                            <div className="font-semibold text-gray-900 text-xs sm:text-base mb-1 truncate">{item.title}</div>
                                            <div className="text-gray-600 text-xs sm:text-sm line-clamp-2">{item.description}</div>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-sm text-gray-500 col-span-2 sm:col-span-3">No portfolio items added yet</p>
                                    )}
                                  </div>
                                </div>

                                {/* Gigs Section */}
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-medium text-gray-900">Gigs</h4>
                                    <span className="text-sm text-gray-500">
                                      {seller?.gigs?.length || 0} services
                                    </span>
                                  </div>
                                  <div className="space-y-3">
                                    {seller?.gigs?.slice(0, 2).map((gig, index) => (
                                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <img
                                          src={gig.image_url}
                                          alt={gig.title}
                                          className="w-12 h-12 object-cover rounded"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <h5 className="font-medium text-gray-900 truncate">{gig.title}</h5>
                                          <p className="text-sm text-green-600">₹{gig.price}</p>
                                        </div>
                                      </div>
                                    ))}
                                    {(!seller?.gigs || seller.gigs.length === 0) && (
                                      <p className="text-sm text-gray-500">No gigs added yet</p>
                                    )}
                                    {seller && Array.isArray(seller.gigs) && seller.gigs.length > 2 && (
                                      <button
                                        onClick={() => setIsEditCompleteProfileOpen(true)}
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                      >
                                        View all {seller.gigs.length} gigs
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="mt-6">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                                  <span className="text-sm text-gray-500">
                                    {calculateProfileCompletion(seller).percentage}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${calculateProfileCompletion(seller).percentage}%` }}
                                  />
                                </div>
                                {calculateProfileCompletion(seller).missingFields.length > 0 && (
                                  <div className="mt-4">
                                    <p className="text-sm text-gray-600 mb-2">Missing Information:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-500 space-y-1">
                                      {calculateProfileCompletion(seller).missingFields.map((field, index) => (
                                        <li key={index}>{field}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>

                              {/* Published Ads Section */}
                              <div className="mt-8">
                                <h3 className="text-lg font-semibold mb-4">Published Ads</h3>
                                {isLoadingAnnouncements ? (
                                  <div className="text-gray-500">Loading...</div>
                                ) : announcements.length === 0 ? (
                                  <div className="text-gray-500">No ads published yet.</div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {announcements.map(ad => (
                                      <div key={ad.id} className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
                                        {ad.icon && (
                                          <img
                                            src={ad.icon}
                                            alt={ad.title}
                                            className="w-16 h-16 object-cover rounded"
                                          />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-medium text-gray-900 truncate">{ad.title}</h4>
                                          <p className="text-sm text-gray-500 truncate">{ad.description}</p>
                                          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                                            ad.status === 'active'
                                              ? 'bg-green-100 text-green-700'
                                              : ad.status === 'pending'
                                              ? 'bg-yellow-100 text-yellow-700'
                                              : 'bg-gray-100 text-gray-700'
                                          }`}>
                                            {ad.status}
                                          </span>
                                          <div className="mt-2 flex gap-2">
                                            <button
                                              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                              onClick={() => handleEditAnnouncementClick(ad)}
                                            >
                                              Edit
                                            </button>
                                            {ad.status === 'active' && (
                                              <button 
                                                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                onClick={() => handleDeactivateAnnouncement(ad.id)}
                                                disabled={isDeactivating[ad.id]}
                                              >
                                                {isDeactivating[ad.id] ? 'Deactivating...' : 'Deactivate'}
                                              </button>
                                            )}
                                            {ad.status === 'inactive' && (
                                              <button 
                                                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                onClick={() => handleActivateAnnouncement(ad.id)}
                                                disabled={isDeactivating[ad.id]}
                                              >
                                                {isDeactivating[ad.id] ? 'Activating...' : 'Activate'}
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Products Section */}
                              <div className="mt-8">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-semibold">Products</h3>
                                  <button
                                    onClick={handleCreateProduct}
                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add Product
                                  </button>
                                </div>
                                {isLoadingProducts ? (
                                  <div className="text-gray-500">Loading products...</div>
                                ) : productCount === 0 ? (
                                  <div className="text-gray-500">No products listed yet.</div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {products.map(product => (
                                      <div key={product.id} className="bg-white p-4 rounded-lg shadow">
                                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                                          <img
                                            src={product.image ?? ''}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                                        <p className="text-sm text-gray-500 truncate mb-2">{product.description}</p>
                                        <div className="flex items-center justify-between">
                                          <span className="text-lg font-semibold text-blue-600">₹{product.price}</span>
                                          <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 text-xs rounded ${
                                              product.status === 'active' 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                              {product.status}
                                            </span>
                                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                              {product.category}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="mt-3 flex gap-2">
                                          <button
                                            onClick={() => handleEditProduct(product)}
                                            className="flex-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            onClick={() => handleDeactivateProduct(product.id, product.status === 'active' ? 'inactive' : 'active')}
                                            className={`flex-1 px-3 py-1 text-xs rounded ${
                                              product.status === 'active'
                                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                            }`}
                                          >
                                            {product.status === 'active' ? 'Deactivate' : 'Activate'}
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {showAnnouncementForm && (
                           <div className="max-w-2xl mx-auto bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow">
                             <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">{editingAnnouncementId ? 'Edit' : 'Publish New'} Announcement</h2>
                                <button 
                                  onClick={closeAnnouncementForm}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                             </div>

                             {announcementError && (
                              <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
                                {typeof announcementError === 'string' 
                                  ? announcementError 
                                  : getReadableErrorMessage(announcementError)
                                }
                              </div>
                             )}

                             <form onSubmit={handleAnnouncementSubmit} className="space-y-6">
                              <div>
                                <label htmlFor="ann-title" className="block text-sm font-medium text-gray-700 mb-1">Title (visible)</label>
                                <input 
                                  id="ann-title" 
                                  type="text" 
                                  required 
                                  maxLength={100}
                                  value={announcementForm.title} 
                                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))} 
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                                />
                                <p className="mt-1 text-xs text-gray-500">{announcementForm.title.length}/100 characters</p>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                  <label htmlFor="ann-category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                  <select 
                                    id="ann-category" 
                                    required 
                                    value={announcementForm.category} 
                                    onChange={(e) => { 
                                      const newCategory = e.target.value as AnnouncementCategory;
                                      setAnnouncementForm(prev => ({ 
                                        ...prev, 
                                        category: newCategory,
                                        subcategory: '' // Reset subcategory when category changes
                                      }))
                                    }} 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                                  >
                                    <option value="">Select a category...</option>
                                    {Object.keys(announcementCategories).map(cat => (
                                      <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label htmlFor="ann-subcategory" className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                                  <select 
                                    id="ann-subcategory" 
                                    required 
                                    value={announcementForm.subcategory} 
                                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, subcategory: e.target.value }))} 
                                    disabled={!announcementForm.category} 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                                  >
                                    <option value="">Select a subcategory...</option>
                                    {announcementForm.category && announcementCategories[announcementForm.category as AnnouncementCategory]?.map(subCat => (
                                      <option key={subCat} value={subCat}>{subCat}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                  <label htmlFor="ann-type" className="block text-sm font-medium text-gray-700 mb-1">Advertisement Type</label>
                                  <select 
                                    id="ann-type" 
                                    required 
                                    value={announcementForm.ad_type} 
                                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, ad_type: e.target.value as 'scroll' | 'flip' }))} 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                                  >
                                    <option value="scroll">Scroll Ad</option>
                                    <option value="flip">Flip Ad</option>
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label htmlFor="ann-desc" className="block text-sm font-medium text-gray-700 mb-1">Short Description (visible)</label>
                                <textarea 
                                  id="ann-desc" 
                                  required 
                                  maxLength={200}
                                  value={announcementForm.description} 
                                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, description: e.target.value }))} 
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                  rows={2}
                                />
                                <p className="mt-1 text-xs text-gray-500">{announcementForm.description.length}/200 characters</p>
                              </div>
                              <div>
                                <label htmlFor="ann-image" className="block text-sm font-medium text-gray-700 mb-1">Announcement Image</label>
                                <div className="flex items-center gap-4">
                                  <input
                                    id="ann-image"
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        // Check file size (max 5MB)
                                        if (file.size > 5 * 1024 * 1024) {
                                          alert('Image size must be less than 5MB');
                                          e.target.value = '';
                                          return;
                                        }
                                        handleImageChange(e);
                                      }
                                    }}
                                    className="block w-full text-sm text-gray-500
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded-lg file:border-0
                                      file:text-sm file:font-semibold
                                      file:bg-blue-50 file:text-blue-700
                                      hover:file:bg-blue-100"
                                  />
                                  {imagePreview && (
                                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                      <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Accepted formats: JPEG, PNG, GIF, WebP. Max size: 5MB</p>
                              </div>
                              <div>
                                <label htmlFor="ann-details" className="block text-sm font-medium text-gray-700 mb-1">Full Details</label>
                                <textarea 
                                  id="ann-details" 
                                  required 
                                  maxLength={500}
                                  value={announcementForm.details} 
                                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, details: e.target.value }))} 
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                                  rows={2}
                                />
                                <p className="mt-1 text-xs text-gray-500">{announcementForm.details.length}/500 characters</p>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                  <label htmlFor="ann-start" className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
                                  <input 
                                    id="ann-start" 
                                    type="datetime-local" 
                                    required 
                                    min={new Date().toISOString().slice(0, 16)}
                                    value={announcementForm.start_date}
                                    max={announcementForm.end_date || undefined} 
                                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, start_date: e.target.value }))} 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                  />
                                  <p className="mt-1 text-xs text-gray-500">Cannot be in the past</p>
                                </div>
                                <div>
                                  <label htmlFor="ann-end" className="block text-sm font-medium text-gray-700 mb-1">End Date & Time (Optional)</label>
                                  <input 
                                    id="ann-end" 
                                    type="datetime-local" 
                                    value={announcementForm.end_date}
                                    min={announcementForm.start_date || new Date().toISOString().slice(0, 16)} 
                                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, end_date: e.target.value }))} 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                  />
                                  <p className="mt-1 text-xs text-gray-500">Must be after start date</p>
                                </div>
                              </div>
                             
                              <button
                                type="submit"
                                disabled={isSubmittingAnnouncement}
                                className={`w-full text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${editingAnnouncementId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                              >
                                {isSubmittingAnnouncement ? (editingAnnouncementId ? 'Updating...' : 'Publishing...') : (editingAnnouncementId ? 'Update Announcement' : 'Publish Announcement')}
                              </button>
                             </form>
                           </div>
                        )}
                        
                      </div>
                    )}
                  </>
                ) : activeTab === 'profile' ? (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                      <h1 className="text-2xl font-bold mb-6">Profile</h1>
                      {isEditingProfile ? (
                        <form onSubmit={handleProfileSubmit} className="max-w-2xl mx-auto space-y-6">
                          {/* Profile Image Section */}
                          <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg">
                                <img
                                  src={imagePreview || profileForm.profile_image_url || 'https://via.placeholder.com/150'}
                                  alt="Profile preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <label 
                                htmlFor="profile-image-upload"
                                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </label>
                              <input
                                id="profile-image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                              />
                            </div>
                            <p className="text-sm text-gray-500">Click the camera icon to change your profile picture</p>
                          </div>

                          {/* Name Input */}
                          <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                              Full Name
                            </label>
                            <input
                              id="name"
                              type="text"
                              value={profileForm.name}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="Enter your full name"
                            />
                          </div>

                          {/* Resources Selection */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Select Your Main Resource Category
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {Object.entries(announcementCategories).map(([category, subcategories]) => (
                                <label
                                  key={category}
                                  className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                                    profileForm.resources[0] === category
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-200 hover:border-blue-300'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="resource"
                                    checked={profileForm.resources[0] === category}
                                    onChange={() => {
                                      setProfileForm(prev => ({ 
                                        ...prev, 
                                        resources: [category], // Only allow one selection
                                        primaryResource: [] // Reset primary resource when category changes
                                      }));
                                    }}
                                    className="sr-only"
                                  />
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">{category}</div>
                                    <div className="text-sm text-gray-500 mt-1">
                                      {subcategories.length} subcategories
                                    </div>
                                  </div>
                                  {profileForm.resources[0] === category && (
                                    <div className="absolute top-2 right-2 text-blue-600">
                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Primary Resource Selection */}
                          {profileForm.resources[0] && (
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Select Your Primary Resource
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {announcementCategories[profileForm.resources[0] as keyof typeof announcementCategories].map(subcategory => (
                                  <label
                                    key={subcategory}
                                    className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                      profileForm.primaryResource[0] === subcategory
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name="primaryResource"
                                      checked={profileForm.primaryResource[0] === subcategory}
                                      onChange={() => {
                                        setProfileForm(prev => ({ 
                                          ...prev, 
                                          primaryResource: [subcategory] // Only allow one selection
                                        }));
                                      }}
                                      className="sr-only"
                                    />
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">{subcategory}</div>
                                    </div>
                                    {profileForm.primaryResource[0] === subcategory && (
                                      <div className="absolute top-2 right-2 text-blue-600">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                    )}
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          {profileError && (
                            <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
                              {profileError}
                            </div>
                          )}

                          <div className="flex gap-4 pt-4">
                            <button
                              type="submit"
                              disabled={isSubmittingProfile || isUploadingImage}
                              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {isSubmittingProfile ? (
                                <>
                                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Save Changes
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingProfile(false);
                                setProfileForm({
                                  name: user.name,
                                  profile_image_url: user.profile_image_url,
                                  resources: user.resources || [],
                                  primaryResource: user.primaryResource || []
                                });
                                setSelectedImage(null);
                                setImagePreview(null);
                              }}
                              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="max-w-2xl mx-auto space-y-8">
                          {/* Profile Header */}
                          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <div className="relative">
                              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg">
                                <img
                                  src={user.profile_image_url || 'https://via.placeholder.com/150'}
                                  alt={user.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            <div className="text-center sm:text-left">
                              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                              <p className="text-gray-500">{user.email}</p>
                              <button 
                                onClick={() => setIsEditingProfile(true)}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto sm:mx-0"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Profile
                              </button>
                            </div>
                          </div>

                          {/* Resources Section */}
                          <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-4">Resources</h3>
                              <div className="flex flex-wrap gap-2">
                                {user.resources?.map((resource, index) => (
                                  <span
                                    key={index}
                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                                  >
                                    {resource}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Resource</h3>
                              <div className="flex flex-wrap gap-2">
                                {user.primaryResource?.map((resource, index) => (
                                  <span
                                    key={index}
                                    className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                                  >
                                    {resource}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : activeTab === 'audit-logs' ? (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 sm:p-6">
                      {/* Header with Filters */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h1 className="text-2xl font-bold">Audit Logs</h1>
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                          <select 
                            value={selectedAction}
                            onChange={(e) => setSelectedAction(e.target.value)}
                            className="w-full sm:w-auto px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">All Actions</option>
                            <option value="CREATE">Create</option>
                            <option value="UPDATE">Update</option>
                            <option value="DELETE">Delete</option>
                          </select>
                          <select 
                            value={selectedEntityType}
                            onChange={(e) => setSelectedEntityType(e.target.value)}
                            className="w-full sm:w-auto px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">All Entities</option>
                            <option value="ANNOUNCEMENT">Announcements</option>
                            <option value="PRODUCT">Products</option>
                            <option value="GIG">Gigs</option>
                            <option value="PORTFOLIO">Portfolio</option>
                          </select>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <input
                              type="date"
                              value={fromDate}
                              onChange={(e) => setFromDate(e.target.value)}
                              className="w-full sm:w-auto px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                            <input
                              type="date"
                              value={toDate}
                              onChange={(e) => setToDate(e.target.value)}
                              className="w-full sm:w-auto px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Loading State */}
                      {isLoadingAuditLogs ? (
                        <div className="flex justify-center items-center h-64">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                      ) : auditLogsError ? (
                        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                          {auditLogsError}
                        </div>
                      ) : auditLogs.length === 0 ? (
                        <div className="text-center py-12">
                          <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p className="mt-4 text-gray-500">No audit logs found</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="px-4 py-2 text-left">Action</th>
                                <th className="px-4 py-2 text-left">User</th>
                                <th className="px-4 py-2 text-left">Entity</th>
                                <th className="px-4 py-2 text-left">Changes</th>
                                <th className="px-4 py-2 text-left">Timestamp</th>
                              </tr>
                            </thead>
                            <tbody>
                              {auditLogs.map((log) => (
                                <tr key={log.id} className="border-b hover:bg-gray-50">
                                  <td className="px-4 py-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                                      log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {log.action}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2">
                                    <div>
                                      <div className="font-medium">{log.user.name}</div>
                                      <div className="text-sm text-gray-500">{log.user.email}</div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2">
                                    <div>
                                      <div className="font-medium">{log.entity_type}</div>
                                      <div className="text-sm text-gray-500">ID: {log.entity_id}</div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2">
                                    <div className="max-w-md">
                                      {Object.entries(log.changes || {}).map(([key, value]) => (
                                        <div key={key} className="mb-2 last:mb-0">
                                          <div className="text-sm font-medium text-gray-700">{key}</div>
                                          {typeof value === 'object' && value !== null ? (
                                            <div className="pl-2 border-l-2 border-gray-200">
                                              {Object.entries(value).map(([subKey, subValue]) => (
                                                <div key={subKey} className="text-sm">
                                                  <span className="text-gray-600">{subKey}:</span>{' '}
                                                  <span className="text-gray-900">
                                                    {typeof subValue === 'boolean' ? (
                                                      <span className={`px-1.5 py-0.5 rounded text-xs ${
                                                        subValue ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                      }`}>
                                                        {subValue ? 'Yes' : 'No'}
                                                      </span>
                                                    ) : typeof subValue === 'string' && subValue.startsWith('http') ? (
                                                      <a href={subValue} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                        View
                                                      </a>
                                                    ) : (
                                                      String(subValue)
                                                    )}
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <div className="text-sm text-gray-900">
                                              {typeof value === 'boolean' ? (
                                                <span className={`px-1.5 py-0.5 rounded text-xs ${
                                                  value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                  {value ? 'Yes' : 'No'}
                                                </span>
                                              ) : typeof value === 'string' && value.startsWith('http') ? (
                                                <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                  View
                                                </a>
                                              ) : (
                                                String(value ?? '')
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-500">
                                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add modals at the end of the component */}
      {isEditCompleteProfileOpen && seller && (
        <EditCompleteProfileModal
          isOpen={isEditCompleteProfileOpen}
          onClose={() => setIsEditCompleteProfileOpen(false)}
          seller={seller}
          onSuccess={handleCompleteProfileSuccess}
        />
      )}

      {showCreateProductModal && seller && (
        <CreateProductModal
          isOpen={showCreateProductModal}
          onClose={() => {
            setShowCreateProductModal(false)
            setSelectedProduct(null)
          }}
          sellerId={seller.id}
          onSuccess={() => {
            fetchProducts()
          }}
        />
      )}

      {showEditProductModal && selectedProduct && (
        <EditProductModal
          isOpen={showEditProductModal}
          onClose={() => {
            setShowEditProductModal(false)
            setSelectedProduct(null)
          }}
          product={selectedProduct}
          onProductUpdated={() => {
            fetchProducts()
            setShowEditProductModal(false)
            setSelectedProduct(null)
          }}
        />
      )}
    </div>
  )
}

// Helper style (or use Tailwind directly)
const inputClass = "px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500";

// Add this server function near other server functions
export const updateSellerCompleteProfile = createServerFn({
  method: 'POST',
  response: 'data',
})
  .validator((data: unknown) => updateSellerCompleteProfileSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      // Update seller profile with skills and languages
      const [updatedSeller] = await db
        .update(sellers)
        .set({
          skills: data.skills,
          languages: data.languages,
          updated_at: new Date(),
        })
        .where(eq(sellers.id, data.sellerId))
        .returning();

      if (!updatedSeller) {
        throw new Error('Seller not found');
      }

      // Delete existing portfolio items
      await db
        .delete(portfolios)
        .where(eq(portfolios.seller_id, data.sellerId));

      // Insert new portfolio items
      if (data.portfolio.length > 0) {
        await db
          .insert(portfolios)
          .values(
            data.portfolio.map((item: { image_url: string, title: string, description: string }) => ({
              seller_id: data.sellerId,
              image_url: item.image_url,
              title: item.title,
              description: item.description
            }))
          );
      }

      // Delete existing gigs
      await db
        .delete(gigs)
        .where(eq(gigs.seller_id, data.sellerId));

      // Insert new gigs with uploaded images
      if (data.gigs.length > 0) {
        const processedGigs = await Promise.all(
          data.gigs.map(async (gig: { title: string; description: string; image_url: string; price: number }) => {
            let finalImageUrl = gig.image_url;

            // If the image is a base64 string, upload it to Supabase
            if (gig.image_url.startsWith('data:image')) {
              const base64Data = gig.image_url.split(',')[1];
              if (!base64Data) {
                throw new Error('Invalid base64 data');
              }
              const buffer = Buffer.from(base64Data, 'base64');
              
              // Generate a unique filename
              const fileName = `gig-${data.sellerId}-${Date.now()}.jpg`;
              const filePath = `gigs/${fileName}`;

              // Upload to S3
              await s3Client.send(
                new PutObjectCommand({
                  Bucket: 'upcr',
                  Key: filePath,
                  Body: buffer,
                  ContentType: 'image/jpeg',
                  ACL: 'public-read'
                })
              );

              // Get the public URL
              finalImageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/upcr/${filePath}`;
            }

            return {
              seller_id: data.sellerId,
              title: gig.title,
              description: gig.description,
              image_url: finalImageUrl,
              price: gig.price.toString(),
              status: 'active'
            };
          })
        );

        // Insert gigs with uploaded image URLs
        await db
          .insert(gigs)
          .values(processedGigs);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating seller profile:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  });

export const uploadProfileImage = createServerFn({
  method: 'POST',
  response: 'data',
})
  .validator((data: unknown) => uploadProfileImageSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { file, userId } = data;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'Invalid file type. Only images are allowed.' }
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'File size too large. Maximum size is 5MB.' }
      }

      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `profile/${fileName}`;

      // Convert base64 to buffer
      const base64Data = file.data.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid base64 data');
      }
      const buffer = Buffer.from(base64Data, 'base64');

      // Upload to S3
      await s3Client.send(
        new PutObjectCommand({
          Bucket: 'upcr',
          Key: filePath,
          Body: buffer,
          ContentType: file.type,
          ACL: 'public-read'
        })
      );

      // Construct the public URL
      const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/upcr/${filePath}`;

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Error uploading image:', error);
      return { success: false, error: 'Failed to upload image' };
    }
  });

// Add this function near other utility functions
function calculateProfileCompletion(seller: Seller | null): { percentage: number; missingFields: string[] } {
  if (!seller) return { percentage: 0, missingFields: [] }

  const totalFields = 11
  let completedFields = 0
  const missingFields: string[] = []

  // Basic Information (4 fields)
  if (!seller.company_name?.trim()) missingFields.push('Company Name')
  else completedFields++
  
  if (!seller.business_type?.trim()) missingFields.push('Business Type')
  else completedFields++
  
  if (!seller.address?.trim()) missingFields.push('Address')
  else completedFields++
  
  if (!seller.phone?.trim()) missingFields.push('Phone')
  else completedFields++

  // Additional Information (2 fields)
  if (!seller.website?.trim()) missingFields.push('Website')
  else completedFields++
  
  if (!seller.description?.trim()) missingFields.push('Description')
  else completedFields++

  // Profile Media (1 field)
  if (!seller.aadhar_url && !seller.gst_certificate_url) missingFields.push('Verification Documents')
  else completedFields++

  // Skills and Languages (2 fields)
  if (!seller.skills?.length) missingFields.push('Skills')
  else completedFields++
  
  if (!seller.languages?.length) missingFields.push('Languages')
  else completedFields++

  // Portfolio and Gigs (2 fields)
  if (!seller.portfolio?.length) missingFields.push('Portfolio')
  else completedFields++
  
  if (!seller.gigs?.length) missingFields.push('Gigs')
  else completedFields++

  return {
    percentage: Math.round((completedFields / totalFields) * 100),
    missingFields
  }
}
