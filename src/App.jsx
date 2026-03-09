import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import QuizListPage from './pages/QuizListPage';
import QuizDetailPage from './pages/QuizDetailPage';
import AdminQuizzesPage from './pages/AdminQuizzesPage';
import AdminQuestionsPage from './pages/AdminQuestionsPage';
// Main application component with routing
function App() {
  return (
    <div className="min-vh-100" style={{ background: '#f8f9fa' }}>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected – all logged-in users */}
        <Route path="/" element={
          <ProtectedRoute><QuizListPage /></ProtectedRoute>
        } />
        <Route path="/quizzes/:id" element={
          <ProtectedRoute><QuizDetailPage /></ProtectedRoute>
        } />

        {/* Admin only */}
        <Route path="/admin/quizzes" element={
          <ProtectedRoute adminOnly><AdminQuizzesPage /></ProtectedRoute>
        } />
        <Route path="/admin/questions" element={
          <ProtectedRoute adminOnly><AdminQuestionsPage /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
