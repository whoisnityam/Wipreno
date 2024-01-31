import { Container, SxProps } from '@mui/material';
import React from 'react';
import { CustomStepper } from '../components/CustomStepper';

interface OnboardingStepperProps {
    currentStep: number;
    sx?: SxProps;
}

export function OnboardingStepper({ currentStep, sx }: OnboardingStepperProps): React.ReactElement {
    return (
        <Container sx={{ ...sx }}>
            <CustomStepper activeStep={currentStep} />
        </Container>
    );
}
