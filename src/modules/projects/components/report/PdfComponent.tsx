import { Box, Button, useTheme } from '@mui/material';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import ReactToPrint from 'react-to-print';
import { User } from '../../../profile/models/User';
import { LotViewDataForReport } from '../../models/Lot';
import { Report } from '../../models/Report';

import { ExportReport } from './ExportReport';
import { Project } from '../../models/Project';

interface PdfComponentProps {
    reportDetails: Report;
    lots: LotViewDataForReport[];
    companyLogo: string;
    userInfo: User | null;
    clientInfo: User | undefined;
    project: Project | undefined;
    hasCompanyHeader: boolean;
}

export const PdfComponent = ({
    reportDetails,
    lots,
    companyLogo,
    userInfo,
    clientInfo,
    project,
    hasCompanyHeader
}: PdfComponentProps): JSX.Element => {
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
                    background: `${theme.palette.primary.medium} !important`,
                    marginBottom: '10px'
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
                documentTitle="Compte rendu wipreno"
                removeAfterPrint
                trigger={reactToPrintTrigger}
            />
            <Box p={2} ref={componentRef}>
                <ExportReport
                    reportDetails={reportDetails}
                    lots={lots}
                    companyLogo={companyLogo}
                    userInfo={userInfo}
                    clientInfo={clientInfo}
                    project={project}
                    hasCompanyHeader={hasCompanyHeader}
                />
            </Box>
        </div>
    );
};
