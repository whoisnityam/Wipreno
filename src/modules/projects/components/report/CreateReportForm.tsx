import React, { ChangeEvent, useContext, useEffect, useRef, useState } from 'react';
import { Box, Button, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import 'yup-phone';
import { useTranslation } from 'react-i18next';
import { NEUTRAL } from '../../../../theme/palette';
import { body3, button2, small2 } from '../../../../theme/typography';
import { useParams } from 'react-router-dom';
import { Plus, Camera, ChevronUp, ChevronDown, X } from 'react-feather';
import { createStyles, makeStyles } from '@mui/styles';
import { SystemStyleObject, Theme } from '@mui/system';
import { CreateReport, LotComments } from '../../models/CreateReport';
import { LotViewDataForReport } from '../../models/Lot';
import { ProjectContext } from '../../layout/ProjectDetailLayout';
import { createReport, updateReport } from '../../services/ReportService';
import { Report } from '../../models/Report';
import { getLots } from '../../services/LotService';
import { FileData } from '../../models/FileData';

interface CreateReportFormsProps {
    handleCloseForm: Function;
    handleOpenSuccess: Function;
    reportData?: Report;
    isModify?: boolean;
    lots?: LotViewDataForReport[];
    onClose?: () => void;
}

export function CreateReportForm({
    handleCloseForm,
    handleOpenSuccess,
    reportData,
    isModify,
    lots,
    onClose = (): void => {}
}: CreateReportFormsProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();
    const { id } = useParams();
    const projectData = useContext(ProjectContext)?.project;
    const inputFile = useRef<HTMLInputElement>(null);
    const [currentCommentIndex, setCurrentCommentIndex] = useState<number>(0);
    const [currentLot, setCurrentLot] = useState<LotViewDataForReport>();
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const [attachmentLimitExceeded, setAttachmentLimitExceeded] = useState<boolean>(false);
    const [formData, setFormData] = useState<CreateReport[]>([]);
    const [initialFormData, setInitialFormData] = useState<CreateReport[]>([]);
    const isLargeLandscape = useMediaQuery('(min-width:920px)');

    function scrollToBottom(): void {
        const element = document.getElementById('content');
        if (element) {
            {
                element.scrollIntoView(false);
            }
        }
    }

    useEffect(() => {
        if (formData.length === 0) {
            setIsDisabled(true);
        } else {
            setIsDisabled(false);
        }
    }, [formData]);

    useEffect(() => {
        if (reportData === undefined && isModify) {
            setIsDisabled(true);
        }
    }, [reportData]);

    const useStyles = makeStyles(() =>
        createStyles({
            multilineText: {
                '& .MuiOutlinedInput-root': {
                    height: 'auto'
                },
                '& .MuiOutlinedInput-input': {
                    paddingTop: '4px'
                }
            },
            textColor: {
                color: theme.palette.grey[200]
            },
            labelColor: {
                color: theme.palette.primary.main
            }
        })
    );
    const classes = useStyles();

    const triggerFileUpload = (): void => {
        if (inputFile && inputFile.current) {
            inputFile.current.click();
        }
    };

    const fetchLots = async (): Promise<void | null> => {
        const data = await getLots(projectData!.notices!.at(0)!.id);
        const list: CreateReport[] = [];
        for (const lot of data) {
            list.push({ lot, commentInfo: [] });
        }
        list.push({
            lot: {
                id: null,
                title: t('various'),
                artisan_id: undefined
            },
            commentInfo: []
        });
        if (list.length === data.length + 1) {
            setFormData(list);
        }
        scrollToBottom();
    };

    useEffect(() => {
        if (id && !reportData) {
            fetchLots();
        }
    }, [id]);

    const setReportData = async (): Promise<void> => {
        let updatedList: CreateReport[] = [];
        if (lots) {
            const list: CreateReport[] = [];
            lots.map((lot) => {
                list.push({
                    lot,
                    commentInfo: []
                });
            });
            if (reportData) {
                reportData.items.map((reportItem) => {
                    list.map((row) => {
                        if (row.lot.id === reportItem.lot_id) {
                            const fileDetails: {
                                fileName: string;
                                fileId: string;
                                attachmentId: string;
                            }[] = [];
                            const files: FileData[] = [];
                            reportItem.attachments.map((attachment) => {
                                fileDetails.push({
                                    fileName: attachment.file.filename_download,
                                    fileId: attachment.file.id,
                                    attachmentId: attachment.id
                                });
                                files.push(attachment.file);
                            });
                            const lotComment: LotComments = {
                                comment: reportItem.comment,
                                fileUploaded: null,
                                fileDetails,
                                lot_id: reportItem.lot_id,
                                id: reportItem.id,
                                files
                            };
                            row.commentInfo.push(lotComment);
                        }
                    });
                });
            }
            updatedList = list;
        }
        if (updatedList.length > 0 && lots) {
            setFormData([...updatedList]);
            setInitialFormData([...updatedList]);
        }
    };

    useEffect(() => {
        setReportData();
    }, [lots]);

    const addLotComment = (lot: LotViewDataForReport): CreateReport[] => {
        const list = formData;
        formData.forEach((element, index) => {
            let commentList = [];
            if (element.lot.id === lot.id) {
                commentList = element.commentInfo;
                commentList.push({
                    comment: '',
                    files: [],
                    fileUploaded: null,
                    lot_id: lot.id,
                    id: null,
                    fileDetails: []
                });
                list[index].commentInfo = [...commentList];
            }
        });
        return list;
    };

    const handleAddReportItem = (lot: LotViewDataForReport): void => {
        const res = addLotComment(lot);
        if (res.length > 0) {
            setFormData([...res]);
        }
    };

    const handleCommentChange = (
        value: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
        index: number,
        lot: LotViewDataForReport
    ): void => {
        const list = [...formData];
        formData.forEach((item, position) => {
            if (lot.id === item.lot.id) {
                list[position].commentInfo[index] = {
                    comment: value.target.value,
                    files: [...list[position].commentInfo[index].files],
                    fileUploaded: list[position].commentInfo[index].fileUploaded,
                    lot_id: lot?.id,
                    id: list[position].commentInfo[index].id,
                    fileDetails: [...list[position].commentInfo[index].fileDetails]
                };
            }
        });
        setFormData([...list]);
    };

    const handleFileChange = (value: FileList): void => {
        const list = [...formData];
        if (value.length > 0) {
            formData.map((item, position) => {
                if (currentLot?.id === item.lot.id) {
                    list[position].commentInfo[currentCommentIndex] = {
                        comment: list[position].commentInfo[currentCommentIndex].comment,
                        files: [...list[position].commentInfo[currentCommentIndex].files],
                        fileUploaded: value,
                        lot_id: currentLot.id,
                        id: list[position].commentInfo[currentCommentIndex].id,
                        fileDetails: [
                            ...list[position].commentInfo[currentCommentIndex].fileDetails
                        ]
                    };
                }
            });
        }
        setFormData([...list]);
    };

    const validateInitialData = (): void => {
        if (JSON.stringify(formData) === JSON.stringify(initialFormData) && !isModify) {
            setIsDisabled(false);
        }
        if (JSON.stringify(formData) !== JSON.stringify(initialFormData) && isModify) {
            setIsDisabled(false);
        }
    };

    useEffect(() => {
        setAttachmentLimitExceeded(false);
        if (reportData) {
            validateInitialData();
        }
        let totalAttachments = 0;
        formData.map((item) => {
            item.commentInfo.map((comment) => {
                if (comment.fileUploaded && comment.fileUploaded?.length > 0) {
                    totalAttachments = totalAttachments + comment.fileUploaded.length;
                }
                if (comment.files && comment.files.length > 0) {
                    totalAttachments = totalAttachments + comment.files.length;
                }
            });
        });
        if (totalAttachments > 50) {
            setAttachmentLimitExceeded(true);
            setIsDisabled(true);
        }
    }, [formData]);

    const handleSubmit = async (): Promise<void> => {
        if (projectData) {
            if (reportData) {
                await updateReport(projectData, formData, reportData.id).then(() => {
                    handleOpenSuccess();
                });
                handleCloseForm();
            } else {
                await createReport(projectData, formData);
                handleOpenSuccess();
                handleCloseForm();
            }
        }
    };

    const getSelectedFileNames = (files: FileList | null): string => {
        let str = '';
        if (files) {
            const fileList = Array.from(files);
            let index = 0;
            for (const file of fileList) {
                if (index + 1 < fileList.length) {
                    str = `${str} ${file.name}, `;
                    index++;
                } else {
                    str = `${str} ${file.name}`;
                }
            }
            return str;
        } else {
            return str;
        }
    };

    const handleDrawer = (reportIndex: number, comment: LotComments, item: CreateReport): void => {
        if (
            reportIndex === currentCommentIndex &&
            currentLot?.id === comment.lot_id &&
            currentLot !== undefined
        ) {
            setCurrentLot(undefined);
        } else {
            setCurrentCommentIndex(reportIndex);
            setCurrentLot(item.lot);
        }
    };

    return (
        <Box>
            <Typography
                variant={isLargeLandscape ? 'h4' : 'h5'}
                color={NEUTRAL.darker}
                sx={{ textAlign: 'center', marginTop: isLargeLandscape ? '' : '15px' }}>
                {isModify ? t('editReport') : t('reportEmptyStateButtonTitle')}
            </Typography>
            <Typography
                variant="body1"
                color={NEUTRAL.medium}
                sx={{ textAlign: 'center', marginTop: '16px', display: isModify ? 'none' : '' }}>
                {t('detailReportOfEachLot')}
            </Typography>
            <Typography
                sx={{
                    ...small2,
                    color: theme.palette.secondary.medium,
                    paddingBottom: '16px',
                    marginTop: '32px',
                    display: isModify ? 'none' : ''
                }}>
                {t('requiredFields')}
            </Typography>
            <Box sx={{ width: '100%', marginBottom: '48px' }}>
                {formData.map((createReportData, index) => (
                    <Box key={index}>
                        <Typography mt={2} variant="h6" color={theme.palette.primary.main}>
                            {createReportData.lot.title}
                        </Typography>
                        <Typography variant="subtitle2" color={NEUTRAL.medium}>
                            {createReportData.lot.artisan_id
                                ? createReportData.lot.artisan_id.company_name
                                : ''}
                        </Typography>
                        {createReportData.commentInfo.map((lotComment, reportIndex) => {
                            const uploadedFiles: string | null = lotComment.fileUploaded
                                ? getSelectedFileNames(lotComment.fileUploaded)
                                : null;
                            const existingFiles: string | null =
                                lotComment.fileDetails.length > 0
                                    ? lotComment.fileDetails
                                          .map((detail) => detail.fileName)
                                          .join(', ')
                                    : null;

                            let fileList = '';
                            if (uploadedFiles === null && existingFiles !== null) {
                                fileList = existingFiles;
                            } else if (uploadedFiles !== null && existingFiles === null) {
                                fileList = uploadedFiles;
                            } else if (uploadedFiles !== null && existingFiles !== null) {
                                fileList = `${uploadedFiles}, ${existingFiles}`;
                            }
                            return (
                                <React.Fragment key={reportIndex}>
                                    <Box>
                                        <Stack
                                            onClick={(): void => {
                                                handleDrawer(
                                                    reportIndex,
                                                    lotComment,
                                                    createReportData
                                                );
                                            }}
                                            direction="row"
                                            alignItems="center"
                                            style={{
                                                justifyContent: 'space-between',
                                                marginTop: '16px'
                                            }}>
                                            <Typography variant="button" color={NEUTRAL.dark}>
                                                {t('remark')}
                                            </Typography>
                                            {reportIndex !== currentCommentIndex ||
                                            currentLot?.id !== lotComment.lot_id ? (
                                                <ChevronDown />
                                            ) : (
                                                <ChevronUp />
                                            )}
                                        </Stack>
                                        <Box
                                            style={{
                                                display:
                                                    (reportIndex !== currentCommentIndex ||
                                                        currentLot?.id !== lotComment.lot_id) &&
                                                    createReportData.commentInfo.length !==
                                                        reportIndex + 1
                                                        ? 'block'
                                                        : 'none',
                                                border: '1px solid',
                                                borderColor: NEUTRAL.light
                                            }}></Box>
                                        <Box
                                            sx={{
                                                display:
                                                    reportIndex !== currentCommentIndex ||
                                                    currentLot?.id !== lotComment.lot_id
                                                        ? 'none'
                                                        : '',
                                                marginTop: '12px'
                                            }}>
                                            {lotComment.comment !== '' && (
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'flex-end',
                                                        position: 'relative',
                                                        zIndex: 1
                                                    }}>
                                                    <X
                                                        style={{
                                                            color: theme.palette.error.main,
                                                            backgroundColor:
                                                                theme.palette.error.light,
                                                            borderRadius: '100%',
                                                            width: '20px',
                                                            height: '20px',
                                                            strokeWidth: '4',
                                                            position: 'absolute',
                                                            top: '-3px',
                                                            marginRight: '-9px',
                                                            cursor: 'pointer',
                                                            padding: '4px'
                                                        }}
                                                        onClick={(): void => {
                                                            const tempFormData = [...formData];
                                                            const lotLocation =
                                                                tempFormData.findIndex(
                                                                    (ele) =>
                                                                        ele.lot.id ===
                                                                        createReportData.lot.id
                                                                );
                                                            const commentLocation = tempFormData[
                                                                lotLocation
                                                            ].commentInfo.findIndex(
                                                                (commentEle) =>
                                                                    commentEle.id === lotComment.id
                                                            );
                                                            tempFormData[lotLocation].commentInfo[
                                                                commentLocation
                                                            ].comment = '';
                                                            setFormData(tempFormData);
                                                        }}
                                                    />
                                                </Box>
                                            )}
                                            <TextField
                                                fullWidth
                                                sx={{ marginTop: '12px' }}
                                                type="text"
                                                multiline
                                                minRows={2}
                                                value={lotComment.comment}
                                                onChange={(event): void =>
                                                    handleCommentChange(
                                                        event,
                                                        reportIndex,
                                                        createReportData.lot
                                                    )
                                                }
                                                required
                                                className={classes.multilineText}
                                                placeholder={t('workDescription')}
                                                label={t('workDescription')}
                                                id={'description'}
                                            />
                                            <input
                                                type="file"
                                                name="document"
                                                id="document"
                                                multiple
                                                accept="image/png, image/gif, image/jpeg"
                                                key={reportIndex}
                                                ref={inputFile}
                                                onChange={(
                                                    event: ChangeEvent<HTMLInputElement>
                                                ): void => {
                                                    if (
                                                        event.target.files &&
                                                        event.target.files[0] !== null
                                                    ) {
                                                        handleFileChange(event.target.files);
                                                    }
                                                }}
                                                style={{ display: 'none' }}
                                            />
                                            {fileList.length > 0 && (
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'flex-end',
                                                        position: 'relative',
                                                        zIndex: 1
                                                    }}>
                                                    <X
                                                        style={{
                                                            color: theme.palette.error.main,
                                                            backgroundColor:
                                                                theme.palette.error.light,
                                                            borderRadius: '100%',
                                                            width: '20px',
                                                            height: '20px',
                                                            strokeWidth: '4',
                                                            position: 'absolute',
                                                            top: '5px',
                                                            marginRight: '-9px',
                                                            cursor: 'pointer',
                                                            padding: '4px'
                                                        }}
                                                        onClick={(): void => {
                                                            const tempFormData = [...formData];
                                                            const lotLocation =
                                                                tempFormData.findIndex(
                                                                    (ele) =>
                                                                        ele.lot.id ===
                                                                        createReportData.lot.id
                                                                );
                                                            const commentLocation = tempFormData[
                                                                lotLocation
                                                            ].commentInfo.findIndex(
                                                                (commentEle) =>
                                                                    commentEle.id === lotComment.id
                                                            );
                                                            tempFormData[lotLocation].commentInfo[
                                                                commentLocation
                                                            ].fileUploaded = null;
                                                            tempFormData[lotLocation].commentInfo[
                                                                commentLocation
                                                            ].fileDetails = [];
                                                            tempFormData[lotLocation].commentInfo[
                                                                commentLocation
                                                            ].files = [];
                                                            setFormData(tempFormData);
                                                        }}
                                                    />
                                                </Box>
                                            )}

                                            <Stack
                                                direction="column"
                                                alignItems="center"
                                                sx={{
                                                    border: '1px solid',
                                                    borderColor: NEUTRAL.light,
                                                    margin: '15px 0px',
                                                    padding: '10px'
                                                }}
                                                onClick={(): void => {
                                                    triggerFileUpload();
                                                    setCurrentCommentIndex(reportIndex);
                                                    setCurrentLot(createReportData.lot);
                                                }}>
                                                <Camera style={{ color: NEUTRAL.medium }} />
                                                {fileList ? (
                                                    <>
                                                        <Typography
                                                            variant="body2"
                                                            color={NEUTRAL.medium}>
                                                            {fileList}
                                                        </Typography>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Typography
                                                            variant="body2"
                                                            color={NEUTRAL.medium}>
                                                            {t('addOrDragPhotos')}
                                                        </Typography>
                                                    </>
                                                )}
                                            </Stack>
                                        </Box>
                                    </Box>
                                </React.Fragment>
                            );
                        })}
                        <Button
                            variant={'outlined'}
                            color={'secondary'}
                            onClick={(): void => {
                                handleAddReportItem(createReportData.lot);
                                setCurrentCommentIndex(createReportData.commentInfo.length - 1);
                                setCurrentLot(createReportData.lot);
                            }}
                            startIcon={<Plus />}
                            sx={{
                                marginTop: '24px',
                                borderRadius: '4px',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                            {t('addAComment')}
                        </Button>
                    </Box>
                ))}
            </Box>
            {attachmentLimitExceeded ? (
                <Typography
                    color={theme.palette.error.main}
                    sx={{
                        ...body3
                    }}>
                    {t('maximumLimitOf50Items')}
                </Typography>
            ) : null}
            <Button
                fullWidth
                type="button"
                size="medium"
                disabled={isDisabled}
                sx={{
                    background: 'linear-gradient(90deg, #3360DB 0%, #DD6789 100%)',
                    opacity: !isDisabled ? 1 : 0.25,
                    marginTop: '48px',
                    marginBottom: '20px'
                }}
                onClick={(): Promise<void> => handleSubmit()}>
                <Typography
                    color={NEUTRAL.white}
                    sx={(): SystemStyleObject<Theme> => ({
                        ...button2,
                        fontWeight: 'bold',
                        margin: '1% 0%',
                        textTransform: 'none'
                    })}>
                    {isModify ? t('modifyButtonTitle') : t('createReport')}
                </Typography>
            </Button>
            <Button
                fullWidth
                type="button"
                size="medium"
                sx={{
                    border: '1px solid',
                    borderColor: theme.palette.secondary.main,
                    borderRadius: '4px',
                    marginBottom: '8px'
                }}
                onClick={(): void => {
                    handleCloseForm();
                    onClose();
                }}>
                <Typography
                    color={theme.palette.secondary.main}
                    sx={(): SystemStyleObject<Theme> => ({
                        ...button2,
                        fontWeight: 'bold',
                        margin: '1% 0%',
                        textTransform: 'none'
                    })}>
                    {t('return')}
                </Typography>
            </Button>
        </Box>
    );
}
