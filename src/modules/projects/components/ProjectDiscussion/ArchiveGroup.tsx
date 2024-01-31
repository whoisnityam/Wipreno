import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from '../../../../components/alerts/Alert';
import { SuccessAlert } from '../../../../components/alerts/SuccessAlert';
import { DiscussionGroup } from '../../models/DiscussionGroup';
import { deleteDiscussionGroup } from '../../services/DiscussionService';

interface ArchiveGroupProps {
    selectedGroup: DiscussionGroup | undefined;
    reload: Function;
    openModal: boolean;
    onClose: Function;
}

export function ArchiveGroup({
    selectedGroup,
    openModal,
    reload = (): void => {},
    onClose = (): void => {}
}: ArchiveGroupProps): React.ReactElement {
    const { t } = useTranslation();
    const [openDeleteAlert, setOpenDeleteAlert] = useState<boolean>(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);

    useEffect(() => {
        setOpenDeleteAlert(openModal);
    }, [openModal]);

    const openSuccessModal = (): void => {
        setSuccessModalOpen(true);
        setTimeout(async () => {
            setSuccessModalOpen(false);
            reload();
        }, 3000);
    };

    return (
        <>
            <Alert
                width="440px"
                title={selectedGroup?.is_deleted ? t('unarchiveGroupTitle') : t('closeGroupTitle')}
                subtitle={
                    selectedGroup?.is_deleted
                        ? t('unarchiveGroupDescription')
                        : t('closeGroupDescription')
                }
                open={openDeleteAlert}
                onClick={async (): Promise<void> => {
                    await deleteDiscussionGroup(selectedGroup!);
                    setOpenDeleteAlert(false);
                    openSuccessModal();
                }}
                onSecondaryButtonClick={(): void => {
                    setOpenDeleteAlert(false);
                    onClose();
                }}
                primaryButton={
                    selectedGroup?.is_deleted ? t('unarchiveGroupButton') : t('closeGroup')
                }
                primaryButtonType={selectedGroup?.is_deleted ? 'primary' : 'error'}
                secondaryButton={t('cancelButtonTitle')}
                secondaryButtonType={'text'}
            />
            <SuccessAlert
                onClose={(): void => {
                    onClose();
                }}
                open={successModalOpen}
                title={t('yourRequestHasBeenTaken')}
                subtitle={t('discussionSuccessDescription')}
            />
        </>
    );
}
