import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ username: '', password: '' });

  useEffect(() => {
    if (token) navigate('/');
    return () => dispatch(clearError());
  }, [token]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="brand-icon"><i className="bi bi-patch-question-fill"></i></div>
          <h2 className="fw-bold mt-2">Welcome back</h2>
          <p className="text-muted">Sign in to your QuizApp account</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
            <i className="bi bi-exclamation-circle"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} id="login-form">
          <div className="mb-3">
            <label className="form-label fw-medium">Username</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-person"></i></span>
              <input
                id="login-username"
                type="text"
                name="username"
                className="form-control"
                placeholder="Enter your username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label fw-medium">Password</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-lock"></i></span>
              <input
                id="login-password"
                type="password"
                name="password"
                className="form-control"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary-gradient w-100 py-2"
            disabled={loading}
          >
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Signing in…</> : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-3 mb-0 text-muted">
          Don't have an account?{' '}
          <Link to="/signup" className="text-decoration-none fw-medium" style={{ color: '#6366f1' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
