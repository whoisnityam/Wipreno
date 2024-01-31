import React, { useContext, useEffect, useState } from 'react';
import { styled } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components/topNavigation/NavBar';
import { NEUTRAL } from '../../../theme/palette';
import { UserContext } from '../../../provider/UserProvider';
import { Role } from '../../profile/models/Role';

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const RootStyle = styled('div')({
    display: 'flex',
    minHeight: '100%',
    overflow: 'hidden'
});

const MainStyle = styled('div')(({ theme }) => ({
    flexGrow: 1,
    overflow: 'auto',
    minHeight: '100%',
    paddingTop: APP_BAR_MOBILE + 24,
    backgroundColor: NEUTRAL.lighter,
    [theme.breakpoints.up('lg')]: {
        paddingTop: APP_BAR_DESKTOP + 24,
        paddingLeft: '40px',
        paddingRight: '80px'
    }
}));

export function DashboardLayout(): React.ReactElement {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [showBackButton, setShowBackButton] = useState(false);
    const user = useContext(UserContext);

    useEffect(() => {
        if (
            pathname.startsWith('/project/') ||
            pathname === '/projects/planning' ||
            pathname.startsWith('/artisan/') ||
            pathname.startsWith('/clients/details') ||
            pathname.includes('/project/report/details/') ||
            pathname.includes('/project/taskDetails/') ||
            pathname.startsWith('/profile/')
        ) {
            setShowBackButton(true);
        } else {
            setShowBackButton(false);
        }
    }, [pathname]);

    return (
        <RootStyle>
            <Navbar
                hasBackButton={showBackButton}
                onBackClick={(): void => {
                    if (
                        user.user?.role.name === Role.artisan ||
                        user.user?.role.name === Role.client
                    ) {
                        if (pathname.includes('/project/details/')) {
                            navigate('/dashboard', { replace: true });
                        } else {
                            navigate('/dashboard');
                        }
                    } else {
                        if (
                            pathname.includes('/project/details/') ||
                            pathname.includes('/project/estimation/') ||
                            pathname.includes('/project/consultation/') ||
                            pathname.includes('/project/budget/') ||
                            pathname.includes('/project/compte-rendu/') ||
                            pathname.includes('/project/planning') ||
                            pathname.includes('/project/documents/')
                        ) {
                            navigate('/projects', { replace: true });
                        } else if (pathname.startsWith('/artisan/')) {
                            navigate('/artisans/list', { replace: true });
                        } else if (pathname.startsWith('/clients/details')) {
                            navigate('/clients/list', { replace: true });
                        } else if (
                            pathname.includes('/project/report/details/') ||
                            pathname.includes('/project/taskDetails/') ||
                            pathname.includes('profile/payment-history') ||
                            pathname.includes('profile/change-subscription')
                        ) {
                            navigate(-1);
                        } else if (
                            pathname.includes('/profile/current') ||
                            pathname.includes('profile/userManagement') ||
                            pathname.includes('profile/subscription')
                        ) {
                            navigate('/dashboard');
                        }
                    }
                }}
            />
            <MainStyle>
                <Outlet />
            </MainStyle>
        </RootStyle>
    );
}
