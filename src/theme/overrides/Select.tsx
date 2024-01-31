import { Components, Theme } from '@mui/material';
import { NEUTRAL } from '../palette';

export function Select(_theme: Theme): Components {
    return {
        MuiSelect: {
            styleOverrides: {
                iconStandard: {
                    color: NEUTRAL.black
                },
                standard: {
                    ..._theme.typography.subtitle2,
                    color: NEUTRAL.black
                }
            }
        }
    };
}
