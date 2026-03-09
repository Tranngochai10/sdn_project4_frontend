import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuizzes, createQuiz, updateQuiz, deleteQuiz } from '../store/quizzesSlice';
import { fetchQuestions } from '../store/questionsSlice';
import { quizAPI } from '../api/api';

const EMPTY_FORM = { title: '', description: '' };
const EMPTY_Q = { text: '', options: ['', '', '', ''], correctAnswerIndex: 0, keywords: '' };

const AdminQuizzesPage = () => {
  const dispatch = useDispatch();
  const { quizzes, loading, error } = useSelector((state) => state.quizzes);
  const { questions: allQuestions } = useSelector((state) => state.questions);

  const [quizForm, setQuizForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  
  // Tab control in Edit Modal
  const [editTab, setEditTab] = useState('info'); // 'info' | 'questions'

  // Add-question modal state
  const [targetQuizId, setTargetQuizId] = useState(null);
  const [qTab, setQTab] = useState('new'); // 'new' | 'existing'
  const [qForm, setQForm] = useState(EMPTY_Q);
  const [qLoading, setQLoading] = useState(false);
  const [qError, setQError] = useState('');
  const [qSuccess, setQSuccess] = useState('');

  // Pick-existing state
  const [existSearch, setExistSearch] = useState('');
  const [selectedQIds, setSelectedQIds] = useState([]);
  const [addExistLoading, setAddExistLoading] = useState(false);

  // Remove question state
  const [removeQLoading, setRemoveQLoading] = useState(null);

  useEffect(() => { dispatch(fetchQuizzes()); }, [dispatch]);
  useEffect(() => { dispatch(fetchQuestions()); }, [dispatch]);

  /* ── Quiz form helpers ── */
  const openCreate = () => {
    setQuizForm(EMPTY_FORM);
    setEditingId(null);
    setModalMode('create');
    setEditTab('info');
  };
  const openEdit = (quiz) => {
    setQuizForm({ title: quiz.title, description: quiz.description });
    setEditingId(quiz._id);
    setModalMode('edit');
    setEditTab('info');
  };
  const handleQuizChange = (e) => setQuizForm({ ...quizForm, [e.target.name]: e.target.value });

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      await dispatch(createQuiz(quizForm));
    } else {
      await dispatch(updateQuiz({ id: editingId, data: quizForm }));
    }
    document.getElementById('closeQuizModal').click();
    dispatch(fetchQuizzes());
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this quiz and all its questions?')) {
      dispatch(deleteQuiz(id));
    }
  };

  const handleRemoveQuestion = async (quizId, questionId) => {
    if (!window.confirm('Remove this question from the quiz?')) return;
    
    setRemoveQLoading(questionId);
    try {
      await quizAPI.removeExistingQuestion(quizId, questionId);
      dispatch(fetchQuizzes()); // Refresh quiz list to update question counts and data
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove question');
    } finally {
      setRemoveQLoading(null);
    }
  };

  /* ── Add question helpers ── */
  const openAddQuestion = (quizId) => {
    setTargetQuizId(quizId);
    setQTab('new');
    setQForm(EMPTY_Q);
    setQError('');
    setQSuccess('');
    setExistSearch('');
    setSelectedQIds([]);
  };

  const handleQChange = (e) => setQForm({ ...qForm, [e.target.name]: e.target.value });
  const handleOptionChange = (idx, val) => {
    const opts = [...qForm.options];
    opts[idx] = val;
    setQForm({ ...qForm, options: opts });
  };

  // Tab: Create new question
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setQLoading(true);
    setQError('');
    setQSuccess('');
    try {
      const payload = {
        text: qForm.text,
        options: qForm.options,
        correctAnswerIndex: Number(qForm.correctAnswerIndex),
        keywords: qForm.keywords.split(',').map(k => k.trim()).filter(Boolean),
      };
      await quizAPI.addQuestion(targetQuizId, payload);
      setQSuccess('Question created and added!');
      setQForm(EMPTY_Q);
      dispatch(fetchQuizzes());
    } catch (err) {
      setQError(err.response?.data?.message || 'Failed to add question');
    } finally {
      setQLoading(false);
    }
  };

  // Tab: Pick existing questions
  const toggleSelectQ = (id) => {
    setSelectedQIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Get question IDs already in this quiz (for Pick Existing Tab)
  const currentAddTargetQuiz = quizzes.find(q => q._id === targetQuizId);
  const alreadyInQuiz = new Set(
    (currentAddTargetQuiz?.questions || []).map(q => (typeof q === 'object' ? q._id : q))
  );

  const filteredExisting = allQuestions.filter(q =>
    !alreadyInQuiz.has(q._id) &&
    q.text.toLowerCase().includes(existSearch.toLowerCase())
  );

  const handleAddExisting = async () => {
    if (selectedQIds.length === 0) return;
    setAddExistLoading(true);
    setQError('');
    setQSuccess('');
    try {
      await quizAPI.addExistingQuestions(targetQuizId, selectedQIds);
      setQSuccess(`${selectedQIds.length} question(s) added to quiz!`);
      setSelectedQIds([]);
      dispatch(fetchQuizzes());
    } catch (err) {
      setQError(err.response?.data?.message || 'Failed to add existing question(s)');
    } finally {
      setAddExistLoading(false);
    }
  };

  // Get active quiz for Edit Modal
  const activeQuiz = quizzes.find(q => q._id === editingId);

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="page-header d-flex justify-content-between align-items-center">
        <h1 className="fw-bold mb-0">
          <i className="bi bi-clipboard-data me-2" style={{ color: '#6366f1' }}></i>
          Manage Quizzes
        </h1>
        <button
          id="create-quiz-btn"
          className="btn btn-primary-gradient"
          data-bs-toggle="modal"
          data-bs-target="#quizModal"
          onClick={openCreate}
        >
          <i className="bi bi-plus-lg me-1"></i> New Quiz
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="text-center py-4"><div className="spinner-border" style={{ color: '#6366f1' }}></div></div>}

      {/* Table */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
        <div className="table-responsive">
          <table className="table admin-table mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Description</th>
                <th className="text-center">Questions</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.length === 0 && (
                <tr><td colSpan={5} className="text-center text-muted py-4">No quizzes yet. Create one!</td></tr>
              )}
              {quizzes.map((quiz, idx) => (
                <tr key={quiz._id}>
                  <td className="text-muted">{idx + 1}</td>
                  <td className="fw-semibold">{quiz.title}</td>
                  <td className="text-muted" style={{ maxWidth: 250 }}>{quiz.description}</td>
                  <td className="text-center">
                    <span className="badge bg-light text-dark border">{quiz.questions?.length || 0}</span>
                  </td>
                  <td className="text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      {/* Add question */}
                      <button
                        id={`add-q-${quiz._id}`}
                        className="btn btn-sm btn-outline-success"
                        data-bs-toggle="modal"
                        data-bs-target="#addQuestionModal"
                        onClick={() => openAddQuestion(quiz._id)}
                        title="Add question"
                      >
                        <i className="bi bi-plus-circle"></i>
                      </button>
                      {/* Edit */}
                      <button
                        id={`edit-quiz-${quiz._id}`}
                        className="btn btn-sm btn-outline-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#quizModal"
                        onClick={() => openEdit(quiz)}
                        title="Manage Quiz & Questions"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      {/* Delete */}
                      <button
                        id={`delete-quiz-${quiz._id}`}
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(quiz._id)}
                        title="Delete"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Quiz Create/Edit Modal ── */}
      <div className="modal fade" id="quizModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content" style={{ borderRadius: 16 }}>
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold">
                {modalMode === 'create' ? 'Create New Quiz' : 'Manage Quiz'}
              </h5>
              <button id="closeQuizModal" type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            
            {/* Tabs (Only show in edit mode) */}
            {modalMode === 'edit' && (
              <div className="px-4 pt-2">
                <ul className="nav nav-tabs">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${editTab === 'info' ? 'active fw-semibold' : ''}`}
                      onClick={() => setEditTab('info')}
                    >
                      <i className="bi bi-info-circle me-1"></i> Quiz Info
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${editTab === 'questions' ? 'active fw-semibold' : ''}`}
                      onClick={() => setEditTab('questions')}
                    >
                      <i className="bi bi-list-ol me-1"></i> Questions
                      <span className="badge bg-secondary ms-1" style={{ fontSize: '0.7rem' }}>
                        {activeQuiz?.questions?.length || 0}
                      </span>
                    </button>
                  </li>
                </ul>
              </div>
            )}

            <div className="modal-body pt-3">
              {/* Tab: Info - Create/Edit Form */}
              {(modalMode === 'create' || editTab === 'info') && (
                <form onSubmit={handleQuizSubmit} id="quiz-info-form">
                  <div className="mb-3">
                    <label className="form-label fw-medium">Title</label>
                    <input id="quiz-title-input" className="form-control" name="title" value={quizForm.title} onChange={handleQuizChange} required placeholder="e.g. World Geography" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Description</label>
                    <textarea id="quiz-desc-input" className="form-control" name="description" value={quizForm.description} onChange={handleQuizChange} required rows={3} placeholder="Short description of this quiz" />
                  </div>
                </form>
              )}

              {/* Tab: Questions (Only in edit mode) */}
              {modalMode === 'edit' && editTab === 'questions' && (
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {activeQuiz?.questions?.length === 0 ? (
                    <div className="text-center text-muted py-4">No questions in this quiz yet.</div>
                  ) : (
                    activeQuiz?.questions?.map((q, idx) => (
                      <div key={q._id || idx} className="d-flex justify-content-between align-items-start p-3 mb-2 rounded-3 border border-light">
                        <div className="flex-grow-1 pe-3">
                          <div className="fw-semibold mb-1">{idx + 1}. {q.text}</div>
                          <div className="d-flex flex-wrap gap-1">
                            {q.options?.map((opt, i) => (
                              <span
                                key={i}
                                className={`badge ${i === q.correctAnswerIndex ? 'bg-success' : 'bg-light text-dark border'}`}
                                style={{ fontSize: '0.75rem' }}
                              >
                                {i + 1}. {opt}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-danger flex-shrink-0"
                          title="Remove from Quiz"
                          disabled={removeQLoading === q._id}
                          onClick={() => handleRemoveQuestion(activeQuiz._id, q._id)}
                        >
                          {removeQLoading === q._id ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <i className="bi bi-x-lg"></i>
                          )} Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            
            <div className="modal-footer border-0 pt-0">
              <button type="button" className="btn btn-light" data-bs-dismiss="modal">Close</button>
              {(modalMode === 'create' || editTab === 'info') && (
                <button form="quiz-info-form" id="save-quiz-btn" type="submit" className="btn btn-primary-gradient px-4">
                  {modalMode === 'create' ? 'Create' : 'Save Info'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Question Modal ── */}
      <div className="modal fade" id="addQuestionModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content" style={{ borderRadius: 16 }}>
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold">Add Question to Quiz</h5>
              <button id="closeAddQModal" type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            {/* Tabs */}
            <div className="px-4 pt-2">
              <ul className="nav nav-tabs">
                <li className="nav-item">
                  <button
                    id="tab-new"
                    className={`nav-link ${qTab === 'new' ? 'active fw-semibold' : ''}`}
                    onClick={() => { setQTab('new'); setQError(''); setQSuccess(''); }}
                  >
                    <i className="bi bi-plus-circle me-1"></i> Create New
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    id="tab-existing"
                    className={`nav-link ${qTab === 'existing' ? 'active fw-semibold' : ''}`}
                    onClick={() => { setQTab('existing'); setQError(''); setQSuccess(''); }}
                  >
                    <i className="bi bi-list-check me-1"></i> Pick Existing
                    {allQuestions.length > 0 && (
                      <span className="badge bg-secondary ms-1" style={{ fontSize: '0.7rem' }}>
                        {allQuestions.length - alreadyInQuiz.size}
                      </span>
                    )}
                  </button>
                </li>
              </ul>
            </div>

            <div className="modal-body pt-3">
              {qError && <div className="alert alert-danger py-2">{qError}</div>}
              {qSuccess && <div className="alert alert-success py-2">{qSuccess}</div>}

              {/* ── Tab: Create New ── */}
              {qTab === 'new' && (
                <form onSubmit={handleAddQuestion}>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Question Text</label>
                    <input id="q-text-input" className="form-control" name="text" value={qForm.text} onChange={handleQChange} required placeholder="Enter the question" />
                  </div>
                  <div className="row g-3 mb-3">
                    {qForm.options.map((opt, i) => (
                      <div className="col-md-6" key={i}>
                        <label className="form-label fw-medium">Option {i + 1}</label>
                        <input
                          id={`option-${i}`}
                          className="form-control"
                          value={opt}
                          onChange={(e) => handleOptionChange(i, e.target.value)}
                          required
                          placeholder={`Option ${i + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Correct Answer</label>
                      <select id="correct-answer-sel" className="form-select" name="correctAnswerIndex" value={qForm.correctAnswerIndex} onChange={handleQChange}>
                        {qForm.options.map((_, i) => (
                          <option key={i} value={i}>Option {i + 1}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Keywords <span className="text-muted">(comma-separated)</span></label>
                      <input id="keywords-input" className="form-control" name="keywords" value={qForm.keywords} onChange={handleQChange} placeholder="e.g. capital, geography" />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button type="button" className="btn btn-light" data-bs-dismiss="modal">Close</button>
                    <button id="add-q-submit" type="submit" className="btn btn-primary-gradient px-4" disabled={qLoading}>
                      {qLoading ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                      Add Question
                    </button>
                  </div>
                </form>
              )}

              {/* ── Tab: Pick Existing ── */}
              {qTab === 'existing' && (
                <div>
                  {/* Search */}
                  <div className="input-group mb-3">
                    <span className="input-group-text"><i className="bi bi-search"></i></span>
                    <input
                      id="exist-q-search"
                      className="form-control"
                      placeholder="Search questions…"
                      value={existSearch}
                      onChange={(e) => setExistSearch(e.target.value)}
                    />
                    {selectedQIds.length > 0 && (
                      <span className="input-group-text bg-primary text-white border-0">
                        {selectedQIds.length} selected
                      </span>
                    )}
                  </div>

                  {/* Question list */}
                  <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                    {filteredExisting.length === 0 ? (
                      <div className="text-center text-muted py-4">
                        {allQuestions.length === 0
                          ? 'No questions in the bank yet. Create some in Manage Questions!'
                          : 'All available questions are already in this quiz.'}
                      </div>
                    ) : (
                      filteredExisting.map((q, idx) => {
                        const isChecked = selectedQIds.includes(q._id);
                        return (
                          <div
                            key={q._id}
                            className={`d-flex align-items-start gap-3 p-3 mb-2 rounded-3 border cursor-pointer ${isChecked ? 'border-primary bg-primary bg-opacity-10' : 'border-light'}`}
                            style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                            onClick={() => toggleSelectQ(q._id)}
                          >
                            <input
                              type="checkbox"
                              className="form-check-input mt-1 flex-shrink-0"
                              id={`exist-q-${q._id}`}
                              checked={isChecked}
                              onChange={() => toggleSelectQ(q._id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-grow-1">
                              <div className="fw-semibold mb-1">{idx + 1}. {q.text}</div>
                              <div className="d-flex flex-wrap gap-1">
                                {q.options.map((opt, i) => (
                                  <span
                                    key={i}
                                    className={`badge ${i === q.correctAnswerIndex ? 'bg-success' : 'bg-light text-dark border'}`}
                                    style={{ fontSize: '0.75rem' }}
                                  >
                                    {i + 1}. {opt}
                                  </span>
                                ))}
                              </div>
                              {q.keywords?.length > 0 && (
                                <div className="mt-1">
                                  {q.keywords.map(k => (
                                    <span key={k} className="badge bg-light text-muted border me-1" style={{ fontSize: '0.7rem' }}>{k}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <button type="button" className="btn btn-light" data-bs-dismiss="modal">Close</button>
                    <button
                      id="add-existing-submit"
                      className="btn btn-primary-gradient px-4"
                      disabled={selectedQIds.length === 0 || addExistLoading}
                      onClick={handleAddExisting}
                    >
                      {addExistLoading ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                      Add {selectedQIds.length > 0 ? `(${selectedQIds.length})` : ''} to Quiz
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQuizzesPage;
