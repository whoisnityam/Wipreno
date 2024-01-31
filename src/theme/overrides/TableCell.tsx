import { Components, Theme } from '@mui/material';
import { small1 } from '../typography';
import { NEUTRAL } from '../palette';

export function TableCell(_theme: Theme): Components {
    return {
        MuiTableCell: {
            styleOverrides: {
                root: {
                    paddingRight: 0
                },
                head: {
                    ...small1,
                    color: NEUTRAL.darker
                },
                body: {
                    ..._theme.typography.body2,
                    color: NEUTRAL.medium,
                    borderBottom: 'none'
                }
            }
        }
    };
}
