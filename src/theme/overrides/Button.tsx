import { Components, Theme } from '@mui/material';

export function Button(theme: Theme): Components {
    return {
        MuiButton: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        boxShadow: 'none'
                    },
                    textTransform: 'none'
                },
                sizeMedium: {
                    height: 48
                },
                sizeLarge: {
                    height: 56
                },
                outlinedPrimary: {
                    border: `1px solid ${theme.palette.secondary.main}`,
                    borderRadius: '4px',
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover
                    },
                    color: theme.palette.secondary.main
                },
                containedPrimary: {
                    textTransform: 'none',
                    color: theme.palette.background.default,
                    background: 'linear-gradient(90deg, #3360DB 0%, #DD6789 100%)',
                    '&:hover': {
                        color: theme.palette.background.default,
                        borderRadius: '4px'
                    },
                    '&.Mui-disabled': {
                        color: theme.palette.background.default,
                        background: 'linear-gradient(90deg, #C9D3EE 0%, #EED6DE 100%)'
                    }
                },
                containedSecondary: {
                    color: theme.palette.primary.darker,
                    backgroundColor: theme.palette.secondary.lighter,
                    borderRadius: '4px',
                    boxShadow: 'none',
                    '&:hover': {
                        color: theme.palette.background.default,
                        backgroundColor: theme.palette.secondary.light
                    },
                    '&.Mui-disabled': {
                        background: theme.palette.secondary.lighter,
                        opacity: '0.25'
                    }
                }
            }
        }
    };
}
