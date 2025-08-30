import React, { createContext, useContext, useState, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { apiHelpers } from '../config/api';

// Real contract data structure matching production API
interface Contract {
  id: number;
  contract_number: string;
  tenant_name: string;
  tenant_email?: string;
  tenant_national_id?: string;
  landlord_name: string;
  landlord_email?: string;
  landlord_national_id?: string;
  property_address: string;
  rent_amount: number;
  deposit?: number;
  start_date: string; // ISO format
  end_date: string;
  access_code: string; // 6-digit string
  status: 'draft' | 'active' | 'signed' | 'terminated';
  signature?: string; // Base64 image
  national_id_image?: string; // Base64 image
  created_at: string; // ISO timestamp
  signed_at?: string;
  
  // Legacy fields for compatibility
  contractNumber?: string;
  accessCode?: string;
  tenantName?: string;
  tenantEmail?: string;
  tenantPhone?: string;
  tenantNationalId?: string;
  landlordName?: string;
  landlordEmail?: string;
  landlordNationalId?: string;
  propertyAddress?: string;
  propertyType?: string;
  rentAmount?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  lastModified?: string;
  signedAt?: string;
  terminatedAt?: string;
  createdBy?: string;
  nationalId?: string;
}

interface ContractContextType {
  contracts: Contract[];
  filteredContracts: Contract[];
  isLoading: boolean;
  searchQuery: string;
  statusFilter: string;
  fetchContracts: () => Promise<void>;
  saveContracts: (contracts: Contract[]) => Promise<void>;
  addContract: (contractData: Partial<Contract>) => Promise<Contract>;
  updateContract: (contractNumber: string, updates: Partial<Contract>) => Promise<void>;
  deleteContract: (contractNumber: string) => Promise<void>;
  terminateContract: (contractNumber: string) => Promise<void>;
  signContract: (contractNumber: string, signature: string) => Promise<void>;
  lookupTenantByNationalId: (nationalId: string) => Promise<any>;
  lookupLandlordByNationalId: (nationalId: string) => Promise<any>;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: string) => void;
  getContractByCredentials: (contractNumber: string, accessCode: string) => Contract | null;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export const useContracts = () => {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error('useContracts must be used within a ContractProvider');
  }
  return context;
};

interface ContractProviderProps {
  children: ReactNode;
}

export const ContractProvider: React.FC<ContractProviderProps> = ({ children }) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const generateContractNumber = () => `RNT${Date.now()}`;
  const generateAccessCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      const response = await apiHelpers.getContracts();
      
      // Transform API response to match frontend interface
      const serverContracts = (response.contracts || []).map((contract: any) => ({
        ...contract,
        // Add legacy field mappings for compatibility
        contractNumber: contract.contract_number,
        accessCode: contract.access_code,
        tenantName: contract.tenant_name,
        tenantEmail: contract.tenant_email,
        tenantNationalId: contract.tenant_national_id,
        landlordName: contract.landlord_name,
        landlordEmail: contract.landlord_email,
        landlordNationalId: contract.landlord_national_id,
        propertyAddress: contract.property_address,
        rentAmount: contract.rent_amount?.toString(),
        startDate: contract.start_date,
        endDate: contract.end_date,
        createdAt: contract.created_at,
        signedAt: contract.signed_at
      }));
      
      setContracts(serverContracts);
      filterContracts(serverContracts, searchQuery, statusFilter);
      
      if (serverContracts.length === 0) {
        toast.info('هیچ قراردادی یافت نشد');
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast.error('خطا در بارگذاری قراردادها');
      setContracts([]);
      setFilteredContracts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveContracts = async (updatedContracts: Contract[]) => {
    // This method is kept for compatibility but not used with real API
    setContracts(updatedContracts);
    filterContracts(updatedContracts, searchQuery, statusFilter);
  };

  const addContract = async (contractData: Partial<Contract>) => {
    try {
      const contractNumber = generateContractNumber();
      const accessCode = generateAccessCode();

      // Transform to API format
      const apiContractData = {
        contract_number: contractNumber,
        access_code: accessCode,
        tenant_name: contractData.tenantName || '',
        tenant_email: contractData.tenantEmail,
        tenant_national_id: contractData.tenantNationalId,
        landlord_name: contractData.landlordName || '',
        landlord_email: contractData.landlordEmail,
        landlord_national_id: contractData.landlordNationalId,
        property_address: contractData.propertyAddress || '',
        rent_amount: parseFloat(contractData.rentAmount || '0'),
        deposit: contractData.deposit ? parseFloat(contractData.deposit) : undefined,
        start_date: contractData.startDate,
        end_date: contractData.endDate,
        status: 'active'
      };

      const response = await apiHelpers.createContract(apiContractData);
      
      if (response.success) {
        toast.success('قرارداد با موفقیت ایجاد شد');
        await fetchContracts(); // Refresh contracts
        
        // Return contract with legacy format for compatibility
        return {
          ...response.contract,
          contractNumber: response.contract.contract_number,
          accessCode: response.contract.access_code,
          tenantName: response.contract.tenant_name,
          landlordName: response.contract.landlord_name,
          propertyAddress: response.contract.property_address,
          rentAmount: response.contract.rent_amount?.toString(),
          startDate: response.contract.start_date,
          endDate: response.contract.end_date
        };
      } else {
        throw new Error(response.message || 'خطا در ایجاد قرارداد');
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error('خطا در ایجاد قرارداد');
      throw error;
    }
  };

  const updateContract = async (contractNumber: string, updates: Partial<Contract>) => {
    try {
      const contract = contracts.find(c => c.contractNumber === contractNumber || c.contract_number === contractNumber);
      if (!contract) {
        throw new Error('قرارداد یافت نشد');
      }

      // Transform updates to API format
      const apiUpdates: any = {};
      if (updates.tenantName) apiUpdates.tenant_name = updates.tenantName;
      if (updates.tenantEmail) apiUpdates.tenant_email = updates.tenantEmail;
      if (updates.tenantNationalId) apiUpdates.tenant_national_id = updates.tenantNationalId;
      if (updates.landlordName) apiUpdates.landlord_name = updates.landlordName;
      if (updates.landlordEmail) apiUpdates.landlord_email = updates.landlordEmail;
      if (updates.landlordNationalId) apiUpdates.landlord_national_id = updates.landlordNationalId;
      if (updates.propertyAddress) apiUpdates.property_address = updates.propertyAddress;
      if (updates.rentAmount) apiUpdates.rent_amount = parseFloat(updates.rentAmount);
      if (updates.deposit) apiUpdates.deposit = parseFloat(updates.deposit);
      if (updates.startDate) apiUpdates.start_date = updates.startDate;
      if (updates.endDate) apiUpdates.end_date = updates.endDate;
      if (updates.status) apiUpdates.status = updates.status;

      const response = await apiHelpers.updateContract(contract.id, apiUpdates);
      
      if (response.success) {
        toast.success('قرارداد با موفقیت بروزرسانی شد');
        await fetchContracts(); // Refresh contracts
      } else {
        throw new Error(response.message || 'خطا در بروزرسانی قرارداد');
      }
    } catch (error) {
      console.error('Error updating contract:', error);
      toast.error('خطا در بروزرسانی قرارداد');
      throw error;
    }
  };

  const deleteContract = async (contractNumber: string) => {
    try {
      const contract = contracts.find(c => c.contractNumber === contractNumber || c.contract_number === contractNumber);
      if (!contract) {
        throw new Error('قرارداد یافت نشد');
      }

      const response = await apiHelpers.deleteContract(contract.id);
      
      if (response.success) {
        toast.success('قرارداد با موفقیت حذف شد');
        await fetchContracts(); // Refresh contracts
      } else {
        throw new Error(response.message || 'خطا در حذف قرارداد');
      }
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error('خطا در حذف قرارداد');
      throw error;
    }
  };

  const terminateContract = async (contractNumber: string) => {
    try {
      await updateContract(contractNumber, { 
        status: 'terminated', 
        terminatedAt: new Date().toISOString() 
      });
      toast.success('قرارداد با موفقیت فسخ شد');
    } catch (error) {
      console.error('Error terminating contract:', error);
      toast.error('خطا در فسخ قرارداد');
      throw error;
    }
  };

  const signContract = async (contractNumber: string, signature: string, nationalIdImage?: string) => {
    try {
      const response = await apiHelpers.signContract(contractNumber, signature, nationalIdImage);

      if (response.success) {
        toast.success('قرارداد با موفقیت امضا شد');
        await fetchContracts(); // Refresh contracts
      } else {
        throw new Error(response.message || 'خطا در امضای قرارداد');
      }
    } catch (error) {
      console.error('Error signing contract:', error);
      toast.error('خطا در امضای قرارداد. لطفاً دوباره تلاش کنید.');
      throw error;
    }
  };

  const lookupTenantByNationalId = async (nationalId: string) => {
    try {
      const response = await api.get(`/api/tenant/lookup/${nationalId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No tenant found, which is fine for new tenants
      }
      console.error('Error looking up tenant:', error);
      toast.error('خطا در جستجوی اطلاعات مستأجر');
      throw error;
    }
  };

  const lookupLandlordByNationalId = async (nationalId: string) => {
    try {
      const response = await api.get(`/api/landlord/lookup/${nationalId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No landlord found, which is fine for new landlords
      }
      console.error('Error looking up landlord:', error);
      toast.error('خطا در جستجوی اطلاعات موجر');
      throw error;
    }
  };

  const getContractByCredentials = (contractNumber: string, accessCode: string): Contract | null => {
    return contracts.find((c: Contract) => 
      c.contractNumber === contractNumber && 
      c.accessCode === accessCode && 
      c.status !== 'terminated'
    ) || null;
  };

  const filterContracts = (contractsToFilter: Contract[], query: string, filter: string, currentUser?: any) => {
    let filtered = contractsToFilter;

    if (currentUser?.role === 'tenant') {
      filtered = contractsToFilter.filter((contract: Contract) => 
        contract.contractNumber === currentUser.contractNumber
      );
    }

    if (query) {
      const queryLower = query.toLowerCase();
      filtered = filtered.filter((contract: Contract) => 
        contract.tenantName?.toLowerCase().includes(queryLower) ||
        contract.contractNumber?.toLowerCase().includes(queryLower) ||
        contract.propertyAddress?.toLowerCase().includes(queryLower) ||
        contract.tenantEmail?.toLowerCase().includes(queryLower)
      );
    }

    if (filter !== 'all') {
      filtered = filtered.filter((contract: Contract) => contract.status === filter);
    }

    setFilteredContracts(filtered);
  };

  // Update filtered contracts when dependencies change
  React.useEffect(() => {
    filterContracts(contracts, searchQuery, statusFilter);
  }, [contracts, searchQuery, statusFilter]);

  const value: ContractContextType = {
    contracts,
    filteredContracts,
    isLoading,
    searchQuery,
    statusFilter,
    fetchContracts,
    saveContracts,
    addContract,
    updateContract,
    deleteContract,
    terminateContract,
    signContract,
    lookupTenantByNationalId,
    lookupLandlordByNationalId,
    setSearchQuery,
    setStatusFilter,
    getContractByCredentials
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};