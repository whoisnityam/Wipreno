import {
    Box,
    Button,
    Dialog,
    Grid,
    Slide,
    Stack,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download, Plus, Trash2 } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { SuccessAlert } from '../../../components/alerts/SuccessAlert';
import { useIsMounted } from '../../../components/Hooks/useIsMounted';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { ModalContainer } from '../../../components/ModalContainer';
import {
    TinyButton,
    DocumentFolderComponent
} from '../components/documents/DocumentFolderComponent';
import { DocumentsBreadCrumb } from '../components/documents/DocumentsBreadCrumb';
import { DocumentsMobileTooltip } from '../components/documents/DocumentsMobileTooltip';
import { DocumentTooltip } from '../components/documents/DocumentTooltip';
import { RenderAddDocumentModal } from '../components/documents/FilesAddDocumentModal';
import { RenderAddFolderModal } from '../components/documents/FoldersAddFolderModal';
import { RenderDeleteFolderModal } from '../components/documents/FoldersDeleteFolderModal';
import { DocumentFolder } from '../models/DocumentFolder';
import { getDocumentFolders } from '../services/DocumentsService';

export function ProjectDocumentsFolders(): React.ReactElement {
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));
    const { pathname } = useLocation();
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const Type = pathname.includes('craftsman') ? 'ARTISAN' : 'CLIENT';
    const [loading, setLoading] = useState(false);
    const [folders, setFolders] = useState<DocumentFolder[]>([]);
    const [addFolderModal, setAddFolderModal] = useState(false);
    const [addDocumentModal, setAddDocumentModal] = useState(false);
    const [addDocumentSuccess, setAddDocumentSuccess] = useState(false);
    const [deleteFolderModal, setDeleteFolderModal] = useState(false);
    const [deleteFolderSuccess, setDeleteFolderSuccess] = useState(false);
    const [addFolderSuccess, setAddFolderSuccess] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<DocumentFolder>();
    const isMounted = useIsMounted();

    const prepareData = async (): Promise<void> => {
        if (id && isMounted) {
            if (isMounted) {
                setLoading(true);
            }
            if (isMounted) {
                getDocumentFolders(id, Type).then((response) => {
                    if (isMounted) {
                        setFolders(response);
                    }
                });
            }
            if (isMounted) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (isMounted) {
            prepareData();
        }
    }, []);

    if (loading) {
        return <LoadingIndicator />;
    } else {
        return (
            <Stack width="100%">
                <Stack direction="row" justifyContent="space-between">
                    <Stack
                        width={isLarge ? 'fit-content' : '100%'}
                        alignItems={'center'}
                        direction="row"
                        marginBottom={{ xs: '24px', md: '33px' }}
                        marginTop={{ md: '9px' }}>
                        {isLarge ? (
                            <>
                                <DocumentsBreadCrumb
                                    items={[
                                        {
                                            title: t('documents'),
                                            path: `/project/documents/${id}`
                                        },
                                        {
                                            title:
                                                Type === 'ARTISAN'
                                                    ? t('artisanDocumentFolder')
                                                    : t('clientDocumentFolder'),
                                            path: pathname
                                        }
                                    ]}
                                />
                                <Box width="10px" />
                                <DocumentTooltip
                                    title={
                                        Type === 'ARTISAN'
                                            ? t('artisanTooltip')
                                            : t('clientTooltip')
                                    }
                                />
                            </>
                        ) : (
                            <Stack width="100%">
                                <Stack
                                    width="100%"
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center">
                                    <Stack direction="row" alignItems="center">
                                        <TinyButton
                                            onClick={(): void => {
                                                navigate(`/project/documents/${id}`);
                                            }}>
                                            <ArrowLeft />
                                        </TinyButton>
                                        <Box width="8px" />
                                        <Typography variant="h5">
                                            {Type === 'ARTISAN'
                                                ? t('artisanDocumentFolder')
                                                : t('clientDocumentFolder')}
                                        </Typography>
                                    </Stack>
                                    <TinyButton
                                        onClick={(): void => {
                                            // TODO: Download logic for all files
                                        }}>
                                        <Download />
                                    </TinyButton>
                                </Stack>
                                <Box height="12px" />
                                <DocumentsMobileTooltip
                                    tooltipContent={
                                        Type === 'ARTISAN'
                                            ? t('artisanTooltip')
                                            : t('clientTooltip')
                                    }
                                />
                                <Box height="24px" />
                                <Button
                                    variant="outlined"
                                    onClick={(): void => {
                                        setAddDocumentModal(true);
                                    }}>
                                    <Plus color={theme.palette.secondary.medium} />
                                    <Box width="15px" />
                                    {t('addADocument')}
                                </Button>
                            </Stack>
                        )}
                    </Stack>
                    {isLarge && (
                        <Button variant="outlined" onClick={(): void => setAddDocumentModal(true)}>
                            <Plus color={theme.palette.secondary.medium} />
                            <Box width="15px" />
                            {t('addADocument')}
                        </Button>
                    )}
                </Stack>
                <Grid
                    minWidth="100%"
                    alignItems={{ xs: 'center' }}
                    direction={{ xs: 'column', md: 'row' }}
                    container
                    spacing={{ xs: '16px', md: '20px' }}>
                    {folders.map((folder, index) => {
                        return (
                            <Grid width={!isLarge ? '100%' : '285px'} item key={index}>
                                <DocumentFolderComponent
                                    title={folder.name}
                                    documentOnClick={(): void => {
                                        Type === 'ARTISAN'
                                            ? navigate(
                                                  `/project/documents/craftsman/files/${id}/${folder.id}`
                                              )
                                            : navigate(
                                                  `/project/documents/client/files/${id}/${folder.id}`
                                              );
                                    }}
                                    iconImage={
                                        isLarge ? (
                                            <Trash2 color={theme.palette.error.medium} />
                                        ) : (
                                            <Download color={theme.palette.primary.medium} />
                                        )
                                    }
                                    iconOnClick={(): void => {
                                        if (isLarge) {
                                            setSelectedFolder(folder);
                                            setDeleteFolderModal(true);
                                        } else {
                                            // TODO: download logic for small screens
                                        }
                                    }}
                                />
                            </Grid>
                        );
                    })}
                    <Grid width={!isLarge ? '100%' : '285px'} item>
                        <div
                            onClick={(): void => {
                                setAddFolderModal(true);
                            }}>
                            <Stack
                                direction="row"
                                sx={{
                                    border: '1px dashed #D9D9D9',
                                    borderRadius: '4px',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    pt: '28px',
                                    pb: '28px',
                                    cursor: 'pointer'
                                }}>
                                <Plus />
                                <Box width="8px" />
                                <Typography variant="body2" fontWeight={600}>
                                    {t('newFolder')}
                                </Typography>
                            </Stack>
                        </div>
                    </Grid>
                </Grid>
                {isLarge ? (
                    <ModalContainer
                        isModalOpen={addFolderModal}
                        onClose={(): void => setAddFolderModal(false)}
                        content={
                            <RenderAddFolderModal
                                type={Type}
                                isMounted={isMounted}
                                folders={folders}
                                setAddFolderModal={setAddFolderModal}
                                setFolders={setFolders}
                                setAddFolderSuccess={setAddFolderSuccess}
                            />
                        }
                    />
                ) : (
                    <Slide direction="up" in={addFolderModal}>
                        <Dialog
                            open={addFolderModal}
                            keepMounted
                            onClose={(): void => {
                                if (isMounted) {
                                    setAddFolderModal(false);
                                }
                            }}
                            sx={{
                                '.MuiDialog-paper': {
                                    height: 'calc(100% - 80px)',
                                    minWidth: '100%',
                                    maxWidth: '100%',
                                    margin: 'unset',
                                    marginTop: '80px',
                                    padding: '24px 16px'
                                }
                            }}>
                            <RenderAddFolderModal
                                type={Type}
                                isMounted={isMounted}
                                folders={folders}
                                setAddFolderModal={setAddFolderModal}
                                setFolders={setFolders}
                                setAddFolderSuccess={setAddFolderSuccess}
                            />
                        </Dialog>
                    </Slide>
                )}
                {isLarge && (
                    <ModalContainer
                        width={isLarge ? undefined : 'calc(100% - 32px)'}
                        isModalOpen={deleteFolderModal}
                        onClose={(): void => {
                            if (isMounted) {
                                setDeleteFolderModal(false);
                            }
                        }}
                        content={
                            <RenderDeleteFolderModal
                                selectedFolder={selectedFolder}
                                folders={folders}
                                isMounted={isMounted}
                                setFolders={setFolders}
                                setDeleteFolderModal={setDeleteFolderModal}
                                setDeleteFolderSuccess={setDeleteFolderSuccess}
                            />
                        }
                    />
                )}
                {isLarge ? (
                    <ModalContainer
                        isModalOpen={addDocumentModal}
                        onClose={(): void => setAddDocumentModal(false)}
                        content={
                            <RenderAddDocumentModal
                                type={Type}
                                folderList={folders}
                                isMounted={isMounted}
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
                                folderList={folders}
                                isMounted={isMounted}
                                setAddDocumentModal={setAddDocumentModal}
                                setAddDocumentSuccess={setAddDocumentSuccess}
                            />
                        </Dialog>
                    </Slide>
                )}
                <SuccessAlert
                    title={t('folderHasBeenAdded')}
                    subtitle={t('addFolderSubtitle')}
                    onClose={(): void => {
                        if (isMounted) {
                            setAddFolderSuccess(false);
                        }
                    }}
                    open={addFolderSuccess}
                />
                <SuccessAlert
                    title={t('yourRequestHasBeenTaken')}
                    subtitle={t('redirectedToProjects')}
                    onClose={(): void => {
                        if (isMounted) {
                            setDeleteFolderSuccess(false);
                        }
                    }}
                    open={deleteFolderSuccess}
                />
                <SuccessAlert
                    title={t('addDocumentTitle')}
                    subtitle={t('addDocumentSubtitle')}
                    onClose={(): void => setAddDocumentSuccess(false)}
                    open={addDocumentSuccess}
                />
            </Stack>
        );
    }
}
