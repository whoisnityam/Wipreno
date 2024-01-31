import { TFunction } from 'react-i18next';

export const projectManagerNavigation = (
    t: TFunction<'translation'>
): { title: string; path: string; innerPath?: string }[] => [
    {
        title: t('dashboard'),
        path: '/dashboard'
    },
    {
        title: t('projects'),
        path: '/projects',
        innerPath: '/project'
    },
    {
        title: t('craftsmen'),
        path: '/artisans',
        innerPath: '/artisan'
    },
    {
        title: t('clients'),
        path: '/clients'
    },
    {
        title: t('models'),
        path: '/modeles',
        innerPath: '/modele'
    }
];
export const projectManagerNavigationResponsive = (
    t: TFunction<'translation'>
): { title: string; path: string; innerPath?: string }[] => [
    {
        title: t('dashboard'),
        path: '/dashboard'
    },
    {
        title: t('projects'),
        path: '/projects',
        innerPath: '/project'
    },
    {
        title: t('craftsmen'),
        path: '/artisans',
        innerPath: '/artisan'
    },
    {
        title: t('clients'),
        path: '/clients'
    }
];

export const adminNavigation = (t: TFunction<'translation'>): { title: string; path: string }[] => [
    {
        title: t('dashboard'),
        path: '/dashboard'
    },
    {
        title: t('users'),
        path: '/users'
    },
    {
        title: t('predefinedRecords'),
        path: '/predefined-notices'
    },
    {
        title: t('adminManagement'),
        path: '/admin-management'
    }
];

export const accountPopoverConfig = (
    t: TFunction<'translation'>
): { title: string; path: string }[] => [
    {
        title: t('myAccount'),
        path: '/profile'
    },
    {
        title: t('logOut'),
        path: '/logout'
    }
];
