import React from 'react';
import { Box, Step, StepConnector, StepLabel, Stepper, styled, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTranslation } from 'react-i18next';
import { small1 } from '../../../theme/typography';

interface CustomStepperProps {
    activeStep: number;
}

const useStyles = makeStyles(() => ({
    stepsLayout: {
        '& .MuiStepLabel-root': {
            flexDirection: 'row',
            paddingLeft: '5px'
        },
        '& .MuiStepLabel-label': {
            marginTop: '0px',
            margin: '0px 5px !important'
        },
        '& .Mui-disabled': {
            opacity: 0.5
        },
        '& .Mui-completed': {
            color: '#4A8F18',
            opacity: 0.75
        },
        '& .MuiStepLabel-labelContainer': {
            color: '#666666',
            marginLeft: '5px'
        },
        '& .MuiStep-root': {
            margin: '0px 10px',
            padding: '20px 0px'
        }
    },
    icon: {
        '& .MuiStepIcon-root': {
            width: '40px !important',
            height: '40px !important'
        }
    },
    inactiveIcon: {
        '& .MuiStepIcon-root': {
            width: '40px !important',
            height: '40px !important',
            color: 'white !important',
            border: '2px solid #666666',
            borderRadius: '50%',
            opacity: 0.5
        },
        '& .MuiStepIcon-text': {
            fill: '#666666'
        }
    }
}));

const ColorLineConnector = styled(StepConnector)(({}) => ({
    '& .MuiStepConnector-line': {
        display: 'none'
    }
}));

const StepperContainer = styled(Stepper)(({}) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    '@media (max-width: 420px)': {
        flexDirection: 'row',
        overflow: 'auto'
    }
}));

export function CustomStepper({ activeStep }: CustomStepperProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const steps = [t('profile'), t('subscription'), t('billing'), t('payment')];

    const getIconClass = (index: number): string => {
        if (index <= activeStep) {
            return classes.icon;
        } else {
            return classes.inactiveIcon;
        }
    };

    return (
        <StepperContainer
            className={classes.stepsLayout}
            activeStep={activeStep}
            alternativeLabel
            orientation="vertical"
            connector={<ColorLineConnector />}>
            {steps.map((label, index) => (
                <Step key={label} className={getIconClass(index)}>
                    <StepLabel>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}>
                            <Typography sx={small1}>{label}</Typography>
                        </Box>
                    </StepLabel>
                </Step>
            ))}
        </StepperContainer>
    );
}
