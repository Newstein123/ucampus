import React, { useState } from 'react';
import { selectUser } from '../store/slices/authSlice';
import { useSelector } from 'react-redux';
import { Box, Typography, Button, MobileStepper, Paper } from '@mui/material';
import { KeyboardArrowRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Onboarding: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0);
    const user = useSelector(selectUser);
    console.log(user);
    const navigate = useNavigate();
    const steps = [
        {
            title: "What is U Campus?",
            content: "U Campus is envisioned as a free, community-driven digital platform uniquely designed to empower Myanmar youth. It will serve as a dynamic space for sharing ideas, exploring deep questions, and collaborating on real-world projects that foster learning, creativity, and tangible impact."
        },
        {
            title: "Join Our Community",
            content: "Connect with like-minded individuals, share your ideas, and collaborate on projects that make a difference. Our platform is designed to foster creativity and innovation."
        },
        {
            title: "Get Started",
            content: "You're all set! Start exploring the platform, connect with others, and begin your journey of learning and collaboration."
        }
    ];

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            console.log("Onboarding Completed");
            navigate('/');
        } else {
            setActiveStep((prevStep) => prevStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    return (
        <Box
            sx={{
                bgcolor: '#f7fafd',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pt: 2,
                pb: 2,
                maxWidth: 400,
                mx: 'auto',
            }}
        >
            <Typography
                variant="subtitle1"
                sx={{ color: '#c1c1c1', fontWeight: 500, mb: 2, alignSelf: 'flex-start', pl: 2 }}
            >
                Onboarding
            </Typography>

            <Box
                sx={{
                    bgcolor: '#d9f5d6',
                    width: '90%',
                    height: 220,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                }}
            >
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        bgcolor: '#e6f7e6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#b0c4b1',
                    }}
                >
                    <KeyboardArrowRight fontSize="large" />
                </Box>
            </Box>

            <MobileStepper
                variant="dots"
                steps={steps.length}
                position="static"
                activeStep={activeStep}
                sx={{
                    bgcolor: 'transparent',
                    mb: 2,
                    '.MuiMobileStepper-dotActive': { bgcolor: '#4caf50' },
                    '.MuiMobileStepper-dot': { bgcolor: '#e0e0e0' },
                }}
                nextButton={null}
                backButton={null}
            />

            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    px: 3,
                    py: 2,
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {steps[activeStep].title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#757575', mb: 3 }}>
                    {steps[activeStep].content}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    {activeStep > 0 && (
                        <Button
                            variant="outlined"
                            onClick={handleBack}
                            sx={{
                                borderColor: '#4caf50',
                                color: '#4caf50',
                                fontWeight: 600,
                                borderRadius: 2,
                                textTransform: 'none',
                                flex: 1,
                                '&:hover': {
                                    borderColor: '#388e3c',
                                    bgcolor: 'rgba(76, 175, 80, 0.04)'
                                },
                            }}
                        >
                            Back
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{
                            bgcolor: '#4caf50',
                            color: '#fff',
                            fontWeight: 600,
                            borderRadius: 2,
                            textTransform: 'none',
                            flex: activeStep > 0 ? 1 : 1,
                            '&:hover': { bgcolor: '#388e3c' },
                        }}
                    >
                        {activeStep === steps.length - 1 ? 'Get Started' : 'Next'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default Onboarding;