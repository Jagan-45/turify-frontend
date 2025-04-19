// EmailVerification.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const EmailVerification = () => {
  const handleResendToken = async () => {
    try {
      const token=localStorage.getItem("verifyToken")
      localStorage.removeItem("verifyToken")
      const response = await fetch(`http://localhost:8081/api/v0/auth/resend-token?token=${token}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Verification email resent successfully!');
      } else {
        toast.error('Failed to resend verification email. Please try again later.');
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      toast.error('An error occurred while resending the email.');
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
      <h1 className="text-2xl font-bold text-gray-800">Email Sent!</h1>
      <p className="text-gray-600 mt-2">
        A verification email has been sent to your email address. Please check your inbox and verify your account.
      </p>
      <p className="text-gray-600 mt-2">
        If you don't see it, please check your spam folder.
      </p>
      <button
        onClick={handleResendToken}
        className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition duration-200 cursor-pointer"
      >
        Resend Token
      </button>
    </motion.div>
  );
};

export default EmailVerification;