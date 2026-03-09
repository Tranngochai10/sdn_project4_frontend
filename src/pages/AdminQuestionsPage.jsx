import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuestions, createQuestion, updateQuestion, deleteQuestion } from '../store/questionsSlice';

const EMPTY_FORM = {
  text: '',
  options: ['', '', '', ''],
  correctAnswerIndex: 0,
  keywords: '',
};

const AdminQuestionsPage = () => {
  const dispatch = useDispatch();
  const { questions, loading, error } = useSelector((state) => state.questions);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [search, setSearch] = useState('');

  useEffect(() => { dispatch(fetchQuestions()); }, [dispatch]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setModalMode('create');
  };

  const openEdit = (q) => {
    setForm({
      text: q.text,
      options: q.options.length >= 4 ? q.options : [...q.options, ...Array(4 - q.options.length).fill('')],
      correctAnswerIndex: q.correctAnswerIndex,
      keywords: (q.keywords || []).join(', '),
    });
    setEditingId(q._id);
    setModalMode('edit');
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleOptionChange = (idx, val) => {
    const opts = [...form.options];
    opts[idx] = val;
    setForm({ ...form, options: opts });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      text: form.text,
      options: form.options,
      correctAnswerIndex: Number(form.correctAnswerIndex),
      keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
    };
    if (modalMode === 'create') {
      await dispatch(createQuestion(payload));
    } else {
      await dispatch(updateQuestion({ id: editingId, data: payload }));
    }
    document.getElementById('closeQModal').click();
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this question?')) dispatch(deleteQuestion(id));
  };

  const filtered = questions.filter(q =>
    q.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="page-header d-flex justify-content-between align-items-center">
        <h1 className="fw-bold mb-0">
          <i className="bi bi-question-circle me-2" style={{ color: '#6366f1' }}></i>
          Manage Questions
        </h1>
        <button
          id="create-question-btn"
          className="btn btn-primary-gradient"
          data-bs-toggle="modal"
          data-bs-target="#questionModal"
          onClick={openCreate}
        >
          <i className="bi bi-plus-lg me-1"></i> New Question
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Search */}
      <div className="mb-3">
        <div className="input-group" style={{ maxWidth: 360 }}>
          <span className="input-group-text"><i className="bi bi-search"></i></span>
          <input
            id="question-search"
            className="form-control"
            placeholder="Search questions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && <div className="text-center py-4"><div className="spinner-border" style={{ color: '#6366f1' }}></div></div>}

      {/* Table */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
        <div className="table-responsive">
          <table className="table admin-table mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Question</th>
                <th>Options</th>
                <th className="text-center">Answer</th>
                <th>Keywords</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted py-4">No questions found.</td></tr>
              )}
              {filtered.map((q, idx) => (
                <tr key={q._id}>
                  <td className="text-muted">{idx + 1}</td>
                  <td style={{ maxWidth: 220 }}>{q.text}</td>
                  <td>
                    {q.options.map((opt, i) => (
                      <div key={i} className={`small ${i === q.correctAnswerIndex ? 'text-success fw-semibold' : 'text-muted'}`}>
                        {i + 1}. {opt}
                      </div>
                    ))}
                  </td>
                  <td className="text-center">
                    <span className="badge bg-success">{q.correctAnswerIndex + 1}</span>
                  </td>
                  <td className="small text-muted">{(q.keywords || []).join(', ')}</td>
                  <td className="text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <button
                        id={`edit-q-${q._id}`}
                        className="btn btn-sm btn-outline-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#questionModal"
                        onClick={() => openEdit(q)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        id={`delete-q-${q._id}`}
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(q._id)}
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

      {/* Modal */}
      <div className="modal fade" id="questionModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content" style={{ borderRadius: 16 }}>
            <div className="modal-header border-0">
              <h5 className="modal-title fw-bold">
                {modalMode === 'create' ? 'Create New Question' : 'Edit Question'}
              </h5>
              <button id="closeQModal" type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body pt-0">
                <div className="mb-3">
                  <label className="form-label fw-medium">Question Text</label>
                  <input id="q-modal-text" className="form-control" name="text" value={form.text} onChange={handleChange} required placeholder="Enter the question" />
                </div>
                <div className="row g-3 mb-3">
                  {form.options.map((opt, i) => (
                    <div className="col-md-6" key={i}>
                      <label className="form-label fw-medium">Option {i + 1}</label>
                      <input
                        id={`modal-option-${i}`}
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
                    <select id="modal-correct-sel" className="form-select" name="correctAnswerIndex" value={form.correctAnswerIndex} onChange={handleChange}>
                      {form.options.map((_, i) => (
                        <option key={i} value={i}>Option {i + 1}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Keywords <span className="text-muted">(comma-separated)</span></label>
                    <input id="modal-keywords" className="form-control" name="keywords" value={form.keywords} onChange={handleChange} placeholder="e.g. capital, geography" />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                <button id="save-q-btn" type="submit" className="btn btn-primary-gradient px-4">
                  {modalMode === 'create' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQuestionsPage;
