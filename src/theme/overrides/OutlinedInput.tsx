import { Components, Theme } from '@mui/material';
import { NEUTRAL } from '../palette';

export function OutlinedInput(_theme: Theme): Components {
    return {
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    height: '48px',
                    background: 'white',
                    '&.Mui-focused fieldset': {
                        borderColor: `${_theme.palette.primary.light} !important`
                    }
                },
                notchedOutline: {
                    '& legend': {
                        display: 'none'
                    }
                },
                input: {
                    color: NEUTRAL.medium,
                    ..._theme.typography.body2,
                    paddingTop: '25px',
                    height: '13px',
                    borderRadius: '4px'
                }
            }
        }
    };
}
