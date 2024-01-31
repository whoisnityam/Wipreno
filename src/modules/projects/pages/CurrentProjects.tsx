import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Button, Divider, MenuItem, Stack, Typography, useMediaQuery } from '@mui/material';
import { NEUTRAL } from '../../../theme/palette';
import { useTranslation } from 'react-i18next';
import { ProjectEmptyState } from '../../../components/emptyState/ProjectEmptyState';
import { CurrentProjectTable } from '../components/table/CurrentProjectTable';
import { getProjects } from '../services/ProjectService';
import { Project } from '../models/Project';
import { UserContext } from '../../../provider/UserProvider';
import { Filter } from '../components/Filter';
import { getProjectManagersByEnterpriseId } from '../../profile/services/ProfileService';
import { ModalContainer } from '../../../components/ModalContainer';
import { CreateProjectForms } from './CreateProjectForm';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { ProjectKanban } from '../components/table/ProjectKanban';
import { Searchbar } from '../../../components/textfield/Searchbar';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProjectStatusByEnterpriseId } from '../services/StatusService';
import { Priorities } from '../../../constants';
import { CheckSentenceStartsWith } from '../../../utils';
import { Sliders } from 'react-feather';
import { useIsMounted } from '../../../components/Hooks/useIsMounted';

export interface ProjectFilters {
    manager?: string;
    status?: string;
    priority?: string;
}

export function CurrentProjects(): React.ReactElement {
    const user = useContext(UserContext);
    const navigate = useNavigate();
    const isLargeLandscape = useMediaQuery('(min-width:920px)');
    const [searchParams] = useSearchParams();
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [projectManagerFilters, setProjectManagerFilters] = useState<
        { id: string; value: string }[]
    >([]);
    const [statusFilters, setStatusFilters] = useState<{ id: string; value: string }[]>([]);
    const [searchText, setSearchText] = useState('');
    const [viewFilter, setViewFilter] = useState<'LIST' | 'KANBAN'>('LIST');
    const [filters, setFilters] = useState<ProjectFilters>({
        manager: undefined,
        status: searchParams.get('filter') ?? undefined,
        priority: undefined
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [openProjectForm, setOpenProjectForm] = useState<boolean>(false);
    const [kanbanKey, setKanbanKey] = useState('');
    const isMounted = useIsMounted();

    const { t } = useTranslation();

    useEffect(() => {
        if (isMounted) {
            setKanbanKey(
                `${filters.manager}+${filters.status}+${filters.priority}+${searchText}+${viewFilter}`
            );
        }
    }, [filters.manager, filters.status, filters.priority, searchText, viewFilter]);

    const fetchProjects = async (): Promise<Project[]> => {
        return getProjects(user.user!.enterprises.at(0)!.enterprise_id.id);
    };

    const fetchStatus = async (): Promise<void> => {
        const statusList = await getProjectStatusByEnterpriseId(
            user.user!.enterprises.at(0)!.enterprise_id.id
        );
        const statusFilter: React.SetStateAction<{ id: string; value: string }[]> = [];
        statusList
            .filter((item) => item.name !== 'Chantier terminé' && item.name !== 'Projet perdu')
            .map((item) => {
                statusFilter.push({
                    id: item.id,
                    value: item.name
                });
            });
        setStatusFilters(statusFilter);
    };

    const fetchFilters = useCallback(async () => {
        const managers = await getProjectManagersByEnterpriseId(
            user.user!.enterprises.at(0)!.enterprise_id.id
        );
        const managerFilter: React.SetStateAction<{ id: string; value: string }[]> = [];
        managers.map((item) => {
            managerFilter.push({
                id: item.id,
                value: `${item.first_name} ${item.last_name}`
            });
        });

        setProjectManagerFilters(managerFilter);
        fetchStatus();
    }, []);

    const prepareData = useCallback(async () => {
        setLoading(true);
        const response = await fetchProjects();
        setAllProjects(response);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (isMounted) {
            fetchFilters();
            prepareData();
        }
    }, []);

    const openSuccessModal = (): void => {
        prepareData();
    };

    useEffect(() => {
        let filteredList: Project[] = allProjects;
        if (filters.manager && filters.manager !== 'ALL') {
            filteredList = filteredList.filter((item) => item.manager_id.id === filters.manager);
        }
        if (viewFilter === 'LIST' && filters.status && filters.status !== 'ALL') {
            filteredList = filteredList.filter((item) => item.status_id.id === filters.status);
        }
        if (filters.priority && filters.priority !== 'ALL') {
            filteredList = filteredList.filter((item) => item.priority === filters.priority);
        }

        if (searchText) {
            filteredList = filteredList.filter((item) => {
                const clientName = item.client_id?.first_name + ' ' + item.client_id?.last_name;
                const managerName = item.manager_id?.first_name + ' ' + item.manager_id?.last_name;
                return (
                    CheckSentenceStartsWith(item.name, searchText) ||
                    item.name.toLocaleLowerCase().startsWith(searchText.toLocaleLowerCase()) ||
                    CheckSentenceStartsWith(clientName, searchText) ||
                    CheckSentenceStartsWith(managerName, searchText)
                );
            });
        }
        setFilteredProjects(filteredList);
    }, [allProjects, filters, searchText, viewFilter]);

    const PageTitle = (): ReactElement => {
        return (
            <Typography
                variant={isLargeLandscape ? 'h3' : 'h5'}
                color={NEUTRAL.darker}
                sx={{ marginTop: isLargeLandscape ? '' : '15px' }}>
                {t('currentProjects')}
            </Typography>
        );
    };

    const EmptyStateComponent = (): React.ReactElement => {
        return (
            <>
                <PageTitle />
                <ProjectEmptyState prepareData={prepareData} />
            </>
        );
    };

    const updateFilters = (
        field: 'manager' | 'status' | 'priority' | 'searchText',
        value: string
    ): void => {
        if (field === 'manager') {
            setFilters({ manager: value, status: filters.status });
        } else if (field === 'status') {
            setFilters({ manager: filters.manager, status: value });
        } else if (field === 'priority') {
            setFilters({ manager: filters.manager, status: filters.status, priority: value });
        } else {
            setSearchText(value);
        }
    };

    const ViewFilter = (): React.ReactElement => {
        return (
            <Stack direction={'row'} alignItems={'baseline'}>
                <Typography variant={'subtitle2'} color={NEUTRAL.medium}>
                    {t('viewFilterLabel')}
                </Typography>
                <Filter
                    selected={viewFilter}
                    onChange={(value: 'LIST' | 'KANBAN'): void => setViewFilter(value)}>
                    <MenuItem value={'LIST'}>{t('listDropdownLabel')}</MenuItem>
                    <MenuItem value={'KANBAN'}>{t('kanbanDropdownLabel')}</MenuItem>
                </Filter>
            </Stack>
        );
    };

    const ManagerFilter = (): React.ReactElement => {
        return (
            <Stack direction={'row'} alignItems={'baseline'}>
                <Typography variant={'subtitle2'} color={NEUTRAL.medium}>
                    {t('projectManagerFilterLabel')}
                </Typography>
                <Filter
                    selected={filters.manager ?? 'ALL'}
                    onChange={(value: string): void => updateFilters('manager', value)}>
                    <MenuItem key={'ALL'} value={'ALL'}>
                        {t('filterAllLabel')}
                    </MenuItem>
                    {projectManagerFilters.map((item) => {
                        return (
                            <MenuItem key={item.id} value={item.id}>
                                {item.value}
                            </MenuItem>
                        );
                    })}
                </Filter>
            </Stack>
        );
    };

    const getStatusFromId = (statusId: string | undefined): boolean => {
        const statusSelected = statusFilters.filter((item) => {
            if (item.id === statusId) {
                return item;
            }
        });
        return statusSelected.length > 0 ? true : false;
    };

    const StatusFilter = (): React.ReactElement => {
        return (
            <Stack direction={'row'} alignItems={'baseline'}>
                <Typography variant={'subtitle2'} color={NEUTRAL.medium}>
                    {t('statusDropdownLabel')}
                </Typography>
                <Filter
                    selected={getStatusFromId(filters.status) ? filters.status : 'ALL'}
                    onChange={(value: string): void => updateFilters('status', value)}>
                    <MenuItem key={'ALL'} value={'ALL'}>
                        {t('filterAllLabel')}
                    </MenuItem>
                    {statusFilters.map((item) => {
                        return (
                            <MenuItem key={item.id} value={item.id}>
                                {item.value}
                            </MenuItem>
                        );
                    })}
                </Filter>
            </Stack>
        );
    };

    const PriorityFilter = (): React.ReactElement => {
        return (
            <Stack direction={'row'} alignItems={'baseline'}>
                <Typography variant={'subtitle2'} color={NEUTRAL.medium}>
                    {t('priorityDropdownLabel')}
                </Typography>
                <Filter
                    selected={filters.priority ?? 'ALL'}
                    onChange={(value: string): void => updateFilters('priority', value)}>
                    <MenuItem key={'ALL'} value={'ALL'}>
                        {t('filterAllLabel')}
                    </MenuItem>
                    {Priorities.map((item) => {
                        return (
                            <MenuItem key={item} value={item}>
                                {item}
                            </MenuItem>
                        );
                    })}
                </Filter>
            </Stack>
        );
    };

    const Filters = (): React.ReactElement => {
        return (
            <Stack direction={'row'} spacing={'30px'} flexWrap={'wrap'}>
                <ViewFilter />
                <ManagerFilter />
                {viewFilter === 'KANBAN' ? <></> : <StatusFilter />}
                <PriorityFilter />
            </Stack>
        );
    };

    const header = (): React.ReactElement => {
        return (
            <Stack
                direction={isLargeLandscape ? 'row' : 'column'}
                justifyContent={'space-between'}
                width={'100%'}
                spacing={'24px'}>
                <PageTitle />
                <Stack direction={'row'} spacing={'20px'}>
                    {isLargeLandscape ? (
                        <>
                            <Button
                                variant={'outlined'}
                                color={'secondary'}
                                onClick={(): void => navigate('/projects/planning')}>
                                {t('viewPlanningButtonTitle')}
                            </Button>
                            <Button
                                variant={'contained'}
                                onClick={(): void => setOpenProjectForm(true)}>
                                {t('createProjectButton')}
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant={'outlined'}
                            fullWidth
                            color={'secondary'}
                            onClick={(): void => navigate('/projects/planning')}>
                            {t('viewPlanningButtonTitle')}
                        </Button>
                    )}
                </Stack>
            </Stack>
        );
    };

    const searchAndFilter = (): React.ReactElement => {
        if (isLargeLandscape) {
            return (
                <Stack marginTop={'50px'} width={'100%'}>
                    <Stack direction={'row'} justifyContent={'space-between'}>
                        {Filters()}
                        <Searchbar
                            searchText={searchText}
                            onChange={(searchTerm): void => setSearchText(searchTerm)}
                        />
                    </Stack>
                    <Divider variant={'fullWidth'} />
                </Stack>
            );
        } else {
            return (
                <Stack
                    direction={'row'}
                    spacing={'12px'}
                    marginTop={'40px'}
                    alignItems={'flex-end'}>
                    <Searchbar
                        type={'outlined'}
                        width={'100%'}
                        searchText={searchText}
                        onChange={(searchTerm): void => setSearchText(searchTerm)}
                    />
                    <Button variant={'outlined'} sx={{ height: '53px', minWidth: 'unset' }}>
                        <Sliders />
                    </Button>
                </Stack>
            );
        }
    };

    const ProjectList = (): React.ReactElement => {
        return (
            <Stack marginTop={{ xs: '33px', md: 'unset' }}>
                {header()}
                {searchAndFilter()}
                {viewFilter === 'LIST' ? (
                    <CurrentProjectTable key={'list'} projects={filteredProjects} />
                ) : (
                    <ProjectKanban
                        key={kanbanKey}
                        status={statusFilters}
                        allProjects={filteredProjects}
                        updateAllProjectsOnProjectUpdate={(
                            projectId: string,
                            statusId: string
                        ): void => {
                            const newStatus = statusFilters.find(
                                (status) => status.id === statusId
                            );
                            const tempProjectList = [...allProjects];
                            const projectIndex = tempProjectList.findIndex(
                                (project) => project.id === projectId
                            );
                            if (projectIndex !== -1 && newStatus) {
                                tempProjectList[projectIndex].status_id.name = newStatus.value;
                                tempProjectList[projectIndex].status_id.id = newStatus.id;
                            }
                        }}
                    />
                )}
            </Stack>
        );
    };

    const renderProjectForm = (): React.ReactElement => {
        return (
            <CreateProjectForms
                handleCloseForm={(): void => setOpenProjectForm(false)}
                handleOpenSuccess={(): void => openSuccessModal()}
            />
        );
    };

    const RenderComponents = (): React.ReactElement => {
        if (loading) {
            return <LoadingIndicator />;
        } else if (allProjects.length === 0) {
            return <EmptyStateComponent key={'empty state'} />;
        } else {
            return (
                <>
                    {ProjectList()}
                    <ModalContainer
                        isModalOpen={openProjectForm}
                        content={renderProjectForm()}
                        onClose={(): void => setOpenProjectForm(false)}
                    />
                </>
            );
        }
    };

    return <>{RenderComponents()}</>;
}
