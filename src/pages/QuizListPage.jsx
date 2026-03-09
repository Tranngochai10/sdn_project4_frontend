import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuizzes } from '../store/quizzesSlice';

const COLORS = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#06b6d4,#3b82f6)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#ec4899,#8b5cf6)',
  'linear-gradient(135deg,#f97316,#ef4444)',
];

const QuizListPage = () => {
  const dispatch = useDispatch();
  const { quizzes, loading, error } = useSelector((state) => state.quizzes);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  if (loading) return (
    <div className="spinner-overlay">
      <div className="spinner-border" style={{ color: '#6366f1' }} role="status">
        <span className="visually-hidden">Loading…</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="container mt-5">
      <div className="alert alert-danger"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>
    </div>
  );

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="fw-bold mb-1">
            <i className="bi bi-mortarboard me-2" style={{ color: '#6366f1' }}></i>
            Available Quizzes
          </h1>
          <p className="text-muted mb-0">Hello, <strong>{user?.username}</strong> — pick a quiz and get started!</p>
        </div>
        <span className="badge fs-6 px-3 py-2" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', borderRadius:12 }}>
          {quizzes.length} Quiz{quizzes.length !== 1 ? 'zes' : ''}
        </span>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-inbox" style={{ fontSize: '4rem', color: '#cbd5e1' }}></i>
          <h5 className="mt-3 text-muted">No quizzes available yet</h5>
        </div>
      ) : (
        <div className="row g-4">
          {quizzes.map((quiz, idx) => (
            <div className="col-sm-6 col-lg-4" key={quiz._id}>
              <div className="quiz-card card h-100">
                {/* Coloured header */}
                <div style={{ background: COLORS[idx % COLORS.length], padding: '1.5rem 1.25rem' }}>
                  <i className="bi bi-clipboard-data-fill text-white" style={{ fontSize: '2rem' }}></i>
                </div>
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-bold">{quiz.title}</h5>
                  <p className="card-text text-muted flex-grow-1">{quiz.description}</p>
                  <div className="d-flex align-items-center justify-content-between mt-2">
                    <span className="badge bg-light text-dark border">
                      <i className="bi bi-question-circle me-1"></i>
                      {quiz.questions?.length || 0} questions
                    </span>
                    <Link
                      to={`/quizzes/${quiz._id}`}
                      id={`start-quiz-${quiz._id}`}
                      className="btn btn-sm btn-primary-gradient px-3"
                    >
                      Start <i className="bi bi-arrow-right ms-1"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizListPage;
