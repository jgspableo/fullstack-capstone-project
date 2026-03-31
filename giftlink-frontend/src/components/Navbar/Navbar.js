import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AuthContext';

export default function Navbar() {
  const { isLoggedIn, setIsLoggedIn, userName, setUserName } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    const authTokenFromSession = sessionStorage.getItem('auth-token');
    const nameFromSession = sessionStorage.getItem('name');

    if (authTokenFromSession && nameFromSession) {
      setIsLoggedIn(true);
      setUserName(nameFromSession);
    } else {
      setIsLoggedIn(false);
      setUserName('');
    }
  }, [setIsLoggedIn, setUserName]);

  const handleLogout = () => {
    sessionStorage.removeItem('auth-token');
    sessionStorage.removeItem('name');
    sessionStorage.removeItem('email');

    setIsLoggedIn(false);
    setUserName('');
    navigate('/app');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
      <Link className="navbar-brand" to="/app">
        GiftLink
      </Link>

      <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <a className="nav-link" href="/home.html">Home</a>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/app">Gifts</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/app/search">Search</Link>
          </li>
        </ul>

        <ul className="navbar-nav">
          {isLoggedIn ? (
            <>
              <li className="nav-item">
                <span className="nav-link">Hi, {userName}</span>
              </li>
              <li className="nav-item">
                <button className="btn btn-outline-danger ms-2" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/app/login">Login</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/app/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
