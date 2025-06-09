import React, { useState } from 'react';
import { ShoppingBag, Store, DollarSign, Package, Upload, FileText, MapPin, Tag, Star } from 'lucide-react';

export function EStoreForm() {
  const [formData, setFormData] = useState({
    storeName: '',
    category: '',
    description: '',
    products: '',
    pricing: '',
    shippingInfo: '',
    location: '',
    businessHours: '',
    paymentMethods: '',
    returnPolicy: '',
    uploadedFile: null as File | null
  });

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-8 py-6">
        <div className="flex items-center space-x-3">
          <ShoppingBag className="w-8 h-8 text-white" />
          <div>
            <h2 className="text-2xl font-bold text-white">E-Store Listing</h2>
            <p className="text-violet-100 mt-1">Create your online store presence</p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Store Name */}
          <div className="md:col-span-2">
            <label htmlFor="storeName" className="block text-sm font-semibold text-gray-700 mb-2">
              Store Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Store className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="storeName"
                value={formData.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
                placeholder="Enter your store name"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Store Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
              Store Category
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 appearance-none"
              >
                <option value="">Select category</option>
                <option value="construction-supplies">Construction Supplies</option>
                <option value="tools-equipment">Tools & Equipment</option>
                <option value="building-materials">Building Materials</option>
                <option value="safety-gear">Safety Gear</option>
                <option value="electrical">Electrical Supplies</option>
                <option value="plumbing">Plumbing Supplies</option>
                <option value="hardware">Hardware & Fasteners</option>
                <option value="machinery">Machinery & Parts</option>
                <option value="general">General Store</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Business Hours */}
          <div>
            <label htmlFor="businessHours" className="block text-sm font-semibold text-gray-700 mb-2">
              Business Hours
            </label>
            <input
              type="text"
              id="businessHours"
              value={formData.businessHours}
              onChange={(e) => handleInputChange('businessHours', e.target.value)}
              placeholder="e.g., Mon-Fri: 9AM-6PM, Sat: 9AM-2PM"
              className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
              Store Location
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
                placeholder="City, State, Country"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <label htmlFor="paymentMethods" className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Methods Accepted
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="h-5 w-5 text-gray-400 text-sm font-medium">₹</span>
              </div>
              <input
                type="text"
                id="paymentMethods"
                value={formData.paymentMethods}
                onChange={(e) => handleInputChange('paymentMethods', e.target.value)}
                placeholder="e.g., Cash, Credit Cards, PayPal, Bank Transfer"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Products & Services */}
          <div className="md:col-span-2">
            <label htmlFor="products" className="block text-sm font-semibold text-gray-700 mb-2">
              Products & Services Offered
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                <Package className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="products"
                rows={3}
                value={formData.products}
                onChange={(e) => handleInputChange('products', e.target.value)}
                placeholder="List your main products and services, brands you carry, special offerings..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 resize-none"
              />
            </div>
          </div>

          {/* Pricing Information */}
          <div className="md:col-span-2">
            <label htmlFor="pricing" className="block text-sm font-semibold text-gray-700 mb-2">
              Pricing Information
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                <Star className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="pricing"
                rows={3}
                value={formData.pricing}
                onChange={(e) => handleInputChange('pricing', e.target.value)}
                placeholder="Describe your pricing structure, bulk discounts, special offers, price ranges..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 resize-none"
              />
            </div>
          </div>

          {/* Store Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Store Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your store, your experience, specializations, what sets you apart from competitors..."
              className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 resize-none"
            />
          </div>

          {/* Shipping Information */}
          <div className="md:col-span-2">
            <label htmlFor="shippingInfo" className="block text-sm font-semibold text-gray-700 mb-2">
              Shipping & Delivery Information
            </label>
            <textarea
              id="shippingInfo"
              rows={3}
              value={formData.shippingInfo}
              onChange={(e) => handleInputChange('shippingInfo', e.target.value)}
              placeholder="Shipping areas, delivery options, costs, timeframes, pickup availability..."
              className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 resize-none"
            />
          </div>

          {/* Return Policy */}
          <div className="md:col-span-2">
            <label htmlFor="returnPolicy" className="block text-sm font-semibold text-gray-700 mb-2">
              Return & Exchange Policy
            </label>
            <textarea
              id="returnPolicy"
              rows={3}
              value={formData.returnPolicy}
              onChange={(e) => handleInputChange('returnPolicy', e.target.value)}
              placeholder="Return periods, conditions, exchange policies, warranty information..."
              className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 resize-none"
            />
          </div>

          {/* Store Images/Documents */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Store Images/Catalogs
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-violet-400 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-violet-600 hover:text-violet-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-violet-500"
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
                <p className="text-xs text-gray-500">Store photos, product catalogs, certificates up to 10MB each</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            className="bg-gradient-to-r from-violet-600 to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:from-violet-700 hover:to-purple-800 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
          >
            <FileText className="w-5 h-5" />
            <span>Launch Store</span>
          </button>
        </div>
      </div>
    </div>
  );
} 