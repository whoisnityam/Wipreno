import React, { ChangeEventHandler } from 'react';
import NumberFormat, { NumberFormatValues } from 'react-number-format';
import { TextareaAutosize, TextField, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FONT_SECONDARY } from '../../theme/typography';

export interface TableTextFieldProps {
    requiredValue: number | string | undefined;
    onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    onValueChange?: (value: number | undefined) => void;
    readonly?: boolean;
    numberOnly?: boolean;
    width?: string;
    float?: boolean;
    isMoney?: boolean;
}

export function TableTextField({
    requiredValue,
    onChange,
    onValueChange,
    readonly,
    numberOnly,
    width,
    float,
    isMoney
}: TableTextFieldProps): React.ReactElement {
    const theme = useTheme();
    const useStyles = makeStyles(() => ({
        textArea: {
            '& .MuiOutlinedInput-root': {
                height: '32px',
                width
            },
            '& .MuiOutlinedInput-input': {
                marginTop: '-12px'
            },
            padding: '12px',
            borderRadius: '4px',
            outlineColor: '#23308F'
        }
    }));

    const classes = useStyles();

    if (numberOnly) {
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
                decimalSeparator={','}
                isAllowed={withValueLimit}
                decimalScale={float ? 2 : 0}
                disabled={readonly}
                suffix={isMoney ? '€' : ''}
                allowNegative={isMoney}
                onValueChange={(e: NumberFormatValues): void => {
                    if (onValueChange) onValueChange(e.floatValue);
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        height: '42px',
                        width
                    },
                    '& .MuiOutlinedInput-input': {
                        marginTop: '-12px'
                    }
                }}
            />
        );
    } else {
        return (
            <TextareaAutosize
                aria-label="textarea"
                style={{
                    width: '100%',
                    minWidth: '120px',
                    resize: 'none',
                    color: theme.palette.grey[200],
                    fontWeight: 400,
                    lineHeight: 1.5,
                    fontFamily: FONT_SECONDARY,
                    fontSize: '14px',
                    borderColor: 'rgba(0, 0, 0, 0.23)'
                }}
                value={requiredValue}
                className={classes.textArea}
                onChange={onChange}
            />
        );
    }
}
