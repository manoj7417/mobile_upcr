import React, { useState } from 'react';
import { useCategory } from '../../context/CategoryContext';
import { TenderForm } from './forms/TenderForm';
import { LandForm } from './forms/LandForm';
import { MachinesForm } from './forms/MachinesForm';
import { MaterialForm } from './forms/MaterialForm';
import { EquipmentForm } from './forms/EquipmentForm';
import { ToolsForm } from './forms/ToolsForm';
import { ManpowerForm } from './forms/ManpowerForm';
import { FinanceForm } from './forms/FinanceForm';
import { ShowcaseForm } from './forms/ShowcaseForm';
import { AuctionForm } from './forms/AuctionForm';
import { JobsForm } from './forms/JobsForm';
import { EStoreForm } from './forms/EStoreForm';
import { X, FileText, MapPin, Cog, Package, Wrench, Hammer, Users, Star, Gavel, Briefcase, Store } from 'lucide-react';

interface PostFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PostForm({ isOpen, onClose }: PostFormProps) {
  const { selectedCategory } = useCategory();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const getCategoryIcon = () => {
    const iconProps = { size: 20, className: "text-blue-600" };
    switch (selectedCategory) {
      case 'Tenders': return <FileText {...iconProps} />;
      case 'Land': return <MapPin {...iconProps} />;
      case 'Machines': return <Cog {...iconProps} />;
      case 'Material': return <Package {...iconProps} />;
      case 'Equipment': return <Wrench {...iconProps} />;
      case 'Tools': return <Hammer {...iconProps} />;
      case 'Manpower': return <Users {...iconProps} />;
      case 'Finance': return <span className="w-5 h-5 text-current text-sm font-bold">₹</span>;
      case 'Showcase': return <Star {...iconProps} />;
      case 'Auction': return <Gavel {...iconProps} />;
      case 'Jobs': return <Briefcase {...iconProps} />;
      case 'E-Stores': return <Store {...iconProps} />;
      default: return <FileText {...iconProps} />;
    }
  };

  const renderFormFields = () => {
    switch (selectedCategory) {
      case 'Tenders':
        return <TenderForm onClose={onClose} />;
      case 'Land':
        return <LandForm />;
      case 'Machines':
        return <MachinesForm />;
      case 'Material':
        return <MaterialForm />;
      case 'Equipment':
        return <EquipmentForm />;
      case 'Tools':
        return <ToolsForm />;
      case 'Manpower':
        return <ManpowerForm />;
      case 'Finance':
        return <FinanceForm />;
      case 'Showcase':
        return <ShowcaseForm />;
      case 'Auction':
        return <AuctionForm />;
      case 'Jobs':
        return <JobsForm />;
      case 'E-Stores':
        return <EStoreForm />;
      default:
        return (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <FileText size={48} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Category Selected</h3>
            <p className="text-gray-600 max-w-sm">
              Please select a category from the circular menu to continue creating your post.
            </p>
          </div>
        );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle">
          <div className="bg-white">
            <div className="w-full">
              {renderFormFields()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}