import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    Box,
    Checkbox,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select,
    Typography,
    useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { ConsultationFormContainer } from './ConsultationFormContainer';
import { NEUTRAL } from '../../../../theme/palette';
import { SystemStyleObject, Theme } from '@mui/system';
import { button2 } from '../../../../theme/typography';
import { useParams } from 'react-router-dom';
import { Lot } from '../../models/Lot';
import { getArtisansByEnterpriseId } from '../../services/ConsultationServices';
import { User } from '../../../profile/models/User';
import { UserContext } from '../../../../provider/UserProvider';
import { SelectArtisan } from '../../models/SelectArtisan';
import { ProjectContext } from '../../layout/ProjectDetailLayout';
import { getLots } from '../../services/LotService';

interface FormStepOneProps {
    initialValues: {
        lots: Lot[];
        selectedArtisan: SelectArtisan[];
    };
    onSubmit: Function;
    onClose: Function;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250
        }
    }
};

export function ConsultationFormStepOne({
    initialValues,
    onSubmit,
    onClose
}: FormStepOneProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();
    const { id } = useParams();
    const projectContext = useContext(ProjectContext);
    const notice = projectContext?.project?.notices?.at(0);
    const user = useContext(UserContext);
    const mountedRef = useRef(true);
    const [lots, setLots] = useState<Lot[]>([]);
    const [allArtisans, setAllArtisans] = useState<User[]>([]);
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const [selectedArtisans, setSelectedArtisans] = useState<SelectArtisan[]>([]);

    useEffect(() => {
        mountedRef.current = true;
    });

    const fetchLots = async (): Promise<void | null> => {
        const data = await getLots(notice!.id);
        if (!mountedRef.current) return null;
        setLots(data);
    };

    const fetchArtisans = async (enterpriseId: string): Promise<void | null> => {
        const data = await getArtisansByEnterpriseId(enterpriseId);
        if (!mountedRef.current) return null;
        setAllArtisans(data);
    };

    useEffect(() => {
        if (user.user && user.user?.enterprises.at(0)!.enterprise_id.id) {
            fetchArtisans(user.user.enterprises.at(0)!.enterprise_id.id);
        }
        return (): void => {
            mountedRef.current = false;
        };
    }, [user]);

    useEffect(() => {
        if (notice) {
            fetchLots();
        }
        return (): void => {
            mountedRef.current = false;
        };
    }, [id]);

    useEffect(() => {
        if (initialValues.selectedArtisan.length > 0) {
            setSelectedArtisans([...initialValues.selectedArtisan]);
        }
        if (initialValues.lots.length > 0) {
            setLots([...initialValues.lots]);
        }
        return (): void => {
            mountedRef.current = false;
        };
    }, [initialValues]);

    const form = useFormik({
        initialValues,
        onSubmit: async () => {
            onSubmit({ lots, selectedArtisans: [...selectedArtisans] });
        }
    });
    const handleArtisanSelect = (artisanSelected: User, lotid: string): void => {
        const list = allArtisans;
        let userPresent = false;
        const currentSelected = list.filter((element) => {
            if (element.id.toString() === artisanSelected.id) {
                const selectedArtisansList = selectedArtisans;
                selectedArtisans.map((item, index) => {
                    if (item.artisan?.id === artisanSelected.id && item.lotId === lotid) {
                        userPresent = true;
                        if (index > -1) {
                            selectedArtisansList.splice(index, 1);
                        }
                    }
                });
                if (userPresent) {
                    setSelectedArtisans([...selectedArtisansList]);
                }
                return element;
            }
            return null;
        });
        if (currentSelected && !userPresent) {
            setSelectedArtisans([
                ...selectedArtisans,
                { lotId: lotid, artisan: currentSelected[0] }
            ]);
        }
    };

    const isChecked = (lotId: string, artisanId: string): boolean => {
        let checked = false;
        selectedArtisans.map((item) => {
            if (item.artisan?.id === artisanId && item.lotId === lotId) {
                checked = true;
            }
        });
        return checked;
    };

    const displaySelectedValues = (lotId: string): string[] => {
        const str: string[] = [];
        selectedArtisans.map((item) => {
            if (item.lotId === lotId) {
                str.push(`${item.artisan?.first_name} ${item.artisan.last_name}` ?? '');
            }
        });
        return str;
    };

    const validateNextButton = (): void => {
        if (selectedArtisans.length > 0) {
            setIsDisabled(false);
        } else {
            setIsDisabled(true);
        }
    };

    useEffect(() => {
        validateNextButton();
        return (): void => {
            mountedRef.current = false;
        };
    }, [selectedArtisans]);

    const { submitForm } = form;
    return (
        <ConsultationFormContainer
            primaryButtonDisabled={isDisabled}
            primaryButtonOnClick={submitForm}
            secondaryButtonVisible={true}
            currentStep={0}
            secondaryButtonOnClick={onClose}>
            <Box>
                <Typography
                    variant="h4"
                    sx={{ color: NEUTRAL.darker, textAlign: 'center', padding: '0px 10px' }}>
                    {t('createConsultation')} {'(1/2)'}
                </Typography>
                <Typography
                    color={theme.palette.secondary.main}
                    sx={(): SystemStyleObject<Theme> => ({
                        ...button2,
                        fontWeight: 'bold',
                        marginTop: '32px',
                        marginBottom: '16px'
                    })}>
                    {t('requiredFields')}
                </Typography>
                <Box sx={{ width: '100%', marginBottom: '48px' }}>
                    {lots.map((lot, index) => (
                        <Box key={index}>
                            <Typography
                                mt={2}
                                mb={2}
                                variant="h6"
                                color={theme.palette.primary.main}>
                                {lot.title}
                            </Typography>
                            <FormControl sx={{ width: '100%' }}>
                                <InputLabel id="demo-multiple-checkbox-label">
                                    {t('companies')}
                                </InputLabel>
                                <Select
                                    required
                                    labelId="demo-multiple-checkbox-label"
                                    id="demo-multiple-checkbox"
                                    multiple
                                    value={displaySelectedValues(lot.id)}
                                    input={<OutlinedInput label="Tag" />}
                                    renderValue={(selected): string => selected.join(', ')}
                                    MenuProps={MenuProps}>
                                    {allArtisans.map((artisan) => (
                                        <MenuItem
                                            key={artisan.id}
                                            value={artisan.id}
                                            onClick={(): void =>
                                                handleArtisanSelect(artisan, lot.id)
                                            }>
                                            <Checkbox checked={isChecked(lot.id, artisan.id)} />
                                            <ListItemText
                                                sx={{ whiteSpace: 'pre-wrap' }}
                                                primary={`${artisan.first_name} ${
                                                    artisan.last_name
                                                },${' '}(${artisan.company_name})`}
                                            />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    ))}
                </Box>
            </Box>
        </ConsultationFormContainer>
    );
}
