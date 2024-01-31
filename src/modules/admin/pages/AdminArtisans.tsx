import { Box, Button, Divider, MenuItem, Stack, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { WRTable } from '../../../components/WRTable';
import { artisanProfession, departmentList } from '../../../constants';
import { NEUTRAL } from '../../../theme/palette';
import { PinkBox } from '../../artisans/components/ArtisanTableView';
import { User } from '../../profile/models/User';
import { Filter } from '../../projects/components/Filter';
import { ArtisanDetailsModal } from '../components/ArtisanDetailsModal';
import { getAllArtisans } from '../services/AdminArtisanService';

interface ArtisanFilters {
    invitedBy: string;
    job: string;
    department: string;
}

export const AdminArtisans = (): React.ReactElement => {
    const { t } = useTranslation();
    const mountedRef = useRef(true);
    const all = 'Tous';
    const [allArtisans, setAllArtisans] = useState<User[]>();
    const [filteredArtisans, setFilteredArtisans] = useState<User[]>();
    const [allProfessions, setAllProfessions] = useState<string[]>();
    const [enterpriseList, setEnterpriseList] = useState<string[]>();
    const [loading, setLoading] = useState<boolean>(false);
    const [filters, setFilters] = useState<ArtisanFilters>({
        job: all,
        invitedBy: all,
        department: all
    });

    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedArtisan, setSelectedArtisan] = useState<User>();

    const prepareData = async (): Promise<void> => {
        setLoading(true);
        if (mountedRef.current) {
            const artisans = await getAllArtisans();
            setAllArtisans(artisans);
            setAllProfessions(artisanProfession);
        }
    };

    useEffect(() => {
        prepareData();
        return (): void => {
            setLoading(false);
        };
    }, [mountedRef.current]);

    useEffect(() => {
        if (allArtisans !== undefined) {
            setLoading(false);
        }
    }, [allArtisans]);

    useEffect(() => {
        if (allArtisans !== undefined) {
            const tempEnterpriseList: string[] = [];
            allArtisans.map((artisan) => {
                const isEnterpriseAlreadyPresent =
                    tempEnterpriseList.find(
                        (enterprise) =>
                            enterprise ===
                            artisan.artisan_id.created_by.enterprises?.at(0)?.enterprise_id.name
                    ) !== undefined;
                if (!isEnterpriseAlreadyPresent) {
                    const enterprise =
                        artisan.artisan_id.created_by.enterprises?.at(0)?.enterprise_id.name;
                    if (enterprise) {
                        tempEnterpriseList.push(enterprise);
                    }
                }
            });
            setEnterpriseList(tempEnterpriseList);
        }
    }, [allArtisans]);

    useEffect(() => {
        if (allArtisans && allProfessions) {
            let filteredList = allArtisans;

            // Job filters
            if (filters.job !== all) {
                filteredList = filteredList.filter((user) => {
                    const res = user.artisan_profession.find(
                        (job) => job.profession === filters.job
                    );
                    return res;
                });
            }

            //Department filter
            if (filters.department !== all) {
                filteredList = filteredList.filter(
                    (user) => user.artisan_id.department === filters.department
                );
            }

            // Invited by filters
            if (filters.invitedBy !== all) {
                filteredList = filteredList.filter(
                    (user) =>
                        user.artisan_id.created_by.enterprises.at(0)!.enterprise_id.name ===
                        filters.invitedBy
                );
            }

            setFilteredArtisans(filteredList);
        }
    }, [filters, allArtisans, allProfessions]);

    const updateFilters = (field: 'invitedBy' | 'job' | 'department', value: string): void => {
        if (field === 'invitedBy') {
            setFilters({ invitedBy: value, job: filters.job, department: filters.department });
        } else if (field === 'job') {
            setFilters({
                invitedBy: filters.invitedBy,
                job: value,
                department: filters.department
            });
        } else if (field === 'department') {
            setFilters({ invitedBy: filters.invitedBy, job: filters.job, department: value });
        }
    };

    const JobFilter = (): React.ReactElement => {
        return (
            <Stack direction="row" alignItems={'baseline'}>
                <Typography variant={'subtitle2'} color={NEUTRAL.medium}>
                    {`${t('profession')}: `}
                </Typography>
                <Filter
                    selected={filters.job}
                    onChange={(value: string): void => updateFilters('job', value)}>
                    <MenuItem value={all}>{all}</MenuItem>
                    {artisanProfession.map((jobTitle) => (
                        <MenuItem key={jobTitle} value={jobTitle}>
                            {jobTitle}
                        </MenuItem>
                    ))}
                </Filter>
            </Stack>
        );
    };

    const InvitedByFilter = (): React.ReactElement => {
        if (enterpriseList) {
            return (
                <Stack direction="row" alignItems={'baseline'}>
                    <Typography variant={'subtitle2'} color={NEUTRAL.medium}>
                        {`${t('invitedBy')}: `}
                    </Typography>
                    <Filter
                        selected={filters.invitedBy}
                        onChange={(value: string): void => updateFilters('invitedBy', value)}>
                        <MenuItem value={all}>{all}</MenuItem>
                        {enterpriseList.map((enterpriseName) => (
                            <MenuItem key={enterpriseName} value={enterpriseName}>
                                {enterpriseName}
                            </MenuItem>
                        ))}
                    </Filter>
                </Stack>
            );
        } else return <React.Fragment />;
    };

    const DepartmentFilter = (): React.ReactElement => {
        return (
            <Stack direction="row" alignItems={'baseline'}>
                <Typography variant={'subtitle2'} color={NEUTRAL.medium}>
                    {`${t('Department')}: `}
                </Typography>
                <Filter
                    selected={filters.department}
                    onChange={(value: string): void => updateFilters('department', value)}>
                    <MenuItem value={all}>{all}</MenuItem>
                    {departmentList.map((list) => (
                        <MenuItem key={list} value={list}>
                            {list}
                        </MenuItem>
                    ))}
                </Filter>
            </Stack>
        );
    };

    const TitleComponent = (): React.ReactElement => {
        return (
            <Stack direction="row" alignItems="baseline">
                <Typography variant="h3">{t('craftsmen')}</Typography>
                <Box width="4px" />
                <Typography
                    color={NEUTRAL.dark}
                    variant="h5">{`(${allArtisans?.length})`}</Typography>
            </Stack>
        );
    };

    const FilterComponent = (): React.ReactElement => {
        return (
            <Stack direction="row">
                <JobFilter />
                <Box width="32px" />
                <DepartmentFilter />
                <Box width="32px" />
                <InvitedByFilter />
            </Stack>
        );
    };

    const ArtisanTableComponent = (): React.ReactElement => {
        const users = filteredArtisans !== undefined ? filteredArtisans : [];
        const headers = [
            t('enterprise'),
            t('lastNameTextFieldLabel'),
            t('profession'),
            t('invitedBy'),
            ''
        ];
        const body = users.map((user) => {
            return [
                <Typography key="enterprise" variant="body2">
                    {user.enterprises.at(0)?.enterprise_id?.name ?? ''}
                </Typography>,
                <Typography key="name" variant="body2">
                    {`${user.first_name} ${user.last_name}`}
                </Typography>,
                <Stack direction="row" key="profession">
                    {user.artisan_profession.length >= 1 &&
                        PinkBox(user.artisan_profession[0].profession)}
                    {user.artisan_profession.length >= 2 && <Box width="8px" />}
                    {user.artisan_profession.length >= 2 &&
                        PinkBox(user.artisan_profession.length - 1)}
                </Stack>,
                <Typography key="invitedBy" variant="body2">
                    {user.artisan_id.created_by.enterprises.at(0)?.enterprise_id.name ?? ''}
                </Typography>,
                <Button
                    key={user.id}
                    variant={'outlined'}
                    color={'secondary'}
                    onClick={(): void => {
                        setSelectedArtisan(user);
                        setDetailsOpen(true);
                    }}
                    sx={{ width: '147px' }}>
                    {t('seeNoticeButtonTitle')}
                </Button>
            ];
        });

        return <WRTable headers={headers} body={body} />;
    };

    const AdminArtisansComponent = (): React.ReactElement => {
        return (
            <Stack>
                <TitleComponent />
                <Box height="49.5px" />
                <FilterComponent />
                <Box height="17.5px" />
                <Divider flexItem />
                <Box height="6.5px" />
                <ArtisanTableComponent />
            </Stack>
        );
    };

    const RenderComponents = (): React.ReactElement => {
        if (loading) {
            return <LoadingIndicator />;
        } else {
            return (
                <>
                    {selectedArtisan && (
                        <ArtisanDetailsModal
                            artisan={selectedArtisan}
                            professionList={selectedArtisan.artisan_profession.map(
                                (job) => job.profession
                            )}
                            isOpen={detailsOpen}
                            onClose={(): void => {
                                setDetailsOpen(false);
                                setSelectedArtisan(undefined);
                            }}
                        />
                    )}
                    <AdminArtisansComponent />
                </>
            );
        }
    };

    return <>{RenderComponents()}</>;
};
