import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
    Box,
    Button,
    MenuItem,
    Menu,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
    Grid,
    Dialog,
    Slide,
    InputLabel,
    Select,
    TextField
} from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, Edit3, MoreHorizontal, Plus, Trash2 } from 'react-feather';
import {
    deleteDocumentFile,
    getDocumentFolderById,
    getDocumentFolders,
    modifyDocumentFile
} from '../services/DocumentsService';
import { NEUTRAL } from '../../../theme/palette';
import { DocumentFileComponent } from '../components/documents/DocumentFileComponent';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { ModalContainer } from '../../../components/ModalContainer';
import { DocumentFolder } from '../models/DocumentFolder';
import { DocumentFile } from '../models/DocumentFile';
import { LoadingButton } from '@mui/lab';
import { TinyButton } from '../components/documents/DocumentFolderComponent';
import { DocumentsBreadCrumb } from '../components/documents/DocumentsBreadCrumb';
import { downloadURI, getFileURL } from '../../../utils';
import { RenderDeleteFolderModal } from '../components/documents/FilesDeleteFolderModal';
import { useIsMounted } from '../../../components/Hooks/useIsMounted';
import { RenderModifyFolderNameModal } from '../components/documents/FilesModifyFolderNameModal';
import { RenderAddDocumentModal } from '../components/documents/FilesAddDocumentModal';
import { StyledFormControl } from '../components/documents/StyledFormControl';
import { StyledMenuItem } from '../components/documents/StyledMenuItem';
import { RenderMobileOptionsModal } from '../components/documents/FilesMobileOptionsModal';

export function ProjectDocumentsFiles(): React.ReactElement {
    const { id, folderId } = useParams();
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const { pathname } = useLocation();
    const Type = pathname.includes('craftsman') ? 'ARTISAN' : 'CLIENT';
    const { t } = useTranslation();
    const [mainFolder, setMainFolder] = useState<DocumentFolder>();
    const [folderList, setFolderList] = useState<DocumentFolder[]>();
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<DocumentFile>();
    const [fileDeleteModal, setFileDeleteModal] = useState(false);
    const [fileModifyModal, setFileModifyModal] = useState(false);
    const [modifyFolderNameModal, setModifyFolderNameModal] = useState(false);
    const [mobileOptionsModal, setMobileOptionsModal] = useState(false);
    const [addDocumentModal, setAddDocumentModal] = useState(false);
    const [addDocumentSuccess, setAddDocumentSuccess] = useState(false);
    const [modifyDocumentSuccess, setModifyDocumentSuccess] = useState(false);
    const [modifyFolderNameSuccess, setModifyFolderNameSuccess] = useState(false);
    const [deleteDocumentSuccess, setDeleteDocumentSuccess] = useState(false);
    const [deleteFolderSuccess, setDeleteFolderSuccess] = useState(false);
    const [deleteFolderModal, setDeleteFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState<string>();
    const isMounted = useIsMounted();

    useEffect(() => {
        if (mainFolder && folderList && newFolderName) {
            const tempFolderList = [...folderList];
            const folderIndex = tempFolderList.findIndex(
                (folderItem) => folderItem.id === mainFolder.id
            );
            tempFolderList[folderIndex] = {
                ...tempFolderList[folderIndex],
                name: newFolderName
            };
            setFolderList(tempFolderList);
            setMainFolder({
                ...mainFolder,
                name: newFolderName
            });
        }
    }, [newFolderName]);

    const prepareData = useCallback(async () => {
        if (folderId && id) {
            setLoading(true);
            getDocumentFolders(id, Type).then((response) => {
                if (isMounted) {
                    setFolderList(response);
                }
            });
            getDocumentFolderById(folderId).then((response) => {
                if (isMounted) {
                    setMainFolder(response);
                }
            });
        }
    }, [folderId]);

    useEffect(() => {
        if (mainFolder !== undefined && folderList !== undefined && isMounted) {
            setLoading(false);
        }
    }, [mainFolder]);

    useEffect(() => {
        if (isMounted) {
            prepareData();
        }
    }, [isMounted, folderId]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (): void => {
        setAnchorEl(null);
    };

    const RenderDeleteFileModal = (): React.ReactElement => {
        const [buttonLoading, setButtonLoading] = useState(false);
        const _isMounted = useIsMounted();

        return (
            <Stack>
                <Typography variant={isLarge ? 'h4' : 'h5'} textAlign="center">
                    {t('deleteDocumentConfirmation')}
                </Typography>
                <Box height="24px" />
                <Typography variant="body1" textAlign="center">
                    {t('deleteDocumentSubtitle')}
                </Typography>
                <Box height={isLarge ? '48px' : '40px'} />
                <LoadingButton
                    loading={buttonLoading}
                    variant="contained"
                    color="error"
                    onClick={(): void => {
                        if (selectedFile) {
                            setButtonLoading(true);
                            deleteDocumentFile(selectedFile.id)
                                .then((response) => {
                                    if (
                                        mainFolder !== undefined &&
                                        mainFolder.files !== undefined
                                    ) {
                                        const tempFiles = [...mainFolder.files];
                                        const documentFileIndex = tempFiles.findIndex(
                                            (item) => item.id === response.id
                                        );
                                        tempFiles.splice(documentFileIndex, 1);
                                        setMainFolder({ ...mainFolder, files: tempFiles });
                                        setFileDeleteModal(false);
                                        setDeleteDocumentSuccess(true);
                                        setTimeout((): void => {
                                            if (isMounted) {
                                                setDeleteDocumentSuccess(false);
                                            }
                                        }, 3000);
                                        if (_isMounted) {
                                            setButtonLoading(false);
                                        }
                                    }
                                })
                                .catch(() => {
                                    if (_isMounted) {
                                        setButtonLoading(false);
                                    }
                                });
                        }
                    }}>
                    {t('remove')}
                </LoadingButton>
                <Box height={isLarge ? '20px' : '12px'} />
                <Button variant="outlined" onClick={(): void => setFileDeleteModal(false)}>
                    {t('cancelButtonTitle')}
                </Button>
            </Stack>
        );
    };

    const RenderModifyDocumentModal = (): React.ReactElement => {
        if (mainFolder && folderList && selectedFile) {
            const [file, setFile] = useState<File>();
            const [folder, setFolder] = useState(mainFolder.id);
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
                            {t('modifyADocument')}
                        </Typography>
                        <Box height={isLarge ? '32px' : '40px'} />
                        <StyledFormControl>
                            <InputLabel>{t('inTheFile')}</InputLabel>
                            <Select
                                required
                                value={folder}
                                onChange={(e): void => {
                                    setFolder(e.target.value);
                                }}>
                                {folderList.map((folderItem) => (
                                    <StyledMenuItem key={folderItem.id} value={folderItem.id}>
                                        <Typography variant="body2">{folderItem.name}</Typography>
                                    </StyledMenuItem>
                                ))}
                            </Select>
                        </StyledFormControl>
                        <Box height="12px" />
                        <TextField
                            label={isLarge ? t('addOrDragFile') : t('document')}
                            value={file ? file.name : selectedFile.file_id.filename_download}
                            onClick={(): void => triggerFileUpload()}
                            InputProps={{
                                readOnly: true
                            }}
                            sx={{
                                '.MuiOutlinedInput-input': {
                                    cursor: 'pointer'
                                }
                            }}
                        />
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
                            disabled={!(Boolean(file) || folder !== mainFolder.id)}
                            onClick={(): void => {
                                if (file) setButtonLoading(true);
                                modifyDocumentFile(selectedFile, file, folder)
                                    .then((response) => {
                                        if (_isMounted) {
                                            setButtonLoading(false);
                                        }
                                        // This will always be true
                                        if (mainFolder.files !== undefined) {
                                            const tempFiles = [...mainFolder.files];
                                            const documentFileIndex = tempFiles.findIndex(
                                                (item) => item.id === selectedFile.id
                                            );
                                            if (folder !== mainFolder.id) {
                                                tempFiles.splice(documentFileIndex, 1);
                                            } else {
                                                tempFiles[documentFileIndex] = response;
                                            }
                                            setMainFolder({
                                                ...mainFolder,
                                                files: [...tempFiles]
                                            });
                                            setFileModifyModal(false);
                                            setModifyDocumentSuccess(true);
                                            setTimeout((): void => {
                                                if (isMounted) {
                                                    setModifyDocumentSuccess(false);
                                                }
                                            }, 3000);
                                        }
                                    })
                                    .catch(() => {
                                        if (_isMounted) {
                                            setButtonLoading(false);
                                        }
                                    });
                            }}>
                            {t('modifyButtonTitle')}
                        </LoadingButton>
                        <Box height={isLarge ? '20px' : '12px'} />
                        <Button variant="outlined" onClick={(): void => setFileModifyModal(false)}>
                            {t('return')}
                        </Button>
                    </Stack>
                </Stack>
            );
        }
        return <></>;
    };

    return loading ? (
        <LoadingIndicator />
    ) : (
        <Stack width="100%">
            <Stack
                direction={isLarge ? 'row' : 'column'}
                justifyContent={isLarge ? 'space-between' : 'normal'}>
                <Stack
                    alignItems={'center'}
                    direction="row"
                    marginBottom={{ xs: '24px', md: '33px' }}
                    marginTop={{ md: '9px' }}>
                    {isLarge ? (
                        <DocumentsBreadCrumb
                            items={[
                                {
                                    title: t('documents'),
                                    path: `/project/documents/${id}`
                                },
                                {
                                    title: pathname.includes('craftsman')
                                        ? t('artisanDocumentFolder')
                                        : t('clientDocumentFolder'),
                                    path: pathname.includes('craftsman')
                                        ? `/project/documents/craftsman/${id}`
                                        : `/project/documents/client/${id}`
                                },
                                {
                                    title: mainFolder ? mainFolder.name : '',
                                    path: pathname
                                }
                            ]}
                        />
                    ) : (
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%">
                            <Stack direction="row" alignItems="center" maxWidth="calc(100% - 64px)">
                                <TinyButton
                                    onClick={(): void => {
                                        window.history.back();
                                    }}>
                                    <ArrowLeft color={theme.palette.primary.medium} />
                                </TinyButton>
                                <Box width="8px" />
                                <Typography
                                    variant="h5"
                                    maxWidth="calc(100% - 32px)"
                                    textOverflow="ellipsis"
                                    overflow="hidden"
                                    whiteSpace="nowrap">
                                    {mainFolder !== undefined ? mainFolder.name : ''}
                                </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center">
                                <TinyButton
                                    onClick={(): void => {
                                        setDeleteFolderModal(true);
                                    }}>
                                    <Trash2 color={theme.palette.error.medium} />
                                </TinyButton>
                                <Box width="8px" />
                                <TinyButton
                                    onClick={(): void => {
                                        // TODO: Download folder content logic
                                    }}>
                                    <Download color={NEUTRAL.darker} />
                                </TinyButton>
                            </Stack>
                        </Stack>
                    )}
                    {isLarge && (
                        <>
                            <Box width="10px" />
                            <TinyButton
                                onClick={(): void => setModifyFolderNameModal(true)}
                                id="basic-button"
                                aria-controls={open ? 'basic-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={open ? 'true' : undefined}>
                                <Edit3 />
                            </TinyButton>
                        </>
                    )}
                </Stack>
                <Button
                    sx={{ ml: { md: isLarge ? '8px' : '' } }}
                    variant="outlined"
                    onClick={(): void => {
                        setAddDocumentModal(true);
                    }}>
                    <Plus color={theme.palette.secondary.medium} />
                    <Box width="15px" />
                    {t('addADocument')}
                </Button>
                {!isLarge && <Box height="40px" />}
            </Stack>
            <Grid
                minWidth="100vw"
                maxWidth="100vw"
                alignItems={{ xs: 'center' }}
                direction={{ xs: 'column', md: 'row' }}
                container
                spacing={{ xs: '24px', md: '20px' }}>
                {mainFolder?.files?.map((file, index) => {
                    return (
                        <Grid minWidth={!isLarge ? '100%' : '360px'} item key={index}>
                            <Stack direction="row" alignItems="center">
                                <DocumentFileComponent
                                    title={file.file_id.filename_download}
                                    addedBy={`${file.created_by?.first_name} ${file.created_by?.last_name}`}
                                />
                                <TinyButton
                                    onClick={(e): void => {
                                        setSelectedFile(file);
                                        if (isLarge) {
                                            handleClick(e);
                                        } else {
                                            setMobileOptionsModal(true);
                                        }
                                    }}
                                    id="basic-button"
                                    aria-controls={open ? 'basic-menu' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={open ? 'true' : undefined}>
                                    <MoreHorizontal />
                                </TinyButton>
                            </Stack>
                        </Grid>
                    );
                })}
            </Grid>
            {isLarge ? (
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button'
                    }}>
                    <MenuItem
                        onClick={(): void => {
                            setAnchorEl(null);
                            if (selectedFile !== undefined) {
                                downloadURI(
                                    getFileURL(selectedFile.file_id.id),
                                    selectedFile.file_id.filename_download
                                );
                            }
                        }}>
                        <Typography variant="body1" color={NEUTRAL.medium}>
                            {t('toDownload')}
                        </Typography>
                    </MenuItem>
                    <MenuItem
                        onClick={(): void => {
                            setAnchorEl(null);
                            setFileModifyModal(true);
                        }}>
                        <Typography color={NEUTRAL.medium}>{t('modifyButtonTitle')}</Typography>
                    </MenuItem>
                    <MenuItem
                        onClick={(): void => {
                            setAnchorEl(null);
                            setFileDeleteModal(true);
                        }}>
                        <Typography color={theme.palette.error.main}>{t('remove')}</Typography>
                    </MenuItem>
                </Menu>
            ) : (
                <Slide direction="up" in={mobileOptionsModal}>
                    <Dialog
                        open={mobileOptionsModal}
                        keepMounted
                        onClose={(): void => setMobileOptionsModal(false)}
                        sx={{
                            '.MuiDialog-paper': {
                                height: '240px',
                                minWidth: '100%',
                                maxWidth: '100%',
                                margin: 'unset',
                                marginTop: 'calc(100vh - 240px)',
                                padding: '12px 16px'
                            }
                        }}>
                        <RenderMobileOptionsModal
                            selectedFile={selectedFile}
                            setMobileOptionsModal={setMobileOptionsModal}
                            setFileModifyModal={setFileModifyModal}
                            setFileDeleteModal={setFileDeleteModal}
                        />
                    </Dialog>
                </Slide>
            )}
            {isLarge ? (
                <ModalContainer
                    isModalOpen={addDocumentModal}
                    onClose={(): void => setAddDocumentModal(false)}
                    content={
                        <RenderAddDocumentModal
                            type={Type}
                            mainFolder={mainFolder}
                            folderList={folderList}
                            isMounted={isMounted}
                            setMainFolder={setMainFolder}
                            setAddDocumentModal={setAddDocumentModal}
                            setAddDocumentSuccess={setAddDocumentSuccess}
                        />
                    }
                />
            ) : (
                <Slide direction="up" in={addDocumentModal}>
                    <Dialog
                        open={addDocumentModal}
                        keepMounted
                        onClose={(): void => setAddDocumentModal(false)}
                        sx={{
                            '.MuiDialog-paper': {
                                height: 'calc(100vh - 80px)',
                                minWidth: '100%',
                                maxWidth: '100%',
                                margin: 'unset',
                                marginTop: '80px',
                                padding: '24px 16px'
                            }
                        }}>
                        <RenderAddDocumentModal
                            type={Type}
                            mainFolder={mainFolder}
                            folderList={folderList}
                            isMounted={isMounted}
                            setMainFolder={setMainFolder}
                            setAddDocumentModal={setAddDocumentModal}
                            setAddDocumentSuccess={setAddDocumentSuccess}
                        />
                    </Dialog>
                </Slide>
            )}
            {isLarge ? (
                <ModalContainer
                    isModalOpen={fileModifyModal}
                    onClose={(): void => setFileModifyModal(false)}
                    content={<RenderModifyDocumentModal />}
                />
            ) : (
                <Slide direction="up" in={fileModifyModal}>
                    <Dialog
                        open={fileModifyModal}
                        keepMounted
                        onClose={(): void => setFileModifyModal(false)}
                        sx={{
                            '.MuiDialog-paper': {
                                height: 'calc(100vh - 80px)',
                                minWidth: '100%',
                                maxWidth: '100%',
                                margin: 'unset',
                                marginTop: '80px',
                                padding: '24px 16px'
                            }
                        }}>
                        <RenderModifyDocumentModal />
                    </Dialog>
                </Slide>
            )}
            <ModalContainer
                width={isLarge ? undefined : 'calc(100% - 32px)'}
                isModalOpen={fileDeleteModal}
                onClose={(): void => setFileDeleteModal(false)}
                content={<RenderDeleteFileModal />}
            />
            {isLarge && (
                <ModalContainer
                    isModalOpen={modifyFolderNameModal}
                    onClose={(): void => setModifyFolderNameModal(false)}
                    content={
                        <RenderModifyFolderNameModal
                            setNewFolderNameMain={setNewFolderName}
                            mainFolder={mainFolder}
                            folderList={folderList}
                            isMounted={isMounted}
                            setModifyFolderNameModal={setModifyFolderNameModal}
                            setModifyFolderNameSuccess={setModifyFolderNameSuccess}
                        />
                    }
                />
            )}
            {!isLarge && (
                <ModalContainer
                    width={isLarge ? undefined : 'calc(100% - 32px)'}
                    isModalOpen={deleteFolderModal}
                    onClose={(): void => {
                        setDeleteFolderModal(false);
                    }}
                    content={
                        <RenderDeleteFolderModal
                            mainFolder={mainFolder}
                            setDeleteFolderModal={setDeleteFolderModal}
                            setDeleteFolderSuccess={setDeleteFolderSuccess}
                            type={Type}
                        />
                    }
                />
            )}
            <SuccessAlert
                title={t('addDocumentTitle')}
                subtitle={t('addDocumentSubtitle')}
                onClose={(): void => setAddDocumentSuccess(false)}
                open={addDocumentSuccess}
            />
            <SuccessAlert
                title={t('yourRequestHasBeenTaken')}
                subtitle={t('redirectedToProjects')}
                onClose={(): void => {
                    setModifyFolderNameSuccess(false);
                    setModifyDocumentSuccess(false);
                    setDeleteDocumentSuccess(false);
                }}
                open={
                    modifyDocumentSuccess ||
                    deleteDocumentSuccess ||
                    deleteFolderSuccess ||
                    modifyFolderNameSuccess
                }
            />
        </Stack>
    );
}
