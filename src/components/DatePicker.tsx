import * as React from 'react';
import TextField from '@mui/material/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import fr from 'date-fns/locale/fr';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { SxProps, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { NEUTRAL } from '../theme/palette';

interface DatePickerCustomProps {
    onDateChange: (newValue: Date | null) => void;
    value: Date | null;
    label: string;
    sx?: SxProps;
    disabled?: boolean;
    classReceived?: string;
    readonly?: boolean;
    startFromToday?: boolean;
    required?: boolean;
}

export function DatePicker({
    onDateChange,
    sx,
    value,
    label,
    disabled = false,
    classReceived,
    readonly,
    startFromToday,
    required
}: DatePickerCustomProps): JSX.Element {
    const today = new Date();
    const theme = useTheme();
    const useStyles = makeStyles(() => ({
        labelColor: {
            color: theme.palette.primary.main
        }
    }));

    const classes = useStyles();

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <DesktopDatePicker
                minDate={startFromToday ? today : undefined}
                disabled={disabled}
                readOnly={readonly}
                label={label}
                inputFormat="dd/MM/yyyy"
                value={value}
                onChange={(newValue: Date | null): void => onDateChange(newValue)}
                renderInput={(params): React.ReactElement => (
                    <TextField
                        required={required}
                        style={{ color: NEUTRAL.medium }}
                        InputLabelProps={{
                            className: value === null ? '' : classes.labelColor
                        }}
                        className={classReceived ?? ''}
                        {...params}
                        inputProps={{
                            ...params.inputProps,
                            placeholder: 'jj/mm/aaaa'
                        }}
                        sx={{ ...sx }}
                    />
                )}
            />
        </LocalizationProvider>
    );
}
