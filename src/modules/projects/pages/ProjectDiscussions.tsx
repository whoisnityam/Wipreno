import { Box, Stack, useMediaQuery, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { EmptyState } from '../../../components/emptyState/EmptyState';
import { UserContext } from '../../../provider/UserProvider';
import { User } from '../../profile/models/User';
import { ProjectDiscussionChatbox } from '../components/ProjectDiscussion/ProjectDiscussionChatbox';
import { ProjectContext } from '../layout/ProjectDetailLayout';
import { DiscussionGroup } from '../models/DiscussionGroup';
import {
    getDiscussionGroupsByProjectId,
    getUsersForDiscussion
} from '../services/DiscussionService';
import { PINK, NEUTRAL, ACCENT_SUNSET } from '../../../theme/palette';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { getUserAccessForDiscussion } from '../services/UserAccessService';
import { ProjectAccess } from '../models/ProjectAccess';

export const ProjectDiscussions = (): React.ReactElement => {
    const { t } = useTranslation();
    const theme = useTheme();
    const user = useContext(UserContext);
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));
    const { id } = useParams();
    const [groupList, setGroupList] = useState<DiscussionGroup[]>([]);
    const [ProjectAccessList, setProjectAccessList] = useState<ProjectAccess[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isAdded, setIsAdded] = useState(false);
    const [loading, setLoading] = useState(false);

    const project = useContext(ProjectContext)?.project;
    const fetchGroups = useCallback(async () => {
        let list: DiscussionGroup[] = [];
        let projectUsers: ProjectAccess[] = [];
        if (project) {
            setLoading(true);
            projectUsers = await getUserAccessForDiscussion(project.id);

            list = await getDiscussionGroupsByProjectId(project.id);
        }
        setProjectAccessList(projectUsers);

        list.map((item) => {
            item.users.map((value) => {
                if (value.user_id.id === user.user!.id) {
                    value.avatarColor = ACCENT_SUNSET.darker;
                    value.avatarBackground = ACCENT_SUNSET.lighter;
                } else {
                    switch (Math.floor(Math.random() * 3)) {
                        case 0:
                            value.avatarColor = PINK.darker;
                            value.avatarBackground = PINK.lighter;
                            break;
                        case 1:
                            value.avatarColor = theme.palette.secondary.darker;
                            value.avatarBackground = theme.palette.secondary.lighter;
                            break;
                        case 2:
                            value.avatarColor = NEUTRAL.darker;
                            value.avatarBackground = NEUTRAL.light;
                            break;
                        default:
                    }
                }
            });
        });
        setGroupList(list);
        setLoading(false);
    }, []);

    const fetchUsers = useCallback(async () => {
        if (project) {
            const list = await getUsersForDiscussion(
                project.id,
                user.user!.enterprises.at(0)!.enterprise_id.id
            );

            const filteredList = list.filter((value) => {
                switch (Math.floor(Math.random() * 3)) {
                    case 0:
                        value.avatarColor = PINK.darker;
                        value.avatarBackground = PINK.lighter;
                        break;
                    case 1:
                        value.avatarColor = theme.palette.secondary.darker;
                        value.avatarBackground = theme.palette.secondary.lighter;
                        break;
                    case 2:
                        value.avatarColor = NEUTRAL.darker;
                        value.avatarBackground = NEUTRAL.light;
                        break;
                    default:
                }

                if (value.id !== user.user!.id) {
                    return value;
                }
            });

            setUsers(filteredList);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchGroups();
    }, [isAdded]);

    const RenderComponents = (): React.ReactElement => {
        if (ProjectAccessList && ProjectAccessList.length > 0) {
            return (
                <>
                    <Stack>
                        <ProjectDiscussionChatbox
                            groupList={groupList}
                            projectId={project!.id}
                            users={users}
                            currentUser={user.user!}
                            reload={(): void => {
                                setIsAdded(!isAdded);
                            }}
                        />
                    </Stack>
                </>
            );
        } else {
            return (
                <>
                    <EmptyState
                        title={''}
                        subtitle={t('discussionEmptyStateTitle')}
                        description={t('discussionEmptyStateDescription')}
                        buttonTitle={t('manageAccess')}
                        buttonType={'contained'}
                        buttonOnClick={(): void => {
                            window.location.href = `/project/user-access/${id}`;
                        }}
                        displayButtons={isLarge}
                    />
                </>
            );
        }
    };

    return (
        <Box width={'100%'} justifyContent="space-between">
            {loading ? <LoadingIndicator /> : <RenderComponents />}
        </Box>
    );
};
