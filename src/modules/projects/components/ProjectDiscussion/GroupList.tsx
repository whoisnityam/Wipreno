import { Box, MenuItem, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NEUTRAL } from '../../../../theme/palette';
import { CheckSentenceStartsWith } from '../../../../utils';
import { User } from '../../../profile/models/User';
import { DiscussionGroup } from '../../models/DiscussionGroup';
import { Filter } from '../Filter';
import { GroupThread } from './GroupThread';

interface GroupListProps {
    onClick: Function;
    groupList: DiscussionGroup[];
    searchText?: string;
    currentUser: User;
}
export const GroupList = ({
    onClick = (): void => {},
    groupList,
    searchText,
    currentUser
}: GroupListProps): React.ReactElement => {
    const { t } = useTranslation();
    const [filter, setFilter] = useState('active');
    const [filteredList, setFilteredList] = useState<DiscussionGroup[]>([]);
    const updateFilters = (value: string): void => {
        setFilter(value);
    };

    useEffect(() => {
        const list = groupList.filter((group) => {
            if (filter === 'active') {
                if (group.is_deleted === false) {
                    return group;
                }
            } else if (filter === 'archived') {
                if (group.is_deleted === true) {
                    return group;
                }
            } else {
                return group;
            }
        });
        if (searchText) {
            if (searchText.trim() !== '') {
                const filteredDatas = list;

                const filteredSearchData = filteredDatas.filter((element) => {
                    const title = element.title.split(' ');
                    const result = title.filter((word) => {
                        if (CheckSentenceStartsWith(word, searchText)) {
                            return element;
                        }
                    });
                    if (result && result.length > 0) {
                        return result[0];
                    }
                    return null;
                });

                setFilteredList(filteredSearchData);
            }
        } else {
            setFilteredList(list);
        }
    }, [filter, groupList]);

    return (
        <Stack
            width={'100%'}
            height="380px"
            sx={{
                overflowY: 'auto'
            }}>
            <Box display={'flex'} alignItems={'center'} p={'13px 24px 0'}>
                <Typography variant={'subtitle2'} color={NEUTRAL.medium}>
                    {t('groupStatusFilter')}
                </Typography>
                <Filter
                    selected={'active'}
                    onChange={(value: string): void => updateFilters(value)}>
                    <MenuItem key={'active'} value={'active'}>
                        {t('active')}
                    </MenuItem>
                    <MenuItem key={'archived'} value={'archived'}>
                        {t('archived')}
                    </MenuItem>
                    <MenuItem key={'active, archived'} value={'active, archived'}>
                        {t('active, archived')}
                    </MenuItem>
                </Filter>
            </Box>
            {filteredList.map((group) => {
                return (
                    <Stack
                        key={group.id + filter}
                        width="100%"
                        sx={{ cursor: 'pointer' }}
                        onClick={(): void => {
                            onClick(group.id);
                        }}>
                        <GroupThread group={group} currentUser={currentUser} />
                    </Stack>
                );
            })}
        </Stack>
    );
};
