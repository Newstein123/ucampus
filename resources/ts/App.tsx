import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import MyProfile from './pages/MyProfile';
import Onboarding from './pages/Onboarding';
import Register from './pages/Register';
import Create from './pages/contribution/Create';
import ProjectCreate from './pages/contribution/ProjectCreate';
import QuestionCreate from './pages/contribution/QuestionCreate';
import IdeaCreate from './pages/contribution/IdeaCreate';
import Explore from './pages/Explore';
import Projects from './pages/Projects';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const App: React.FC = () => (
    <BrowserRouter>
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* Protected routes */}
            <Route path="/" element={
                <ProtectedRoute>
                    <Home />
                </ProtectedRoute>
            } />

            <Route path="/myhub" element={
                <ProtectedRoute>
                    <MyProfile />
                </ProtectedRoute>
            } />

            <Route path="/contribution/create" element={
                <ProtectedRoute>
                    <Create />
                </ProtectedRoute>
            } />

            <Route path="/onboarding" element={
                <Onboarding />
            } />

            {/* Contribution routes */}
            <Route path="/contribution/create-idea" element={
                <ProtectedRoute>
                    <IdeaCreate />
                </ProtectedRoute>
            } />

            <Route path="/contribution/create-question" element={
                <ProtectedRoute>
                    <QuestionCreate />
                </ProtectedRoute>
            } />


            <Route path="/contribution/create-project" element={
                <ProtectedRoute>
                    <ProjectCreate />
                </ProtectedRoute>
            } />

            <Route path="/explore" element={
                <ProtectedRoute>
                    <Explore />
                </ProtectedRoute>
            } />

            <Route path="/projects" element={
                <ProtectedRoute>
                    <Projects />
                </ProtectedRoute>
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </BrowserRouter>
);

export default App;