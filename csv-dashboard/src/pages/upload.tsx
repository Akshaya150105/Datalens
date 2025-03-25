import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { FileUp, FileText, AlertTriangle } from "lucide-react";
import { useFile } from "../context/FileContext";

const Upload: React.FC = () => {
  const { setFile, setData } = useFile();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Reset previous errors
    setError(null);

    if (event.target.files) {
      const file = event.target.files[0];
      
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Please upload a CSV file.');
        return;
      }

      // Validate file size (e.g., max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError('File is too large. Maximum file size is 10MB.');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) {
        setError('Unable to read the file.');
        setIsLoading(false);
        return;
      }
      
      try {
        Papa.parse(event.target.result as string, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            // Validate parsed data
            if (result.data.length === 0) {
              setError('The CSV file appears to be empty.');
              setIsLoading(false);
              return;
            }

            

            setData(result.data);
            navigate("/dashboard");
          },
         
        });
      } catch (parseError) {
        setError('An unexpected error occurred while parsing the file.');
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Error reading the file.');
      setIsLoading(false);
    };

    reader.readAsText(selectedFile);
  };

  return (
    <div className="container mx-auto max-w-md p-6">
      <div className="bg-white shadow-md rounded-lg p-8">
        <div className="flex items-center mb-6">
          <FileUp className="w-10 h-10 text-blue-500 mr-4" />
          <h1 className="text-3xl font-bold text-gray-800">Upload CSV</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4 flex items-center">
            <AlertTriangle className="w-6 h-6 mr-3 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="mb-6">
          <label 
            htmlFor="csv-upload" 
            className="block text-gray-700 mb-2"
          >
            Select CSV File
          </label>
          <div className="flex items-center">
            <input 
              id="csv-upload"
              type="file" 
              accept=".csv" 
              onChange={handleFileChange} 
              className="hidden"
            />
            <label 
              htmlFor="csv-upload" 
              className="flex-grow border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition"
            >
              {selectedFile 
                ? `${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB)` 
                : "Drag and drop or click to select a CSV file"}
            </label>
          </div>
        </div>

        <button 
          onClick={handleUpload} 
          disabled={!selectedFile || isLoading}
          className={`w-full py-3 rounded-lg text-white font-bold transition duration-300 ${
            selectedFile && !isLoading 
              ? 'bg-blue-500 hover:bg-blue-600' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Parsing...' : 'Upload & Analyze'}
        </button>

        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="text-blue-500 hover:underline flex items-center justify-center"
          >
            <FileText className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Upload;