import { useState, useEffect, useRef } from "react";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  TagIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { updateSellerCompleteProfile, uploadProfileImage } from "../routes/app";

type Gig = {
  id?: number;
  title: string;
  description: string;
  image_url: string;
  price: number;
};

type PortfolioItem = {
  image_url: string;
  title: string;
  description: string;
};

type Seller = {
  id: number;
  user_id: string;
  company_name: string;
  business_type: string;
  address: string;
  phone: string;
  website?: string | null;
  description?: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  aadhar_url?: string | null;
  gst_certificate_url?: string | null;
  work_photos_urls?: string[] | null;
  owner_photos_urls?: string[] | null;
  skills?: string[];
  languages?: string[];
  portfolio_urls?: string[];
  gigs?: Gig[];
  portfolio?: PortfolioItem[];
};

type EditCompleteProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  seller: Seller;
  onSuccess: () => void;
};

// Predefined skill categories and suggestions
const skillCategories = {
  Technical: [
    "Web Development",
    "Mobile Development",
    "UI/UX Design",
    "Database Management",
    "DevOps",
    "Cloud Computing",
  ],
  Business: [
    "Digital Marketing",
    "Sales",
    "Project Management",
    "Business Analysis",
    "Content Writing",
    "SEO",
  ],
  Creative: [
    "Graphic Design",
    "Video Editing",
    "Photography",
    "Animation",
    "3D Modeling",
    "Illustration",
  ],
  Other: [
    "Customer Service",
    "Teaching",
    "Consulting",
    "Research",
    "Data Analysis",
    "Quality Assurance",
  ],
};

// Common languages
const commonLanguages = [
  "English",
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Arabic",
  "Portuguese",
  "Russian",
  "Italian",
  "Korean",
  "Dutch",
  "Turkish",
  "Swedish",
];

export function EditCompleteProfileModal({
  isOpen,
  onClose,
  seller,
  onSuccess,
}: EditCompleteProfileModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    skills: seller.skills || [],
    languages: seller.languages || [],
    portfolio: seller.portfolio || [],
    gigs: seller.gigs || [],
  });
  const [newSkill, setNewSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [newGig, setNewGig] = useState<Partial<Gig>>({
    title: "",
    description: "",
    image_url: "",
    price: 0,
  });
  const [selectedPortfolioImage, setSelectedPortfolioImage] =
    useState<File | null>(null);
  const [selectedGigImage, setSelectedGigImage] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    portfolio?: number;
    gig?: number;
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrls, setPreviewUrls] = useState<{
    portfolio?: string;
    gig?: string;
  }>({});
  const portfolioTitleRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [gigImageUploading, setGigImageUploading] = useState(false);
  const [portfolioImageUploading, setPortfolioImageUploading] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Always load seller.portfolio if present
        if (
          seller.portfolio &&
          Array.isArray(seller.portfolio) &&
          seller.portfolio.length > 0
        ) {
          setFormData((prev) => ({
            ...prev,
            portfolio: seller.portfolio ?? [],
          }));
        } else if (
          Array.isArray(seller.portfolio_urls) &&
          seller.portfolio_urls.length > 0
        ) {
          setFormData((prev) => ({
            ...prev,
            portfolio: (seller.portfolio_urls ?? []).map((url) => ({
              image_url: url,
              title: "",
              description: "",
            })),
          }));
        }
        // Load gigs
        if (seller.gigs?.length) {
          setFormData((prev) => ({
            ...prev,
            gigs: seller.gigs || [],
          }));
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [seller]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleAddLanguage = () => {
    if (
      newLanguage.trim() &&
      !formData.languages.includes(newLanguage.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()],
      }));
      setNewLanguage("");
    }
  };

  const handleRemoveLanguage = (languageToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter(
        (language) => language !== languageToRemove
      ),
    }));
  };

  // Handle portfolio image preview
  const handlePortfolioImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index?: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setPortfolioImageUploading(true);
        setError(null);

        // Create a temporary URL for preview
        const tempUrl = URL.createObjectURL(file);
        setPreviewUrls((prev) => ({ ...prev, portfolio: tempUrl }));

        // Upload to server
        const uploadResult = await uploadProfileImage({
          data: {
            file: {
              name: file.name,
              type: file.type,
              size: file.size,
              data: await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
              }),
            },
            userId: seller.user_id,
          },
        });

        if (uploadResult.success && uploadResult.url) {
          if (typeof index === "number") {
            // Change image for existing item
            const newPortfolio = [...(formData.portfolio ?? [])];
            if (newPortfolio[index]) {
              newPortfolio[index].image_url = uploadResult.url;
              setFormData((prev) => ({ ...prev, portfolio: newPortfolio }));
            }
          } else {
            // Add new item
            setFormData((prev) => ({
              ...prev,
              portfolio: [
                ...(prev.portfolio ?? []),
                { image_url: uploadResult.url, title: "", description: "" },
              ],
            }));
          }
        } else {
          throw new Error("Failed to upload image");
        }
      } catch (error) {
        setError("Failed to upload image. Please try again.");
        console.error("Upload error:", error);
      } finally {
        setPortfolioImageUploading(false);
        setPreviewUrls((prev) => ({ ...prev, portfolio: undefined }));
      }
    }
  };

  // Handle gig image preview
  const handleGigImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setGigImageUploading(true);
      const tempUrl = URL.createObjectURL(file);
      setPreviewUrls((prev) => ({ ...prev, gig: tempUrl }));
      // Upload to Supabase
      const uploadResult = await uploadProfileImage({
        data: {
          file: {
            name: file.name,
            type: file.type,
            size: file.size,
            data: await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            }),
          },
          userId: seller.user_id,
        },
      });
      setGigImageUploading(false);
      if (uploadResult.success && uploadResult.url) {
        setNewGig((prev) => ({ ...prev, image_url: uploadResult.url }));
      } else {
        setError("Failed to upload gig image. Please try again.");
      }
    }
  };

  const handleAddGig = () => {
    if (
      newGig.title &&
      newGig.description &&
      newGig.price &&
      newGig.price > 0 &&
      newGig.image_url &&
      !newGig.image_url.startsWith("blob:")
    ) {
      setFormData((prev) => ({
        ...prev,
        gigs: [...(prev.gigs ?? []), { ...(newGig as Gig) }],
      }));
      setNewGig({
        title: "",
        description: "",
        image_url: "",
        price: 0,
      });
      setSelectedGigImage(null);
      setPreviewUrls((prev) => ({ ...prev, gig: undefined }));
    } else if (newGig.image_url && newGig.image_url.startsWith("blob:")) {
      setError(
        "Please wait for the image to finish uploading before adding the gig."
      );
    } else {
      setError("Please fill all fields and upload an image for the gig.");
    }
  };

  const handleRemoveGig = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      gigs: prev.gigs.filter((_, i) => i !== index),
    }));
  };

  const handleAddPortfolio = () => {
    // Only allow add if last item has a real image_url (not blob:)
    if (
      formData.portfolio &&
      formData.portfolio.length > 0 &&
      formData.portfolio[formData.portfolio.length - 1]?.image_url &&
      !formData.portfolio[formData.portfolio.length - 1]?.image_url.startsWith(
        "blob:"
      )
    ) {
      // Add a new empty item (triggers file input)
      setFormData((prev) => ({
        ...prev,
        portfolio: [
          ...(prev.portfolio ?? []),
          { image_url: "", title: "", description: "" },
        ],
      }));
    } else {
      setError("Please upload an image before adding a new portfolio item.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validation: Ensure all portfolio items have title and description
    for (const item of formData.portfolio) {
      if (!item.title.trim() || !item.description.trim()) {
        setError(
          "Please provide a title and description for every portfolio item."
        );
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Upload portfolio images if selected
      const updatedPortfolio = [...formData.portfolio];
      if (selectedPortfolioImage) {
        setUploadProgress((prev) => ({ ...prev, portfolio: 0 }));
        const reader = new FileReader();
        reader.readAsDataURL(selectedPortfolioImage);
        const base64Data = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
        });

        setUploadProgress((prev) => ({ ...prev, portfolio: 50 }));
        const uploadResult = await uploadProfileImage({
          data: {
            file: {
              name: selectedPortfolioImage.name,
              type: selectedPortfolioImage.type,
              size: selectedPortfolioImage.size,
              data: base64Data,
            },
            userId: seller.user_id,
          },
        });

        if (!uploadResult.success || !uploadResult.url) {
          throw new Error("Failed to upload portfolio image");
        }
        setUploadProgress((prev) => ({ ...prev, portfolio: 100 }));
        updatedPortfolio[updatedPortfolio.length - 1] = {
          image_url: uploadResult.url,
          title: "",
          description: "",
        };
      }

      // Upload gig images if selected
      const updatedGigs = [...formData.gigs];
      if (selectedGigImage) {
        setUploadProgress((prev) => ({ ...prev, gig: 0 }));
        const reader = new FileReader();
        reader.readAsDataURL(selectedGigImage);
        const base64Data = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
        });

        setUploadProgress((prev) => ({ ...prev, gig: 50 }));
        const uploadResult = await uploadProfileImage({
          data: {
            file: {
              name: selectedGigImage.name,
              type: selectedGigImage.type,
              size: selectedGigImage.size,
              data: base64Data,
            },
            userId: seller.user_id,
          },
        });

        if (!uploadResult.success || !uploadResult.url) {
          throw new Error("Failed to upload gig image");
        }
        setUploadProgress((prev) => ({ ...prev, gig: 100 }));
        // Update the last added gig's image URL
        if (updatedGigs.length > 0) {
          const lastGig = updatedGigs[updatedGigs.length - 1];
          if (lastGig && typeof lastGig === "object") {
            lastGig.image_url = uploadResult.url;
          }
        }
      }
      
      const result = await updateSellerCompleteProfile({
        data: {
          sellerId: seller.id,
          skills: formData.skills,
          languages: formData.languages,
          portfolio: updatedPortfolio,
          gigs: updatedGigs.map((gig) => ({
            ...gig,
            price: gig.price || 0,
          })),
        },
      });

      console.log("Update result:", result);

      if (!result.success) {
        throw new Error(result.error || "Failed to update profile");
      }

      onSuccess();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while updating the profile"
      );
    } finally {
      setIsSubmitting(false);
      setUploadProgress({});
    }
  };

  const steps = [
    { id: 1, name: "Skills", description: "Add your professional skills" },
    { id: 2, name: "Languages", description: "Add languages you speak" },
    { id: 3, name: "Portfolio", description: "Showcase your work" },
    { id: 4, name: "Gigs", description: "Add your services" },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Complete Your Profile
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Step {currentStep} of {steps.length}:{" "}
                {steps[currentStep - 1]?.name || ""}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-white">
            <nav aria-label="Progress">
              <ol className="flex items-center">
                {steps.map((step, index) => (
                  <li
                    key={step.id}
                    className={`relative ${index !== steps.length - 1 ? "pr-4 sm:pr-8 md:pr-20" : ""}`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`relative z-10 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full ${
                          step.id < currentStep
                            ? "bg-blue-600"
                            : step.id === currentStep
                              ? "bg-blue-600 ring-2 ring-blue-600 ring-offset-2"
                              : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ${
                            step.id <= currentStep ? "bg-white" : "bg-gray-400"
                          }`}
                        />
                      </div>
                      {index !== steps.length - 1 && (
                        <div
                          className={`absolute top-3 sm:top-4 left-6 sm:left-8 -ml-px h-0.5 w-full ${
                            step.id < currentStep
                              ? "bg-blue-600"
                              : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                    <div className="mt-0.5 ml-2 sm:ml-4 min-w-0 flex flex-col">
                      <span
                        className={`text-xs font-semibold tracking-wide uppercase ${
                          step.id <= currentStep
                            ? "text-blue-600"
                            : "text-gray-500"
                        }`}
                      >
                        {step.name}
                      </span>
                      <span className="text-xs text-gray-500 hidden sm:block">
                        {step.description}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                {/* Skills Section */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Add Your Skills
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Add skills that best represent your expertise. This
                        helps clients find you for relevant projects.
                      </p>
                    </div>

                    {/* Skill Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(skillCategories).map(
                        ([category, skills]) => (
                          <div key={category} className="space-y-2">
                            <h4 className="font-medium text-gray-700">
                              {category}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {skills.map((skill) => (
                                <button
                                  key={skill}
                                  type="button"
                                  onClick={() => {
                                    if (!formData.skills.includes(skill)) {
                                      setFormData((prev) => ({
                                        ...prev,
                                        skills: [...prev.skills, skill],
                                      }));
                                    }
                                  }}
                                  className={`px-3 py-1 rounded-full text-sm ${
                                    formData.skills.includes(skill)
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  }`}
                                >
                                  {skill}
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    {/* Custom Skill Input */}
                    <div className="mt-6">
                      <label
                        htmlFor="custom-skill"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Add Custom Skill
                      </label>
                      <div className="mt-1 flex gap-2">
                        <input
                          type="text"
                          id="custom-skill"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Enter a skill"
                          className="flex-1 rounded-lg border-gray-300 shadow-sm 
                            focus:border-blue-500 focus:ring-blue-500 
                            hover:border-gray-400
                            transition-colors duration-200
                            px-4 py-2.5"
                        />
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg 
                            hover:bg-blue-700 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                            transition-colors duration-200
                            flex items-center gap-2"
                        >
                          <PlusIcon className="w-5 h-5" />
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Selected Skills */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Your Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="text-blue-700 hover:text-blue-900"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Languages Section */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Add Languages
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Add languages you speak fluently. This helps in
                        communicating with clients effectively.
                      </p>
                    </div>

                    {/* Common Languages */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Common Languages
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {commonLanguages.map((language) => (
                          <button
                            key={language}
                            type="button"
                            onClick={() => {
                              if (!formData.languages.includes(language)) {
                                setFormData((prev) => ({
                                  ...prev,
                                  languages: [...prev.languages, language],
                                }));
                              }
                            }}
                            className={`px-3 py-1 rounded-full text-sm ${
                              formData.languages.includes(language)
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {language}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Language Input */}
                    <div className="mt-6">
                      <label
                        htmlFor="custom-language"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Add Custom Language
                      </label>
                      <div className="mt-1 flex gap-2">
                        <input
                          type="text"
                          id="custom-language"
                          value={newLanguage}
                          onChange={(e) => setNewLanguage(e.target.value)}
                          placeholder="Enter a language"
                          className="flex-1 rounded-lg border-gray-300 shadow-sm 
                            focus:border-blue-500 focus:ring-blue-500 
                            hover:border-gray-400
                            transition-colors duration-200
                            px-4 py-2.5"
                        />
                        <button
                          type="button"
                          onClick={handleAddLanguage}
                          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg 
                            hover:bg-blue-700 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                            transition-colors duration-200
                            flex items-center gap-2"
                        >
                          <PlusIcon className="w-5 h-5" />
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Selected Languages */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Your Languages
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.languages.map((language, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2"
                          >
                            {language}
                            <button
                              type="button"
                              onClick={() => handleRemoveLanguage(language)}
                              className="text-green-700 hover:text-green-900"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Portfolio Section */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Add Portfolio Items
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Showcase your best work. Add images that represent your
                        skills and expertise.
                      </p>
                    </div>

                    {/* Portfolio UX: If empty, show dropzone. Otherwise, show grid and add button. */}
                    {!formData.portfolio || formData.portfolio.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                          <PhotoIcon className="w-10 h-10 text-gray-400 mb-2" />
                          <span className="text-base text-gray-600 mb-1">
                            Click to upload your first portfolio image
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              handlePortfolioImageChange(e);
                            }}
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(formData.portfolio ?? []).map(
                          (item: PortfolioItem, index: number) => (
                            <div
                              key={index}
                              className="bg-white border rounded-lg shadow-sm overflow-hidden"
                            >
                              {/* Image Section */}
                              <div className="relative h-40">
                                {item.image_url ? (
                                  <img
                                    src={item.image_url}
                                    alt={`Portfolio ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <label className="w-full h-full flex items-center justify-center bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors">
                                    <div className="text-center">
                                      <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                      <span className="text-sm text-gray-500">
                                        Click to add image
                                      </span>
                                    </div>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) =>
                                        handlePortfolioImageChange(e, index)
                                      }
                                    />
                                  </label>
                                )}
                                {item.image_url && (
                                  <label
                                    className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 cursor-pointer hover:bg-white transition-colors"
                                    title="Change image"
                                  >
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) =>
                                        handlePortfolioImageChange(e, index)
                                      }
                                    />
                                    <PhotoIcon className="w-4 h-4 text-gray-600" />
                                  </label>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      portfolio: (prev.portfolio ?? []).filter(
                                        (_, i) => i !== index
                                      ),
                                    }));
                                  }}
                                  className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 text-gray-600 hover:bg-white hover:text-red-500 transition-colors"
                                  title="Remove item"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </div>
                              {/* Content Section */}
                              <div className="p-3 space-y-2">
                                <input
                                  type="text"
                                  placeholder="Add a title"
                                  value={item.title}
                                  onChange={(e) => {
                                    const newPortfolio = [
                                      ...(formData.portfolio ?? []),
                                    ];
                                    if (newPortfolio[index])
                                      newPortfolio[index].title =
                                        e.target.value;
                                    setFormData((prev) => ({
                                      ...prev,
                                      portfolio: newPortfolio,
                                    }));
                                  }}
                                  className="w-full px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <textarea
                                  placeholder="Add a description"
                                  value={item.description}
                                  onChange={(e) => {
                                    const newPortfolio = [
                                      ...(formData.portfolio ?? []),
                                    ];
                                    if (newPortfolio[index])
                                      newPortfolio[index].description =
                                        e.target.value;
                                    setFormData((prev) => ({
                                      ...prev,
                                      portfolio: newPortfolio,
                                    }));
                                  }}
                                  rows={2}
                                  className="w-full px-2 py-1.5 border rounded text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                          )
                        )}
                        {/* Add New Portfolio Item Button: only show if last item is complete */}
                        {formData.portfolio &&
                          formData.portfolio.length > 0 &&
                          formData.portfolio[formData.portfolio.length - 1]
                            ?.image_url && (
                            <button
                              type="button"
                              onClick={handleAddPortfolio}
                              disabled={portfolioImageUploading}
                              className="h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <PlusIcon className="w-8 h-8 text-gray-400" />
                              <span className="text-sm font-medium text-gray-600">
                                Add Portfolio Item
                              </span>
                            </button>
                          )}
                      </div>
                    )}
                  </div>
                )}

                {/* Gigs Section */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Add Your Gigs
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Create gigs to showcase your services. Add details about
                        what you offer and set your prices.
                      </p>
                    </div>

                    {/* New Gig Form */}
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <label
                          htmlFor="gig-title"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Gig Title
                        </label>
                        <input
                          type="text"
                          id="gig-title"
                          value={newGig.title}
                          onChange={(e) =>
                            setNewGig((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder="e.g., Professional Logo Design"
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm 
                            focus:border-blue-500 focus:ring-blue-500 
                            hover:border-gray-400
                            transition-colors duration-200
                            px-4 py-2.5"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="gig-description"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Description
                        </label>
                        <textarea
                          id="gig-description"
                          value={newGig.description}
                          onChange={(e) =>
                            setNewGig((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Describe what you offer in this gig..."
                          rows={3}
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm 
                            focus:border-blue-500 focus:ring-blue-500 
                            hover:border-gray-400
                            transition-colors duration-200
                            px-4 py-2.5"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="gig-price"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Price (₹)
                          </label>
                          <input
                            type="number"
                            id="gig-price"
                            value={newGig.price || ""}
                            onChange={(e) =>
                              setNewGig((prev) => ({
                                ...prev,
                                price: parseFloat(e.target.value),
                              }))
                            }
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm 
                              focus:border-blue-500 focus:ring-blue-500 
                              hover:border-gray-400
                              transition-colors duration-200
                              px-4 py-2.5"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="gig-image"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Gig Image
                          </label>
                          <input
                            type="file"
                            id="gig-image"
                            accept="image/*"
                            onChange={handleGigImageChange}
                            className="mt-1 block w-full text-sm text-gray-500
                              file:mr-4 file:py-2.5 file:px-4
                              file:rounded-lg file:border-0
                              file:text-sm file:font-semibold
                              file:bg-blue-50 file:text-blue-700
                              hover:file:bg-blue-100
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                              transition-colors duration-200
                              px-4 py-2.5"
                          />
                        </div>
                      </div>

                      {previewUrls.gig && (
                        <div className="relative group aspect-video">
                          <img
                            src={previewUrls.gig}
                            alt="Gig preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGigImage(null);
                              setPreviewUrls((prev) => ({
                                ...prev,
                                gig: undefined,
                              }));
                              setNewGig((prev) => ({ ...prev, image_url: "" }));
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleAddGig}
                        disabled={
                          !newGig.title ||
                          !newGig.description ||
                          !newGig.price ||
                          !newGig.image_url
                        }
                        className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg 
                          hover:bg-blue-700 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                          transition-colors duration-200
                          flex items-center justify-center gap-2
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlusIcon className="w-5 h-5" />
                        Add Gig
                      </button>
                    </div>

                    {/* Existing Gigs */}
                    <div className="space-y-4">
                      {formData.gigs.map((gig, index) => (
                        <div
                          key={index}
                          className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center gap-4"
                        >
                          <img
                            src={gig.image_url}
                            alt={gig.title}
                            className="w-16 h-16 object-cover rounded border"
                          />
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 mb-1">
                              {gig.title}
                            </h5>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-1">
                              {gig.description}
                            </p>
                            <p className="text-sm font-medium text-green-600">
                              ₹{gig.price}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveGig(index)}
                            className="text-red-500 hover:text-red-700 self-start"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-6 sm:mt-8 flex justify-between">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentStep((prev) => prev - 1);
                }}
                disabled={currentStep === 1}
                className="inline-flex items-center px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                Previous
              </button>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentStep((prev) => prev + 1);
                  }}
                  className="inline-flex items-center px-3 sm:px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Next
                  <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-3 sm:px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
