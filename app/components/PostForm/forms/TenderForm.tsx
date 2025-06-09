import React, { useState, useEffect } from 'react';
import { Upload, FileText, Calendar, MapPin, User, Phone, Mail, ClipboardList, Building, Briefcase, Target } from 'lucide-react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { createTender } from '../../../routes/api/tenders';

// Define TypeScript interfaces
interface FormData {
  engineeringCategory: 'civil' | 'mechanical' | 'electrical' | 'chemical' | 'environmental' | '';
  specialization: string;
  tenderName: string;
  location: string;
  scope: string;
  estimatedValue: string;
  collectionDate: string;
  submissionDate: string;
  contactName: string;
  contactNumber: string;
  contactEmail: string;
  address: string;
  uploadedFile: File | null;
}

interface PDFData extends FormData {
  upcRef: string;
}

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff'
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#1e40af'
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#1e40af',
    fontWeight: 'bold'
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8
  },
  label: {
    width: '30%',
    fontSize: 12,
    color: '#4b5563'
  },
  value: {
    width: '70%',
    fontSize: 12,
    color: '#111827'
  },
  upcRef: {
    fontSize: 14,
    color: '#047857',
    marginBottom: 15
  }
});

// PDF Document Component
const TenderPDF = ({ data }: { data: PDFData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Tender Details</Text>
      
      <View style={styles.section}>
        <Text style={styles.upcRef}>UPC Reference: {data.upcRef}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tender Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Engineering Category:</Text>
          <Text style={styles.value}>{data.engineeringCategory}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Specialization:</Text>
          <Text style={styles.value}>{data.specialization}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tender Name:</Text>
          <Text style={styles.value}>{data.tenderName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>{data.location}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Scope:</Text>
          <Text style={styles.value}>{data.scope}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial & Timeline Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Estimated Value:</Text>
          <Text style={styles.value}>₹{data.estimatedValue}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Collection Date:</Text>
          <Text style={styles.value}>{data.collectionDate}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Submission Date:</Text>
          <Text style={styles.value}>{data.submissionDate}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Contact Name:</Text>
          <Text style={styles.value}>{data.contactName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Contact Number:</Text>
          <Text style={styles.value}>{data.contactNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{data.contactEmail}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{data.address}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

// Function to generate UPC reference number locally
const generateUPCReference = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const currentDate = `${year}${month}${day}`;
  
  // Generate a random number between 0 and 9999
  const randomNumber = Math.floor(Math.random() * 10000);
  const paddedNumber = String(randomNumber).padStart(4, '0');
  
  return `UPCR-${currentDate}-${paddedNumber}`;
};

export function TenderForm({ onClose, prefilledUPC }: { onClose: () => void, prefilledUPC?: string | null }) {
  const [upcRef, setUpcRef] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submittedData, setSubmittedData] = useState<PDFData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    engineeringCategory: '',
    specialization: '',
    tenderName: '',
    location: '',
    scope: '',
    estimatedValue: '',
    collectionDate: '',
    submissionDate: '',
    contactName: '',
    contactNumber: '',
    contactEmail: '',
    address: '',
    uploadedFile: null
  });

  // Generate UPC reference on component mount
  useEffect(() => {
    if (prefilledUPC) {
      // Use the prefilled UPC from the route
      setUpcRef(prefilledUPC)
    } else {
      // Generate new UPC reference locally
      const newUPCRef = generateUPCReference();
      setUpcRef(newUPCRef);
    }
  }, [prefilledUPC]);

  const handleInputChange = (field: keyof FormData, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear any previous errors when user starts typing
    if (error) {
      setError(null);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.engineeringCategory) return 'Please select an engineering category';
    if (!formData.specialization.trim()) return 'Please enter specialization';
    if (!formData.tenderName.trim()) return 'Please enter tender name';
    if (!formData.location.trim()) return 'Please enter location';
    if (!formData.scope.trim()) return 'Please enter project scope';
    if (!formData.estimatedValue.trim()) return 'Please enter estimated value';
    if (!formData.collectionDate) return 'Please select collection date';
    if (!formData.submissionDate) return 'Please select submission date';
    if (!formData.contactName.trim()) return 'Please enter contact name';
    if (!formData.contactNumber.trim()) return 'Please enter contact number';
    if (!formData.contactEmail.trim()) return 'Please enter contact email';
    if (!formData.address.trim()) return 'Please enter address';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      return 'Please enter a valid email address';
    }

    // Validate dates
    const collectionDate = new Date(formData.collectionDate);
    const submissionDate = new Date(formData.submissionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (collectionDate < today) {
      return 'Collection date cannot be in the past';
    }

    if (submissionDate <= collectionDate) {
      return 'Submission date must be after collection date';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createTender({
        data: {
          engineering_category: formData.engineeringCategory as 'civil' | 'mechanical' | 'electrical' | 'chemical' | 'environmental',
          specialization: formData.specialization,
          tender_name: formData.tenderName,
          location: formData.location,
          scope: formData.scope,
          estimated_value: formData.estimatedValue,
          collection_date: formData.collectionDate,
          submission_date: formData.submissionDate,
          contact_name: formData.contactName,
          contact_number: formData.contactNumber,
          contact_email: formData.contactEmail,
          address: formData.address,
          document_urls: []
        }
      });

      if (result.success) {
        // Prepare data for PDF
        const pdfData: PDFData = {
          ...formData,
          upcRef: upcRef
        };
        
        setSubmittedData(pdfData);
        setShowSuccessModal(true);
        
        // Auto close modal and redirect after 5 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
          onClose();
        }, 5000);
      } else {
        setError(result.error || 'Failed to create tender. Please try again.');
      }
    } catch (error) {
      console.error('Error creating tender:', error);
      setError('Failed to create tender. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
        <div className="flex items-center space-x-3">
          <ClipboardList className="w-8 h-8 text-white" />
          <div>
            <h2 className="text-2xl font-bold text-white">Create New Tender</h2>
            <p className="text-blue-100 mt-1">Fill in the details below to publish your tender</p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* UPC Reference No - Auto generated */}
            <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
              <label htmlFor="upcRef" className="block text-sm font-semibold text-gray-700 mb-2">
                UPC Reference No (Auto-generated)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  type="text"
                  id="upcRef"
                  value={upcRef}
                  disabled
                  className="block w-full pl-10 pr-3 py-3 bg-white border border-blue-300 rounded-xl shadow-sm text-blue-700 font-medium"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">This reference number is automatically generated and cannot be changed.</p>
            </div>

            {/* Engineering Category */}
            <div>
              <label htmlFor="engineeringCategory" className="block text-sm font-semibold text-gray-700 mb-2">
                Engineering Category *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="engineeringCategory"
                  value={formData.engineeringCategory}
                  onChange={(e) => handleInputChange('engineeringCategory', e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none"
                  required
                >
                  <option value="">Select category</option>
                  <option value="civil">Civil Engineering</option>
                  <option value="mechanical">Mechanical Engineering</option>
                  <option value="electrical">Electrical Engineering</option>
                  <option value="chemical">Chemical Engineering</option>
                  <option value="environmental">Environmental Engineering</option>
                </select>
              </div>
            </div>

            {/* Engineering Specialization */}
            <div>
              <label htmlFor="specialization" className="block text-sm font-semibold text-gray-700 mb-2">
                Engineering Specialization *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  placeholder="e.g., Structural, HVAC, Power Systems"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Name of the Tender */}
            <div className="md:col-span-2">
              <label htmlFor="tenderName" className="block text-sm font-semibold text-gray-700 mb-2">
                Name of the Tender *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ClipboardList className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="tenderName"
                  value={formData.tenderName}
                  onChange={(e) => handleInputChange('tenderName', e.target.value)}
                  placeholder="Enter the official tender name"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="md:col-span-2">
              <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                Project Location *
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
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Scope */}
            <div className="md:col-span-2">
              <label htmlFor="scope" className="block text-sm font-semibold text-gray-700 mb-2">
                Project Scope & Description *
              </label>
              <textarea
                id="scope"
                rows={4}
                value={formData.scope}
                onChange={(e) => handleInputChange('scope', e.target.value)}
                placeholder="Describe the project scope, requirements, deliverables, and specifications in detail..."
                className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                required
              />
            </div>

            {/* Estimated Value */}
            <div>
              <label htmlFor="estimatedValue" className="block text-sm font-semibold text-gray-700 mb-2">
                Estimated Project Value *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="h-5 w-5 text-gray-400 text-sm font-medium">₹</span>
                </div>
                <input
                  type="number"
                  id="estimatedValue"
                  value={formData.estimatedValue}
                  onChange={(e) => handleInputChange('estimatedValue', e.target.value)}
                  placeholder="Enter estimated value"
                  min="0"
                  step="0.01"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Last Date of Tender Collection */}
            <div>
              <label htmlFor="collectionDate" className="block text-sm font-semibold text-gray-700 mb-2">
                Last Date of Tender Collection *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="collectionDate"
                  value={formData.collectionDate}
                  onChange={(e) => handleInputChange('collectionDate', e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Last Date of Tender Submission */}
            <div>
              <label htmlFor="submissionDate" className="block text-sm font-semibold text-gray-700 mb-2">
                Last Date of Tender Submission *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="submissionDate"
                  value={formData.submissionDate}
                  onChange={(e) => handleInputChange('submissionDate', e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Upload NIT/Tender Details */}
            <div className="md:col-span-2">
              <label htmlFor="tenderDetails" className="block text-sm font-semibold text-gray-700 mb-2">
                Upload NIT/Tender Details (Optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
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
                  <p className="text-xs text-gray-500">NIT documents, specifications, drawings (PDF, DOC up to 10MB)</p>
                  {formData.uploadedFile && (
                    <p className="text-xs text-green-600 mt-2">
                      Selected: {formData.uploadedFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="md:col-span-2 bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <User className="w-6 h-6 mr-2 text-blue-600" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Name */}
                <div>
                  <label htmlFor="contactName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Person Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                      placeholder="Enter contact person name"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Contact Number */}
                <div>
                  <label htmlFor="contactNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="contactNumber"
                      value={formData.contactNumber}
                      onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                      placeholder="Enter phone number"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Contact Email */}
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="contactEmail"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      placeholder="Enter email address"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                    Office Address *
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      id="address"
                      rows={3}
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter complete office address"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-800 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 ${
                isSubmitting ? 'opacity-75 cursor-not-allowed transform-none' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Publish Tender</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal with PDF Download */}
      {showSuccessModal && submittedData && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Successfully Published!</h3>
            <p className="text-sm text-gray-500 mb-2">Your tender has been published successfully.</p>
            <p className="text-sm text-blue-600 font-medium mb-6">UPC Reference: {submittedData.upcRef}</p>
            
            {/* PDF Download Link */}
            <PDFDownloadLink
              document={<TenderPDF data={submittedData} />}
              fileName={`tender-${submittedData.upcRef}.pdf`}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-medium shadow-lg mb-4"
            >
              {({ loading }) =>
                loading ? (
                  <span>Preparing PDF...</span>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Download Tender PDF</span>
                  </>
                )
              }
            </PDFDownloadLink>
            
            <p className="text-xs text-gray-400">This modal will close automatically in 5 seconds</p>
          </div>
        </div>
      )}
    </div>
  );
}