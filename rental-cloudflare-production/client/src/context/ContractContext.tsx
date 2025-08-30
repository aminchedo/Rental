import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Contract {
  id: string;
  contractNumber: string;
  tenantName: string;
  tenantEmail: string;
  landlordName: string;
  landlordEmail: string;
  propertyAddress: string;
  rentAmount: string;
  status: string;
  createdAt: string;
  signedAt?: string;
  signature?: string;
  nationalIdImage?: string;
}

interface ContractContextType {
  contracts: Contract[];
  setContracts: (contracts: Contract[]) => void;
  selectedContract: Contract | null;
  setSelectedContract: (contract: Contract | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
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
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);

  const value = {
    contracts,
    setContracts,
    selectedContract,
    setSelectedContract,
    loading,
    setLoading,
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};