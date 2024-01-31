import { Outlet } from 'react-router-dom';
import React, { useEffect } from 'react';
import { Box, Paper, styled, useMediaQuery, useTheme } from '@mui/material';
import banner from '../../../assets/banner.svg';
import { NEUTRAL } from '../../../theme/palette';
import logoWithName from '../../../assets/logoWithName.svg';
import { hasUserData, logout } from '../services/AuthService';

const AuthContainer = styled(Box)(({ theme }) => ({
    [theme.breakpoints.up('sm')]: {
        backgroundSize: 'contain',
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

// ----------------------------------------------------------------------

export function AuthLayout(): React.ReactElement {
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('lg'));

    useEffect(() => {
        if (hasUserData()) {
            logout();
        }
    }, []);

    return (
        <AuthContainer>
            {!isLarge && (
                <>
                    <PaperStyle
                        sx={{
                            flexDirection: 'column',
                            width: '100%',
                            height: '100%',
                            backgroundColor: NEUTRAL.lighter,
                            paddingTop: '10px',
                            paddingLeft: '16px',
                            paddingRight: '16px'
                        }}>
                        <Box height="8px" />
                        <Box component={'img'} height="32px" src={logoWithName} alt="logo" />
                        <Box height={'60px'} />
                        <Outlet />
                    </PaperStyle>
                </>
            )}
            {isLarge && (
                <>
                    <PaperStyle sx={{ width: '100%' }}>
                        <Box
                            sx={{
                                width: '43%',
                                height: '100vh',
                                backgroundColor: NEUTRAL.lighter,
                                paddingTop: '40px',
                                paddingLeft: '80px',
                                paddingRight: '116px'
                            }}>
                            <Box component={'img'} src={logoWithName} alt="logo" />
                            <Box height={'60px'} />
                            <Outlet />
                        </Box>
                        <Box sx={{ height: '100vh', flexGrow: 1 }}>
                            <img
                                src={banner}
                                alt="banner"
                                style={{
                                    height: '100vh',
                                    width: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </Box>
                    </PaperStyle>
                </>
            )}
        </AuthContainer>
    );
}
