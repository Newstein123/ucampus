import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store';
import ProtectedRoute from './components/ProtectedRoute';
import { HomeProvider } from './contexts/HomeContext';

// Pages
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MyProfile from './pages/MyProfile';
import Create from './pages/contribution/Create';
import IdeaCreate from './pages/contribution/IdeaCreate';
import QuestionCreate from './pages/contribution/QuestionCreate';
import ProjectCreate from './pages/contribution/ProjectCreate';
import Explore from './pages/Explore';
import Projects from './pages/Projects';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProjectDetails from './pages/contribution/ProjectDetails';
import MyIdeasAndQuestions from './pages/myhub/MyIdeasAndQuestions';
import TermsAndConditions from './pages/myhub/TermsAndConditions';
import ContactUs from './pages/myhub/ContactUs';
import Language from './pages/myhub/Language';
import ChangePassword from './pages/myhub/ChangePassword';

// Create a theme instance
const theme = createTheme({
    palette: {
        primary: {
            main: '#1F8505',
        },
        secondary: {
            main: '#48b74d',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
});

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <HomeProvider>
                        <BrowserRouter>
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password" element={<ResetPassword />} />

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

                                <Route path="/my-ideas-and-questions" element={
                                    <ProtectedRoute>
                                        <MyIdeasAndQuestions />
                                    </ProtectedRoute>
                                } />

                                <Route path="/terms-and-conditions" element={
                                    <ProtectedRoute>
                                        <TermsAndConditions />
                                    </ProtectedRoute>
                                } />

                                <Route path="/contact-us" element={
                                    <ProtectedRoute>
                                        <ContactUs />
                                    </ProtectedRoute>
                                } />

                                <Route path="/language" element={
                                    <ProtectedRoute>
                                        <Language />
                                    </ProtectedRoute>
                                } />

                                <Route path="/change-password" element={
                                    <ProtectedRoute>
                                        <ChangePassword />
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
                                <Route path="/projects" element={
                                    <ProtectedRoute>
                                        <Projects />
                                    </ProtectedRoute>
                                } />
                                <Route path="/explore" element={
                                    <ProtectedRoute>
                                        <Explore />
                                    </ProtectedRoute>
                                } />
                                <Route path="/project-details/:id" element={
                                    <ProtectedRoute>
                                        <ProjectDetails />
                                    </ProtectedRoute>
                                } />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </BrowserRouter>
                    </HomeProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </Provider>
    );
};

export default App;