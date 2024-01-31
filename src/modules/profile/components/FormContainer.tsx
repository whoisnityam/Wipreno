import React from 'react';
import { Box, Button, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { NEUTRAL } from '../../../theme/palette';
import { useTranslation } from 'react-i18next';
import { SystemStyleObject, Theme } from '@mui/system';
import { button2 } from '../../../theme/typography';
import { LoadingButton } from '@mui/lab';

interface FormContainerProps {
    children: React.ReactElement;
    primaryButtonDisabled: boolean;
    primaryButtonOnClick: Function;
    secondaryButtonVisible?: boolean;
    secondaryButtonOnClick?: Function;
    loading?: boolean;
    isModify?: boolean;
}

export function FormContainer({
    children,
    primaryButtonDisabled,
    primaryButtonOnClick,
    secondaryButtonOnClick = (): void => {},
    secondaryButtonVisible = true,
    isModify,
    loading = false
}: FormContainerProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();
    const isLargeLandscape = useMediaQuery('(min-width:920px)');

    const getSubmitButton = (): React.ReactElement => {
        return (
            <LoadingButton
                loading={loading}
                fullWidth
                disabled={primaryButtonDisabled}
                variant="contained"
                type="button"
                size="medium"
                onClick={async (e): Promise<void> => {
                    e.preventDefault();
                    primaryButtonOnClick();
                }}>
                {!loading && (
                    <Typography
                        color={NEUTRAL.white}
                        sx={(): SystemStyleObject<Theme> => ({
                            ...button2,
                            fontWeight: 'bold',
                            margin: '1% 0%',
                            textTransform: 'none'
                        })}>
                        {isModify ? t('modifyButtonTitle') : t('add')}
                    </Typography>
                )}
            </LoadingButton>
        );
    };

    return (
        <Box
            sx={{
                backgroundColor: NEUTRAL.white,
                height: 'auto',
                background: 'white',
                position: isLargeLandscape ? 'absolute' : '',
                top: isLargeLandscape ? '50%' : '',
                left: isLargeLandscape ? '50%' : '',
                transform: isLargeLandscape ? 'translate(-50%, -50%)' : '',
                padding: isLargeLandscape ? '40px' : '',
                width: isLargeLandscape ? '440px' : '100%',
                marginTop: isLargeLandscape ? '' : '12px',
                whiteSpace: 'pre-line'
            }}>
            {children}
            <Stack>
                <Box height="48px" />
                {getSubmitButton()}
                <Box height="20px" />
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
                        {t('return')}
                    </Typography>
                </Button>
            </Stack>
        </Box>
    );
}
