import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser, clearError } from '../store/authSlice';

const SignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ username: '', password: '', confirm: '' });
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (token) navigate('/');
    return () => dispatch(clearError());
  }, [token]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    if (form.password !== form.confirm) {
      setLocalError('Passwords do not match');
      return;
    }
    dispatch(signupUser({ username: form.username, password: form.password }));
  };

  const displayError = localError || error;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="brand-icon"><i className="bi bi-patch-question-fill"></i></div>
          <h2 className="fw-bold mt-2">Create account</h2>
          <p className="text-muted">Join QuizApp and start learning</p>
        </div>

        {displayError && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
            <i className="bi bi-exclamation-circle"></i> {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} id="signup-form">
          <div className="mb-3">
            <label className="form-label fw-medium">Username</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-person"></i></span>
              <input
                id="signup-username"
                type="text"
                name="username"
                className="form-control"
                placeholder="Choose a username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label fw-medium">Password</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-lock"></i></span>
              <input
                id="signup-password"
                type="password"
                name="password"
                className="form-control"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label fw-medium">Confirm Password</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
              <input
                id="signup-confirm"
                type="password"
                name="confirm"
                className="form-control"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <button
            id="signup-submit"
            type="submit"
            className="btn btn-primary-gradient w-100 py-2"
            disabled={loading}
          >
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating…</> : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-3 mb-0 text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-decoration-none fw-medium" style={{ color: '#6366f1' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
