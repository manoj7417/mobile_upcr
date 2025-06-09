import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { CircularMenu } from '../components/CircularMenu/CircularMenu'
import { DealRoom } from '../components/DealRoom/DealRoom'
import { HomePageAd } from '../components/HomePageAd/HomePageAd'
import { AnnouncementTicker } from '../components/AnnouncementTicker/AnnouncementTicker'

export const Route = createFileRoute('/resource-compass')({
  component: ResourceCompass,
})

function ResourceCompass() {
  return (
    <div className="min-h-screen bg-white">
      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Section - CircularMenu */}
          <div className="w-full lg:w-1/3 flex justify-center items-start sticky top-4">
            <CircularMenu />
          </div>

          {/* Center Section - DealRoom */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-12rem)] overflow-hidden">
              <DealRoom />
            </div>
          </div>

          {/* Right Section - Ads */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="sticky top-4 space-y-6">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <HomePageAd orientation="vertical" />
              </div>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <HomePageAd orientation="vertical" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Ticker - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
        <AnnouncementTicker />
      </div>
    </div>
  )
} 