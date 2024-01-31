import { Components, Theme } from '@mui/material';
import { NEUTRAL } from '../palette';
import { small1 } from '../typography';

export function StandardInput(_theme: Theme): Components {
    return {
        MuiInput: {
            styleOverrides: {
                input: {
                    color: NEUTRAL.medium,
                    ...small1
                }
            }
        }
    };
}
