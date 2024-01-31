import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Searchbar } from '../../../components/textfield/Searchbar';
import { WRTable } from '../../../components/WRTable';
import { Notice } from '../../projects/models/Notice';
import { getAdminPredefinedNotices } from '../services/ModelesServices';
import { useNavigate } from 'react-router-dom';
import { ModeleDuplicate } from '../components/ModeleDuplicate';
import { CheckSentenceStartsWith } from '../../../utils';

export function PredefinedModeles(): React.ReactElement {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [searchText, setSearchText] = useState('');
    const [notices, setNotices] = useState<Notice[]>([]);
    const [filteredNotices, setFilteredNotices] = useState<Notice[]>([]);

    const fetchPredefinedNotices = useCallback(async () => {
        const list = await getAdminPredefinedNotices();
        setNotices(list);
    }, []);

    useEffect(() => {
        fetchPredefinedNotices();
    }, []);

    useEffect(() => {
        let list = notices;
        if (searchText) {
            list = notices.filter((notice) => CheckSentenceStartsWith(notice.title, searchText));
        }
        setFilteredNotices(list);
    }, [notices, searchText]);

    const headers = [t('modelType'), ''];
    const body = filteredNotices.map((notice, index) => {
        return [
            notice.title,
            <Stack direction={'row'} spacing={2} key={index} justifyContent={'flex-end'}>
                <Button
                    variant={'outlined'}
                    color={'secondary'}
                    fullWidth
                    sx={{ width: '147px' }}
                    onClick={(): void => navigate(`/modele/estimation/${notice.id}`)}>
                    {t('seeNoticeButtonTitle')}
                </Button>
                <ModeleDuplicate notice={notice} />
            </Stack>
        ];
    });
    return (
        <Stack>
            <Typography variant={'h3'}>{t('modelsPredefined')}</Typography>
            <Box height={'44px'} />
            <Searchbar
                type={'outlined'}
                searchText={searchText}
                onChange={(searchTerm): void => setSearchText(searchTerm)}
                width={'360px'}
            />
            <WRTable key={filteredNotices.length} headers={headers} body={body} />
        </Stack>
    );
}
