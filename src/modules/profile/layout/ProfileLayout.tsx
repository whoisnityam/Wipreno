import React, { useContext, useEffect, useState } from 'react';
import { Box, Tab, Tabs, Typography, useMediaQuery } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../../../components/sidebar/Sidebar';
import {
    profileSidebarConfig,
    projectManagerProfileSidebarConfig
} from '../../../components/sidebar/SidebarItems';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../../provider/UserProvider';
import { ACCENT_SUNSET, NEUTRAL } from '../../../theme/palette';
import { small1 } from '../../../theme/typography';
import { useIsMounted } from '../../../components/Hooks/useIsMounted';

export interface ItemType {
    title: string;
    path: string;
    icon: JSX.Element;
}

export function ProfileLayout(): React.ReactElement {
    const { t } = useTranslation();
    const user = useContext(UserContext);
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const sidebarConfig = profileSidebarConfig(t);
    const projectManagerSidebarConfig = projectManagerProfileSidebarConfig(t);
    const isLargeLandscape = useMediaQuery('(min-width:920px)');
    const isMounted = useIsMounted();

    let currentTab: number;

    if (pathname === '/profile/current' || pathname === '/profile') {
        currentTab = 0;
    } else if (pathname === '/profile/userManagement') {
        currentTab = 1;
    } else {
        currentTab = 2;
    }
    const [selectedItem, setSelectedItem] = useState<ItemType>(sidebarConfig[currentTab]);
    const [selectedTab, setSelectedTab] = useState(currentTab);

    const handleSelectedItem = (item: ItemType): void => {
        setSelectedItem(item);
        navigate(item.path);
    };

    const setNavbar = (): ItemType[] => {
        if (user.user && user.user?.is_enterprise_owner) {
            return sidebarConfig;
        } else {
            return projectManagerSidebarConfig;
        }
    };

    useEffect(() => {
        setNavbar();
    }, [user.user]);

    useEffect(() => {
        if (user.user?.is_enterprise_owner) {
            if (pathname === '/profile/current' || pathname === '/profile') {
                setSelectedItem(sidebarConfig[0]);
            } else if (pathname === '/profile/userManagement') {
                setSelectedItem(sidebarConfig[1]);
            } else {
                setSelectedItem(sidebarConfig[2]);
            }
        } else {
            setSelectedItem(projectManagerSidebarConfig[0]);
        }
    }, [pathname]);

    const desktopView = (): React.ReactElement => {
        return (
            <>
                <Sidebar
                    title={t('myAccount')}
                    navConfig={setNavbar()}
                    selectedItem={selectedItem}
                    handleSelectedItem={handleSelectedItem}
                />
                <Box height={'100%'} paddingLeft={'325px'}>
                    <Outlet />
                </Box>
            </>
        );
    };

    const tabs = (): React.ReactElement[] => {
        if (user.user?.is_enterprise_owner) {
            return [
                <Tab key={1} label={t('myProfile')} />,
                <Tab key={2} label={t('userManagement')} />,
                <Tab key={3} label={t('subscription')} />
            ];
        } else {
            return [<Tab key={1} label={t('myProfile')} />];
        }
    };

    useEffect(() => {
        if (isMounted) {
            handleSelectedItem(sidebarConfig[selectedTab]);
        }
    }, [selectedTab]);

    const additionalLayout = (): boolean => {
        if (pathname.includes('/profile/payment-history')) {
            return true;
        } else if (pathname.includes('/profile/change-subscription')) {
            return true;
        } else {
            return false;
        }
    };

    const mobileView = (): React.ReactElement => {
        return (
            <Box padding={'16px'} height={'100%'}>
                {!additionalLayout() ? (
                    <>
                        <Typography variant={'h4'}>{t('myAccount')}</Typography>
                        <Box
                            sx={{
                                borderBottom: 1,
                                borderColor: NEUTRAL.light,
                                marginTop: '24px'
                            }}>
                            <Tabs
                                sx={{
                                    '.MuiTab-root': {
                                        ...small1,
                                        padding: 0,
                                        marginRight: '40px',
                                        color: NEUTRAL.light
                                    },
                                    '.MuiTabs-indicator': {
                                        backgroundColor: ACCENT_SUNSET.medium
                                    }
                                }}
                                variant="scrollable"
                                value={selectedTab}
                                onChange={(_, newValue): void => setSelectedTab(newValue)}
                                aria-label="Project Tabs">
                                {tabs()}
                            </Tabs>
                        </Box>
                    </>
                ) : (
                    <></>
                )}
                <Outlet />
            </Box>
        );
    };

    return <Box height={'100%'}>{isLargeLandscape ? desktopView() : mobileView()}</Box>;
}
