import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from '../../../../components/alerts/Alert';
import { useTranslation } from 'react-i18next';
import {
    Select,
    MenuItem,
    TextField,
    Typography,
    useTheme,
    InputLabel,
    FormControl
} from '@mui/material';
import { small2 } from '../../../../theme/typography';
import { Notice } from '../../models/Notice';
import {
    createNoticeLotsTasks,
    getPredefinedNotices,
    modifyNotice
} from '../../services/NoticeService';
import { UserContext } from '../../../../provider/UserProvider';
import { useParams } from 'react-router-dom';
import { ProjectContext } from '../../layout/ProjectDetailLayout';
import { getLotsByNoticeId } from '../../../modeles/services/ModelesServices';

export const CreateNotice: React.FC<{ projectId: string; onClose: () => void }> = (props) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const { id } = useParams();
    const user = useContext(UserContext);
    const projectContext = useContext(ProjectContext);
    const projectData = projectContext?.project;
    const [createNoticeModal, setCreateNoticeModal] = useState(true);
    const [values, setValues] = useState({
        type: '',
        title: ''
    });
    const [noticeMenu, setNoticeMenu] = useState<Notice[]>([]);
    const mountedRef = useRef(true);

    const fetchPredefinedNotices = useCallback(async () => {
        if (user) {
            const notices = await getPredefinedNotices(
                user.user!.enterprises.at(0)!.enterprise_id.id
            );
            if (!mountedRef.current) return null;
            setNoticeMenu(notices);
        }
    }, []);

    useEffect(() => {
        fetchPredefinedNotices();
        return (): void => {
            mountedRef.current = false;
        };
    }, []);

    const handleChange = (value: string, field: 'type' | 'title'): void => {
        setValues({ ...values, [field]: value });
    };

    const handleCloseModal = (): void => {
        setCreateNoticeModal(false);
        props.onClose();
    };

    return (
        <>
            <Alert
                width="440px"
                height="496px"
                title={t('createNoticeModalTitle')}
                subtitle={t('createNoticeModalSubtitle')}
                open={createNoticeModal}
                onClick={async (): Promise<void> => {
                    await getLotsByNoticeId(values.type).then(async (lotsData) => {
                        if (projectData) {
                            const res = await createNoticeLotsTasks(
                                values.title,
                                lotsData,
                                projectData
                            );
                            await modifyNotice(res.id, id!);
                            await projectContext?.refreshData();
                        }
                    });
                    handleCloseModal();
                }}
                onClose={handleCloseModal}
                onSecondaryButtonClick={(): void => {
                    handleCloseModal();
                }}
                primaryButton={t('createNoticeModalButtonTitle')}
                primaryButtonEnabled={Boolean(values.type.trim() && values.title.trim())}
                secondaryButton={t('return')}>
                <>
                    <Typography
                        sx={{
                            ...small2,
                            color: theme.palette.secondary.medium,
                            paddingBottom: '16px'
                        }}>
                        {t('requiredFields')}
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel id="notice-type-label">{t('noticeTypeLabel')}</InputLabel>
                        <Select
                            fullWidth
                            labelId={'notice-type-label'}
                            id={'notice-type'}
                            value={values.type}
                            required={true}
                            style={{ wordBreak: 'break-all' }}
                            label={t('noticeTypeLabel')}
                            onChange={(event): void => handleChange(event.target.value, 'type')}>
                            {noticeMenu.map((item) => (
                                <MenuItem
                                    key={item.id}
                                    value={item.id}
                                    style={{ whiteSpace: 'normal' }}>
                                    {item.title}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        sx={{ marginTop: '16px' }}
                        fullWidth
                        required={true}
                        id={'title'}
                        value={values.title}
                        onChange={(event): void => handleChange(event.target.value, 'title')}
                        label={t('noticeNameLabel')}
                    />
                </>
            </Alert>
        </>
    );
};
