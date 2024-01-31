import { Button, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { WRTable } from '../../../components/WRTable';
import { Notice } from '../../projects/models/Notice';
import { TotalLots } from './TotalLots';
import { TotalTasks } from './Totaltasks';

interface NoticePredefinedTableProps {
    notice: Notice[];
}

export const NoticePredefinedTable = ({
    notice
}: NoticePredefinedTableProps): React.ReactElement => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const headers = [t('nameOfNotice'), t('numberOfLots'), t('numberOfTasks'), ''];
    const body = notice.map((data) => {
        return [
            <Typography key="title" variant="body2">
                {data.title}
            </Typography>,
            <TotalLots key="total_lots" notice={data} />,
            <TotalTasks key="total_lots" notice={data} />,

            <Button
                key={data.id}
                variant={'outlined'}
                color={'secondary'}
                onClick={(): void => navigate(`/predefined-notice/estimation/${data.id}`)}
                sx={{ borderRadius: '4px', width: '60%' }}>
                {t('seeNoticeButtonTitle')}
            </Button>
        ];
    });

    return <WRTable headers={headers} body={body} maxHeight={'calc(100vh - 250px)'} />;
};
