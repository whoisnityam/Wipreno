import React, { ChangeEvent, useState, useRef, useContext } from 'react';
import { Box, Button, Stack, Typography, useTheme } from '@mui/material';
import { NEUTRAL } from '../../../theme/palette';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { Upload, Info } from 'react-feather';
import { small1 } from '../../../theme/typography';
import { ImportFormContainer } from './ImportFormContainer';
import { UserContext } from '../../../provider/UserProvider';
import { ImportArtisanSampleData } from '../services/artisanService';

interface FormProps {
    initialValues: {
        artisanDocument: File | null;
    };
    onSubmit: Function;
    closeForm: Function;
    loading: boolean;
    errorMessage: string;
}

export function ImportArtisanForm({
    initialValues,
    onSubmit,
    closeForm,
    loading,
    errorMessage
}: FormProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();
    const inputFile = useRef<HTMLInputElement>(null);
    const user = useContext(UserContext);
    const [artisanDocument, setArtisanDocument] = useState<File | null>(null);

    const getTitle = (): string => {
        if (artisanDocument?.name) {
            return artisanDocument.name;
        } else {
            return t('addOrDragCsv');
        }
    };

    const triggerFileUpload = (): void => {
        if (inputFile && inputFile.current) {
            inputFile.current.click();
        }
    };

    const form = useFormik({
        initialValues,
        onSubmit: (values) => {
            values.artisanDocument = artisanDocument;
            onSubmit(values);
        }
    });

    const { submitForm, isValid } = form;

    return (
        <ImportFormContainer
            primaryButtonDisabled={!isValid || !artisanDocument}
            primaryButtonOnClick={submitForm}
            secondaryButtonVisible={true}
            secondaryButtonOnClick={closeForm}
            loading={loading}>
            <Box>
                <Typography
                    variant="h4"
                    sx={{ color: NEUTRAL.darker, textAlign: 'center', fontFamily: 'Poppins' }}>
                    {t('importArtisan')}
                </Typography>

                <Stack
                    mt={'32px'}
                    width={'100%'}
                    direction={'row'}
                    flexWrap={'nowrap'}
                    alignItems={'flex-start'}
                    padding={2}
                    sx={{ backgroundColor: theme.palette.info.light }}>
                    <Box mr={2}>
                        <Info />
                    </Box>
                    <Box>
                        <Typography
                            sx={{ ...small1, display: 'inline' }}
                            color={theme.palette.info.dark}
                            fontWeight={'700'}>
                            {t('howDatabaseLookLike')}
                        </Typography>
                        <Button
                            sx={{
                                height: '0 !important',
                                ':hover': {
                                    backgroundColor: theme.palette.info.light
                                }
                            }}
                            onClick={async (): Promise<void> => {
                                if (user.user) {
                                    await ImportArtisanSampleData(
                                        user.user.enterprises.at(0)!.enterprise_id.id
                                    );
                                }
                            }}>
                            <Typography
                                sx={{
                                    ...small1,
                                    display: 'inline',
                                    textDecoration: 'underline',
                                    color: theme.palette.info.dark,
                                    fontWeight: 400
                                }}>
                                {t('viewExample')}
                            </Typography>
                        </Button>
                    </Box>
                </Stack>

                <Stack
                    sx={{
                        marginTop: '32px',
                        border: '1px solid',
                        borderColor: theme.palette.grey[100],
                        width: '100%',
                        borderRadius: '4px',
                        height: '150px'
                    }}>
                    <input
                        type="file"
                        name="decennialInsuranceDocument"
                        id="decennialInsuranceDocument"
                        ref={inputFile}
                        accept="text/csv"
                        onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                            if (event.target.files && event.target.files[0] !== null) {
                                setArtisanDocument(event.target.files[0]);
                            }
                        }}
                        style={{ display: 'none' }}
                    />
                    <Button
                        onClick={(): void => triggerFileUpload()}
                        fullWidth
                        style={{
                            justifyContent: 'center',
                            height: '100%',
                            flexDirection: 'column-reverse'
                        }}>
                        <Typography
                            mt={2}
                            sx={{
                                color: artisanDocument
                                    ? theme.palette.grey[200]
                                    : theme.palette.grey[100],
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                            {getTitle()}
                        </Typography>
                        <Upload
                            style={{
                                width: '20px',
                                height: '20px',
                                marginRight: '10px',
                                color: artisanDocument
                                    ? theme.palette.grey[200]
                                    : theme.palette.grey[100]
                            }}
                        />
                    </Button>
                </Stack>
                {errorMessage !== '' ? (
                    <Typography
                        mt={1}
                        sx={{
                            color: theme.palette.error.main,
                            fontSize: '12px',
                            fontFamily: 'Poppins'
                        }}>
                        {errorMessage}
                    </Typography>
                ) : null}
            </Box>
        </ImportFormContainer>
    );
}
