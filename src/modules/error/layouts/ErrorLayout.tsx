import React from 'react';
import { Box, Button, styled, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

interface ErrorLayoutProps {
    title: string;
    subtitle: string;
    image: string;
}

const ErrorContainer = styled(Box)({
    textAlign: 'center',
    minHeight: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center'
});

export function ErrorLayout({ title, subtitle, image }: ErrorLayoutProps): React.ReactElement {
    const { t } = useTranslation();
    return (
        <ErrorContainer>
            <Typography variant="h3" my={1} maxWidth={'550px'}>
                {t(title)}
            </Typography>
            <Typography variant="body1" my={1} maxWidth={'550px'}>
                {t(subtitle)}
            </Typography>
            <Box
                component="img"
                src={image}
                sx={{
                    flexGrow: 1,
                    maxHeight: '200px'
                }}
            />
            <Button to="/" size="large" variant="contained" component={RouterLink} sx={{ my: 1 }}>
                {t('goHomeButtonTitle')}
            </Button>
        </ErrorContainer>
    );
}
