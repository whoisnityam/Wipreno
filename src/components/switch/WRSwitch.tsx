import React from 'react';
import { Switch } from '@mui/material';
import { NEUTRAL } from '../../theme/palette';

interface WRSwitchProps {
    handleToggle: Function;
    value: boolean;
    disabled?: boolean;
    color?: string;
    thumbColor?: string;
    backgroundColor?: string;
}

export function WRSwitch({
    handleToggle,
    value,
    disabled = false,
    color = NEUTRAL.medium,
    thumbColor = color,
    backgroundColor = 'none'
}: WRSwitchProps): React.ReactElement {
    return (
        <Switch
            sx={{
                width: '60px',
                margin: `0 !important`,
                '.MuiSwitch-thumb': {
                    height: '8px',
                    width: '8px',
                    marginTop: '7px',
                    marginLeft: '7px',
                    border: `4px solid ${thumbColor}`,
                    background: 'none !important'
                },
                '.MuiSwitch-track': {
                    height: '16px',
                    width: '36px',
                    borderRadius: '10px',
                    border: `2px solid ${color}`,
                    opacity: `1 !important`,
                    background: `${backgroundColor} !important`
                }
            }}
            disabled={disabled}
            checked={value}
            disableRipple={true}
            disableFocusRipple={true}
            onClick={(): void => handleToggle()}
        />
    );
}
