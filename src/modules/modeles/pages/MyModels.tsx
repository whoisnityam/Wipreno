import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Searchbar } from '../../../components/textfield/Searchbar';
import { WRTable } from '../../../components/WRTable';
import { Notice } from '../../projects/models/Notice';
import {
    createAdminPredefinedNotices,
    getMyModels,
    modifyPredefinedNotice
} from '../services/ModelesServices';
import { Plus } from 'react-feather';
import { TableTextField } from '../../../components/textfield/TableTextField';
import { UserContext } from '../../../provider/UserProvider';
import { Alert } from '../../../components/alerts/Alert';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { useNavigate } from 'react-router-dom';
import { CheckSentenceStartsWith } from '../../../utils';

export function MyModels(): React.ReactElement {
    const { t } = useTranslation();
    const user = useContext(UserContext);
    const navigate = useNavigate();
    const [createNoticeModal, setCreateNoticeModal] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [notices, setNotices] = useState<Notice[]>([]);
    const [title, setTitle] = useState('');
    const [filteredNotices, setFilteredNotices] = useState<Notice[]>([]);
    const [tempNotice, setTempNotice] = useState<Notice[]>([]);
    const [isCreated, setIsCreated] = useState(false);
    const [createBlankTemplate, setCreateBlankTemplate] = useState(false);

    const fetchPredefinedNotices = useCallback(async () => {
        const list = await getMyModels(user.user!.enterprises.at(0)!.enterprise_id.id);
        setNotices(list);
    }, []);

    useEffect(() => {
        if (user) {
            fetchPredefinedNotices();
        }
    }, [isCreated]);

    useEffect(() => {
        let list = notices;
        if (searchText) {
            list = notices.filter((notice) => CheckSentenceStartsWith(notice.title, searchText));
        }
        setFilteredNotices(list.slice());
        setTempNotice(list.slice());
    }, [notices, searchText]);

    const handleClose = (): void => {
        setCreateNoticeModal(false);
        setTitle('');
    };

    function success(): React.ReactElement {
        return (
            <SuccessAlert
                onClose={(): void => {}}
                open={successModalOpen}
                title={t('yourModalIsCreated')}
                subtitle={t('yourModalSuccessDescription')}
            />
        );
    }

    function createModels(): React.ReactElement {
        return (
            <Alert
                width="440px"
                height="434px"
                title={t('createModelTitle')}
                subtitle={t('createModelDescription')}
                open={createNoticeModal}
                onClick={async (): Promise<void> => {
                    const data = {
                        id: '',
                        title: title.trim(),
                        is_predefined: true
                    };
                    try {
                        const newData = await createAdminPredefinedNotices(data);
                        setIsCreated(!isCreated);
                        setSuccessModalOpen(true);
                        setTimeout(async () => {
                            setSuccessModalOpen(false);
                            navigate(`/modele/vos-modeles/estimation/${newData.id}`);
                        }, 3000);
                    } catch (e) {
                        console.log(e);
                    }
                    handleClose();
                }}
                onClose={handleClose}
                onSecondaryButtonClick={handleClose}
                primaryButton={t('createModelButton')}
                primaryButtonEnabled={title.trim().length > 0}
                secondaryButton={t('return')}>
                <>
                    <TextField
                        sx={{ marginTop: '16px' }}
                        fullWidth
                        required={true}
                        id={'title'}
                        value={title}
                        onChange={(event): void => {
                            setTitle(event.target.value);
                        }}
                        label={t('createMyModelTitle')}
                    />
                </>
            </Alert>
        );
    }

    function createBlankTemplateModel(): React.ReactElement {
        return (
            <Alert
                width="440px"
                height="392px"
                title={t('createBlankTemplateTitle')}
                subtitle={t('createBlankTemplateSubtitle')}
                open={createBlankTemplate}
                onClick={(): void => {
                    setCreateNoticeModal(true);
                    setCreateBlankTemplate(false);
                }}
                onClose={(): void => {
                    setCreateBlankTemplate(false);
                }}
                onSecondaryButtonClick={(): void => {
                    setCreateBlankTemplate(false);
                }}
                primaryButton={t('createBlankTemplateButton')}
                secondaryButton={t('return')}
            />
        );
    }

    const ActionButton = (noticeId: string): React.ReactElement => {
        let isChanged = false;
        let changedTitle: string;
        const selectedIndex = notices.findIndex((notice) => notice.id === noticeId);
        const originalNotice = notices[selectedIndex];
        const changedNotice = filteredNotices.find((notice) => notice.id === noticeId);
        if (
            changedNotice &&
            originalNotice.title !== changedNotice.title &&
            changedNotice.title.trim() !== ''
        ) {
            isChanged = true;
            changedTitle = changedNotice.title;
        }
        if (isChanged) {
            return (
                <Button
                    key={'button'}
                    variant={'contained'}
                    color={'secondary'}
                    fullWidth
                    sx={{ width: '147px' }}
                    onClick={async (): Promise<void> => {
                        if (changedTitle.trim() && selectedIndex !== undefined) {
                            notices[selectedIndex] = await modifyPredefinedNotice(
                                noticeId,
                                changedTitle
                            );
                            setNotices([...notices]);
                            setIsCreated(!isCreated);
                            setTempNotice(filteredNotices);
                        }
                    }}>
                    {t('saveButtonTitle')}
                </Button>
            );
        } else {
            return (
                <Button
                    key={'button'}
                    disabled={isChanged}
                    variant={'outlined'}
                    color={'secondary'}
                    fullWidth
                    sx={{ width: '147px' }}
                    onClick={(): void => {
                        navigate(`/modele/vos-modeles/estimation/${noticeId}`);
                    }}>
                    {t('seeNoticeButtonTitle')}
                </Button>
            );
        }
    };

    const headers = [t('modelType'), ''];
    const body = filteredNotices.map((notice, index) => {
        return [
            <TableTextField
                key={tempNotice[index].title}
                requiredValue={notice.title}
                onChange={(event): void => {
                    const newValue = { ...filteredNotices[index] };
                    newValue.title = event.target.value;
                    filteredNotices[index] = newValue;
                    setFilteredNotices([...filteredNotices]);
                }}
            />,
            <Stack key="actionButton" direction={'row'} justifyContent={'flex-end'}>
                {ActionButton(notice.id)}
            </Stack>
        ];
    });

    return (
        <>
            <Stack>
                <Stack direction={'row'} justifyContent={'space-between'}>
                    <Typography variant={'h3'}>{t('yourModels')}</Typography>
                    <Button
                        variant={'outlined'}
                        startIcon={<Plus />}
                        onClick={(): void => setCreateBlankTemplate(true)}>
                        {t('createModelButtonTitle')}
                    </Button>
                </Stack>
                <Box height={'44px'} />
                <Searchbar
                    type={'outlined'}
                    searchText={searchText}
                    onChange={(searchTerm): void => setSearchText(searchTerm)}
                    width={'360px'}
                />
                <WRTable key={filteredNotices.length} headers={headers} body={body} />
            </Stack>
            {success()}
            {createModels()}
            {createBlankTemplateModel()}
        </>
    );
}
