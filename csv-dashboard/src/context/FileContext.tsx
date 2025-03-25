import React, { createContext, useState, useContext, ReactNode } from "react";

interface FileContextType {
  file: File | null;
  data: any[];  // Store parsed CSV data
  setFile: (file: File | null) => void;
  setData: (data: any[]) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]); // Store parsed CSV data

  return (
    <FileContext.Provider value={{ file, setFile, data, setData }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFile = () => {
  const context = useContext(FileContext);
  if (!context) throw new Error("useFile must be used within FileProvider");
  return context;
};
