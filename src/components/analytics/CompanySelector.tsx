import { useState } from 'react';

interface Company {
  id: string;
  name: string;
  reportDate: string;
}

interface CompanySelectorProps {
  companies: Company[];
  selectedCompany: Company | null;
  onCompanySelect: (company: Company) => void;
  isLoading: boolean;
}

const CompanySelector = ({ 
  companies, 
  selectedCompany, 
  onCompanySelect,
  isLoading
}: CompanySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleDropdown = () => {
    if (!isLoading) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (company: Company) => {
    onCompanySelect(company);
    setIsOpen(false);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        className={`flex items-center justify-between w-full px-4 py-2 text-sm font-medium bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
        onClick={toggleDropdown}
        disabled={isLoading}
      >
        <span className="flex items-center">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading...</span>
            </span>
          ) : selectedCompany ? (
            <div className="flex flex-col">
              <span>{selectedCompany.name}</span>
              <span className="text-xs text-slate-500">
                Report: {formatDate(selectedCompany.reportDate)}
              </span>
            </div>
          ) : (
            'Select a company'
          )}
        </span>
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-full bg-white shadow-lg rounded-md border border-slate-200 overflow-hidden">
          <ul className="py-1 max-h-60 overflow-auto">
            {companies.map((company) => (
              <li
                key={`${company.id}-${company.reportDate}`}
                className="cursor-pointer hover:bg-slate-100"
                onClick={() => handleSelect(company)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="font-medium">{company.name}</div>
                  <div className="text-xs text-slate-500">
                    Report: {formatDate(company.reportDate)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CompanySelector;
