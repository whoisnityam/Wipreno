import { Components, Theme } from '@mui/material';
import { FONT_SECONDARY } from '../typography';
import { NEUTRAL } from '../palette';

export function InputLabel(_theme: Theme): Components {
    return {
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    marginTop: '-4px',
                    color: NEUTRAL.light,
                    fontFamily: FONT_SECONDARY,
                    fontSize: '14px'
                },
                shrink: {
                    color: _theme.palette.primary.medium,
                    marginTop: '10px'
                }
            }
        }
    };
}
