import React from "react";
import FileUpload from "../components/FileUpload";

const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <FileUpload />
      </div>
    </div>
  );
};

export default Dashboard;
