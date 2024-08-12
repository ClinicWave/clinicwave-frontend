import React, { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import VerificationStatus from './VerificationStatus';

interface ErrorResponse {
  errors?: Record<string, string>;
  error?: string;
}

interface SuccessResponse {
  message: string;
}

interface VerificationStatusResponse {
  isVerified: boolean;
}

interface VerificationStatusErrorResponse {
  error?: string;
}

const VerificationForm: React.FC = () => {
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
      checkVerificationStatus(emailParam).then((r) => r);
    }
  }, [location]);

  const checkVerificationStatus = async (email: string) => {
    try {
      const response = await axios.get<VerificationStatusResponse>(
        `http://localhost:8080/api/verification/verify?email=${email}`
      );
      setIsVerified(response.data.isVerified);
      setSuccessMessage(
        response.data.isVerified ? 'Your account is already verified.' : ''
      );
    } catch (err) {
      const error = err as AxiosError<VerificationStatusErrorResponse>;
      if (error.response?.data) {
        const responseData = error.response.data;
        if (responseData.error) {
          setError(responseData.error);
        } else {
          setError('Error checking verification status. Please try again.');
        }
      } else {
        setError('Error checking verification status. Please try again.');
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setValidationErrors({});
    setIsSubmitting(true);

    try {
      const response = await axios.post<SuccessResponse>(
        'http://localhost:8080/api/verification/verify',
        {
          email,
          code,
        }
      );
      setSuccessMessage(response.data.message);
      setIsVerified(true);
      // Redirect to login page after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      if (error.response?.data) {
        const responseData = error.response.data;
        if (responseData.errors) {
          setValidationErrors(responseData.errors);
        } else if (responseData.error) {
          setError(responseData.error);
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Verify Your Account</h1>
      {isVerified || successMessage ? (
        <VerificationStatus isVerified={isVerified} message={successMessage} />
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              disabled
            />
          </div>
          <div>
            <label htmlFor="code">Code</label>
            <input
              type="text"
              id="code"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            {validationErrors.code && (
              <p className="text-red-500">{validationErrors.code}</p>
            )}
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      )}
    </div>
  );
};

export default VerificationForm;
