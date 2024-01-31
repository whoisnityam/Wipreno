/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Box, Button, useTheme } from '@mui/material';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import ReactToPrint from 'react-to-print';
import { User } from '../../../profile/models/User';
import { Lot } from '../../models/Lot';
import { ExportWorkEstimation } from './ExportWorkEstimation';
import { Project } from '../../models/Project';

interface ExportNoticeCustomDataProps {
    lots: Lot[];
    companyLogo: string;
    userInfo: User | null;
    clientInfo: User | undefined;
    project: Project | undefined;
    selectedChoice: string;
}

export const ExportNoticeCustomData = ({
    lots,
    companyLogo,
    userInfo,
    clientInfo,
    project,
    selectedChoice
}: ExportNoticeCustomDataProps) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const componentRef = React.useRef(null);

    const reactToPrintContent = React.useCallback(() => {
        return componentRef.current;
    }, [componentRef.current]);

    const reactToPrintTrigger = React.useCallback(() => {
        return (
            <Button
                variant="contained"
                sx={{
                    float: 'right',
                    background: `${theme.palette.primary.medium} !important`
                }}
                onClick={reactToPrintTrigger}>
                {t('exportButton')}
            </Button>
        );
    }, []);

    return (
        <div>
            <ReactToPrint
                content={reactToPrintContent}
                documentTitle="Notice travaux Wipréno"
                removeAfterPrint
                trigger={reactToPrintTrigger}
            />
            <Box p={2} ref={componentRef}>
                <ExportWorkEstimation
                    lots={lots}
                    companyLogo={companyLogo}
                    userInfo={userInfo}
                    clientInfo={clientInfo}
                    project={project}
                    selectedChoice={selectedChoice}
                />
            </Box>
        </div>
    );
};
