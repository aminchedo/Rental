import React, { createContext, useContext, useState, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { api, endpoints } from '../config/api';

interface Contract {
  id: string;
  contractNumber: string;
  accessCode: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  tenantNationalId?: string;
  landlordName: string;
  landlordEmail: string;
  landlordNationalId?: string;
  propertyAddress: string;
  propertyType: string;
  rentAmount: string;
  startDate: string;
  endDate: string;
  deposit: string;
  status: 'draft' | 'active' | 'signed' | 'terminated';
  signature?: string;
  nationalId?: string;
  createdAt: string;
  lastModified: string;
  signedAt?: string;
  terminatedAt?: string;
  createdBy: string;
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

  const generateContractNumber = () => `RNT${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  const generateAccessCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(endpoints.contracts);
      const serverContracts = response.data || [];
      setContracts(serverContracts);
      filterContracts(serverContracts, searchQuery, statusFilter);
    } catch (error) {
      console.error('Error loading contracts:', error);
      setContracts([]);
      setFilteredContracts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveContracts = async (updatedContracts: Contract[]) => {
    try {
      await api.post(endpoints.contracts, updatedContracts);
      setContracts(updatedContracts);
      filterContracts(updatedContracts, searchQuery, statusFilter);
    } catch (error) {
      console.error('Error saving contracts:', error);
      throw error;
    }
  };

  const addContract = async (contractData: Partial<Contract>) => {
    const contractNumber = generateContractNumber();
    const accessCode = generateAccessCode();

    const contract: Contract = {
      ...contractData,
      id: contractNumber,
      contractNumber,
      accessCode,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      createdBy: 'landlord'
    } as Contract;

    const updatedContracts = [...contracts, contract];
    await saveContracts(updatedContracts);
    return contract;
  };

  const updateContract = async (contractNumber: string, updates: Partial<Contract>) => {
    const updatedContracts = contracts.map((c: Contract) => 
      c.contractNumber === contractNumber 
        ? { ...c, ...updates, lastModified: new Date().toISOString() }
        : c
    );
    await saveContracts(updatedContracts);
  };

  const deleteContract = async (contractNumber: string) => {
    const updatedContracts = contracts.filter((c: Contract) => c.contractNumber !== contractNumber);
    await saveContracts(updatedContracts);
  };

  const terminateContract = async (contractNumber: string) => {
    const updatedContracts = contracts.map((c: Contract) => 
      c.contractNumber === contractNumber 
        ? { ...c, status: 'terminated' as const, terminatedAt: new Date().toISOString() }
        : c
    );
    await saveContracts(updatedContracts);
  };

  const signContract = async (contractNumber: string, signature: string) => {
    try {
      const response = await api.post(endpoints.signContract(contractNumber), {
        signature
      });

      if (response.data.success) {
        toast.success('قرارداد با موفقیت امضا شد و ایمیل به موجر ارسال شد');
        await fetchContracts(); // Refresh contracts
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