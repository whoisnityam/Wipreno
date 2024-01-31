import { BreakpointsOptions, createTheme } from '@mui/material';

const defaultTheme = createTheme();
export const breakpoints: BreakpointsOptions = {
    values: {
        ...defaultTheme.breakpoints.values,
        md: 920
    }
};
