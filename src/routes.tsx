import React, { useContext } from 'react';
import { Navigate, RouteObject, useRoutes } from 'react-router-dom';
import { AuthLayout } from './modules/auth/layouts/AuthLayout';
import { OnBoardingLayout } from './modules/onboarding/layouts/onboardingLayout';
import { ForgotPassword } from './modules/auth/pages/ForgotPassword';
import { ResetPassword } from './modules/auth/pages/ResetPassword';
import { ProjectLayout } from './modules/projects/layout/ProjectLayout';
import { CurrentProjects } from './modules/projects/pages/CurrentProjects';
import { ArtisansLayout } from './modules/artisans/layout/ArtisansLayout';
import { ArtisansList } from './modules/artisans/pages/ArtisansList';
import { ClientsLayout } from './modules/clients/layout/ClientsLayout';
import { ClientsList } from './modules/clients/pages/ClientsList';
import { PredefinedModeles } from './modules/modeles/pages/PredefinedModeles';
import { ModelesLayout } from './modules/modeles/layout/ModelesLayout';
import { ArchivedProjects } from './modules/projects/pages/ArchivedProjects';
import { ProjectStatusList } from './modules/projects/pages/ProjectStatusList';
import { Page404 } from './modules/error/pages/Page404';
import { Login } from './modules/auth/pages/Login';
import { Register } from './modules/auth/pages/Register';
import { Dashboard } from './modules/dashboard/pages/Dashboard';
import { DashboardLayout } from './modules/dashboard/layouts/DashboardLayout';
import { Page401 } from './modules/error/pages/Page401';
import { Page500 } from './modules/error/pages/Page500';
import { ProjectGlobalPlanning } from './modules/projects/pages/ProjectGlobalPlanning';
import { ProjectDetailLayout } from './modules/projects/layout/ProjectDetailLayout';
import { ProjectDetails } from './modules/projects/pages/ProjectDetails';
import { ProjectEstimation } from './modules/projects/pages/ProjectEstimation';
import { ProjectConsultation } from './modules/projects/pages/ProjectConsultation';
import { ProjectBudget } from './modules/projects/pages/ProjectBudget';
import { ProjectPlanning } from './modules/projects/pages/ProjectPlanning';
import { ProjectReport } from './modules/projects/pages/ProjectReport';
import { MyModels } from './modules/modeles/pages/MyModels';
import { ArtisanDetailLayout } from './modules/artisans/layout/ArtisanDetailLayout';
import { ArtisanDetails } from './modules/artisans/pages/ArtisanDetails';
import { AssignedProjects } from './modules/artisans/pages/AssignedProjects';
import { ArtisanPlanning } from './modules/artisans/pages/ArtisanPlanning';
import { ModeleDetailLayout } from './modules/modeles/layout/ModeleDetailLayout';
import { Estimation } from './modules/modeles/pages/Estimation';
import { Planning } from './modules/modeles/pages/Planning';
import { ProfileLayout } from './modules/profile/layout/ProfileLayout';
import { CurrentProfile } from './modules/profile/pages/CurrentProfile';
import { UserManagement } from './modules/profile/pages/UserManagement';
import { Subscription } from './modules/profile/pages/Subscription';
import { PreviewDocument } from './modules/projects/components/PreviewDocument';
import { NoticesPredefined } from './modules/admin/pages/NoticesPredefined';
import { UserContext } from './provider/UserProvider';
import { Role } from './modules/profile/models/Role';
import { AdminDashboard } from './modules/admin/pages/AdminDashboard';
import { Dashboard as UserDashboard } from './modules/common/pages/Dashboard';
import { PaymentHistory } from './modules/profile/pages/PaymentHistory';
import { ChangeSubscription } from './modules/profile/pages/ChangeSubscription';
import { AdminUserLayout } from './modules/admin/layouts/AdminUserLayout';
import { AdminClients } from './modules/admin/pages/AdminClients';
import { AdminArtisans } from './modules/admin/pages/AdminArtisans';
import { ConsultationPreview } from './modules/projects/components/consultation/ConsultationPreview';
import { AdminManagement } from './modules/admin/pages/AdminManagement';
import { AdminProfile } from './modules/admin/pages/AdminProfile';
import { ProjectDiscussions } from './modules/projects/pages/ProjectDiscussions';
import { ProjectDocumentsFolders } from './modules/projects/pages/ProjectDocumentsFolders';
import { ProjectDocuments } from './modules/projects/pages/ProjectDocuments';
import { ProjectDocumentsFiles } from './modules/projects/pages/ProjectDocumentsFiles';
import { UserAccess } from './modules/projects/pages/UserAccess';
import { ClientsDetails } from './modules/clients/pages/ClientsDetails';
import { ReportDetails } from './modules/projects/components/report/ReportDetails';
import { TaskDetails } from './modules/projects/components/estimation/TaskDetails';

export function Router(): React.ReactElement | null {
    const user = useContext(UserContext);

    const managerOnboarding: RouteObject[] = [
        {
            path: '/onboarding',
            children: [{ path: '', element: <OnBoardingLayout /> }]
        }
    ];

    const managerBasicPlanRoutes: RouteObject[] = [
        {
            path: '/',
            element: <DashboardLayout />,
            children: [
                { path: '/', element: <Navigate to="/dashboard" /> },
                { path: '/dashboard', element: <Dashboard /> },
                {
                    path: '/profile',
                    element: <ProfileLayout />,
                    children: [
                        { path: '/profile', element: <Navigate to="/profile/current" /> },
                        { path: '/profile/current', element: <CurrentProfile /> },
                        { path: '/profile/userManagement', element: <UserManagement /> },
                        { path: '/profile/subscription', element: <Subscription /> },
                        { path: '/profile/payment-history', element: <PaymentHistory /> },
                        { path: '/profile/change-subscription', element: <ChangeSubscription /> }
                    ]
                },
                {
                    path: '/projects',
                    element: <ProjectLayout />,
                    children: [
                        { path: '/projects', element: <Navigate to="/projects/current" /> },
                        { path: '/projects/current', element: <CurrentProjects /> },
                        { path: '/projects/archived', element: <ArchivedProjects /> },
                        { path: '/projects/status', element: <ProjectStatusList /> },
                        { path: '/projects/planning', element: <ProjectGlobalPlanning /> }
                    ]
                },
                {
                    path: '/project',
                    element: <ProjectDetailLayout />,
                    children: [
                        { path: '/project', element: <Navigate to="/project/details/:id" /> },
                        { path: '/project/details/:id', element: <ProjectDetails /> },
                        { path: '/project/estimation/:id', element: <ProjectEstimation /> },
                        { path: '/project/taskDetails/:id', element: <TaskDetails /> }
                    ]
                },
                {
                    path: '/artisans',
                    element: <ArtisansLayout />,
                    children: [
                        { path: '/artisans', element: <Navigate to="/artisans/list" /> },
                        { path: '/artisans/list', element: <ArtisansList /> }
                    ]
                },
                {
                    path: '/artisan',
                    element: <ArtisanDetailLayout />,
                    children: [
                        { path: '/artisan', element: <Navigate to="/artisan/details/:id" /> },
                        { path: '/artisan/details/:id', element: <ArtisanDetails /> },
                        {
                            path: '/artisan/assignedProjects/:id',
                            element: <AssignedProjects />
                        },
                        { path: '/artisan/Planning/:id', element: <ArtisanPlanning /> }
                    ]
                },
                {
                    path: '/clients',
                    element: <ClientsLayout />,
                    children: [
                        { path: '/clients', element: <Navigate to="/clients/list" /> },
                        { path: '/clients/list', element: <ClientsList /> },
                        { path: '/clients/details/:id', element: <ClientsDetails /> }
                    ]
                },
                {
                    path: '/modeles',
                    element: <ModelesLayout />,
                    children: [
                        { path: '/modeles', element: <Navigate to="/modeles/predefined" /> },
                        { path: '/modeles/predefined', element: <PredefinedModeles /> },
                        {
                            path: '/modeles/vos-modeles',
                            element: <MyModels />
                        }
                    ]
                },

                {
                    path: '/modele',
                    element: <ModeleDetailLayout />,
                    children: [
                        { path: '/modele', element: <Navigate to="/modele/estimation/:id" /> },
                        {
                            path: '/modele/estimation/:id',
                            element: <Estimation isEditable={false} />
                        },
                        { path: '/modele/planning/:id', element: <Planning isEditable={false} /> },
                        {
                            path: '/modele/vos-modeles/estimation/:id',
                            element: <Estimation isEditable={true} />
                        },
                        {
                            path: '/modele/vos-modeles/planning/:id',
                            element: <Planning isEditable={true} />
                        }
                    ]
                }
            ]
        }
    ];

    const managerProPlanRoutes = [
        {
            path: '/',
            element: <DashboardLayout />,
            children: [
                {
                    path: '/project',
                    element: <ProjectDetailLayout />,
                    children: [
                        { path: '/project/consultation/:id', element: <ProjectConsultation /> },
                        { path: '/project/budget/:id', element: <ProjectBudget /> },
                        { path: '/project/planning/:id', element: <ProjectPlanning /> },
                        { path: '/project/compte-rendu/:id', element: <ProjectReport /> },
                        { path: '/project/discussions/:id', element: <ProjectDiscussions /> },
                        { path: '/project/report/details/:id', element: <ReportDetails /> },
                        {
                            path: '/project/documents',
                            element: <Navigate to="/project/documents/:id" />
                        },
                        {
                            path: '/project/documents/:id',
                            element: <ProjectDocuments />
                        },
                        {
                            path: '/project/documents/craftsman/:id',
                            element: <ProjectDocumentsFolders />
                        },
                        {
                            path: '/project/documents/client/:id',
                            element: <ProjectDocumentsFolders />
                        },
                        {
                            path: '/project/documents/craftsman/files/:id/:folderId',
                            element: <ProjectDocumentsFiles />
                        },
                        {
                            path: '/project/documents/client/files/:id/:folderId',
                            element: <ProjectDocumentsFiles />
                        },
                        { path: '/project/user-access/:id', element: <UserAccess /> },
                        { path: '/project/report/details/:id', element: <ReportDetails /> }
                    ]
                }
            ]
        }
    ];

    const admin: RouteObject[] = [
        {
            path: '/',
            element: <DashboardLayout />,
            children: [
                { path: '/', element: <Navigate to="/dashboard" /> },
                { path: '/dashboard', element: <AdminDashboard /> },
                {
                    path: '/predefined-notices',
                    element: <NoticesPredefined />
                },
                {
                    path: '/users',
                    element: <AdminUserLayout />,
                    children: [
                        { path: '/users', element: <Navigate to="/users/clients" /> },
                        { path: '/users/clients', element: <AdminClients /> },
                        { path: '/users/artisans', element: <AdminArtisans /> }
                    ]
                },
                {
                    path: '/admin-management',
                    element: <AdminManagement />
                },
                {
                    path: '/predefined-notice',
                    element: <ModeleDetailLayout />,
                    children: [
                        {
                            path: '/predefined-notice',
                            element: <Navigate to="/predefined-notice/estimation/:id" />
                        },
                        {
                            path: '/predefined-notice/estimation/:id',
                            element: <Estimation isEditable={true} />
                        },
                        {
                            path: '/predefined-notice/planning/:id',
                            element: <Planning isEditable={true} />
                        }
                    ]
                },
                { path: '/profile', element: <AdminProfile /> }
            ]
        }
    ];

    const artisian: RouteObject[] = [
        {
            path: '/',
            element: <DashboardLayout />,
            children: [
                { path: '/', element: <Navigate to="/dashboard" /> },
                { path: '/dashboard', element: <UserDashboard /> },
                {
                    path: '/project',
                    element: <ProjectDetailLayout />,
                    children: [
                        { path: '/project', element: <Navigate to="/project/details/:id" /> },
                        { path: '/project/details/:id', element: <ProjectDetails /> }
                    ]
                }
            ]
        }
    ];

    const client: RouteObject[] = [
        {
            path: '/',
            element: <DashboardLayout />,
            children: [
                { path: '/', element: <Navigate to="/dashboard" /> },
                { path: '/dashboard', element: <UserDashboard /> },
                {
                    path: '/project',
                    element: <ProjectDetailLayout />,
                    children: [
                        { path: '/project', element: <Navigate to="/project/details/:id" /> },
                        { path: '/project/details/:id', element: <ProjectDetails /> }
                    ]
                }
            ]
        }
    ];

    const common: RouteObject[] = [
        {
            path: '/auth',
            element: <AuthLayout />,
            children: [
                { path: 'login', element: <Login /> },
                { path: 'register', element: <Register /> },
                { path: 'forgot-password', element: <ForgotPassword /> },
                { path: 'reset-password', element: <ResetPassword /> },
                { path: 'set-password', element: <ResetPassword /> }
            ]
        },
        {
            path: '/:id',
            element: <PreviewDocument />
        },
        {
            path: '/error',
            children: [
                { path: '404', element: <Page404 /> },
                { path: '401', element: <Page401 /> },
                { path: '500', element: <Page500 /> }
            ]
        },
        { path: '/consultation-response', element: <ConsultationPreview /> },
        { path: '*', element: <Navigate to="/error/404" replace /> }
    ];

    switch (user.user?.role.name) {
        case Role.admin:
            return useRoutes([...admin, ...common]);
        case Role.projectManager:
            if (user.user?.is_enterprise_owner) {
                if (user.user.subscription_plan_id === null) {
                    return useRoutes([...managerOnboarding, ...common]);
                } else if (user.user.subscription_plan_id?.is_pro) {
                    return useRoutes([
                        ...managerBasicPlanRoutes,
                        ...managerProPlanRoutes,
                        ...managerOnboarding,
                        ...common
                    ]);
                } else {
                    return useRoutes([...managerBasicPlanRoutes, ...managerOnboarding, ...common]);
                }
            } else {
                return useRoutes([...managerBasicPlanRoutes, ...managerProPlanRoutes, ...common]);
            }
        case Role.artisan:
            return useRoutes([...artisian, ...common]);
        case Role.client:
            return useRoutes([...client, ...common]);
        default:
            return useRoutes([...common]);
    }
}
