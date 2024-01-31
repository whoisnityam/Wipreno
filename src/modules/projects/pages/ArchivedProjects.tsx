import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Box, MenuItem, Typography, Divider, useMediaQuery, Stack } from '@mui/material';
import { NEUTRAL } from '../../../theme/palette';
import { Project } from '../models/Project';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../../provider/UserProvider';
import { getArchivedProjects } from '../services/ProjectService';
import { getProjectManagersByEnterpriseId } from '../../profile/services/ProfileService';
import { Filter } from '../components/Filter';
import { ArchivedProjectsTable } from '../components/table/ArchivedProjectsTable';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { Searchbar } from '../../../components/textfield/Searchbar';
import { EmptyState } from '../../../components/emptyState/EmptyState';
import { CheckSentenceStartsWith } from '../../../utils';

export interface ProjectFilters {
    manager?: string;
}

export function ArchivedProjects(): React.ReactElement {
    const user = useContext(UserContext);
    const isLargeLandscape = useMediaQuery('(min-width:920px)');
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [projectManagerFilters, setProjectManagerFilters] = useState<
        { id: string; value: string }[]
    >([]);
    const [filters, setFilters] = useState<ProjectFilters>({
        manager: undefined
    });
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState<boolean>(false);

    const fetchData = useCallback(() => {
        setLoading(true);
        getArchivedProjects(user.user!.enterprises.at(0)!.enterprise_id.id).then((data) => {
            setAllProjects(data);
            setLoading(false);
        });
        getProjectManagersByEnterpriseId(user.user!.enterprises.at(0)!.enterprise_id.id).then(
            (data) => {
                const managerFilter: React.SetStateAction<{ id: string; value: string }[]> = [];
                data.map((item) => {
                    managerFilter.push({
                        id: item.id,
                        value: `${item.first_name} ${item.last_name}`
                    });
                });
                setProjectManagerFilters(managerFilter);
            }
        );
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    const { t } = useTranslation();

    useEffect(() => {
        let filteredList: Project[] = allProjects;
        if (filters.manager && filters.manager !== 'ALL') {
            filteredList = filteredList.filter((item) => item.manager_id.id === filters.manager);
        }
        if (searchText) {
            filteredList = filteredList.filter((element) => {
                const clientName =
                    element.client_id?.first_name + ' ' + element.client_id?.last_name;
                const managerName =
                    element.manager_id?.first_name + ' ' + element.manager_id?.last_name;
                return (
                    CheckSentenceStartsWith(clientName, searchText) ||
                    CheckSentenceStartsWith(managerName, searchText) ||
                    CheckSentenceStartsWith(element.name, searchText) ||
                    element.name.toLocaleLowerCase().startsWith(searchText.toLocaleLowerCase())
                );
            });
        }
        setFilteredProjects(filteredList);
    }, [allProjects, searchText, filters]);

    const updateFilters = (field: 'manager' | 'searchText', value: string): void => {
        if (field === 'manager') {
            setFilters({ manager: value });
        } else {
            setSearchText(value);
        }
    };

    const ManagerFilter = (): React.ReactElement => {
        return (
            <Box display={'flex'} alignItems={'center'}>
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
            </Box>
        );
    };

    const Filters = (): React.ReactElement => {
        return (
            <Stack marginTop={'50px'} spacing={{ xs: '25px', md: '17px' }}>
                {isLargeLandscape ? (
                    <>
                        <Stack direction={'row'} justifyContent={'space-between'}>
                            <ManagerFilter />
                            <Searchbar
                                searchText={searchText}
                                onChange={(searchTerm): void => setSearchText(searchTerm)}
                            />
                        </Stack>
                        <Divider variant={'fullWidth'} />
                    </>
                ) : (
                    <>
                        <Searchbar
                            type={'outlined'}
                            searchText={searchText}
                            onChange={(searchTerm): void => setSearchText(searchTerm)}
                        />
                        <ManagerFilter />
                    </>
                )}
            </Stack>
        );
    };

    const ArchiveProjectEmptyState = (): React.ReactElement => {
        return (
            <Box height="80%" mt={isLargeLandscape ? '150px' : '80px'}>
                <EmptyState
                    title={t('')}
                    subtitle={t('projectEmptyStateTitle')}
                    description={t('noProjectArchivedYet')}
                />
            </Box>
        );
    };

    const ProjectList = (): React.ReactElement => {
        return (
            <Stack marginTop={{ xs: '33px', md: 'unset' }}>
                <Box display={'flex'} justifyContent={'space-between'}>
                    <Typography
                        variant={isLargeLandscape ? 'h3' : 'h5'}
                        color={NEUTRAL.darker}
                        sx={{ marginTop: isLargeLandscape ? '' : '15px' }}>
                        {t('archivedProjects')}
                    </Typography>
                </Box>
                {allProjects.length > 0 ? (
                    <>
                        {Filters()}
                        <ArchivedProjectsTable key={'list'} projects={filteredProjects} />
                    </>
                ) : (
                    <ArchiveProjectEmptyState />
                )}
            </Stack>
        );
    };

    const RenderComponents = (): React.ReactElement => {
        if (loading) {
            return <LoadingIndicator />;
        } else {
            return <>{ProjectList()}</>;
        }
    };

    return <>{RenderComponents()}</>;
}
