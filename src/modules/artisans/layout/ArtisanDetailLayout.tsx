import React, { createContext, useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { WRBreadcrumb } from '../../../components/breadcumbs/WRBreadcrumb';
import { useTranslation } from 'react-i18next';
import { Box, Tab, Tabs, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ACCENT_SUNSET, NEUTRAL } from '../../../theme/palette';
import { small1 } from '../../../theme/typography';
import { InformationButtons } from '../components/InformationButton';
import { getArtisanById } from '../services/artisanService';
import { User } from '../../profile/models/User';
import { PlanningButton } from '../components/PlanningButton';

export interface ArtisanViewData {
    artisan?: User;
    refreshData: Function;
}

export const ArtisanContext = createContext<ArtisanViewData | undefined>(undefined);

export function ArtisanDetailLayout(): React.ReactElement {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    const theme = useTheme();
    const isLargeLandscape = useMediaQuery('(min-width:920px)');
    const [viewData, setViewData] = useState<ArtisanViewData>({
        artisan: undefined,
        refreshData: (): void => {}
    });
    let currentTab = 0;

    if (pathname.includes('/artisan/details/')) {
        currentTab = 0;
    } else if (pathname.includes('/artisan/assignedProjects/')) {
        currentTab = 1;
    } else if (pathname.includes('/artisan/Planning/')) {
        currentTab = 2;
    }

    const [selectedTab, setSelectedTab] = useState(currentTab);
    const [loading, setLoading] = useState<boolean>(false);

    const prepareData = useCallback(async () => {
        setLoading(true);
        const response = await getArtisanById(id!);
        setViewData({ artisan: response, refreshData: prepareData });
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!id) {
            navigate('/artisans/list', { replace: true });
        } else {
            prepareData();
        }
    }, []);

    useEffect(() => {
        switch (selectedTab) {
            case 0:
                navigate(`/artisan/details/${id}`);
                break;
            case 1:
                navigate(`/artisan/assignedProjects/${id}`);
                break;
            case 2:
                navigate(`/artisan/Planning/${id}`);
                break;
            default:
                navigate(`/artisan/details/${id}`);
                break;
        }
    }, [selectedTab]);

    const breadcrumbData: {
        link: string;
        label: string;
    }[] = [
        { link: '/artisans', label: t('craftsmen') },
        { link: '#', label: viewData.artisan ? viewData.artisan?.company_name : '' }
    ];

    const ActionButtons = (): React.ReactElement => {
        if (selectedTab === 0) {
            return <InformationButtons />;
        } else if (selectedTab === 2) {
            return <PlanningButton />;
        } else {
            return <></>;
        }
    };

    const Header = (): React.ReactElement => {
        return (
            <Box>
                {isLargeLandscape && (
                    <>
                        <WRBreadcrumb
                            onBackPress={(): void => navigate('/artisans/list', { replace: true })}
                            links={breadcrumbData}
                        />
                        <Box height={'30px'} />
                    </>
                )}
                <Box
                    sx={{
                        height: '28px',
                        [theme.breakpoints.down('sm')]: {
                            height: '22px'
                        }
                    }}
                />
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        height: '50px',
                        marginBottom: isLargeLandscape ? '20px' : ''
                    }}>
                    {isLargeLandscape ? (
                        <>
                            <Typography
                                variant={'h4'}
                                sx={{
                                    display: '-webkit-box',
                                    textOverflow: 'ellipsis',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                }}>
                                {viewData.artisan ? viewData.artisan.company_name : ''}
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Typography
                                variant={'h6'}
                                sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                {viewData.artisan ? viewData.artisan.company_name : ''}
                            </Typography>
                        </>
                    )}
                    {isLargeLandscape && <ActionButtons />}
                </Box>
            </Box>
        );
    };

    const Nav = (): React.ReactElement => {
        return (
            <Box
                sx={{
                    borderBottom: 1,
                    borderColor: NEUTRAL.light
                }}>
                <Tabs
                    sx={{
                        '.MuiTab-root': {
                            ...small1
                        },
                        '.MuiTabs-indicator': {
                            backgroundColor: ACCENT_SUNSET.medium
                        }
                    }}
                    value={selectedTab}
                    variant="scrollable"
                    onChange={(_, newValue): void => setSelectedTab(newValue)}
                    aria-label="Project Tabs">
                    <Tab label={t('profile')} />
                    <Tab label={t('assignedProjects')} />
                    <Tab label={t('planning')} />
                </Tabs>
            </Box>
        );
    };

    const RenderComponents = (): React.ReactElement => {
        if (loading) {
            return <LoadingIndicator />;
        } else {
            return (
                <ArtisanContext.Provider value={viewData}>
                    <Box
                        sx={{
                            paddingLeft: isLargeLandscape ? '40px' : '',
                            padding: isLargeLandscape ? '' : '15px'
                        }}>
                        {Header()}
                        <Box height={isLargeLandscape ? '37px' : '18px'} />
                        <Nav />
                        <Box height={selectedTab === 1 ? '' : '33px'} />
                        <Outlet />
                    </Box>
                </ArtisanContext.Provider>
            );
        }
    };

    return <RenderComponents />;
}
