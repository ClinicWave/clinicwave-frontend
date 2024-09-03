import React, { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import VerificationStatus from './VerificationStatus';

interface ErrorResponse {
  errors?: Record<string, string>;
  errorMessage?: string;
}

interface SuccessResponse {
  message: string;
}

interface VerificationStatusResponse {
  isVerified: boolean;
  email: string;
}

interface VerificationStatusErrorResponse {
  errorMessage?: string;
}

const VerificationForm: React.FC = () => {
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      checkVerificationStatus(tokenParam).then((r) => r);
    }
  }, [location]);

  const checkVerificationStatus = async (token: string) => {
    try {
      const response = await axios.get<VerificationStatusResponse>(
        `http://localhost:8080/api/verification/verify?token=${token}`
      );
      setIsVerified(response.data.isVerified);
      setEmail(response.data.email);
      setMessage(
        response.data.isVerified ? 'Your account is already verified.' : ''
      );
    } catch (err) {
      const error = err as AxiosError<VerificationStatusErrorResponse>;
      const status = error.response?.status;
      const responseData = error.response?.data;
      console.log(error);

      if (status === 404) {
        setMessage('Invalid verification link. Please try again.');
      } else if (responseData?.errorMessage) {
        setMessage(responseData.errorMessage);
      } else if (error.code === 'ERR_NETWORK') {
        setMessage('Unable to connect to the server. Please try again later.');
      } else {
        setMessage('Error checking verification status. Please try again.');
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
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
      setMessage(response.data.message);
      setIsVerified(true);
      // Redirect to login page after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      if (error.response?.data) {
        const responseData = error.response.data;
        if (responseData.errors) {
          setValidationErrors(responseData.errors);
        } else if (responseData.errorMessage) {
          setError(responseData.errorMessage);
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
      {isVerified || message ? (
        <VerificationStatus isVerified={isVerified} message={message} />
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
