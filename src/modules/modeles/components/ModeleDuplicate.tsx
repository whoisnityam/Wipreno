import { Button } from '@mui/material';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { Notice } from '../../projects/models/Notice';
import { NoticeContext } from '../layout/ModeleDetailLayout';
import { DuplicateModal } from './DuplicateModal';

interface ModeleDuplicateProps {
    notice?: Notice;
}

export function ModeleDuplicate({ notice }: ModeleDuplicateProps): React.ReactElement {
    const { t } = useTranslation();
    const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
    const [duplicateModalOpen, setDuplicateModalOpen] = useState<boolean>(false);
    const noticeContext = useContext(NoticeContext);

    const setSuccessOpen = (): void => {
        setDuplicateModalOpen(false);
        setSuccessModalOpen(true);
        setTimeout(async () => {
            setSuccessModalOpen(false);
        }, 3000);
    };

    return (
        <React.Fragment>
            {(notice || (noticeContext && noticeContext.notice)) && (
                <DuplicateModal
                    notice={noticeContext && noticeContext?.notice ? noticeContext.notice : notice!}
                    isModalOpen={duplicateModalOpen}
                    setSuccessOpen={(): void => setSuccessOpen()}
                    onClose={(): void => setDuplicateModalOpen(false)}
                />
            )}
            <SuccessAlert
                onClose={(): void => setSuccessModalOpen(false)}
                open={successModalOpen}
                title={t('yourRequestBeenAccounted')}
                subtitle={t('youWillBeRedirectedToProjectModelPage')}
            />
            <Button
                variant={'contained'}
                color={'secondary'}
                sx={{ width: '124px' }}
                onClick={(): void => setDuplicateModalOpen(true)}>
                {t('duplicateButtonTitle')}
            </Button>
        </React.Fragment>
    );
}
