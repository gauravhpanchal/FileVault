import React, { useState, useEffect } from "react";
import axios from "axios";
import { Upload } from "lucide-react";
import { useSelector } from "react-redux";

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Current Loggedin User
  const user = useSelector((state) => state.auth.user.email);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setError("You are not logged in. Please log in to view your files.");
        return;
      }

      const response = await axios.get(
        "http://localhost:8000/api/protected/files",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUploadedFiles(response.data.files || []);
      setError(""); // Clear any previous errors
    } catch (error) {
      if (error.response?.status === 401) {
        setError("You are not authorized to view the files. Please log in.");
      } else {
        setError("Error fetching files. Please try again later.");
      }
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileChange = (event) => {
    setFiles(event.target.files);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("pdfs", file));

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setError("You are not logged in. Please log in to upload files.");
        return;
      }

      setIsUploading(true);
      await axios.post(
        "http://localhost:8000/api/protected/files/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
            User: user,
          },
        }
      );
      fetchFiles(); // Refresh uploaded files list
      setFiles([]); // Clear selected files
      setError(""); // Clear errors
    } catch (error) {
      setError("Error uploading files. Please try again later.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setError("You are not logged in. Please log in to delete files.");
        return;
      }

      await axios.delete(
        `http://localhost:8000/api/protected/files/${fileId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchFiles(); // Refresh uploaded files list
      setError(""); // Clear errors
    } catch (error) {
      setError("Error deleting file. Please try again later.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Upload Section */}
      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-indigo-400">
        <label htmlFor="file-upload" className="block cursor-pointer">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Click here to select files
          </p>
          <p className="text-xs text-gray-500 mt-1">Supported formats: PDF</p>
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <button
        onClick={handleUpload}
        className={`mt-4 w-full px-4 py-2 rounded-lg text-white ${
          isUploading || !files.length
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-500 hover:bg-indigo-600"
        }`}
        disabled={isUploading || !files.length}
      >
        {isUploading ? "Uploading..." : "Upload Files"}
      </button>

      {/* Selected Files Preview */}
      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Selected Files</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(files).map((file, index) => (
              <li
                key={index}
                className="border p-4 rounded-lg bg-gray-50 shadow-md"
              >
                <img
                  src="https://www.pcworld.com/wp-content/uploads/2024/11/pdf-icon-1.jpg?quality=50&strip=all"
                  alt="PDF Icon"
                  className="h-16 w-16 mx-auto"
                />
                <p className="mt-2 text-center text-sm">{file.name}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Uploaded Files */}
      <div className="mt-6">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <h3 className="text-lg font-semibold mb-2">Uploaded Files</h3>
        {uploadedFiles.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedFiles.map((file) => (
              <li
                key={file._id}
                className="border p-4 rounded-lg bg-white shadow-md"
              >
                <img
                  src="https://www.pcworld.com/wp-content/uploads/2024/11/pdf-icon-1.jpg?quality=50&strip=all"
                  alt="PDF Icon"
                  className="h-16 w-16 mx-auto"
                />
                <p className="mt-2 text-center text-sm">{file.filename}</p>
                <p className="text-center text-xs text-gray-500">
                  {file.size} bytes
                </p>
                <div className="mt-2 flex gap-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-1/2 px-4 py-2 text-center bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(file._id)}
                    className="w-1/2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          !error && <p>No files uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
