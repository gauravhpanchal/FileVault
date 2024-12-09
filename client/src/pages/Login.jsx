import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../store/authSlice";
import { toast } from "react-hot-toast";
import { LogIn } from "lucide-react";
import axios from "axios";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Show a loading toast
      toast.loading("Logging in...", { id: "login" });

      const response = await axios.post(
        "https://filevault-mbnp.onrender.com/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      if (response.status === 200) {
        const { token, user } = response.data;

        // Show success toast
        toast.success("Logged in successfully!", { id: "login" });

        // Save token and navigate
        localStorage.setItem("authToken", token);
        dispatch(login({ email: user.email }));
        navigate("/dashboard");
      }
    } catch (err) {
      // Handle specific errors
      if (err.response && err.response.data.message) {
        const errorMessage = err.response.data.message;

        // Check for specific error messages
        if (errorMessage === "User not found") {
          toast.error("This email is not registered. Please create an account.", {
            id: "login",
          });
        } else if (errorMessage === "Invalid credentials") {
          toast.error("Incorrect password. Please try again.", { id: "login" });
        } else {
          toast.error(errorMessage, { id: "login" });
        }
      } else {
        toast.error("An error occurred. Please try again.", { id: "login" });
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex  justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <LogIn className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Log in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-3 shadow-sm ">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none  relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none  relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
