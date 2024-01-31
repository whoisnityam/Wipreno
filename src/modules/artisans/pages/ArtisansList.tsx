import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Box, Button, Typography, useTheme, MenuItem, Stack, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ArtisanTable } from '../components/ArtisanTableView';
import { UserContext } from '../../../provider/UserProvider';
import { exportArtisans, getArtisanProfession, getArtisans } from '../services/artisanService';
import { EmptyState } from '../../../components/emptyState/EmptyState';
import { NEUTRAL } from '../../../theme/palette';
import { Plus, Download } from 'react-feather';
import { Filter } from '../components/Filter';
import { ModalContainer } from '../../../components/ModalContainer';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { SaveArtisanForms } from './SaveArtisanForms';
import { ArtisanProfession } from '../models/ArtisanProfession';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { AddModal } from '../../../components/addModal';
import { Searchbar } from '../../../components/textfield/Searchbar';
import { artisanProfession } from '../../../constants';
import { SaveImportArtisans } from './SaveImportArtisans';
import { User } from '../../profile/models/User';
import { CheckSentenceStartsWith } from '../../../utils';

export interface ArtisanFilters {
    profession?: string;
}

export function ArtisansList(): React.ReactElement {
    const user = useContext(UserContext);
    const theme = useTheme();
    const isLargeLandscape = useMediaQuery('(min-width:920px)');
    const [createArtisanModalOpen, setCreateArtisanModalOpen] = useState(false);
    const [importArtisanModalOpen, setImportArtisanModalOpen] = useState(false);
    const [allArtisans, setAllArtisans] = useState<User[]>([]);
    const [allProfession, setAllProfession] = useState<ArtisanProfession[]>([]);
    const [filteredArtisans, setFilteredArtisans] = useState<User[]>([]);
    const [isEmpty, setIsEmpty] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState<boolean>(false);
    const [openAddArtisanForm, setOpenAddArtisanForm] = useState<boolean>(false);
    const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
    const [filters, setFilters] = useState<ArtisanFilters>({
        profession: undefined
    });

    const { t } = useTranslation();

    const fetchArtisans = async (): Promise<User[]> => {
        if (user.user) {
            const data = await getArtisans(user.user!.enterprises.at(0)!.enterprise_id.id);
            return data;
        } else {
            return [];
        }
    };

    const fetchProfessions = async (): Promise<ArtisanProfession[]> => {
        if (user.user) {
            const data = await getArtisanProfession(user.user!.enterprises.at(0)!.enterprise_id.id);
            return data;
        } else {
            return [];
        }
    };

    const prepareData = useCallback(async () => {
        if (isEmpty) {
            setLoading(true);
            const response = await fetchArtisans();
            const responseProfession = await fetchProfessions();
            if (response && response.length > 0) {
                setIsEmpty(false);
            }
            if (response) {
                const List: User[] = [];
                for (const element of response) {
                    if (element.id !== null) {
                        const item = element;
                        List.push(item);
                    }
                    setAllArtisans(List);
                    setFilteredArtisans(List);
                }
            }
            if (responseProfession) {
                const ProfessionList: ArtisanProfession[] = [];
                for (const element of responseProfession) {
                    if (element.user_id !== null) {
                        const item = element;
                        ProfessionList.push(item);
                    }
                    setAllProfession(ProfessionList);
                }
            }
            setLoading(false);
        } else {
            const response = await fetchArtisans();
            const responseProfession = await fetchProfessions();
            setAllProfession(responseProfession);
            setAllArtisans(response ?? []);
            setFilteredArtisans(response);
        }
    }, [filters, searchText]);

    useEffect(() => {
        prepareData();
    }, []);

    const openSuccessModal = (): void => {
        setSuccessModalOpen(true);
        setTimeout(async () => {
            setSuccessModalOpen(false);
            prepareData();
        }, 3000);
    };

    useEffect(() => {
        if (searchText.trim() !== '') {
            const filteredDatas = allArtisans;

            const filteredSearchData = filteredDatas.filter((element) => {
                const name = element.first_name + ' ' + element.last_name;
                if (
                    CheckSentenceStartsWith(element.email, searchText) ||
                    CheckSentenceStartsWith(name, searchText) ||
                    CheckSentenceStartsWith(element.phone, searchText) ||
                    CheckSentenceStartsWith(element.company_name, searchText)
                ) {
                    return element;
                }
                return null;
            });
            setFilteredArtisans(filteredSearchData);
        } else {
            setFilteredArtisans(allArtisans);
        }
    }, [searchText]);

    useEffect(() => {
        let filteredData = allArtisans;
        if (filters.profession === 'ALL') {
            setFilteredArtisans(allArtisans);
        } else if (filters.profession !== '') {
            filteredData = filteredData.filter((element) => {
                const tempUsers = allProfession.filter((item) => item.user_id.id === element.id);
                return tempUsers.find((job) => job.profession === filters.profession) !== undefined;
            });
            setFilteredArtisans(filteredData);
        }
    }, [filters]);

    const updateFilters = (field: 'profession' | 'searchText', value: string): void => {
        if (field === 'profession') {
            setFilters({ profession: value });
        } else {
            setSearchText(value);
        }
    };

    const ProfessionFilter = (): React.ReactElement => {
        return (
            <Box display={'flex'} alignItems={'center'}>
                <Typography variant={'subtitle2'} color={NEUTRAL.medium}>
                    {t('professionFilterLabel')}
                </Typography>
                <Filter
                    selected={filters.profession ?? 'ALL'}
                    onChange={(value: string): void => updateFilters('profession', value)}>
                    <MenuItem key={'ALL'} value={'ALL'}>
                        {t('filterAllLabel')}
                    </MenuItem>
                    {artisanProfession.map((item, index) => {
                        return (
                            <MenuItem key={index} value={item}>
                                {item}
                            </MenuItem>
                        );
                    })}
                </Filter>
            </Box>
        );
    };

    const PageTitle = (): ReactElement => {
        return (
            <Typography variant={'h2'} color={theme.palette.primary.main}>
                {t('craftsmen')}
            </Typography>
        );
    };

    const renderCreateArtisanForm = (): React.ReactElement => {
        return (
            <SaveArtisanForms
                handleCloseForm={(): void => setOpenAddArtisanForm(false)}
                handleOpenSuccess={(): void => openSuccessModal()}
            />
        );
    };

    const renderImportArtisan = (): React.ReactElement => {
        return (
            <SaveImportArtisans
                handleCloseForm={(): void => setImportArtisanModalOpen(false)}
                handleOpenSuccess={(): void => openSuccessModal()}
            />
        );
    };

    const EmptyStateComponent = (): React.ReactElement => {
        return (
            <EmptyState
                title={t('craftsmen')}
                subtitle={t('craftsmenEmptyStateTitle')}
                description={t('craftsmenEmptyStateSubtitle')}
                buttonTitle={t('createCraftsmenButton')}
                buttonOnClick={(): void => {
                    setCreateArtisanModalOpen(true);
                }}
            />
        );
    };

    const AddArtisanComponents = (): React.ReactElement => {
        return (
            <>
                <AddModal
                    isModalOpen={createArtisanModalOpen}
                    title={t('howToAddArtisanTitle')}
                    subtitle={t('howToAddArtisanSubtitle')}
                    createButtonText={t('createArtisan')}
                    createFunction={(): void => {
                        setCreateArtisanModalOpen(false);
                        setOpenAddArtisanForm(true);
                    }}
                    onClose={(): void => setCreateArtisanModalOpen(false)}
                    importFunction={(): void => {
                        setCreateArtisanModalOpen(false);
                        setImportArtisanModalOpen(true);
                    }}
                />
                <ModalContainer
                    isModalOpen={openAddArtisanForm && !successModalOpen}
                    content={renderCreateArtisanForm()}
                    onClose={(): void => setOpenAddArtisanForm(false)}
                />
                <ModalContainer
                    isModalOpen={importArtisanModalOpen && !successModalOpen}
                    content={renderImportArtisan()}
                    onClose={(): void => setImportArtisanModalOpen(false)}
                />
                <SuccessAlert
                    onClose={(): void => {}}
                    open={successModalOpen}
                    title={t('requestHasBeenTaken')}
                    subtitle={t('youWillBeRedirectedToArtisanCreated')}
                />
            </>
        );
    };

    const ArtisansComponentDesktop = (): React.ReactElement => {
        return (
            <>
                <>{AddArtisanComponents()}</>
                <Box marginLeft={'30px'}>
                    <Stack justifyContent={'space-between'} direction={'row'} alignItems={'center'}>
                        <PageTitle />
                        <Stack direction={'row'}>
                            <Button
                                variant={'outlined'}
                                color={'secondary'}
                                onClick={(): void => setCreateArtisanModalOpen(true)}
                                sx={{
                                    borderRadius: '4px',
                                    justifyContent: 'space-between'
                                }}
                                startIcon={<Plus />}>
                                {t('createCraftsmenButton')}
                            </Button>
                            <Box width={'20px'} />
                            <Button
                                variant={'contained'}
                                color={'inherit'}
                                onClick={async (): Promise<void> => {
                                    if (user.user) {
                                        await exportArtisans(
                                            user.user.enterprises.at(0)!.enterprise_id.id
                                        );
                                    }
                                }}
                                sx={{
                                    backgroundColor: theme.palette.secondary.lighter,
                                    color: theme.palette.primary.darker,
                                    boxShadow: 'none',
                                    ':hover': {
                                        backgroundColor: theme.palette.secondary.lighter
                                    }
                                }}>
                                {t('exportButton')}
                            </Button>
                        </Stack>
                    </Stack>
                    <Box marginTop={'33px'}>
                        <Box
                            display={'flex'}
                            justifyContent={'space-between'}
                            alignItems={'center'}>
                            {ProfessionFilter()}
                            <Searchbar
                                type={'outlined'}
                                searchText={searchText}
                                onChange={(searchTerm): void => setSearchText(searchTerm)}
                                width="265px"
                            />
                        </Box>
                    </Box>
                    <ArtisanTable artisans={filteredArtisans} profession={allProfession} />
                </Box>
            </>
        );
    };

    const ArtisansComponentMobile = (): React.ReactElement => {
        return (
            <Box sx={{ padding: '15px' }}>
                <Stack
                    width="100%"
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ marginTop: '12px' }}>
                    <Typography variant="h4" color={theme.palette.primary.main}>
                        {t('craftsmen')}
                    </Typography>
                    <Button
                        sx={{
                            padding: '0',
                            minWidth: '0',
                            height: 'fit-content'
                        }}
                        onClick={async (): Promise<void> => {
                            if (user.user) {
                                await exportArtisans(user.user.enterprises.at(0)!.enterprise_id.id);
                            }
                        }}
                        startIcon={<Download />}></Button>
                </Stack>
                <Stack width="100%" sx={{ marginTop: '24px' }}>
                    <Box>
                        <Searchbar
                            type={'outlined'}
                            searchText={searchText}
                            onChange={(searchTerm): void => setSearchText(searchTerm)}
                            width="100%"
                        />
                    </Box>
                    <Box sx={{ marginTop: '24px' }}>{ProfessionFilter()}</Box>
                </Stack>
                <ArtisanTable artisans={filteredArtisans} profession={allProfession} />
            </Box>
        );
    };

    const RenderComponents = (): React.ReactElement => {
        if (loading) {
            return <LoadingIndicator />;
        } else if (allArtisans.length === 0) {
            return (
                <>
                    <EmptyStateComponent />
                    <>{AddArtisanComponents()}</>
                </>
            );
        } else {
            return <>{isLargeLandscape ? ArtisansComponentDesktop() : ArtisansComponentMobile()}</>;
        }
    };

    return (
        <>
            <AddModal
                isModalOpen={createArtisanModalOpen}
                title={t('howToAddArtisanTitle')}
                subtitle={t('howToAddArtisanSubtitle')}
                createButtonText={t('createArtisan')}
                createFunction={(): void => {
                    setCreateArtisanModalOpen(false);
                    setOpenAddArtisanForm(true);
                }}
                onClose={(): void => setCreateArtisanModalOpen(false)}
                importFunction={(): void => setCreateArtisanModalOpen(false)}
            />
            <ModalContainer
                isModalOpen={openAddArtisanForm && !successModalOpen}
                content={renderCreateArtisanForm()}
                onClose={(): void => setOpenAddArtisanForm(false)}
            />
            <SuccessAlert
                onClose={(): void => {}}
                open={successModalOpen}
                title={t('requestHasBeenTaken')}
                subtitle={t('youWillBeRedirectedToArtisanCreated')}
            />
            {RenderComponents()}
        </>
    );
}
