import React from "react";
import { Link } from "react-router-dom";
import { Upload, BarChart, Table } from "lucide-react";
import { Button } from "@/components/ui/button";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
            Welcome to <span className="text-blue-600">CSV Dashboard</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your CSV data into actionable insights with interactive tables, dynamic charts, and powerful statistical analysis.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Upload className="w-10 h-10 text-blue-500 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload CSV</h3>
            <p className="text-gray-600">
              Easily upload your CSV files to get started with data exploration.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <BarChart className="w-10 h-10 text-blue-500 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Visualize Data</h3>
            <p className="text-gray-600">
              Create interactive charts to uncover trends and patterns.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Table className="w-10 h-10 text-blue-500 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Analyze Insights</h3>
            <p className="text-gray-600">
              Dive deep with statistical insights and outlier detection.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div>
          <Link to="/upload">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors">
              Get Started - Upload Your CSV
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;