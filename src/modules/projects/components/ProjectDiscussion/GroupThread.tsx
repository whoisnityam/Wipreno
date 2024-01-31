import { Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import React from 'react';
import { ACCENT_SUNSET, NEUTRAL } from '../../../../theme/palette';
import { body3, small1, small2 } from '../../../../theme/typography';
import { getDiscussionsDate } from '../../../../utils';
import { User } from '../../../profile/models/User';
import { DiscussionGroup } from '../../models/DiscussionGroup';
import { GroupDiscussionAvatar } from './GroupDiscussionAvatar';

interface GroupProps {
    group: DiscussionGroup;
    currentUser: User;
}

export const GroupThread = ({ group, currentUser }: GroupProps): React.ReactElement => {
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));
    const lastElementIndex = group.discussions.length - 1;
    const participants = group.users.map((user) => {
        return {
            name: user.user_id?.first_name + ' ' + user.user_id?.last_name,
            avatarBackground: ACCENT_SUNSET.lighter,
            avatarColor: ACCENT_SUNSET.darker
        };
    });
    return (
        <Stack
            sx={{
                minHeight: '67px',
                height: '67px ',
                width: '100%',
                borderBottom: `1px solid ${theme.palette.grey[100]}`
            }}
            direction={'row'}
            justifyContent="space-between">
            <Stack direction="row" width="max-width">
                <div style={{ margin: 'auto 23px' }}>
                    <GroupDiscussionAvatar participants={participants} />
                </div>
                <Stack sx={{ margin: 'auto 0' }}>
                    <Typography
                        sx={{
                            ...small1,
                            color: NEUTRAL.dark,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'inline-block',
                            width: isLarge ? '10vw' : '46vw'
                        }}>
                        {group.title}
                    </Typography>
                    <Typography
                        sx={{
                            ...body3,
                            color: NEUTRAL.medium,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'inline-block',
                            width: isLarge ? '10vw' : '46vw'
                        }}>
                        {group.discussions[lastElementIndex] ? currentUser.first_name + ' : ' : ''}
                        {group.discussions[lastElementIndex]
                            ? group.discussions[lastElementIndex]?.message === ''
                                ? '[Attachment]'
                                : group.discussions[lastElementIndex]?.message
                            : ''}
                    </Typography>
                </Stack>
            </Stack>
            <Stack sx={{ margin: '13px 20px 0 0' }}>
                <Typography sx={{ ...small2, color: NEUTRAL.light, whiteSpace: 'nowrap' }}>
                    {group.discussions[lastElementIndex]
                        ? getDiscussionsDate(group.discussions[lastElementIndex]?.created_at)
                        : ''}
                </Typography>
            </Stack>
        </Stack>
    );
};
