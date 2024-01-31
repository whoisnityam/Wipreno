import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Project } from '../models/Project';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { WRBreadcrumb } from '../../../components/breadcumbs/WRBreadcrumb';
import { useTranslation } from 'react-i18next';
import { getProject } from '../services/ProjectService';
import { Box, Tab, Tabs, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ACCENT_SUNSET, NEUTRAL } from '../../../theme/palette';
import { small1 } from '../../../theme/typography';
import { InformationButtons } from '../components/information/InformationButtons';
import { EstimationButtons } from '../components/estimation/EstimationButtons';
import { getReports } from '../services/ReportService';
import { Report } from '../models/Report';
import { UserContext } from '../../../provider/UserProvider';
import { PlanningButtons } from '../components/planning/PlanningButtons';
import { DocumentsButton } from '../components/documents/DocumentsButton';
import { ReportButton } from '../components/report/ReportButton';
import { Role } from '../../profile/models/Role';
import { ProjectAccess } from '../models/ProjectAccess';
import { getAccessProjectsByuserId } from '../../common/services/CommonServices';

export interface ProjectViewData {
    project?: Project;
    report?: Report[];
    refreshData: Function;
}

const InitialData = {
    project: undefined,
    report: undefined,
    refreshData: (): void => {}
};

export const ProjectContext = createContext<ProjectViewData>(InitialData);

export function ProjectDetailLayout(): React.ReactElement {
    const { t } = useTranslation();
    const user = useContext(UserContext);
    const theme = useTheme();
    const isLargeLandscape = useMediaQuery('(min-width:920px)');
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    const [viewData, setViewData] = useState<ProjectViewData>(InitialData);
    const [projectAccess, setProjectAccess] = useState<ProjectAccess[]>();

    let currentTab = 0;

    if (pathname.includes('/project/details/')) {
        currentTab = 0;
    } else if (pathname.includes('/project/estimation/')) {
        currentTab = 1;
    } else if (pathname.includes('/project/consultation/')) {
        currentTab = 2;
    } else if (pathname.includes('/project/budget/')) {
        currentTab = 3;
    } else if (pathname.includes('/project/planning/')) {
        currentTab = 4;
    } else if (pathname.includes('/project/compte-rendu/')) {
        currentTab = 5;
    } else if (pathname.includes('/project/discussions/')) {
        currentTab = 6;
    } else if (pathname.includes('/project/documents/')) {
        currentTab = 7;
    } else if (pathname.includes('/project/user-access/')) {
        currentTab = 8;
    }
    const [selectedTab, setSelectedTab] = useState(currentTab);
    const [loading, setLoading] = useState<boolean>(false);
    const mountedRef = useRef(true);

    const prepareData = async (): Promise<void | null> => {
        if (!viewData.project) {
            setLoading(true);
        }
        const response = await getProject(id!);
        const reportData = await getReports(id!);
        const res = await getAccessProjectsByuserId(user.user?.id!);
        setProjectAccess(res);
        setViewData({
            project: response,
            report: reportData,
            refreshData: prepareData
        });
        setLoading(false);
    };

    useEffect(() => {
        if (!id) {
            navigate('/projects/current', { replace: true });
        } else {
            prepareData();
        }
    }, []);

    useEffect(() => {
        switch (selectedTab) {
            case 0:
                navigate(`/project/details/${id}`);
                break;
            case 1:
                navigate(`/project/estimation/${id}`);
                break;
            case 2:
                navigate(`/project/consultation/${id}`);
                break;
            case 3:
                navigate(`/project/budget/${id}`);
                break;
            case 4:
                navigate(`/project/planning/${id}`);
                break;
            case 5:
                navigate(`/project/compte-rendu/${id}`);
                break;
            case 6:
                navigate(`/project/discussions/${id}`);
                break;
            case 7:
                navigate(`/project/documents/${id}`);
                break;
            case 8:
                navigate(`/project/user-access/${id}`);
                break;
            default:
                navigate(`/project/details/${id}`);
                break;
        }
        return (): void => {
            mountedRef.current = false;
        };
    }, [selectedTab]);

    const breadcrumbData: {
        link: string;
        label: string;
    }[] = [
        { link: '/projects/current', label: t('currentProjects') },
        { link: '#', label: viewData.project?.name ?? '' }
    ];

    const ActionButtons = (): React.ReactElement => {
        if (selectedTab === 0) {
            if (user.user?.role.name === Role.artisan || user.user?.role.name === Role.client) {
                return <></>;
            } else {
                return <InformationButtons />;
            }
        } else if (selectedTab === 1) {
            if (viewData.project?.notices?.at(0)) {
                return (
                    <EstimationButtons
                        noticeId={viewData.project!.notices!.at(0)!.id}
                        onReload={(): void => {
                            prepareData();
                        }}
                    />
                );
            } else {
                return <></>;
            }
        } else if (selectedTab === 4) {
            if (viewData.project?.notices?.at(0)) {
                return (
                    <PlanningButtons
                        enterpriseName={viewData.project!.enterprise_id.name}
                        project={viewData.project!}
                        noticeId={viewData.project!.notices!.at(0)!.id}
                    />
                );
            } else {
                return <></>;
            }
        } else if (selectedTab === 5) {
            if (viewData.report && viewData.report.length > 0) {
                return <ReportButton />;
            } else {
                return <></>;
            }
        } else if (selectedTab === 7) {
            return <DocumentsButton />;
        } else {
            return <></>;
        }
    };

    const Header = (): React.ReactElement => {
        return (
            <Box>
                {isLargeLandscape && (
                    <WRBreadcrumb
                        links={breadcrumbData}
                        onBackPress={(): void => {
                            if (
                                user.user?.role.name === Role.artisan ||
                                user.user?.role.name === Role.client
                            ) {
                                navigate('/dashboard', { replace: true });
                            } else {
                                navigate('/projects/current', { replace: true });
                            }
                        }}
                    />
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
                        overflow: 'hidden'
                    }}>
                    <Typography
                        variant={'h4'}
                        color={NEUTRAL.darker}
                        sx={{
                            display: '-webkit-box',
                            textOverflow: 'ellipsis',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                        }}>
                        {viewData.project?.name}
                    </Typography>
                    {isLargeLandscape && <ActionButtons />}
                </Box>
            </Box>
        );
    };

    const tabs = (): React.ReactElement[] => {
        let list = [
            <Tab key={1} label={t('informationTabLabel')} />,
            <Tab key={2} label={t('estimationTabLabel')} />
        ];
        if (
            (isLargeLandscape && user.user?.subscription_plan_id?.is_pro) ||
            !user.user?.is_enterprise_owner
        ) {
            list = [
                ...list,
                <Tab key={3} label={t('consultationTabLabel')} />,
                <Tab key={4} label={t('budgetTabLabel')} />,
                <Tab key={5} label={t('planning')} />,
                <Tab key={6} label={t('reportTabLabel')} />,
                <Tab key={7} label={t('discussionTabLabel')} />,
                <Tab key={8} label={t('documents')} />,
                <Tab key={9} label={t('accessTabLabel')} />
            ];
        } else if (
            (!isLargeLandscape && user.user?.subscription_plan_id?.is_pro) ||
            !user.user?.is_enterprise_owner
        ) {
            list = [
                ...list,
                <Tab key={3} label={t('consultationTabLabel')} />,
                <Tab key={4} label={t('budgetTabLabel')} />,
                <Tab key={5} label={t('planning')} />,
                <Tab key={6} label={t('reportTabLabel')} />,
                <Tab key={8} label={t('discussionTabLabel')} />,
                <Tab key={9} label={t('documents')} />
            ];
        }
        return list;
    };

    const ArtisanClienttabs = (): React.ReactElement[] => {
        let list = [<Tab key={1} label={t('informationTabLabel')} />];
        projectAccess?.map((access) => {
            if (access.project_id.id === viewData.project?.id) {
                if (access.full_access) {
                    list = [
                        ...list,
                        <Tab key={2} label={t('planning')} />,
                        <Tab key={3} label={t('reportTabLabel')} />,
                        <Tab key={4} label={t('discussion')} />,
                        <Tab key={5} label={t('documents')} />
                    ];
                } else {
                    if (access.has_planning) {
                        list = [...list, <Tab key={2} label={t('planning')} />];
                    }
                    if (access.has_reports) {
                        list = [...list, <Tab key={3} label={t('reportTabLabel')} />];
                    }
                    if (access.has_discussions) {
                        list = [...list, <Tab key={4} label={t('discussion')} />];
                    }
                    if (access.has_documents) {
                        list = [...list, <Tab key={5} label={t('documents')} />];
                    }
                }
            }
        });
        return list;
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
                    {user.user?.role.name === Role.artisan || user.user?.role.name === Role.client
                        ? ArtisanClienttabs()
                        : tabs()}
                </Tabs>
            </Box>
        );
    };

    const detailsLayout = (): boolean => {
        if (pathname.includes('/project/report/details/')) {
            return true;
        } else if (pathname.includes('/project/taskDetails')) {
            return true;
        } else {
            return false;
        }
    };

    const RenderComponents = (): React.ReactElement => {
        if (loading) {
            return <LoadingIndicator />;
        } else {
            return (
                <ProjectContext.Provider value={viewData}>
                    <Box
                        sx={{
                            paddingLeft: { xs: '16px', sm: '16px', md: '40px' },
                            paddingRight: { xs: '16px', sm: '16px', md: '40px' },
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%'
                        }}>
                        {!detailsLayout() ? (
                            <>
                                {Header()}
                                <Box
                                    sx={{
                                        height: '35px',
                                        [theme.breakpoints.down('sm')]: {
                                            height: '22px'
                                        }
                                    }}
                                />
                                <Nav />
                                <Box height={'33px'} />
                            </>
                        ) : (
                            <></>
                        )}
                        <Box
                            sx={{
                                display: 'flex',
                                flexGrow: 1,
                                marginBottom: '15px'
                            }}>
                            {Outlet({ context: ProjectContext })}
                        </Box>
                    </Box>
                </ProjectContext.Provider>
            );
        }
    };

    return <RenderComponents />;
}
