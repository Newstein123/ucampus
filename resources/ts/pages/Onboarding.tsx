import { Box, Button, MobileStepper, Paper, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AppButton from '../components/AppButton';

const Onboarding: React.FC = () => {
    const { t } = useTranslation();
    const [activeStep, setActiveStep] = useState(0);
    const navigate = useNavigate();
    const steps = useMemo(
        () => [
            {
                title: t('What is U Campus?'),
                content: t(
                    'U Campus is envisioned as a free, community-driven digital platform uniquely designed to empower Myanmar youth. It will serve as a dynamic space for sharing ideas, exploring deep questions, and collaborating on real-world projects that foster learning, creativity, and tangible impact.',
                ),
                image: '/assets/onboarding/intro.png',
                imageAlt: t('What is U Campus?'),
            },
            {
                title: t('Join Our Community'),
                content: t(
                    'Connect with like-minded individuals, share your ideas, and collaborate on projects that make a difference. Our platform is designed to foster creativity and innovation.',
                ),
                image: '/assets/onboarding/join-our-community.png',
                imageAlt: t('Join Our Community'),
            },
            {
                title: t('Get Started'),
                content: t(
                    "You're all set! Start exploring the platform, connect with others, and begin your journey of learning and collaboration.",
                ),
                image: '/assets/onboarding/get-started.png',
                imageAlt: t('Get Started'),
            },
        ],
        [t],
    );

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            console.log('Onboarding Completed');
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
                maxWidth: 600,
                mx: 'auto',
            }}
        >
            <Typography variant="subtitle1" sx={{ color: '#c1c1c1', fontWeight: 500, mb: 2, alignSelf: 'flex-start', pl: 2 }}>
                {t('Onboarding')}
            </Typography>

            <Box
                sx={{
                    width: '90%',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    overflow: 'hidden',
                }}
            >
                <img src={steps[activeStep].image} alt={steps[activeStep].imageAlt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                                    bgcolor: 'rgba(76, 175, 80, 0.04)',
                                },
                            }}
                        >
                            {t('Back')}
                        </Button>
                    )}
                    <AppButton
                        onClick={handleNext}
                        sx={{
                            bgcolor: '#4caf50',
                            '&:hover': { bgcolor: '#388e3c' },
                            flex: 1,
                            py: 1,
                            fontSize: 14,
                        }}
                    >
                        {activeStep === steps.length - 1 ? t('Get Started') : t('Next')}
                    </AppButton>
                </Box>
            </Paper>
        </Box>
    );
};

export default Onboarding;
