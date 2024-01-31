import { Box, Button, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Plus } from 'react-feather';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createLot } from '../../services/LotService';
import { small2 } from '../../../../theme/typography';
import { Alert } from '../../../../components/alerts/Alert';
import { DuplicateModal } from '../../../modeles/components/DuplicateModal';
import { ProjectContext } from '../../layout/ProjectDetailLayout';
import { Lot } from '../../models/Lot';
import { SuccessAlert } from '../../../../components/alerts/SuccessAlert';

export function EstimationTabHeading({
    lots,
    onLotCreated
}: {
    lots: Lot[];
    onLotCreated: (lots: Lot) => void;
}): React.ReactElement {
    const theme = useTheme();
    const isLarge = useMediaQuery('(min-width:920px)');
    const projectContext = useContext(ProjectContext);
    const project = projectContext!.project;
    const [lotModalOpen, setLotModalOpen] = useState(false);
    const [title, setTitle] = React.useState('');
    const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
    const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
    const { t } = useTranslation();

    const setSuccessOpen = (): void => {
        setDuplicateModalOpen(false);
        setSuccessModalOpen(true);
        setTimeout(async () => {
            setSuccessModalOpen(false);
        }, 3000);
    };

    const alerts = (): React.ReactElement => {
        return (
            <>
                <Alert
                    width="440px"
                    height="484px"
                    title={t('addLot')}
                    subtitle={t('addLotDescription')}
                    open={lotModalOpen}
                    onClick={async (): Promise<void> => {
                        const lot = await createLot(
                            title,
                            lots.length,
                            project!.id,
                            project!.notices!.at(0)!.id
                        );
                        setLotModalOpen(false);
                        setTitle('');
                        onLotCreated(lot);
                    }}
                    onClose={(): void => {
                        setLotModalOpen(false);
                        setTitle('');
                    }}
                    primaryButton={t('add')}
                    primaryButtonType="primary"
                    secondaryButton={t('return')}>
                    <>
                        <Typography
                            sx={{
                                ...small2,
                                color: theme.palette.secondary.medium
                            }}>
                            {t('requiredFields')}
                        </Typography>
                        <TextField
                            sx={{ marginTop: '16px' }}
                            fullWidth
                            required={true}
                            id={'title'}
                            value={title}
                            onChange={(event): void => setTitle(event.target.value)}
                            label={t('lotNameLabel')}
                        />
                    </>
                </Alert>
                {project!.notices && project!.notices.length > 0 && (
                    <DuplicateModal
                        isProjectNotice
                        notice={project!.notices!.at(0)!}
                        isModalOpen={duplicateModalOpen}
                        onClose={(): void => setDuplicateModalOpen(false)}
                        setSuccessOpen={(): void => setSuccessOpen()}
                    />
                )}
                <SuccessAlert
                    onClose={(): void => setSuccessModalOpen(false)}
                    open={successModalOpen}
                    title={t('yourRequestBeenAccounted')}
                />
            </>
        );
    };

    return (
        <Stack direction="row" justifyContent={'space-between'} sx={{ marginBottom: '16px' }}>
            <Stack direction="row" alignItems={'center'} flexWrap={'wrap'}>
                <Typography variant="h5">{project!.notices!.at(0)!.title} </Typography>
                <Typography sx={{ fontSize: '14px !important' }} variant="body1">
                    ({lots!.length})
                </Typography>
            </Stack>
            {isLarge ? (
                <Stack direction="row">
                    <Button
                        variant={'outlined'}
                        color={'secondary'}
                        onClick={(): void => {
                            setLotModalOpen(true);
                        }}
                        sx={{ width: '186px', marginRight: '20px' }}>
                        <Plus /> <Box sx={{ width: '10px' }}></Box>
                        {t('addLot')}
                    </Button>
                    <Button
                        onClick={(): void => {
                            setDuplicateModalOpen(true);
                        }}
                        variant={'contained'}
                        color={'primary'}
                        sx={{ width: '255px' }}>
                        {t('saveToTemplate')}
                    </Button>
                    {alerts()}
                </Stack>
            ) : (
                <></>
            )}
        </Stack>
    );
}
