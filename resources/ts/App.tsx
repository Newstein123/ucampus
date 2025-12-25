import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { PWALoading } from './components/PWALoading';
import { HomeProvider } from './contexts/HomeContext';
import { PWAProvider } from './contexts/PWAContext';
import { store } from './store';
import { addPWAMetaTags, isPWA } from './utils/pwa';

// Pages
import Create from './pages/contribution/Create';
import IdeaCreate from './pages/contribution/IdeaCreate';
import IdeaDetails from './pages/contribution/IdeaDetails';
import ProjectCreate from './pages/contribution/ProjectCreate';
import ProjectDetails from './pages/contribution/ProjectDetails';
import ProjectRequest from './pages/contribution/ProjectRequest';
import QuestionCreate from './pages/contribution/QuestionCreate';
import QuestionDetails from './pages/contribution/QuestionDetails';
import Thread from './pages/contribution/Thread';
import Explore from './pages/Explore';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Login from './pages/Login';
import Bookmarks from './pages/myhub/Bookmarks';
import ChangePassword from './pages/myhub/ChangePassword';
import ContactUs from './pages/myhub/ContactUs';
import Language from './pages/myhub/Language';
import MyIdeasAndQuestions from './pages/myhub/MyIdeasAndQuestions';
import ProfileEdit from './pages/myhub/ProfileEdit';
import TermsAndConditions from './pages/myhub/TermsAndConditions';
import MyProfile from './pages/MyProfile';
import Notifications from './pages/Notifications';
import Onboarding from './pages/Onboarding';
import Projects from './pages/Projects';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Search from './pages/Search';

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
    // Initialize PWA meta tags and handle PWA-specific setup
    useEffect(() => {
        addPWAMetaTags();

        // Handle PWA-specific initialization
        if (isPWA()) {
            console.log('Running in PWA mode');

            // Prevent zoom on iOS PWA
            const preventZoom = (e: TouchEvent) => {
                if (e.touches.length > 1) {
                    e.preventDefault();
                }
            };

            document.addEventListener('touchstart', preventZoom, { passive: false });

            return () => {
                document.removeEventListener('touchstart', preventZoom);
            };
        }
    }, []);

    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <PWAProvider>
                        <HomeProvider>
                            <PWALoading>
                                <BrowserRouter>
                                    <Routes>
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/register" element={<Register />} />
                                        <Route path="/forgot-password" element={<ForgotPassword />} />
                                        <Route path="/reset-password" element={<ResetPassword />} />

                                        <Route
                                            path="/"
                                            element={
                                                <ProtectedRoute>
                                                    <Home />
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/myhub"
                                            element={
                                                <ProtectedRoute>
                                                    <MyProfile />
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/my-ideas-and-questions"
                                            element={
                                                <ProtectedRoute>
                                                    <MyIdeasAndQuestions />
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/bookmarks"
                                            element={
                                                <ProtectedRoute>
                                                    <Bookmarks />
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/terms-and-conditions"
                                            element={
                                                <ProtectedRoute>
                                                    <TermsAndConditions />
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/contact-us"
                                            element={
                                                <ProtectedRoute>
                                                    <ContactUs />
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/language"
                                            element={
                                                <ProtectedRoute>
                                                    <Language />
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/change-password"
                                            element={
                                                <ProtectedRoute>
                                                    <ChangePassword />
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/profile/edit"
                                            element={
                                                <ProtectedRoute>
                                                    <ProfileEdit />
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/contribution/create"
                                            element={
                                                <ProtectedRoute>
                                                    <Create />
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route path="/onboarding" element={<Onboarding />} />

                                        {/* Contribution routes */}
                                        <Route
                                            path="/contribution/create-idea"
                                            element={
                                                <ProtectedRoute>
                                                    <IdeaCreate />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/contribution/create-question"
                                            element={
                                                <ProtectedRoute>
                                                    <QuestionCreate />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/contribution/create-project"
                                            element={
                                                <ProtectedRoute>
                                                    <ProjectCreate />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/projects"
                                            element={
                                                <ProtectedRoute>
                                                    <Projects />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/explore"
                                            element={
                                                <ProtectedRoute>
                                                    <Explore />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/search"
                                            element={
                                                <ProtectedRoute>
                                                    <Search />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/notifications"
                                            element={
                                                <ProtectedRoute>
                                                    <Notifications />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/projects/:id"
                                            element={
                                                <ProtectedRoute>
                                                    <ProjectDetails />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/ideas/:id"
                                            element={
                                                <ProtectedRoute>
                                                    <IdeaDetails />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/questions/:id"
                                            element={
                                                <ProtectedRoute>
                                                    <QuestionDetails />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/contribution/request/:requestId"
                                            element={
                                                <ProtectedRoute>
                                                    <ProjectRequest />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/projects/:id/thread"
                                            element={
                                                <ProtectedRoute>
                                                    <Thread />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/threads/:discussionId"
                                            element={
                                                <ProtectedRoute>
                                                    <Thread />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route path="*" element={<Navigate to="/" replace />} />
                                    </Routes>
                                </BrowserRouter>
                            </PWALoading>
                        </HomeProvider>
                    </PWAProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </Provider>
    );
};

export default App;
