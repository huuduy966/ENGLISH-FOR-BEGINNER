import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PlacementTestPage from './pages/PlacementTestPage';

// Protected Student Pages
import DashboardPage from './pages/DashboardPage';
import LessonsListPage from './pages/LessonsListPage';
import LessonDetailPage from './pages/LessonDetailPage';
import VocabularyPage from './pages/VocabularyPage';
import DictionaryPage from './pages/DictionaryPage';
import ExamPage from './pages/ExamPage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';

// Protected Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/placement-test"
            element={
              <ProtectedRoute>
                <PlacementTestPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Learning App Routes inside MainLayout */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/lessons" element={<LessonsListPage />} />
            <Route path="/lessons/:id" element={<LessonDetailPage />} />
            <Route path="/vocabulary" element={<VocabularyPage />} />
            <Route path="/dictionary" element={<DictionaryPage />} />
            <Route path="/exam" element={<ExamPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Admin Portal (Guarded by requireAdmin) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
