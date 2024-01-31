import React from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { NEUTRAL } from '../../../../theme/palette';
import { useTranslation } from 'react-i18next';
import { LoadingButton } from '@mui/lab';
import { SystemStyleObject, Theme } from '@mui/system';
import { button2 } from '../../../../theme/typography';

interface FormContainerProps {
    currentStep: number;
    children: React.ReactElement;
    primaryButtonDisabled: boolean;
    primaryButtonOnClick: Function;
    secondaryButtonVisible?: boolean;
    secondaryButtonOnClick?: Function;
    loading?: boolean;
    isModify?: boolean;
}

export function FormContainer({
    currentStep,
    children,
    primaryButtonDisabled,
    primaryButtonOnClick,
    secondaryButtonOnClick = (): void => {},
    secondaryButtonVisible = true,
    loading = false,
    isModify = false
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
                sx={{
                    display: isModify || currentStep === 2 ? 'flex' : 'none',
                    background: 'linear-gradient(90deg, #3360DB 0%, #DD6789 100%)',
                    opacity: !primaryButtonDisabled ? 1 : 0.25,
                    marginTop: '48px',
                    marginBottom: '20px'
                }}
                onClick={async (e): Promise<void> => {
                    e.preventDefault();
                    primaryButtonOnClick();
                }}>
                <Typography
                    color={NEUTRAL.white}
                    sx={(): SystemStyleObject<Theme> => ({
                        ...button2,
                        fontWeight: 'bold',
                        margin: '1% 0%',
                        textTransform: 'none'
                    })}>
                    {isModify ? t('modifyButtonTitle') : t('createTheProject')}
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
                    sx={{
                        display: currentStep < 2 && !isModify ? 'flex' : 'none',
                        background: 'linear-gradient(90deg, #3360DB 0%, #DD6789 100%)',
                        opacity: !primaryButtonDisabled ? 1 : 0.25,
                        marginTop: '48px',
                        marginBottom: '20px'
                    }}
                    onClick={(): void => primaryButtonOnClick()}>
                    <Typography
                        color={NEUTRAL.white}
                        sx={(): SystemStyleObject<Theme> => ({
                            ...button2,
                            fontWeight: 'bold',
                            margin: '1% 0%',
                            textTransform: 'none'
                        })}>
                        {t('following')}
                    </Typography>
                </Button>
                {getSubmitButton()}
                <Button
                    fullWidth
                    type="button"
                    size="medium"
                    sx={{
                        display: !secondaryButtonVisible ? 'none' : '',
                        border: '1px solid',
                        borderColor: theme.palette.secondary.main,
                        borderRadius: '4px',
                        marginBottom: '8px'
                    }}
                    onClick={(): void => secondaryButtonOnClick()}>
                    <Typography
                        color={theme.palette.secondary.main}
                        sx={(): SystemStyleObject<Theme> => ({
                            ...button2,
                            fontWeight: 'bold',
                            margin: '1% 0%',
                            textTransform: 'none'
                        })}>
                        {currentStep === 0 ? t('return') : t('previous')}
                    </Typography>
                </Button>
            </Box>
        </Box>
    );
}
