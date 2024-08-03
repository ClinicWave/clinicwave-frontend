import React, { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

interface ErrorResponse {
  errors?: Record<string, string>;
  error?: string;
}

interface SuccessResponse {
  message: string;
}

const VerificationForm: React.FC = () => {
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
    }
  }, [location]);

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
      {successMessage ? (
        <div className="text-green-500">
          <p>{successMessage}</p>
          <p>You will be redirected to the login page shortly...</p>
        </div>
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
