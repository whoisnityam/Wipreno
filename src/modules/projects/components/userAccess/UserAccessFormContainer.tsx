import React from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { NEUTRAL } from '../../../../theme/palette';
import { useTranslation } from 'react-i18next';
import { LoadingButton } from '@mui/lab';
import { button2 } from '../../../../theme/typography';

interface FormContainerProps {
    currentStep: number;
    children: React.ReactElement;
    primaryButtonDisabled: boolean;
    primaryButtonOnClick: Function;
    secondaryButtonVisible?: boolean;
    secondaryButtonOnClick?: Function;
    loading?: boolean;
}

export function UserAccessFormContainer({
    currentStep,
    children,
    primaryButtonDisabled,
    primaryButtonOnClick,
    secondaryButtonOnClick = (): void => {},
    secondaryButtonVisible = true,
    loading = false
}: FormContainerProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();

    const getSubmitButton = (): React.ReactElement => {
        return (
            <LoadingButton
                loading={loading}
                fullWidth
                disabled={primaryButtonDisabled}
                type="button"
                size="medium"
                variant={'contained'}
                sx={{
                    display: currentStep === 1 ? 'flex' : 'none',
                    marginTop: '48px',
                    marginBottom: '20px'
                }}
                onClick={async (e): Promise<void> => {
                    e.preventDefault();
                    primaryButtonOnClick();
                }}>
                <Typography
                    color={NEUTRAL.white}
                    sx={{
                        ...button2,
                        fontWeight: 'bold',
                        margin: '1% 0%',
                        textTransform: 'none'
                    }}>
                    {t('sendInvitation')}
                </Typography>
            </LoadingButton>
        );
    };

    return (
        <Box
            sx={{
                height: '100%',
                overflowY: 'auto'
            }}>
            {children}
            <Box>
                <Button
                    fullWidth
                    disabled={primaryButtonDisabled}
                    type="button"
                    size="medium"
                    variant={'contained'}
                    sx={{
                        display: currentStep < 1 ? 'flex' : 'none',
                        marginTop: '48px',
                        marginBottom: '20px'
                    }}
                    onClick={(): void => primaryButtonOnClick()}>
                    <Typography
                        color={NEUTRAL.white}
                        sx={{
                            ...button2,
                            fontWeight: 'bold',
                            margin: '1% 0%',
                            textTransform: 'none'
                        }}>
                        {t('following')}
                    </Typography>
                </Button>
                {getSubmitButton()}
                <Button
                    fullWidth
                    type="button"
                    size="medium"
                    variant={'outlined'}
                    sx={{
                        display: !secondaryButtonVisible ? 'none' : '',
                        marginBottom: '8px'
                    }}
                    onClick={(): void => secondaryButtonOnClick()}>
                    <Typography
                        color={theme.palette.secondary.main}
                        sx={{
                            ...button2,
                            fontWeight: 'bold',
                            margin: '1% 0%',
                            textTransform: 'none'
                        }}>
                        {currentStep === 0 ? t('return') : t('previous')}
                    </Typography>
                </Button>
            </Box>
        </Box>
    );
}
