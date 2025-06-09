import { getAllSellerAnnouncements } from "@/routes/api/announcements";
import { getSellerById } from "@/routes/api/seller";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";

type Announcement = {
  id: number;
  seller_id: number;
  category: string;
  subcategory: string;
  title: string;
  description: string;
  icon: string;
  details: string;
  ad_type: "scroll" | "flip";
  status: "active" | "inactive" | "pending";
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  // Add seller information fields
  seller_info?: {
    company_name?: string;
    address?: string;
    phone?: string;
    description?: string;
  };
};

type AnnouncementResponse = {
  success: boolean;
  announcements?: Announcement[];
  error?: string;
};

export function AnnouncementTicker() {
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const tickerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [displayedAnnouncements, setDisplayedAnnouncements] = useState<
    Announcement[]
  >([]);
  const [isScrolling, setIsScrolling] = useState(true);
  const [tickerTransform, setTickerTransform] = useState("translateX(0)");
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationStartTimeRef = useRef<number>(0);
  const pausedTransformRef = useRef<string>("translateX(0)");
  const animationDuration = 60000; // 60 seconds in milliseconds
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);
  const [animationDelay, setAnimationDelay] = useState("0s");
  const [isLoadingSeller, setIsLoadingSeller] = useState(false);

  const getAllAnnouncements = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = (await getAllSellerAnnouncements({
        data: { ad_type: "scroll" },
      })) as AnnouncementResponse;

      if (result.success && result.announcements) {
        // Fetch seller information for each announcement
        const announcementsWithSellerInfo = await Promise.all(
          result.announcements.map(async (announcement) => {
            try {
              const sellerResult = await getSellerById({
                data: { sellerId: announcement.seller_id },
              });
              
              if (sellerResult.success && sellerResult.seller) {
                return {
                  ...announcement,
                  seller_info: {
                    company_name: sellerResult.seller.company_name,
                    address: sellerResult.seller.address,
                    phone: sellerResult.seller.phone,
                    description: sellerResult.seller.description || "",
                  },
                };
              }
              return announcement;
            } catch (error) {
              console.error(`Error fetching seller ${announcement.seller_id}:`, error);
              return announcement;
            }
          })
        );
        
        setDisplayedAnnouncements(announcementsWithSellerInfo);
      } else {
        setError(result.error || "Failed to fetch announcements");
        setDisplayedAnnouncements([]);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setDisplayedAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllAnnouncements();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !tickerRef.current?.contains(event.target as Node)
      ) {
        handleCloseTooltip();
      }
    };

    if (selectedAnnouncement) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [selectedAnnouncement]);

  const handleMouseEnter = async (
    announcement: Announcement,
    event: React.MouseEvent
  ) => {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });

    // Set the announcement to show the tooltip immediately
    setSelectedAnnouncement(announcement);
    setIsPaused(true);

    // If seller info is not available, try to fetch it
    if (!announcement.seller_info && !isLoadingSeller) {
      try {
        setIsLoadingSeller(true);
        const result = await getSellerById({
          data: { sellerId: announcement.seller_id },
        });

        if (result.success && result.seller) {
          // Update the announcement with seller information
          const updatedAnnouncement = {
            ...announcement,
            seller_info: {
              company_name: result.seller.company_name,
              address: result.seller.address,
              phone: result.seller.phone,
              description: result.seller.description || "",
            },
          };

          // Update the selected announcement with seller information
          setSelectedAnnouncement(updatedAnnouncement);

          // Also update the announcement in the displayedAnnouncements array
          setDisplayedAnnouncements((prevAnnouncements) =>
            prevAnnouncements.map((a) =>
              a.id === announcement.id ? updatedAnnouncement : a
            )
          );
        }
      } catch (error) {
        console.error("Error fetching seller information:", error);
      } finally {
        setIsLoadingSeller(false);
      }
    }
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      if (!tooltipRef.current?.matches(":hover")) {
        handleCloseTooltip();
      }
    }, 100);
  };

  const handleTooltipMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleTooltipMouseLeave = () => {
    handleCloseTooltip();
  };

  const handleCloseTooltip = () => {
    setSelectedAnnouncement(null);
    setIsPaused(false);
  };

  const handleProfileClick = (e: React.MouseEvent, sellerId: number) => {
    e.stopPropagation();
    navigate({
      to: "/seller/$sellerId",
      params: { sellerId: sellerId.toString() },
    });
  };

  if (isLoading) {
    return (
      <div className="fixed bottom-0 left-0 right-0 flex items-center bg-slate-50 border-t-2 border-blue-400 p-4 z-50 shadow-lg">
        <div className="w-full text-center text-slate-600">
          Loading announcements...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-0 left-0 right-0 flex items-center bg-slate-50 border-t-2 border-red-400 p-4 z-50 shadow-lg">
        <div className="w-full text-center text-red-600">{error}</div>
      </div>
    );
  }

  if (displayedAnnouncements.length === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 flex items-center bg-slate-50 border-t-2 border-blue-400 p-4 z-50 shadow-lg">
        <div className="bg-blue-400 text-white px-6 py-2.5 rounded-lg font-bold text-base whitespace-nowrap flex-shrink-0 shadow-md">
          UPCR Resources
        </div>

        <div className="flex-1 overflow-hidden ml-6 group">
          <div
            ref={tickerRef}
            className={`flex gap-2 animate-ticker`}
            style={{
              width: "fit-content",
              animationPlayState: isPaused ? "paused" : "running",
              animationDelay: animationDelay,
              position: "relative",
              left: "0", // Changed from '100%' to '0'
            }}
          >
            {displayedAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                onMouseEnter={(e) => handleMouseEnter(announcement, e)}
                onMouseLeave={handleMouseLeave}
                className="group flex items-center bg-white rounded-lg shadow-sm border border-slate-200 p-2.5 w-[240px] h-[80px] flex-shrink-0 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-400 hover:bg-slate-50 transition-all duration-200 cursor-pointer relative"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-md mr-3 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  <img
                    src={announcement.icon}
                    alt={announcement.title}
                    className="w-auto h-auto max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="flex flex-col justify-center flex-1 min-w-0">
                  <span className="text-sm font-semibold text-slate-800 line-clamp-2 text-center">
                    {announcement.seller_info?.company_name || announcement.title}
                  </span>
                </div>
              </div>
            ))}
            {/* Duplicate the announcements to create a seamless loop */}
            {displayedAnnouncements.map((announcement) => (
              <div
                key={`dup-${announcement.id}`}
                onMouseEnter={(e) => handleMouseEnter(announcement, e)}
                onMouseLeave={handleMouseLeave}
                className="group flex items-center bg-white rounded-lg shadow-sm border border-slate-200 p-2.5 w-[240px] h-[80px] flex-shrink-0 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-400 hover:bg-slate-50 transition-all duration-200 cursor-pointer relative"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-md mr-3 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  <img
                    src={announcement.icon}
                    alt={announcement.title}
                    className="w-auto h-auto max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="flex flex-col justify-center flex-1 min-w-0">
                  <span className="text-sm font-semibold text-slate-800 line-clamp-2 text-center">
                    {announcement.seller_info?.company_name || announcement.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); } /* Changed from translateX(calc(-100% - 100vw)) to -50% */
          }
          .animate-ticker {
            animation: ticker 60s linear infinite;
            animation-fill-mode: forwards;
            transform-origin: left center;
          }
          .line-clamp-4 {
            display: -webkit-box;
            -webkit-line-clamp: 4;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </div>

      {selectedAnnouncement && (
        <div
          ref={tooltipRef}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          className="fixed bg-white rounded-xl shadow-xl p-0 z-[99999] transition-all duration-200 overflow-hidden border border-blue-100"
          style={{
            left: `${tooltipPosition.x}px`,
            bottom: "120px",
            transform: "translateX(-50%)",
            minWidth: "320px",
            maxWidth: "400px",
            boxShadow:
              "0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)",
          }}
        >
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex items-center justify-center shadow-sm border border-blue-100">
                <img
                  src={selectedAnnouncement.icon}
                  alt={selectedAnnouncement.title}
                  className="w-auto h-auto max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-blue-800 mb-1 line-clamp-2">
                  {selectedAnnouncement.title}
                </h3>
                <p className="text-sm text-blue-600 line-clamp-2">
                  {selectedAnnouncement.description}
                </p>
              </div>
            </div>
          </div>

          {/* Content area with white background */}
          <div className="p-4 bg-white">
            {/* Company Information Section */}
            {selectedAnnouncement.seller_info && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h6v4H7V5zm8 8v2h1v1H4v-1h1v-2a1 1 0 011-1h8a1 1 0 011 1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Company Information
                </h4>

                <div className="grid grid-cols-1 gap-2 bg-blue-50 p-3 rounded-lg">
                  {selectedAnnouncement.seller_info.company_name && (
                    <div className="flex items-start">
                      <span className="text-xs text-indigo-600 font-medium w-16">
                        Name:
                      </span>
                      <span className="text-xs text-gray-800 font-semibold">
                        {selectedAnnouncement.seller_info.company_name}
                      </span>
                    </div>
                  )}

                  {selectedAnnouncement.seller_info.address && (
                    <div className="flex items-start">
                      <span className="text-xs text-indigo-600 font-medium w-16">
                        Address:
                      </span>
                      <span className="text-xs text-gray-700 line-clamp-2">
                        {selectedAnnouncement.seller_info.address}
                      </span>
                    </div>
                  )}

                  {selectedAnnouncement.seller_info.phone && (
                    <div className="flex items-start">
                      <span className="text-xs text-indigo-600 font-medium w-16">
                        Contact:
                      </span>
                      <span className="text-xs text-gray-700">
                        {selectedAnnouncement.seller_info.phone}
                      </span>
                    </div>
                  )}
                </div>

                {selectedAnnouncement.seller_info.description && (
                  <div className="mt-3">
                    <span className="text-xs text-indigo-700 font-bold uppercase tracking-wider flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      About
                    </span>
                    <p className="text-xs text-gray-700 line-clamp-3 mt-2 bg-blue-50 p-3 rounded-lg italic">
                      {selectedAnnouncement.seller_info.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Loading state for seller info */}
            {isLoadingSeller && !selectedAnnouncement.seller_info && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-pulse flex space-x-2">
                  <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                  <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                  <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                </div>
                <span className="ml-2 text-xs text-blue-500 font-medium">
                  Loading company information...
                </span>
              </div>
            )}

            {/* View Profile Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={(e) =>
                  handleProfileClick(e, selectedAnnouncement.seller_id)
                }
                className="text-xs bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-md font-medium hover:from-blue-600 hover:to-indigo-700 transition-colors duration-200 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
                View Profile
              </button>
            </div>
          </div>

          {/* Tooltip arrow */}
          <div
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
            style={{
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid white",
            }}
          />
        </div>
      )}
    </>
  );
}
