import React, { useState } from 'react';
import { DollarSign, CreditCard, Percent, FileText, Upload, MapPin, Building, Calculator } from 'lucide-react';

export function FinanceForm() {
  const [formData, setFormData] = useState({
    serviceType: '',
    loanAmount: '',
    interestRate: '',
    tenure: '',
    eligibility: '',
    processingFee: '',
    institution: '',
    location: '',
    description: '',
    uploadedFile: null as File | null
  });

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-8 py-6">
        <div className="flex items-center space-x-3">
          <span className="w-8 h-8 text-white text-2xl font-bold">₹</span>
          <div>
            <h2 className="text-2xl font-bold text-white">Financial Services Listing</h2>
            <p className="text-emerald-100 mt-1">Share details about your financial products and services</p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service Type */}
          <div className="md:col-span-2">
            <label htmlFor="serviceType" className="block text-sm font-semibold text-gray-700 mb-2">
              Financial Service Type
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="serviceType"
                value={formData.serviceType}
                onChange={(e) => handleInputChange('serviceType', e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 appearance-none"
              >
                <option value="">Select service type</option>
                <option value="construction-loan">Construction Loan</option>
                <option value="business-loan">Business Loan</option>
                <option value="equipment-finance">Equipment Finance</option>
                <option value="working-capital">Working Capital</option>
                <option value="project-finance">Project Finance</option>
                <option value="personal-loan">Personal Loan</option>
                <option value="investment">Investment Services</option>
                <option value="insurance">Insurance</option>
                <option value="other">Financial Instruments (SBLC/BG/LC….)</option>
              </select>
            </div>
          </div>

          {/* Institution Name */}
          <div>
            <label htmlFor="institution" className="block text-sm font-semibold text-gray-700 mb-2">
              Institution/Company Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="institution"
                value={formData.institution}
                onChange={(e) => handleInputChange('institution', e.target.value)}
                placeholder="Enter institution name"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
              Location
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
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Loan Amount Range */}
          <div>
            <label htmlFor="loanAmount" className="block text-sm font-semibold text-gray-700 mb-2">
              Loan Amount Range
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="h-5 w-5 text-gray-400 text-sm font-medium">₹</span>
              </div>
              <input
                type="text"
                id="loanAmount"
                value={formData.loanAmount}
                onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                placeholder="e.g., ₹50,000 - ₹5,00,000"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <label htmlFor="interestRate" className="block text-sm font-semibold text-gray-700 mb-2">
              Interest Rate
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Percent className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="interestRate"
                value={formData.interestRate}
                onChange={(e) => handleInputChange('interestRate', e.target.value)}
                placeholder="e.g., 8.5% - 12% p.a."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Tenure */}
          <div>
            <label htmlFor="tenure" className="block text-sm font-semibold text-gray-700 mb-2">
              Tenure/Repayment Period
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calculator className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="tenure"
                value={formData.tenure}
                onChange={(e) => handleInputChange('tenure', e.target.value)}
                placeholder="e.g., 1-5 years, 6 months"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Processing Fee */}
          <div>
            <label htmlFor="processingFee" className="block text-sm font-semibold text-gray-700 mb-2">
              Processing Fee
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="h-5 w-5 text-gray-400 text-sm font-medium">₹</span>
              </div>
              <input
                type="text"
                id="processingFee"
                value={formData.processingFee}
                onChange={(e) => handleInputChange('processingFee', e.target.value)}
                placeholder="e.g., 1% of loan amount, ₹500 flat"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div className="md:col-span-2">
            <label htmlFor="eligibility" className="block text-sm font-semibold text-gray-700 mb-2">
              Eligibility Criteria
            </label>
            <textarea
              id="eligibility"
              rows={3}
              value={formData.eligibility}
              onChange={(e) => handleInputChange('eligibility', e.target.value)}
              placeholder="e.g., Minimum income, credit score requirements, collateral requirements..."
              className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Service Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the financial product, benefits, special features, approval process, and any additional services..."
              className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
            />
          </div>

          {/* File Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Brochures/Documents
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-emerald-400 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500"
                  >
                    <span>Upload files</span>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      className="sr-only" 
                      multiple
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleInputChange('uploadedFile', e.target.files?.[0] || null)}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">Product brochures, terms & conditions (PDF, DOC up to 10MB)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            className="bg-gradient-to-r from-emerald-600 to-green-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:from-emerald-700 hover:to-green-800 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
          >
            <FileText className="w-5 h-5" />
            <span>Publish Service</span>
          </button>
        </div>
      </div>
    </div>
  );
} 