import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../store/authSlice";
import { toast } from "react-hot-toast";
import { LogIn } from "lucide-react";
import axios from "axios";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "../firebase/firebase";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();

  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleGoogleSignIn = async () => {
    try {
      toast.loading("Signing in with Google...", { id: "google-login" });
      const result = await signInWithPopup(auth, googleProvider);
      const { email, displayName } = result.user;

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/auth/google-login`,
        { email, name: displayName }
      );

      if (response.status === 200) {
        const { token, user } = response.data;
        toast.success("Logged in successfully with Google!", {
          id: "google-login",
        });
        localStorage.setItem("authToken", token);
        dispatch(login({ email: user.email }));
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error("Google Sign-In failed. Please try again.", {
        id: "google-login",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      toast.loading("Logging in...", { id: "login" });
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/auth/login`,
        formData
      );

      if (response.status === 200) {
        const { token, user } = response.data;
        toast.success("Logged in successfully!", { id: "login" });
        localStorage.setItem("authToken", token);
        dispatch(login({ email: user.email }));
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMessage =
        err.response && err.response.data.message
          ? err.response.data.message
          : "An error occurred. Please try again.";
      toast.error(errorMessage, { id: "login" });
    }
  };

  return (
    <div className="min-h-fit flex mt-16 justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <LogIn className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-1 text-gray-600">Log In to access your account</p>
        </div>
        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Email address"
                className="block w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Password"
                className="block w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            Sign in
          </button>
        </form>
        <div className="mt-4 flex items-center gap-2 justify-center">
          <div className="w-full bg-gray-600 h-[0.5px]" />
          <span className="text-gray-600 text-base">or</span>
          <div className="w-full bg-gray-600 h-[0.5px]" />
        </div>
        <button
          onClick={handleGoogleSignIn}
          className="mt-4 w-full flex items-center justify-center gap-2 border bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google Logo"
            className="h-5 w-5"
          />
          Log in with Google
        </button>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-indigo-600 hover:underline"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
