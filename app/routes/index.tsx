// app/routes/index.tsx
import React, { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";
import { CircularMenu } from "../components/CircularMenu/CircularMenu";
import { DealRoom } from "../components/DealRoom/DealRoom";
import { HomePageAd } from "../components/HomePageAd/HomePageAd";
import { AnnouncementTicker } from "../components/AnnouncementTicker/AnnouncementTicker";
import { PostForm } from "../components/PostForm/PostForm";
import { NotificationDialog } from "../components/NotificationDialog/NotificationDialog";
import { getUnreadNotificationCount } from "./api/notifications";

function Index() {
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();

  // Fetch notification count when component mounts or user changes
  useEffect(() => {
    fetchNotificationCount();
    
    // Set up interval to check for new notifications every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotificationCount = async () => {
    if (!user) return;
    
    try {
      setIsLoadingNotifications(true);
      const result = await getUnreadNotificationCount();
      if (result.success) {
        setNotificationCount(result.count || 0);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handlePostIt = () => {
    // Check if user is authenticated
    if (!user) {
      // Show toast notification
      toast.error('Please login to create a post', {
        duration: 3000,
        position: 'top-center',
      });
      
      // Redirect to login page if not authenticated
      setTimeout(() => {
        navigate({ 
          to: '/login',
          search: {
            redirect: window.location.href
          }
        });
      }, 1000);
      return;
    }
    
    // If authenticated, open the post form
    setIsPostFormOpen(true);
  };

  const handleLatestBusiness = () => {
    // Check if user is authenticated
    if (!user) {
      toast.error('Please login to view notifications', {
        duration: 3000,
        position: 'top-center',
      });
      
      setTimeout(() => {
        navigate({ 
          to: '/login',
          search: {
            redirect: window.location.href
          }
        });
      }, 1000);
      return;
    }

    // Open notification dialog
    setIsNotificationDialogOpen(true);
  };

  const handleNotificationRead = () => {
    // Refresh notification count when a notification is marked as read
    fetchNotificationCount();
  };

  return (
    <main className="flex md:h-screen items-center overflow-hidden">
      <div className="container pb-40 mx-auto w-full bg-white hero flex flex-col md:flex-row gap-2 px-4 md:px-0">
        <div className="flex flex-col">
          <div className="mt-[-80px] md:mt-0 min-[320px]:ms-[-100px] min-[375px]:ms-[-105px] min-[425px]:ms-[-100px] lg:ms-[-103px] 2xl:ms-[-20px]">
            <CircularMenu />
          </div>

          {/* Button Container */}
          <div className="flex flex-row justify-center gap-3 mt-4 min-[320px]:ms-[-100px] min-[375px]:ms-[-105px] min-[425px]:ms-[-100px] lg:ms-[-103px] 2xl:ms-[-20px]">
            <button
              onClick={handlePostIt}
              className={`w-40 h-12 font-semibold rounded-lg shadow-md transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                user 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500' 
                  : 'bg-gray-400 hover:bg-gray-500 text-white focus:ring-gray-400'
              }`}
              title={user ? 'Create a new post' : 'Login required to post'}
            >
              {user ? 'Post it' : 'Login to Post'}
            </button>

            <button
              onClick={handleLatestBusiness}
              className="relative w-40 h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              disabled={isLoadingNotifications}
              title={user ? `View notifications${notificationCount > 0 ? ` (${notificationCount} new)` : ''}` : 'Login to view notifications'}
            >
              <span>Latest business</span>
              {user && notificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px] shadow-lg animate-pulse">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
              {isLoadingNotifications && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></span>
              )}
            </button>
          </div>
        </div>

        <div className="mt-[-100px] md:mt-0 h-[550px] md:h-[600px] w-full lg:ms-[-103px] 2xl:ms-[-20px] overflow-hidden relative z-0">
          <DealRoom />
        </div>
        <HomePageAd />
      </div>
      <AnnouncementTicker />
      
      <PostForm 
        isOpen={isPostFormOpen}
        onClose={() => setIsPostFormOpen(false)}
      />

      <NotificationDialog
        isOpen={isNotificationDialogOpen}
        onClose={() => setIsNotificationDialogOpen(false)}
        onNotificationRead={handleNotificationRead}
      />
    </main>
  );
}

export const Route = createFileRoute("/")({
  component: Index,
});
