import React from 'react';
import { Box, Button, Stack, Typography, useTheme } from '@mui/material';
import { NEUTRAL } from '../../../../theme/palette';
import { useTranslation } from 'react-i18next';
import { SystemStyleObject, Theme } from '@mui/system';
import { button2 } from '../../../../theme/typography';
import { LoadingButton } from '@mui/lab';

interface FormContainerProps {
    children: React.ReactElement;
    pdfButtonDisabled: boolean;
    pdfButtonOnClick: Function;
    csvButtonDisabled: boolean;
    csvButtonOnClick: Function;
    secondaryButtonVisible?: boolean;
    secondaryButtonOnClick?: Function;
    loading?: boolean;
}

export function ExportFormContainer({
    children,
    pdfButtonDisabled,
    pdfButtonOnClick,
    csvButtonDisabled,
    csvButtonOnClick,
    secondaryButtonOnClick = (): void => {},
    secondaryButtonVisible = true,
    loading
}: FormContainerProps): React.ReactElement {
    const { t } = useTranslation();
    const themes = useTheme();

    const isDisabled = (): boolean => {
        if (csvButtonDisabled || loading) {
            return true;
        } else {
            return false;
        }
    };

    return (
        <Box
            sx={{
                backgroundColor: NEUTRAL.white,
                height: '100%'
            }}>
            {children}
            <Box>
                <Stack direction={'row'} width={'100%'} justifyContent={'space-between'}>
                    <Button
                        fullWidth
                        disabled={pdfButtonDisabled}
                        type="button"
                        size="medium"
                        sx={{
                            background: 'linear-gradient(90deg, #3360DB 0%, #DD6789 100%)',
                            opacity: !pdfButtonDisabled ? 1 : 0.25,
                            marginTop: '48px',
                            marginBottom: '20px',
                            width: '46%'
                        }}
                        onClick={(): void => pdfButtonOnClick()}>
                        <Typography
                            color={NEUTRAL.white}
                            variant="button"
                            fontWeight={'700'}
                            sx={(): SystemStyleObject<Theme> => ({
                                fontWeight: 'bold',
                                margin: '1% 0%',
                                textTransform: 'none'
                            })}>
                            {t('exportAsPdf')}
                        </Typography>
                    </Button>
                    <LoadingButton
                        loading={loading}
                        sx={(theme): SystemStyleObject<Theme> => ({
                            background: theme.palette.secondary.lighter,
                            opacity: !isDisabled() ? 1 : 0.25,
                            width: '46%',
                            marginTop: '48px',
                            boxShadow: 'none',
                            marginBottom: '20px',
                            ':hover': {
                                backgroundColor: theme.palette.secondary.lighter,
                                color: theme.palette.primary.darker
                            }
                        })}
                        variant="contained"
                        onClick={(): void => csvButtonOnClick()}>
                        <Typography
                            sx={(): SystemStyleObject<Theme> => ({
                                margin: '1% 0%',
                                textTransform: 'none'
                            })}
                            variant="button"
                            color={themes.palette.primary.darker}
                            fontWeight={'700'}>
                            {t('exportAsCsv')}
                        </Typography>
                    </LoadingButton>
                </Stack>

                <Button
                    fullWidth
                    type="button"
                    size="medium"
                    sx={{
                        display: !secondaryButtonVisible ? 'none' : '',
                        border: '1px solid',
                        borderColor: themes.palette.secondary.main,
                        borderRadius: '4px',
                        marginBottom: '8px'
                    }}
                    onClick={(): void => secondaryButtonOnClick()}>
                    <Typography
                        color={themes.palette.secondary.main}
                        sx={(): SystemStyleObject<Theme> => ({
                            ...button2,
                            fontWeight: 'bold',
                            margin: '1% 0%',
                            textTransform: 'none'
                        })}>
                        {t('return')}
                    </Typography>
                </Button>
            </Box>
        </Box>
    );
}
