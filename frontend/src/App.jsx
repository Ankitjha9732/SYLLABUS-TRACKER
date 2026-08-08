import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ProgressProvider } from './context/ProgressContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import { Login, Register } from './pages/Auth.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Syllabus } from './pages/Syllabus.jsx';
import { TopicDetail } from './pages/TopicDetail.jsx';
import { ProgressPage } from './pages/Progress.jsx';
import { Notes } from './pages/Notes.jsx';
import { Settings } from './pages/Settings.jsx';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25 }}
  >
    {children}
  </motion.div>
);

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <PageTransition>
            <Dashboard />
          </PageTransition>
        }
      />
      <Route
        path="/syllabus"
        element={
          <PageTransition>
            <Syllabus />
          </PageTransition>
        }
      />
      <Route
        path="/syllabus/:moduleId"
        element={
          <PageTransition>
            <Syllabus />
          </PageTransition>
        }
      />
      <Route
        path="/topic/:topicId"
        element={
          <PageTransition>
            <TopicDetail />
          </PageTransition>
        }
      />
      <Route
        path="/progress"
        element={
          <PageTransition>
            <ProgressPage />
          </PageTransition>
        }
      />
      <Route
        path="/notes"
        element={
          <PageTransition>
            <Notes />
          </PageTransition>
        }
      />
      <Route
        path="/settings"
        element={
          <PageTransition>
            <Settings />
          </PageTransition>
        }
      />
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

const App = () => (
  <ToastProvider>
    <AuthProvider>
      <ProgressProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ProgressProvider>
    </AuthProvider>
  </ToastProvider>
);

export default App;