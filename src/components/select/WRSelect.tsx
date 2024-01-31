import { FormControl, InputLabel, Select, SelectChangeEvent, SxProps } from '@mui/material';
import React from 'react';

interface WRSelectProps {
    label: string;
    value?: string | undefined;
    values?: string[];
    children: React.ReactElement[];
    renderValue?: (selected: string[]) => string;
    onChange:
        | ((event: SelectChangeEvent<string | string[]>, child: React.ReactNode) => void)
        | undefined;
    sx?: SxProps;
    multiple?: boolean;
    notrequired?: boolean;
    disabled?: boolean;
    name?: string;
}

export function WRSelect({
    label,
    value,
    values = [],
    children,
    renderValue = (): string => '',
    onChange,
    sx,
    disabled,
    notrequired,
    multiple = false,
    name = label
}: WRSelectProps): React.ReactElement {
    return (
        <FormControl sx={{ ...sx }}>
            <InputLabel required={notrequired ? false : true} id={label}>
                {label}
            </InputLabel>
            {multiple ? (
                <Select
                    disabled={disabled}
                    fullWidth
                    multiple
                    labelId={label}
                    id={label}
                    value={values}
                    label={label}
                    name={label}
                    renderValue={renderValue}
                    onChange={onChange}>
                    {children}
                </Select>
            ) : (
                <Select
                    disabled={disabled}
                    fullWidth
                    labelId={label}
                    id={label}
                    value={value}
                    label={label}
                    name={name}
                    onChange={onChange}>
                    {children}
                </Select>
            )}
        </FormControl>
    );
}
