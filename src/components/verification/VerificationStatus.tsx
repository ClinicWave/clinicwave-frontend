import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface VerificationStatusProps {
  isVerified: boolean;
  message: string;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({
  isVerified,
  message,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isVerified) {
      const timer = setTimeout(() => navigate('/login'), 3000);
      return () => clearTimeout(timer);
    }
  }, [isVerified, navigate]);

  return (
    <div>
      <div className={`${isVerified ? 'text-green-500' : 'text-red-500'}`}>
        <p>{message}</p>
      </div>
      {isVerified && (
        <button onClick={() => navigate('/login')}>Go to Login</button>
      )}
    </div>
  );
};

export default VerificationStatus;
