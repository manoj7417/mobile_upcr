import React, { useState } from 'react';
import { Gavel, DollarSign, Clock, Calendar, Upload, FileText, MapPin, Tag } from 'lucide-react';

export function AuctionForm() {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    startingBid: '',
    reservePrice: '',
    auctionDate: '',
    endDate: '',
    location: '',
    condition: '',
    terms: '',
    uploadedFile: null as File | null
  });

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-yellow-700 px-8 py-6">
        <div className="flex items-center space-x-3">
          <Gavel className="w-8 h-8 text-white" />
          <div>
            <h2 className="text-2xl font-bold text-white">Auction Listing</h2>
            <p className="text-amber-100 mt-1">List your item for auction with bidding details</p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Item Title */}
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Auction Item Title
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Gavel className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter auction item title"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
              Item Category
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 appearance-none"
              >
                <option value="">Select category</option>
                <option value="equipment">Construction Equipment</option>
                <option value="vehicles">Vehicles</option>
                <option value="machinery">Heavy Machinery</option>
                <option value="tools">Tools & Equipment</option>
                <option value="materials">Construction Materials</option>
                <option value="property">Property/Real Estate</option>
                <option value="antiques">Antiques & Collectibles</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Condition */}
          <div>
            <label htmlFor="condition" className="block text-sm font-semibold text-gray-700 mb-2">
              Item Condition
            </label>
            <select
              id="condition"
              value={formData.condition}
              onChange={(e) => handleInputChange('condition', e.target.value)}
              className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
            >
              <option value="">Select condition</option>
              <option value="new">New</option>
              <option value="like-new">Like New</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
              <option value="for-parts">For Parts/Repair</option>
            </select>
          </div>

          {/* Starting Bid */}
          <div>
            <label htmlFor="startingBid" className="block text-sm font-semibold text-gray-700 mb-2">
              Starting Bid
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="h-5 w-5 text-gray-400 text-sm font-medium">₹</span>
              </div>
              <input
                type="number"
                id="startingBid"
                value={formData.startingBid}
                onChange={(e) => handleInputChange('startingBid', e.target.value)}
                placeholder="Enter starting bid amount"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Reserve Price */}
          <div>
            <label htmlFor="reservePrice" className="block text-sm font-semibold text-gray-700 mb-2">
              Reserve Price (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="h-5 w-5 text-gray-400 text-sm font-medium">₹</span>
              </div>
              <input
                type="number"
                id="reservePrice"
                value={formData.reservePrice}
                onChange={(e) => handleInputChange('reservePrice', e.target.value)}
                placeholder="Minimum acceptable price"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Auction Start Date */}
          <div>
            <label htmlFor="auctionDate" className="block text-sm font-semibold text-gray-700 mb-2">
              Auction Start Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="datetime-local"
                id="auctionDate"
                value={formData.auctionDate}
                onChange={(e) => handleInputChange('auctionDate', e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Auction End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-2">
              Auction End Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="datetime-local"
                id="endDate"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Location */}
          <div className="md:col-span-2">
            <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
              Item Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, State, Country (where item can be viewed/collected)"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Item Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Item Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detailed description of the item, its history, specifications, and any notable features..."
              className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 resize-none"
            />
          </div>

          {/* Terms & Conditions */}
          <div className="md:col-span-2">
            <label htmlFor="terms" className="block text-sm font-semibold text-gray-700 mb-2">
              Terms & Conditions
            </label>
            <textarea
              id="terms"
              rows={3}
              value={formData.terms}
              onChange={(e) => handleInputChange('terms', e.target.value)}
              placeholder="Payment terms, pickup arrangements, inspection periods, return policy, etc..."
              className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 resize-none"
            />
          </div>

          {/* Item Images/Documents */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Item Images/Documents
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-amber-400 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-amber-600 hover:text-amber-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-amber-500"
                  >
                    <span>Upload files</span>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      className="sr-only" 
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) => handleInputChange('uploadedFile', e.target.files?.[0] || null)}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">High-quality images, documentation, certificates up to 10MB each</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            className="bg-gradient-to-r from-amber-600 to-yellow-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:from-amber-700 hover:to-yellow-800 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
          >
            <FileText className="w-5 h-5" />
            <span>Create Auction</span>
          </button>
        </div>
      </div>
    </div>
  );
} 