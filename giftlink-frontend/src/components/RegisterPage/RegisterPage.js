import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { urlConfig } from '../../config';
import { useAppContext } from '../../context/AuthContext';
import './RegisterPage.css';

function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const { setIsLoggedIn, setUserName } = useAppContext();

  const handleRegister = async () => {
    try {
      setErrorMessage('');

      if (!urlConfig.backendUrl) {
        setErrorMessage('Backend URL is not configured.');
        return;
      }

      const response = await fetch(`${urlConfig.backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('auth-token', data.token);
        sessionStorage.setItem('name', data.name);
        sessionStorage.setItem('email', data.email);

        setUserName(data.name);
        setIsLoggedIn(true);

        navigate('/app');
      } else {
        setErrorMessage(data.message || 'Registration failed.');
      }
    } catch (e) {
      console.log('Error fetching details: ' + e.message);
      setErrorMessage('Unable to register right now.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="register-card p-4 border rounded">
            <h2 className="text-center mb-4 font-weight-bold">Register</h2>

            <div className="form-group mb-3">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                className="form-control"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
              />
            </div>

            <div className="form-group mb-3">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                className="form-control"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
              />
            </div>

            <div className="form-group mb-3">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
              />
              {errorMessage && (
                <div className="text-danger mt-2" style={{ fontSize: '0.9rem' }}>
                  {errorMessage}
                </div>
              )}
            </div>

            <div className="form-group mb-3">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>

            <button className="btn btn-primary w-100" onClick={handleRegister}>
              Register
            </button>

            <p className="mt-4 text-center">
              Already a member?{' '}
              <a href="/app/login" className="text-primary">
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
