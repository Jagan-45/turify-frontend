// TokenVerification.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';

const TokenVerification = () => {
  const [isVerified, setIsVerified] = useState(null);
  const location = useLocation();
  const Navigate=useNavigate();

  // Extract the token from the URL
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  localStorage.setItem('verifyToken', token);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        toast.error('No token provided.');
        setIsVerified(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8081/api/v0/auth/verify-user?token=${token}`);
        const data = await response.json();
        console.log(data.message)
        toast.success(data.message)
        setIsVerified(true);
      } catch (error) {
        setIsVerified(false);
        toast.error('An error occurred while verifying the token.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {isVerified === null ? (
        <p className="text-gray-600">Verifying your token...</p>
      ) : isVerified ? (
        <div className="flex flex-col items-center">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Verification Successful!</h1>
          <p className="text-gray-600 mt-2">Your account has been verified. You can now log in.</p>
          <button className="mt-4 px-4 py-2 bg-black text-white rounded" onClick={()=>{Navigate('/login')}}>
            Login
        </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <XCircle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Verification Failed!</h1>
          <p className="text-gray-600 mt-2">The token is invalid or has expired.</p>
        </div>
      )}
      
    </motion.div>
  );
};

export default TokenVerification;