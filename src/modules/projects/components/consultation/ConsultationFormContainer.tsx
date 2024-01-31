import React from 'react';
import { Box, Button } from '@mui/material';
import { NEUTRAL } from '../../../../theme/palette';
import { useTranslation } from 'react-i18next';

interface FormContainerProps {
    currentStep: number;
    children: React.ReactElement;
    primaryButtonDisabled: boolean;
    primaryButtonOnClick: Function;
    secondaryButtonVisible?: boolean;
    secondaryButtonOnClick?: Function;
}

export function ConsultationFormContainer({
    children,
    currentStep,
    primaryButtonDisabled,
    primaryButtonOnClick,
    secondaryButtonOnClick = (): void => {},
    secondaryButtonVisible = true
}: FormContainerProps): React.ReactElement {
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                backgroundColor: NEUTRAL.white,
                height: '100%',
                paddingTop: '5%',
                overflowY: 'auto'
            }}>
            {children}
            <Box>
                <Button
                    fullWidth
                    disabled={primaryButtonDisabled}
                    variant={'contained'}
                    onClick={(): void => primaryButtonOnClick()}>
                    {currentStep === 1 ? t('create') : t('following')}
                </Button>
                <Button
                    fullWidth
                    variant={'outlined'}
                    sx={{
                        display: !secondaryButtonVisible ? 'none' : '',
                        marginTop: '20px'
                    }}
                    color={'secondary'}
                    onClick={(): void => secondaryButtonOnClick()}>
                    {currentStep === 1 ? t('return') : t('previous')}
                </Button>
            </Box>
        </Box>
    );
}
