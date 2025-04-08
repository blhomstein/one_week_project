import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const accessToken = localStorage.getItem("accessToken");
  console.log(accessToken);

  if (!accessToken) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
