import { Avatar, AvatarGroup, Typography } from '@mui/material';
import React from 'react';
import { NEUTRAL } from '../../../../theme/palette';
import { small2 } from '../../../../theme/typography';
import { stringAvatar } from '../../../../utils';
import { Participants } from '../../models/DiscussionGroup';

interface GroupDiscussionProps {
    max?: number;
    participants: Participants[];
}

export const GroupDiscussionAvatar = ({
    max = 2,
    participants
}: GroupDiscussionProps): React.ReactElement => {
    return (
        <AvatarGroup
            spacing={'small'}
            componentsProps={{
                additionalAvatar: {
                    sx: {
                        ...small2,
                        color: NEUTRAL.darker
                    }
                }
            }}
            max={max}>
            {participants.map((participant) => {
                const fullName = participant.name.split(' ');
                return (
                    <Avatar
                        key={participant.name}
                        sx={{
                            width: '38px',
                            height: '38px',
                            background: participant.avatarBackground,
                            color: participant.avatarColor
                        }}>
                        <Typography sx={{ ...small2 }}>
                            {stringAvatar(fullName[0], fullName[1])}
                        </Typography>
                    </Avatar>
                );
            })}
        </AvatarGroup>
    );
};
