import { MenuItem } from '@mui/material';
import styled from 'styled-components';

export const StyledMenuItem = styled(MenuItem)({
    '.MuiTypography-root': {
        overflow: 'scroll',
        '&::-webkit-scrollbar': {
            display: 'none',
            height: '0px',
            width: '0px'
        },
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
    }
});
