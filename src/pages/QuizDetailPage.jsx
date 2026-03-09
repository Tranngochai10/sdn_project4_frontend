import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuiz, clearCurrentQuiz } from '../store/quizzesSlice';

const QuizDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentQuiz, loading, error } = useSelector((state) => state.quizzes);

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    dispatch(fetchQuiz(id));
    return () => dispatch(clearCurrentQuiz());
  }, [id, dispatch]);

  const handleSelect = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = () => {
    if (!currentQuiz) return;
    let correct = 0;
    currentQuiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswerIndex) correct++;
    });
    setScore(correct);
    setSubmitted(true);
    // Scroll to score  
    setTimeout(() => document.getElementById('score-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pct = currentQuiz?.questions?.length
    ? Math.round((Object.keys(answers).length / currentQuiz.questions.length) * 100)
    : 0;

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

  if (!currentQuiz) return null;

  const totalQ = currentQuiz.questions?.length || 0;
  const answered = Object.keys(answers).length;

  return (
    <div className="container py-4" style={{ maxWidth: 760 }}>
      {/* Header */}
      <button className="btn btn-link text-muted ps-0 mb-3" onClick={() => navigate('/')}>
        <i className="bi bi-arrow-left me-1"></i> Back to quizzes
      </button>
      <h1 className="fw-bold">{currentQuiz.title}</h1>
      <p className="text-muted">{currentQuiz.description}</p>

      {/* Progress */}
      {!submitted && (
        <div className="quiz-progress mb-4">
          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>{answered} of {totalQ} answered</span>
            <span>{pct}%</span>
          </div>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${pct}%` }}></div>
          </div>
        </div>
      )}

      {/* Questions */}
      {currentQuiz.questions.map((q, qIdx) => {
        const userAns = answers[qIdx];
        const isCorrect = submitted && userAns === q.correctAnswerIndex;
        const isWrong = submitted && userAns !== undefined && userAns !== q.correctAnswerIndex;

        return (
          <div key={q._id || qIdx} className="card mb-4 border-0 shadow-sm" style={{ borderRadius: 16 }}>
            <div className="card-body p-4">
              <div className="d-flex gap-2 align-items-start mb-3">
                <span className="badge rounded-pill px-3 py-2" style={{ background: '#eef2ff', color: '#6366f1', fontWeight: 700, fontSize: '.85rem' }}>
                  Q{qIdx + 1}
                </span>
                <p className="fw-semibold mb-0 pt-1">{q.text}</p>
              </div>

              {q.options.map((opt, optIdx) => {
                let extraClass = '';
                if (submitted) {
                  if (optIdx === q.correctAnswerIndex) extraClass = 'correct';
                  else if (optIdx === userAns && isWrong) extraClass = 'wrong';
                }
                return (
                  <label
                    key={optIdx}
                    className={`option-card ${extraClass}`}
                    htmlFor={`q${qIdx}-opt${optIdx}`}
                  >
                    <input
                      type="radio"
                      id={`q${qIdx}-opt${optIdx}`}
                      name={`q${qIdx}`}
                      checked={userAns === optIdx}
                      onChange={() => handleSelect(qIdx, optIdx)}
                      disabled={submitted}
                    />
                    <span>{opt}</span>
                    {submitted && optIdx === q.correctAnswerIndex && (
                      <i className="bi bi-check-circle-fill ms-auto text-success"></i>
                    )}
                    {submitted && optIdx === userAns && isWrong && (
                      <i className="bi bi-x-circle-fill ms-auto text-danger"></i>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Submit / Score */}
      {!submitted ? (
        <div className="text-center mt-2 mb-5">
          <button
            id="submit-quiz-btn"
            className="btn btn-primary-gradient px-5 py-2"
            onClick={handleSubmit}
            disabled={answered < totalQ}
          >
            {answered < totalQ
              ? `Answer all questions (${totalQ - answered} left)`
              : 'Submit Quiz'}
          </button>
        </div>
      ) : (
        <div id="score-section" className="score-banner mb-5">
          <i className="bi bi-trophy-fill" style={{ fontSize: '3rem', opacity: .9 }}></i>
          <h2 className="fw-bold mt-2">
            {score} / {totalQ}
          </h2>
          <p className="mb-1 opacity-90">
            {score === totalQ
              ? '🎉 Perfect score! Amazing job!'
              : score >= totalQ / 2
                ? '👍 Good effort! Keep it up!'
                : '📚 Keep studying, you can do it!'}
          </p>
          <p className="opacity-75 small mb-3">
            Accuracy: {Math.round((score / totalQ) * 100)}%
          </p>
          <button className="btn btn-light fw-semibold px-4" onClick={handleRetry}>
            <i className="bi bi-arrow-repeat me-2"></i>Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizDetailPage;
