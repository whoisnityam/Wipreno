import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
    Box,
    Button,
    MenuItem,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import { ACCENT_SUNSET, NEUTRAL } from '../../../../theme/palette';
import { useTranslation } from 'react-i18next';
import { object } from 'yup';
import { useFormik } from 'formik';
import * as yup from 'yup';
import 'yup-phone';
import { SystemStyleObject, Theme } from '@mui/system';
import { button2, small1 } from '../../../../theme/typography';
import { TypeOfGuest } from '../../../../constants';
import { GetUserByEmail } from '../../../../services/DirectusService';
import { Info } from 'react-feather';
import { WRSwitch } from '../../../../components/switch/WRSwitch';
import { Searchbar } from '../../../../components/textfield/Searchbar';
import { UserContext } from '../../../../provider/UserProvider';
import { User } from '../../../profile/models/User';
import { getClients } from '../../../clients/services/ClientService';
import { getArtisans } from '../../../artisans/services/artisanService';
import { LoadingIndicator } from '../../../../components/LoadingIndicator';
import { CheckSentenceStartsWith } from '../../../../utils';
import { WRTable } from '../../../../components/WRTable';
import { ProjectAccess } from '../../models/ProjectAccess';
import { getUserAccessByProjectId } from '../../services/UserAccessService';
import { useParams } from 'react-router-dom';
import { WRSelect } from '../../../../components/select/WRSelect';
import { UserAccessFormContainer } from './UserAccessFormContainer';

interface FormStepOneProps {
    initialValues: {
        typeOfGuest: string;
        lastName: string;
        firstName: string;
        email: string;
        planning: boolean;
        reports: boolean;
        discussion: boolean;
        documents: boolean;
        selectedUser: string;
    };
    onSubmit: Function;
    closeForm: Function;
    nextStep: Function;
    currentStep: number;
    previousStep: Function;
    createExistingUser: boolean;
}

export function CreateNewUserFormFields({
    initialValues,
    onSubmit,
    closeForm,
    currentStep,
    nextStep,
    previousStep,
    createExistingUser
}: FormStepOneProps): React.ReactElement {
    const user = useContext(UserContext);
    const { t } = useTranslation();
    const { id } = useParams();
    const theme = useTheme();
    const [validClient, setValidClient] = useState<boolean>(true);
    const [searchText, setSearchText] = useState('');
    const currentTab = 0;
    const [selectedTab, setSelectedTab] = useState(currentTab);
    const [loading, setLoading] = useState<boolean>(false);
    const [clients, setClients] = useState<User[]>([]);
    const [allArtisans, setAllArtisans] = useState<User[]>([]);
    const [filteredArtisans, setFilteredArtisans] = useState<User[]>([]);
    const [filteredClients, setFilteredClients] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>();
    const [allAccessUsers, setAllAccessUsers] = useState<ProjectAccess[]>([]);
    const [allNotFullAccess, setAllNotFullAccess] = useState<ProjectAccess[]>([]);

    const fetchClients = async (): Promise<User[]> => {
        if (user.user) {
            return getClients(user.user!.enterprises.at(0)!.enterprise_id.id);
        } else {
            return [];
        }
    };
    const fetchArtisans = async (): Promise<User[]> => {
        if (user.user) {
            const data = await getArtisans(user.user!.enterprises.at(0)!.enterprise_id.id);
            return data;
        } else {
            return [];
        }
    };
    const fetchUserProjectAccess = async (): Promise<ProjectAccess[]> => {
        if (user.user) {
            const data = await getUserAccessByProjectId(
                id!,
                user.user!.enterprises.at(0)!.enterprise_id.id
            );
            return data;
        } else {
            return [];
        }
    };
    const prepareData = useCallback(async () => {
        setLoading(true);
        const responseClients = await fetchClients();
        const response = await fetchArtisans();
        const responseAccess = await fetchUserProjectAccess();
        if (responseClients) {
            const List: User[] = [];
            for (const element of responseClients) {
                if (element.id !== null) {
                    const item = element;
                    List.push(item);
                }
                setClients(List);
                setFilteredClients(List);
            }
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
        if (responseAccess) {
            const List: ProjectAccess[] = [];
            for (const element of responseAccess) {
                if (element.id !== null && element.full_access) {
                    const item = element;
                    List.push(item);
                }
                setAllAccessUsers(List);
            }
            const NewList: ProjectAccess[] = [];
            for (const element of responseAccess) {
                if (element.id !== null && !element.full_access) {
                    const item = element;
                    NewList.push(item);
                }
                setAllNotFullAccess(NewList);
            }
        }
        setLoading(false);
    }, [searchText]);

    useEffect(() => {
        prepareData();
        return (): void => {
            setLoading(false);
        };
    }, []);

    useEffect(() => {
        if (selectedTab === 0) {
            if (searchText.trim() !== '') {
                const filteredDatas = clients;
                const filteredSearchData = filteredDatas.filter((element) => {
                    const name = element.first_name + ' ' + element.last_name;
                    if (CheckSentenceStartsWith(name, searchText)) {
                        return element;
                    }
                    return null;
                });
                setFilteredClients(filteredSearchData);
            } else {
                setFilteredClients(clients);
            }
        } else if (selectedTab === 1) {
            if (searchText.trim() !== '') {
                const filteredDatas = allArtisans;
                const filteredSearchData = filteredDatas.filter((element) => {
                    const name = element.first_name + ' ' + element.last_name;
                    if (CheckSentenceStartsWith(name, searchText)) {
                        return element;
                    }
                    return null;
                });
                setFilteredArtisans(filteredSearchData);
            } else {
                setFilteredArtisans(allArtisans);
            }
        }
    }, [searchText]);

    const userType = (): string => {
        if (selectedTab === 0) {
            return 'Client';
        } else {
            return 'Artisan';
        }
    };

    const validationSchema = object({
        firstName: yup.string(),
        lastName: yup.string(),
        email: yup.string().email(t('invalidEmailErrorMessage'))
    });

    const form = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values) => {
            onSubmit(values);
        }
    });

    const { values, errors, handleChange, setFieldValue, isValid } = form;

    useEffect(() => {
        setValidClient(true);
    }, [values.email]);

    const handlePrimaryButtonClick = async (): Promise<void> => {
        if (currentStep === 0 && !createExistingUser) {
            const response = await GetUserByEmail(values.email);
            if (response) {
                setValidClient(false);
            } else {
                setValidClient(true);
                onSubmit(values);
                nextStep();
            }
        } else if (currentStep === 0 && createExistingUser) {
            setValidClient(true);
            values.typeOfGuest = userType();
            values.selectedUser = selectedUser!;
            onSubmit(values);
            nextStep();
        } else if (currentStep === 1) {
            onSubmit(values);
        }
    };

    const handleSecondaryButtonClick = (): void => {
        if (currentStep === 0) {
            closeForm();
        } else if (currentStep === 1) {
            previousStep();
        }
    };

    const tabs = (): React.ReactElement[] => {
        const list = [
            <Tab key={1} label={t('clientTableHeader')} />,
            <Tab key={2} label={t('artisanTableHeader')} />
        ];
        return list;
    };

    const Nav = (): React.ReactElement => {
        if (createExistingUser) {
            return (
                <Box
                    sx={{
                        borderBottom: 1,
                        borderColor: NEUTRAL.light,
                        marginBottom: '16px'
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
            );
        } else {
            return <></>;
        }
    };
    const TableComponent = (): React.ReactElement => {
        const tableHeaders = [t('lastName'), t('firstName'), ''];
        if (selectedTab === 0) {
            const newFilteredClients = filteredClients.filter((client) => {
                return !allAccessUsers.some((a) => a.user_id.id === client.id);
            });
            const finalFiltredData = newFilteredClients.filter((newClient) => {
                return !allNotFullAccess.some((a) => a.user_id.id === newClient.id);
            });
            const tableBody = finalFiltredData?.map((client, index) => {
                return [
                    client.last_name,
                    client.first_name,
                    <Button
                        key={index}
                        sx={{ ...button2 }}
                        variant={'outlined'}
                        color={selectedUser?.includes(client.id) ? 'error' : 'secondary'}
                        fullWidth
                        onClick={(): void => {
                            if (selectedUser && selectedUser === client.id) {
                                setSelectedUser(undefined);
                            } else {
                                setSelectedUser(client.id);
                            }
                        }}>
                        {selectedUser?.includes(client.id) ? t('cancelButtonTitle') : t('select')}
                    </Button>
                ];
            });
            return (
                <WRTable
                    headers={tableHeaders}
                    body={tableBody}
                    maxHeight={'213px'}
                    removeScroll={true}
                />
            );
        } else {
            const newFilteredArtisans = filteredArtisans.filter((artisan) => {
                return !allAccessUsers.some((a) => a.user_id.id === artisan.id);
            });
            const finalFiltredData = newFilteredArtisans.filter((newArtisan) => {
                return !allNotFullAccess.some((a) => a.user_id.id === newArtisan.id);
            });
            const tableBody = finalFiltredData?.map((artisan, index) => {
                return [
                    artisan.last_name,
                    artisan.first_name,
                    <Button
                        key={index}
                        sx={{ ...button2 }}
                        variant={'outlined'}
                        color={selectedUser?.includes(artisan.id) ? 'error' : 'secondary'}
                        fullWidth
                        onClick={(): void => {
                            if (selectedUser && selectedUser === artisan.id) {
                                setSelectedUser(undefined);
                            } else {
                                setSelectedUser(artisan.id);
                            }
                        }}>
                        {selectedUser?.includes(artisan.id) ? t('cancelButtonTitle') : t('select')}
                    </Button>
                ];
            });
            return (
                <WRTable
                    headers={tableHeaders}
                    body={tableBody}
                    maxHeight={'213px'}
                    removeScroll={true}
                />
            );
        }
    };
    const RenderTableComponents = (): React.ReactElement => {
        if (loading) {
            return <LoadingIndicator />;
        } else {
            return <>{TableComponent()}</>;
        }
    };

    const handlePrimaryButtonDisable = (): boolean => {
        if (currentStep === 0 && !createExistingUser) {
            return (
                !Boolean(values.typeOfGuest) ||
                !Boolean(values.lastName) ||
                !Boolean(values.firstName) ||
                !Boolean(values.email) ||
                !validClient ||
                !isValid
            );
        } else if (currentStep === 0 && createExistingUser) {
            return !Boolean(selectedUser);
        } else if (currentStep === 1) {
            return false;
        } else {
            return true;
        }
    };

    useEffect(() => {
        if (initialValues.selectedUser) {
            setSelectedUser(initialValues.selectedUser);
        }
    }, []);

    const premissionToggle = (value: boolean, lable: string, field: string): React.ReactElement => {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                <WRSwitch
                    value={value}
                    color={value ? theme.palette.success.main : theme.palette.grey[100]}
                    handleToggle={(): void => {
                        setFieldValue(field, !value);
                    }}
                />
                <Typography variant="body2" color={NEUTRAL.medium} fontWeight={'400'}>
                    {lable}
                </Typography>
            </Box>
        );
    };

    return (
        <UserAccessFormContainer
            currentStep={currentStep}
            primaryButtonDisabled={handlePrimaryButtonDisable()}
            primaryButtonOnClick={handlePrimaryButtonClick}
            secondaryButtonVisible={true}
            secondaryButtonOnClick={handleSecondaryButtonClick}>
            <>
                <Box sx={{ display: currentStep === 0 ? 'block' : 'none' }}>
                    <Typography variant="h4" sx={{ color: NEUTRAL.darker, textAlign: 'center' }}>
                        {createExistingUser
                            ? `${t('inviteExistingUserTitle')} (1/2)`
                            : `${t('inviteAUser')} (1/2)`}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: theme.palette.grey[200],
                            textAlign: 'center',
                            marginTop: '16px',
                            padding: '0 12px'
                        }}>
                        {createExistingUser
                            ? t('inviteExistingUserSubtitle')
                            : t('inviteAUserSubtitle')}
                    </Typography>
                    <Typography
                        color={theme.palette.secondary.main}
                        sx={(): SystemStyleObject<Theme> => ({
                            ...button2,
                            fontWeight: 'bold',
                            marginTop: '32px',
                            marginBottom: '16px',
                            display: createExistingUser ? 'none' : ''
                        })}>
                        {t('requiredFields')}
                    </Typography>
                    <WRSelect
                        sx={{
                            marginTop: '12px',
                            display: createExistingUser ? 'none' : '',
                            width: '100%'
                        }}
                        name={'typeOfGuest'}
                        label={t('typeOfGuest')}
                        value={values.typeOfGuest}
                        onChange={handleChange}>
                        {TypeOfGuest.map((item, index) => (
                            <MenuItem key={index} value={item}>
                                {item}
                            </MenuItem>
                        ))}
                    </WRSelect>
                    <Box
                        sx={{
                            justifyContent: 'space-between',
                            marginTop: '12px',
                            display: createExistingUser ? 'none' : 'flex'
                        }}>
                        <TextField
                            sx={{ width: '49%' }}
                            type="text"
                            value={values.lastName}
                            onChange={handleChange}
                            required
                            placeholder={t('lastName')}
                            label={t('lastName')}
                            id={'lastName'}
                            error={Boolean(errors.lastName)}
                            helperText={errors.lastName}
                        />
                        <TextField
                            sx={{ width: '49%' }}
                            type="text"
                            required
                            value={values.firstName}
                            onChange={handleChange}
                            placeholder={t('firstName')}
                            label={t('firstName')}
                            id={'firstName'}
                            error={Boolean(errors.firstName)}
                            helperText={errors.firstName}
                        />
                    </Box>
                    <TextField
                        fullWidth
                        id="email"
                        name="email"
                        required
                        placeholder={t('emailFieldLabel')}
                        label={t('emailFieldLabel')}
                        value={values.email}
                        onChange={handleChange}
                        error={Boolean(errors.email) || (!validClient && values.email !== '')}
                        helperText={
                            !validClient && values.email !== ''
                                ? t('userAlreadyExistsError')
                                : errors.email
                        }
                        sx={{ marginTop: '12px', display: createExistingUser ? 'none' : '' }}
                    />
                    <Box mt={4} sx={{ display: createExistingUser ? '' : 'none' }}>
                        <Nav />
                        <Searchbar
                            type={'outlined'}
                            searchText={searchText}
                            onChange={(searchTerm): void => setSearchText(searchTerm)}
                            width="360px"
                        />
                        {RenderTableComponents()}
                    </Box>
                </Box>
                <Box sx={{ display: currentStep === 1 ? 'block' : 'none' }}>
                    <Typography
                        variant="h4"
                        sx={{
                            color: NEUTRAL.darker,
                            textAlign: 'center'
                        }}>
                        {t('inviteAUser')} {'(2/2)'}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: theme.palette.grey[200],
                            textAlign: 'center',
                            marginTop: '16px'
                        }}>
                        {t('inviteAUserSubtitle')}
                    </Typography>
                    <Typography
                        variant="h6"
                        color={theme.palette.primary.main}
                        fontWeight="fontWeightBold"
                        sx={{ marginTop: '32px' }}>
                        {t('accessRights')}
                    </Typography>
                    {premissionToggle(values.planning, t('planning'), 'planning')}
                    {premissionToggle(values.reports, t('reports'), 'reports')}
                    {premissionToggle(values.discussion, t('discussion'), 'discussion')}
                    {premissionToggle(values.documents, t('documents'), 'documents')}

                    <Stack
                        mt={'26px'}
                        width={'100%'}
                        direction={'row'}
                        flexWrap={'nowrap'}
                        alignItems={'flex-start'}
                        padding={2}
                        sx={{ backgroundColor: theme.palette.info.light }}>
                        <Box mr={2}>
                            <Info style={{ color: theme.palette.info.dark }} />
                        </Box>
                        <Box>
                            <Typography
                                sx={{ ...small1 }}
                                color={theme.palette.info.dark}
                                fontWeight={'700'}>
                                {t('addUSerAccessInfoTitle')}
                            </Typography>
                            <Box sx={{ padding: '0 6px' }}>
                                <Typography variant="body2" color={theme.palette.info.dark}>
                                    {t('addUSerAccessInfoSubtitle1')}
                                </Typography>
                                <Typography variant="body2" color={theme.palette.info.dark}>
                                    {t('addUSerAccessInfoSubtitle2')}
                                </Typography>
                                <Typography variant="body2" color={theme.palette.info.dark}>
                                    {t('addUSerAccessInfoSubtitle3')}
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                </Box>
            </>
        </UserAccessFormContainer>
    );
}
