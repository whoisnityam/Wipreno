import React, { useState, useEffect, createContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { UserContextProps } from '../modules/profile/models/User';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { Role } from '../modules/profile/models/Role';
import { ChangeSubscriptionAlert } from '../modules/profile/pages/ChangeSubscriptionAlert';
import { logout } from '../modules/auth/services/AuthService';
import { GetCurrentUser } from '../services/DirectusService';
import { useIsMounted } from '../components/Hooks/useIsMounted';

const InitialData = {
    user: undefined,
    refreshData: (): void => {}
};

export const UserContext = createContext<UserContextProps>(InitialData);

interface UserProviderProps {
    children?: React.ReactNode;
}

export const UserProvider: React.FunctionComponent<UserProviderProps> = ({
    children
}: UserProviderProps): JSX.Element => {
    const [loaded, setLoaded] = useState<boolean | false>(false);
    const [userData, setUserData] = useState<UserContextProps>(InitialData);
    const [openChangeSubscription, setOpenChangeSubscription] = useState(false);
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const isMounted = useIsMounted();

    useEffect(() => {
        if (
            pathname.includes('/auth') &&
            pathname !== '/consultation-response' &&
            !pathname.includes('/onboarding')
        ) {
            if (
                !pathname.includes('/profile') &&
                userData.user &&
                userData.user.role?.name === Role.projectManager &&
                userData.user.is_enterprise_owner &&
                userData.user.subscription_plan_id &&
                !userData.user.stripe_subscription_id
            ) {
                setOpenChangeSubscription(true);
            }
        }
    }, [pathname]);

    const prepareData = (): void => {
        setLoaded(false);
        GetCurrentUser()
            .then((res) => {
                setUserData({
                    user: res,
                    refreshData: prepareData
                });
                if (res.role.name === Role.projectManager && res.is_enterprise_owner) {
                    if (!res?.email_verified) {
                        navigate('/auth/register?confirmEmail=true', { replace: true });
                    } else if (res.enterprises?.length === 0 && !pathname.includes('/onboarding')) {
                        navigate('/onboarding', { replace: true });
                    } else if (
                        (pathname.includes('/auth') || pathname.includes('/onboarding')) &&
                        res.subscription_plan_id
                    ) {
                        navigate('/dashboard', { replace: true });
                    }
                } else if (
                    res.role.name === Role.projectManager &&
                    !res.is_enterprise_owner &&
                    res.enterprises?.at(0)?.enterprise_id.is_deleted
                ) {
                    logout();
                    navigate('/auth/login');
                } else if (pathname.includes('/auth/login')) {
                    navigate('/dashboard', { replace: true });
                }
            })
            .catch(() => {
                navigate('/auth/login');
            })
            .finally(() => {
                setLoaded(true);
            });
    };

    useEffect(() => {
        if (isMounted) {
            if (
                pathname !== '/auth/register' &&
                pathname !== '/auth/forgot-password' &&
                pathname !== '/auth/reset-password' &&
                pathname !== '/auth/set-password' &&
                pathname !== '/consultation-response'
            ) {
                prepareData();
            } else {
                setLoaded(true);
            }
        }
    }, []);

    return loaded ? (
        <UserContext.Provider value={userData}>
            <ChangeSubscriptionAlert
                isOpen={openChangeSubscription}
                onClose={(): void => setOpenChangeSubscription(false)}
            />
            {children}
        </UserContext.Provider>
    ) : (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%" width="100vw">
            <LoadingIndicator />
        </Box>
    );
};
