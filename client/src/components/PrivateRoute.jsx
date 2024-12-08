import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await axios.get(
            "https://filevault-mbnp.onrender.com/api/protected/dashboard",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          dispatch(login({ email: response.data.user.email }));
        } catch (error) {
          console.error("Invalid token");
          dispatch(logout());
        }
      }
    };

    if (!isAuthenticated) {
      validateToken();
    }
  }, [dispatch, isAuthenticated]);

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
