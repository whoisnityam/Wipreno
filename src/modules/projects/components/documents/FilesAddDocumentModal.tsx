import { LoadingButton } from '@mui/lab';
import {
    Stack,
    Typography,
    InputLabel,
    Select,
    Button,
    Box,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { t } from 'i18next';
import React, { useState, useRef, ChangeEvent } from 'react';
import { Upload } from 'react-feather';
import { useIsMounted } from '../../../../components/Hooks/useIsMounted';
import { NEUTRAL } from '../../../../theme/palette';
import { DocumentFolder } from '../../models/DocumentFolder';
import { addDocumentFile } from '../../services/DocumentsService';
import { StyledFormControl } from './StyledFormControl';
import { StyledMenuItem } from './StyledMenuItem';

interface RenderAddDocumentModalProps {
    folderList: DocumentFolder[] | undefined;
    isMounted: boolean;
    setAddDocumentModal: Function;
    setAddDocumentSuccess: Function;
    type: string;
    mainFolder?: DocumentFolder | undefined;
    setMainFolder?: Function;
}

export const RenderAddDocumentModal = ({
    mainFolder,
    folderList,
    isMounted,
    setMainFolder,
    setAddDocumentModal,
    setAddDocumentSuccess,
    type
}: RenderAddDocumentModalProps): React.ReactElement => {
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));

    if (folderList) {
        const [file, setFile] = useState<File>();
        const [uploadFolderId, setUploadFolderId] = useState(
            mainFolder !== undefined ? mainFolder.id : ''
        );
        const inputFile = useRef<HTMLInputElement>(null);
        const [buttonLoading, setButtonLoading] = useState(false);
        const _isMounted = useIsMounted();

        const triggerFileUpload = (): void => {
            if (inputFile && inputFile.current) {
                inputFile.current.click();
            }
        };

        return (
            <Stack justifyContent={isLarge ? 'normal' : 'space-between'} minHeight="100%">
                <Stack>
                    <Typography
                        variant={isLarge ? 'h4' : 'h5'}
                        textAlign="center"
                        color={NEUTRAL.darker}>
                        {t('addADocument')}
                    </Typography>
                    <Box height={isLarge ? '32px' : '40px'} />
                    <StyledFormControl>
                        <InputLabel>{t('inTheFile')}</InputLabel>
                        <Select
                            required
                            value={uploadFolderId}
                            onChange={(e): void => {
                                setUploadFolderId(e.target.value);
                            }}>
                            {folderList
                                .filter((item) => item.type === type)
                                .map((folderItem) => (
                                    <StyledMenuItem key={folderItem.id} value={folderItem.id}>
                                        <Typography variant="body2">{folderItem.name}</Typography>
                                    </StyledMenuItem>
                                ))}
                        </Select>
                    </StyledFormControl>
                    <Box minHeight="24px" />
                    <Stack
                        direction="column"
                        alignItems="center"
                        justifyContent="center"
                        height="150px"
                        sx={{
                            border: '1px solid',
                            borderColor: NEUTRAL.light,
                            padding: '10px',
                            cursor: 'pointer'
                        }}
                        onClick={(): void => {
                            triggerFileUpload();
                        }}>
                        <Upload color={NEUTRAL.medium} />
                        <Box height="8px" />
                        <Typography
                            variant="body2"
                            color={NEUTRAL.medium}
                            maxWidth="90%"
                            textOverflow="ellipsis"
                            overflow="hidden"
                            whiteSpace="nowrap">
                            {file ? file.name : t('addOrDragFile')}
                        </Typography>
                    </Stack>
                    <input
                        type="file"
                        name="document"
                        id="document"
                        ref={inputFile}
                        onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                            if (event.target.files && event.target.files[0] !== null) {
                                setFile(event.target.files[0]);
                            }
                        }}
                        style={{ display: 'none' }}
                    />
                </Stack>
                {isLarge && <Box height="48px" />}
                <Stack>
                    {!isLarge && <Box height="12px" />}
                    <LoadingButton
                        loading={buttonLoading}
                        variant="contained"
                        disabled={!Boolean(file) || uploadFolderId === ''}
                        onClick={(): void => {
                            if (file) {
                                setButtonLoading(true);
                                addDocumentFile(uploadFolderId, file)
                                    .then((response) => {
                                        if (
                                            mainFolder &&
                                            setMainFolder &&
                                            uploadFolderId === mainFolder.id
                                        ) {
                                            const tempMainFolder = { ...mainFolder };
                                            if (tempMainFolder.files) {
                                                tempMainFolder.files.push(response);
                                            } else {
                                                tempMainFolder.files = [response];
                                            }
                                            setMainFolder(tempMainFolder);
                                        }
                                        if (_isMounted) {
                                            setButtonLoading(false);
                                            setUploadFolderId('');
                                        }
                                        setAddDocumentModal(false);
                                        setAddDocumentSuccess(true);
                                        setTimeout((): void => {
                                            if (isMounted) {
                                                setAddDocumentSuccess(false);
                                            }
                                        }, 3000);
                                    })
                                    .catch(() => {
                                        if (_isMounted) {
                                            setButtonLoading(false);
                                            setUploadFolderId('');
                                        }
                                    });
                            }
                        }}>
                        {t('add')}
                    </LoadingButton>
                    <Box height={isLarge ? '20px' : '12px'} />
                    <Button variant="outlined" onClick={(): void => setAddDocumentModal(false)}>
                        {t('return')}
                    </Button>
                </Stack>
            </Stack>
        );
    }
    return <></>;
};
