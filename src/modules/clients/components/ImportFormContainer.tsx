import React from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { NEUTRAL } from '../../../theme/palette';
import { useTranslation } from 'react-i18next';
import { SystemStyleObject, Theme } from '@mui/system';
import { button2 } from '../../../theme/typography';

interface FormContainerProps {
    children: React.ReactElement;
    primaryButtonDisabled: boolean;
    primaryButtonOnClick: Function;
    secondaryButtonVisible?: boolean;
    secondaryButtonOnClick?: Function;
    loading?: boolean;
}

export function ImportFormContainer({
    children,
    primaryButtonDisabled,
    primaryButtonOnClick,
    secondaryButtonOnClick = (): void => {},
    secondaryButtonVisible = true
}: FormContainerProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <Box
            sx={{
                backgroundColor: NEUTRAL.white,
                height: '100%'
            }}>
            {children}
            <Box>
                <Button
                    fullWidth
                    disabled={primaryButtonDisabled}
                    type="button"
                    size="medium"
                    sx={{
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
                        {t('importButtonLable')}
                    </Typography>
                </Button>

                <Button
                    fullWidth
                    type="button"
                    size="medium"
                    sx={{
                        display: !secondaryButtonVisible ? 'none' : '',
                        border: '1px solid',
                        borderColor: theme.palette.secondary.main,
                        borderRadius: '4px',
                        marginBottom: '4px'
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
            </Box>
        </Box>
    );
}
