import React, { useContext, useState } from 'react';
import { Box, FormControlLabel, Radio, RadioGroup, Typography, useTheme } from '@mui/material';
import { NEUTRAL } from '../../../../theme/palette';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';

import { ExportFormContainer } from './ExportFormContainer';
import { SelectedOption } from '../../models/ExportSelectOption';
import { downloadCSV } from '../../services/ExportService';
import { ProjectContext } from '../../layout/ProjectDetailLayout';

interface ExportWorkNoticeFormProps {
    initialValues: {
        selectedOption: string;
    };
    onSubmit: Function;
    closeForm: Function;
}

export function ExportWorkNoticeForm({
    initialValues,
    onSubmit,
    closeForm
}: ExportWorkNoticeFormProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();
    const projectContext = useContext(ProjectContext);
    const [selectedChoice, setSelectedChoice] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setSelectedChoice((event.target as HTMLInputElement).value);
    };

    const form = useFormik({
        initialValues,
        onSubmit: (values) => {
            values.selectedOption = selectedChoice;
            onSubmit(values);
        }
    });

    const { submitForm } = form;

    const generateCsv = async (selected: string): Promise<void> => {
        switch (selected) {
            case SelectedOption.withPriceDisplayedByLots:
                setLoading(true);
                downloadCSV(projectContext.project!.notices!.at(0)!.id, true, 'lots')
                    .then((res) => {
                        if (res) {
                            setLoading(false);
                        } else {
                            setLoading(true);
                        }
                    })
                    .catch(() => {
                        setLoading(true);
                    });
                break;
            case SelectedOption.withPriceDisplayedByTask:
                setLoading(true);
                await downloadCSV(projectContext.project!.notices!.at(0)!.id, true, 'tasks')
                    .then((res) => {
                        if (res) {
                            setLoading(false);
                        } else {
                            setLoading(true);
                        }
                    })
                    .catch(() => {
                        setLoading(true);
                    });
                break;
            case SelectedOption.withoutPrices:
                setLoading(true);
                await downloadCSV(projectContext.project!.notices!.at(0)!.id, false, 'tasks')
                    .then((res) => {
                        if (res) {
                            setLoading(false);
                        } else {
                            setLoading(true);
                        }
                    })
                    .catch(() => {
                        setLoading(true);
                    });
                break;
            default:
                break;
        }
    };

    const handleDownloadCsv = (): void => {
        generateCsv(selectedChoice);
    };

    return (
        <ExportFormContainer
            pdfButtonDisabled={!selectedChoice}
            csvButtonDisabled={!selectedChoice}
            pdfButtonOnClick={submitForm}
            csvButtonOnClick={handleDownloadCsv}
            secondaryButtonVisible={true}
            secondaryButtonOnClick={closeForm}
            loading={loading}>
            <Box>
                <Typography
                    variant="h4"
                    sx={{ color: NEUTRAL.darker, textAlign: 'center', fontFamily: 'Poppins' }}>
                    {t('howDoYouWantToExport')}
                </Typography>
                <Typography
                    mt={'32px'}
                    mb={'17px'}
                    variant="h6"
                    color={theme.palette.primary.main}
                    fontWeight={'700'}>
                    {t('exportTheWorkNotice')}
                </Typography>

                <RadioGroup
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={selectedChoice}
                    style={{ color: theme.palette.grey[200], fontSize: '14px' }}
                    onChange={handleChange}>
                    <FormControlLabel
                        value="withPriceDisplayedByTask"
                        control={<Radio />}
                        label={t('withPriceDisplayedByTask')}
                    />
                    <FormControlLabel
                        value="withPriceDisplayedByLots"
                        control={<Radio />}
                        label={t('withPriceDisplayedByLots')}
                    />
                    <FormControlLabel
                        value="withoutPrices"
                        control={<Radio />}
                        label={t('withoutPrices')}
                    />
                </RadioGroup>
            </Box>
        </ExportFormContainer>
    );
}
