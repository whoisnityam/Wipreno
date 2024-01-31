import { TFunction } from 'react-i18next';
import React from 'react';

export const projectsSidebarConfig = (
    t: TFunction<'translation'>
): { title: string; path: string; icon: JSX.Element }[] => [
    {
        title: t('currentProjects'),
        path: '/projects/current',
        icon: <></>
    },
    {
        title: t('archivedProjects'),
        path: '/projects/archived',
        icon: <></>
    },
    {
        title: t('projectStatus'),
        path: '/projects/status',
        icon: <></>
    }
];

export const ModelsSidebarConfig = (
    t: TFunction<'translation'>
): { title: string; path: string; icon: JSX.Element }[] => [
    {
        title: t('modelsPredefined'),
        path: '/modeles/predefined',
        icon: <></>
    },
    {
        title: t('yourModels'),
        path: '/modeles/vos-modeles',
        icon: <></>
    }
];

export const AdminUsersSidebarConfig = (
    t: TFunction<'translation'>
): { title: string; path: string; icon: JSX.Element }[] => [
    {
        title: t('clients'),
        path: '/users/clients',
        icon: <></>
    },
    {
        title: t('craftsmen'),
        path: '/users/artisans',
        icon: <></>
    }
];

export const profileSidebarConfig = (
    t: TFunction<'translation'>
): { title: string; path: string; icon: JSX.Element }[] => [
    {
        title: t('myProfile'),
        path: '/profile/current',
        icon: <></>
    },
    {
        title: t('userManagement'),
        path: '/profile/userManagement',
        icon: <></>
    },
    {
        title: t('subscription'),
        path: '/profile/subscription',
        icon: <></>
    }
];

export const projectManagerProfileSidebarConfig = (
    t: TFunction<'translation'>
): { title: string; path: string; icon: JSX.Element }[] => [
    {
        title: t('myProfile'),
        path: '/profile/current',
        icon: <></>
    }
];
