import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { Button, FormControlLabel, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ModalContainer } from '../../../../components/ModalContainer';
import { formatDate } from '../../../../utils';
import { NEUTRAL } from '../../../../theme/palette';
import { Slot } from '../../models/Slot';
import { makeTwoDigits } from './ConsultationPreview';

interface SlotSelectModalProps {
    isModalOpen: boolean;
    title: string;
    singleSlotDate: Slot;
    enterpriseName: string;
    handleSelectedSlot: (slotId: string, slotOption: string) => void;
    onClose: Function;
    timeSlot?: string;
}

const calculateSlotOptions = (startDate: Date, endDate: Date): string[] => {
    const slotOptions: string[] = [];

    let startHours = startDate.getHours();
    const originalStartMins = startDate.getMinutes();
    const startMinutes = Math.ceil(startDate.getMinutes() / 15) * 15;
    if (startMinutes === 60) {
        startHours = startHours + 1;
    }

    const endHours = endDate.getHours();
    const originalEndMins = endDate.getMinutes();
    const endMinutes = Math.floor(endDate.getMinutes() / 15) * 15;

    // If the interval is less than 15 mins, the start time of the interval is given as the only option.
    if (startHours === endHours && originalEndMins - originalStartMins < 15) {
        const slotOption = `${makeTwoDigits(startHours.toString())}h${makeTwoDigits(
            originalStartMins.toString()
        )}`;
        return [slotOption];
    }

    // Find slots that conform with Xh15, Xh30, Xh45 and Xh00.
    let j = 0;
    for (let i = startHours * 60 + startMinutes; i < endHours * 60 + endMinutes; i = i + 15) {
        j = j + 1;
        const hourComponent = Math.floor(i / 60);
        const minuteComponent = i - hourComponent * 60;
        const slotOption = `${makeTwoDigits(hourComponent.toString())}h${makeTwoDigits(
            minuteComponent.toString()
        )}`;
        slotOptions.push(slotOption);
    }

    // Or if no valid timeslot exists by the above logic
    if (j === 0) {
        const slotOption = `${makeTwoDigits(startHours.toString())}h${makeTwoDigits(
            startMinutes.toString()
        )}`;
        return [slotOption];
    }

    return slotOptions;
};

export function SlotSelectModal({
    isModalOpen,
    title,
    singleSlotDate,
    enterpriseName,
    handleSelectedSlot,
    onClose,
    timeSlot
}: SlotSelectModalProps): React.ReactElement {
    const { t } = useTranslation();

    const formattedTimeSlot = timeSlot ? timeSlot.replace(':', 'h') : undefined;
    const [selectedSlotOption, setSelectedSlotOption] = useState<string>(
        formattedTimeSlot ? formattedTimeSlot : ''
    );

    const visitDate = formatDate(new Date(singleSlotDate.visit_date));
    const startTime = formatDate(new Date(singleSlotDate.start_time));
    const endTime = formatDate(new Date(singleSlotDate.end_time));

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setSelectedSlotOption((event.target as HTMLInputElement).value);
    };

    const formattedVisitDate = `${visitDate.getDate()}.${
        visitDate.getMonth() + 1
    }.${visitDate.getUTCFullYear()}`;

    const slotOptions = calculateSlotOptions(startTime, endTime);

    const RenderSlotSelectModal = (): React.ReactElement => {
        return (
            <Stack>
                <Typography color={NEUTRAL.darker} textAlign="center" variant="h4">
                    {title}
                </Typography>
                <Box height="16px" />
                <Stack direction="row" justifyContent="center" alignItems="center">
                    <Typography color={NEUTRAL.medium} variant="body1">
                        {t('consultationOf')}
                    </Typography>
                    &nbsp;
                    <Typography color={NEUTRAL.medium} variant="h6">
                        {formattedVisitDate}
                    </Typography>
                    &nbsp;
                    <Typography color={NEUTRAL.medium} variant="body1">
                        {t('with')}
                    </Typography>
                    &nbsp;
                    <Typography color={NEUTRAL.medium} variant="h6">
                        {enterpriseName}
                    </Typography>
                </Stack>
                <Box height="24px" />
                <RadioGroup row value={selectedSlotOption} onChange={handleChange}>
                    {slotOptions.map((slotOption, index) => {
                        return (
                            <Stack key={index} direction="row">
                                {index % 2 === 1 ? <Box width="30px" /> : <></>}
                                <FormControlLabel
                                    sx={{}}
                                    value={slotOption}
                                    control={<Radio />}
                                    label={
                                        <Typography color={NEUTRAL.medium} variant="body2">
                                            {slotOption}
                                        </Typography>
                                    }
                                />
                                {index % 2 === 1 ? <Box width="70px" /> : <></>}
                            </Stack>
                        );
                    })}
                    <FormControlLabel
                        value="none"
                        control={<Radio />}
                        label={
                            <Typography color={NEUTRAL.medium} variant="body2">
                                {t('notAvailableAtSlots')}
                            </Typography>
                        }
                    />
                </RadioGroup>
                <Box height="48px" />
                <Button
                    disabled={selectedSlotOption === ''}
                    variant="contained"
                    onClick={(): void => {
                        if (selectedSlotOption) {
                            handleSelectedSlot(singleSlotDate.id, selectedSlotOption);
                            onClose();
                        }
                    }}>
                    {t('slotTimingSubmit')}
                </Button>
                <Box height="20px" />
                <Button variant="outlined" onClick={(): void => onClose()}>
                    {t('return')}
                </Button>
            </Stack>
        );
    };

    return (
        <div>
            <ModalContainer
                sx={{ padding: '40px !important' }}
                isModalOpen={isModalOpen}
                content={RenderSlotSelectModal()}
                onClose={(): void => onClose()}
            />
        </div>
    );
}
