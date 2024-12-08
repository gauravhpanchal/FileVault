import React, { useState, useEffect } from "react";
import axios from "axios";
import { Upload } from "lucide-react";
import { useSelector } from "react-redux";
import io from "socket.io-client";

const socket = io("http://localhost:8000"); // Replace with your backend URL

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Current Logged-in User
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

    // Handle real-time updates from the backend
    socket.on("fileUploaded", (uploadedFiles) => {
      setUploadedFiles((prevFiles) => {
        const updatedFiles = prevFiles;
        uploadedFiles.forEach((file) => {
          if (prevFiles.findIndex((x) => x._id == file._id) == -1) {
            updatedFiles.push(file);
          }
        });
        return updatedFiles;
      });
    });

    socket.on("fileDeleted", ({ id }) => {
      setUploadedFiles((prevFiles) =>
        prevFiles.filter((file) => file._id !== id)
      );
    });

    // return () => {
    //   socket.disconnect();
    // };
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
      setProgress(0);

      await axios.post(
        "http://localhost:8000/api/protected/files/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
            User: user,
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percent);
          },
        }
      );
      setFiles([]); // Clear selected files
      setError(""); // Clear errors
    } catch (error) {
      setError("Error uploading files. Please try again later.");
    } finally {
      setIsUploading(false);
      setProgress(0); // Reset progress
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
        {isUploading ? `Uploading... ${progress}%` : "Upload Files"}
      </button>

      {/* Progress Bar */}
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-lg mt-4">
          <div
            className="bg-indigo-500 h-2 rounded-lg"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

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
                  className="h-16 w-16 mx-auto object-cover"
                />
                <p className="text-blue-500 line-clamp-1">{file.filename}</p>
                <p className="text-xs mt-2 text-gray-500 text-center">
                  Size: {file.size} bytes
                </p>
                <button
                  onClick={() => handleDelete(file._id)}
                  className="w-full px-4 py-2 mt-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
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
