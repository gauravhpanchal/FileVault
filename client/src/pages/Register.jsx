import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { UserPlus } from "lucide-react";
import axios from "axios";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "../firebase/firebase";

const Register = () => {
  const navigate = useNavigate();
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleGoogleSignUp = async () => {
    try {
      toast.loading("Signing up with Google...", { id: "google-signup" });

      const result = await signInWithPopup(auth, googleProvider);
      const { email, displayName } = result.user;

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/auth/google-login`,
        { email, name: displayName }
      );

      if (response.status === 200) {
        toast.success("Account created successfully with Google!", {
          id: "google-signup",
        });

        navigate("/dashboard");
      }
    } catch (err) {
      toast.error("Google Sign-Up failed. Please try again.", {
        id: "google-signup",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      toast.loading("Creating your account...", { id: "register" });

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/auth/register`,
        {
          email: formData.email,
          password: formData.password,
        }
      );

      if (response.status === 201) {
        toast.success("Account created successfully!", { id: "register" });

        navigate("/login");
      }
    } catch (err) {
      if (err.response && err.response.data.message) {
        toast.error(err.response.data.message, { id: "register" });
      } else {
        toast.error("An error occurred. Please try again.", { id: "register" });
      }
    }
  };

  return (
    <div className="min-h-fit flex mt-14 justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-md shadow-md">
        <div className="text-center">
          <UserPlus className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign up to access amazing features
          </p>
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md font-medium text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Create Account
            </button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <div className="mt-4 flex items-center gap-2 justify-center">
            <div className="w-full bg-gray-600 h-[0.5px]" />
            <span className="text-gray-600 text-base">or</span>
            <div className="w-full bg-gray-600 h-[0.5px]" />
          </div>
          <button
            onClick={handleGoogleSignUp}
            className="mt-4 w-full flex items-center justify-center gap-2 border bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google Logo"
              className="h-5 w-5"
            />
            Sign up with Google
          </button>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-indigo-600 hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
