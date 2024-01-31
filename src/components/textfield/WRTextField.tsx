import React from 'react';
import NumberFormat, { NumberFormatValues } from 'react-number-format';
import { TextField } from '@mui/material';

export interface TextFieldProps {
    requiredValue: number | undefined;
    onValueChange?: (value: number | undefined) => void;
    readonly?: boolean;
    width?: string;
    float?: boolean;
    isMoney?: boolean;
    margin?: string;
    label: string;
    required?: boolean;
    fullWidth?: boolean;
    suffix?: string;
}

export function WRTextField({
    requiredValue,
    onValueChange,
    readonly,
    label,
    float,
    required,
    margin,
    isMoney,
    suffix,
    fullWidth
}: TextFieldProps): React.ReactElement {
    const MAX_VAL = float ? 10000000000 : 10000000;
    const withValueLimit = ({ floatValue }: NumberFormatValues): boolean => {
        if (floatValue) {
            return floatValue <= MAX_VAL;
        } else {
            return true;
        }
    };
    return (
        <NumberFormat
            customInput={TextField}
            value={requiredValue}
            displayType={'input'}
            thousandSeparator={' '}
            label={label}
            fullWidth={fullWidth}
            required={required}
            decimalSeparator={','}
            isAllowed={withValueLimit}
            decimalScale={float ? 2 : 0}
            sx={{ margin: margin ?? '0' }}
            disabled={readonly}
            suffix={suffix ? suffix : isMoney ? '€' : ''}
            allowNegative={isMoney}
            onValueChange={(e: NumberFormatValues): void => {
                if (onValueChange) {
                    onValueChange(e.floatValue);
                }
            }}
        />
    );
}
