import React, { useState, useEffect } from "react";
import { getAllSellerAnnouncements } from "@/routes/api/announcements";
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
};

type Testimonial = {
  text: string;
  author: string;
  role: string;
  stars: number;
};

type AnnouncementResponse = {
  success: boolean;
  announcements?: Announcement[];
  error?: string;
};

export function HomePageAd() {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [flipAnnouncements, setFlipAnnouncements] = useState<Announcement[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const testimonials: Testimonial[] = [
    {
      text: "UPC Resources has transformed our business operations with their innovative solutions.",
      author: "John Smith",
      role: "CEO, TechCorp",
      stars: 5,
    },
    {
      text: "The team's expertise and dedication have been instrumental in our success.",
      author: "Sarah Johnson",
      role: "Operations Director",
      stars: 5,
    },
    {
      text: "Outstanding service and support from start to finish.",
      author: "Michael Brown",
      role: "Project Manager",
      stars: 5,
    },
  ];

  const getFlipAnnouncements = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = (await getAllSellerAnnouncements({
        data: { ad_type: "flip" },
      })) as AnnouncementResponse;

      if (result.success && result.announcements) {
        setFlipAnnouncements(result.announcements);
      } else {
        setError(result.error || "Failed to fetch announcements");
        setFlipAnnouncements([]);
      }
    } catch (err) {
      console.error("Error fetching flip announcements:", err);
      setError("An unexpected error occurred");
      setFlipAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getFlipAnnouncements();
  }, []);

  useEffect(() => {
    const testimonialTimer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => {
      clearInterval(testimonialTimer);
    };
  }, []);

  const handleProfileClick = (announcement: Announcement | undefined) => {
    if (!announcement) return;
    navigate({
      to: "/seller/$sellerId",
      params: { sellerId: announcement.seller_id.toString() },
    });
  };

  if (isLoading) {
    return <div>Loading advertisements...</div>;
  }

  if (error) {
    console.error("Error loading flip announcements:", error);
    return null; // Silently fail and don't show the ad section
  }

  return (
    <div className="flex flex-col justify-between w-full md:max-w-[240px] mx-auto">
      {/* First Ad Section */}
      {flipAnnouncements[0] && (
        <div className="relative h-[200px] rounded-lg overflow-hidden shadow-md z-10">
          {flipAnnouncements[0].icon.startsWith("http") ? (
            <img
              src={flipAnnouncements[0].icon}
              alt="Advertisement 1"
              className="w-full h-full object-cover transition-opacity duration-1000 cursor-pointer"
              onClick={() => handleProfileClick(flipAnnouncements[0])}
              onError={(e) => {
                console.error(
                  "Error loading image:",
                  flipAnnouncements[0]?.icon
                );
                e.currentTarget.style.display = "none";
              }}
              onLoad={() =>
                console.log(
                  "Image loaded successfully:",
                  flipAnnouncements[0]?.icon
                )
              }
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center bg-slate-100 text-6xl cursor-pointer"
              onClick={() => handleProfileClick(flipAnnouncements[0])}
            >
              {flipAnnouncements[0].icon || "📢"}
            </div>
          )}
        </div>
      )}

      {/* Logo and Testimonial Section */}
      <div className="flex flex-col items-center py-2 relative">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 blur-md"></div>
          <img
            src="/ads_award.png"
            alt="UPC Resources Logo"
            className="w-20 h-20 object-contain relative z-10"
          />
        </div>
        <div
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="relative bg-white rounded-lg p-2 shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_24px_rgba(234,179,8,0.5)] transition-all duration-200 w-full cursor-pointer transform hover:-translate-y-0.5 z-20"
        >
          <div className="flex flex-col gap-1">
            <div className="text-slate-800 text-xs font-semibold">
              Testimonial
            </div>
            <div className="text-slate-600 text-xs italic line-clamp-2">
              "{testimonials[currentTestimonial]?.text || ""}"
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, index) => (
                <svg
                  key={index}
                  className="w-3 h-3 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <div className="text-slate-800 text-xs font-semibold truncate">
              {testimonials[currentTestimonial]?.author || ""} •{" "}
              {testimonials[currentTestimonial]?.role || ""}
            </div>
          </div>

          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-[280px] bg-white rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.2)] p-4 z-[99999999]">
              <div className="flex flex-col gap-3">
                <div className="text-slate-800 text-sm font-semibold">
                  Testimonial
                </div>
                <div className="text-slate-700 text-sm italic">
                  "{testimonials[currentTestimonial]?.text || ""}"
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div className="text-slate-800 text-sm font-semibold truncate">
                  {testimonials[currentTestimonial]?.author || ""} •{" "}
                  {testimonials[currentTestimonial]?.role || ""}
                </div>
              </div>
              {/* Tooltip Arrow */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45"></div>
            </div>
          )}
        </div>
      </div>

      {/* Second Ad Section */}
      {flipAnnouncements[1] && (
        <div className="relative h-[200px] rounded-lg overflow-hidden shadow-md z-10">
          {flipAnnouncements[1].icon.startsWith("http") ? (
            <img
              src={flipAnnouncements[1].icon}
              alt="Advertisement 2"
              className="w-full h-full object-cover transition-opacity duration-1000 cursor-pointer"
              onClick={() => handleProfileClick(flipAnnouncements[1])}
              onError={(e) => {
                console.error(
                  "Error loading image:",
                  flipAnnouncements[1]?.icon
                );
                e.currentTarget.style.display = "none";
              }}
              onLoad={() =>
                console.log(
                  "Image loaded successfully:",
                  flipAnnouncements[1]?.icon
                )
              }
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center bg-slate-100 text-6xl cursor-pointer"
              onClick={() => handleProfileClick(flipAnnouncements[1])}
            >
              {flipAnnouncements[1].icon || "📢"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
