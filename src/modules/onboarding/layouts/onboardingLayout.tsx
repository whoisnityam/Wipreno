import React, { useState } from 'react';
import { Box, Paper, styled, useMediaQuery, useTheme } from '@mui/material';
import { OnboardingForms } from '../pages/OnboardingForms';
import { OnboardingStepper } from '../components/OnboardingStepper';
import { NEUTRAL } from '../../../theme/palette';
import logoWithName from '../../../assets/logoWithName.svg';
import { useSearchParams } from 'react-router-dom';

const OnBoardingContainer = styled(Box)(({ theme }) => ({
    [theme.breakpoints.up('sm')]: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
    },
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
}));

const PaperStyle = styled(Paper)({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: '100vh',
    boxShadow: 'none'
});

export function OnBoardingLayout(): React.ReactElement {
    const [searchParams] = useSearchParams();
    const success = Boolean(searchParams.get('success'));
    const [currentStep, setCurrentStep] = useState<number>(success ? 3 : 0);
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));

    const nextStep = (): void => {
        setCurrentStep(currentStep + 1);
    };

    const previousStep = (): void => {
        setCurrentStep(currentStep - 1);
    };

    const getWidth = (consumedWidth: number): string => {
        const { innerWidth: width } = window;
        return `${width - consumedWidth}px`;
    };

    return (
        <OnBoardingContainer>
            {!isLarge && (
                <PaperStyle
                    sx={{
                        flexDirection: 'column',
                        width: '100vw',
                        backgroundColor: NEUTRAL.lighter,
                        paddingTop: '10px',
                        paddingBottom: '5%'
                    }}>
                    <Box height={'60px'} />
                    <Box
                        component={'img'}
                        src={logoWithName}
                        alt="logo"
                        sx={{ paddingTop: '7px' }}
                    />
                    <Box height={'60px'} />
                    <OnboardingStepper currentStep={currentStep} />
                    {OnboardingForms({
                        currentStep,
                        nextStep,
                        previousStep,
                        openSuccess: success
                    })}
                </PaperStyle>
            )}
            {isLarge && (
                <PaperStyle
                    sx={{
                        width: '100%',
                        margin: '0% auto'
                    }}>
                    <Box sx={{ width: '325px', height: '100vh', marginRight: '80px' }}>
                        <Box height={'30px'} />
                        <Box
                            component={'img'}
                            src={logoWithName}
                            alt="logo"
                            sx={{ width: '150px', height: '36px', marginLeft: '40px' }}
                        />
                        <Box height={'50px'} />
                        <OnboardingStepper currentStep={currentStep} />
                    </Box>
                    <Box
                        sx={{
                            minWidth: getWidth(325),
                            height: '100vh',
                            backgroundColor: NEUTRAL.lighter,
                            paddingRight: '175px',
                            paddingLeft: '40px'
                        }}>
                        {OnboardingForms({
                            currentStep,
                            nextStep,
                            previousStep,
                            openSuccess: success
                        })}
                    </Box>
                </PaperStyle>
            )}
        </OnBoardingContainer>
    );
}
