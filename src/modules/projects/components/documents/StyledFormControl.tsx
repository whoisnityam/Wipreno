import { FormControl } from '@mui/material';
import styled from 'styled-components';

export const StyledFormControl = styled(FormControl)({
    '.MuiTypography-root': {
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    }
});
