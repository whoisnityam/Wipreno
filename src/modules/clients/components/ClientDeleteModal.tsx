import { t } from 'i18next';
import React from 'react';

import { DeleteModal } from '../../../components/DeleteModal';
import { User } from '../../profile/models/User';
import { getUserAccessByUserId, removeAccess } from '../../projects/services/UserAccessService';
import { Project } from '../../projects/models/Project';
import { removeClient } from '../services/ClientService';

interface ClientDeleteModalProps {
    client: User;
    enterpriseId: string;
    isOpen: boolean;
    onClose: Function;
    onSuccess: Function;
    setDeletedClient: Function;
    projects?: Project[];
}

export function ClientDeleteModal({
    client,
    enterpriseId,
    isOpen,
    onClose,
    onSuccess,
    setDeletedClient,
    projects
}: ClientDeleteModalProps): React.ReactElement {
    const onDelete = async (): Promise<void> => {
        const res = await getUserAccessByUserId(client.id);
        if (res) {
            for (const ele of res) {
                await removeAccess(ele.id);
            }
        }
        removeClient(client.id, enterpriseId).then((deleted) => {
            setDeletedClient(deleted);
            onSuccess();
        });
    };
    return (
        <DeleteModal
            isOpen={isOpen}
            title={
                projects?.length! > 0 ? t('assignedInProjectSureToDelete') : t('clientDeleteTitle')
            }
            subtitle={t('clientDeleteSubtitle')}
            onDelete={(): Promise<void> => onDelete()}
            onClose={(): void => onClose()}
        />
    );
}
