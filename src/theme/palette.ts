import { alpha, PaletteOptions } from '@mui/material';
import { PaletteColorOptions, SimplePaletteColorOptions } from '@mui/material/styles/createPalette';

declare module '@mui/material/styles/createPalette' {
    export interface SimplePaletteColorOptions {
        lighter?: string;
        light?: string;
        main: string;
        medium?: string;
        dark?: string;
        darker?: string;
        contrastText?: string;
    }
    export interface PaletteColor {
        lighter?: string;
        darker?: string;
        medium?: string;
    }
}

const GREY = {
    50: '#FFFFFF',
    100: '#D9D9D9',
    200: '#666666',
    300: '#DFE3E8',
    400: '#C4CDD5',
    500: '#919EAB',
    600: '#637381',
    700: '#454F5B',
    800: '#212B36',
    900: '#161C24',
    500_8: alpha('#919EAB', 0.08),
    500_12: alpha('#919EAB', 0.12),
    500_16: alpha('#919EAB', 0.16),
    500_24: alpha('#919EAB', 0.24),
    500_32: alpha('#919EAB', 0.32),
    500_48: alpha('#919EAB', 0.48),
    500_56: alpha('#919EAB', 0.56),
    500_80: alpha('#919EAB', 0.8)
};

const PRIMARY: SimplePaletteColorOptions = {
    lighter: '#A6AEE9',
    light: '#23308F',
    main: '#182162',
    medium: '#182162',
    dark: '#101641',
    darker: '#080B21',
    contrastText: '#fff'
};

const SECONDARY: SimplePaletteColorOptions = {
    lighter: '#BBCAF3',
    light: '#7795E7',
    medium: '#3360DB',
    main: '#3360DB',
    dark: '#1B3D99',
    darker: '#0E1E4D'
};

const INFO: PaletteColorOptions = {
    light: '#C4EDFB',
    main: '#0C8DB8',
    dark: '#05384A'
};

const SUCCESS: PaletteColorOptions = {
    light: '#D9F5C4',
    main: '#4A8F18',
    dark: '#25480C'
};

const WARNING: PaletteColorOptions = {
    light: '#F5CBA6',
    main: '#DE7619',
    dark: '#85470F'
};

const ERROR: PaletteColorOptions = {
    light: '#F3C7C6',
    medium: '#C22A29',
    main: '#C22A29',
    dark: '#791A1A'
};

export const NEUTRAL = {
    white: '#FFFFFF',
    lighter: '#FAFAFA',
    black: '#000000',
    dark: '#404040',
    darker: '#262626',
    medium: '#666666',
    light: '#D9D9D9'
};

export const PINK = {
    lighter: '#F7D9E1',
    light: '#EEB3C4',
    medium: '#DD6789',
    main: '#DD6789',
    dark: '#D13260',
    darker: '#6A182F'
};

export const BLUE = {
    lighter: '#D3F8EE',
    light: '#A8F0DC',
    medium: '#7CE9CB',
    main: '#7CE9CB',
    dark: '#22CC9D',
    darker: '#157A5E'
};

export const ACCENT_SUNSET = {
    medium: '#F6C968',
    darker: '#7C5707',
    dark: '#F4BA3F',
    light: '#F8D486',
    lighter: '#FBE4B3'
};

export const ONBOARDING_PAYMENT_BUTTON = {
    selected: '#46EDCA'
};
export const SwitchColor = {
    OFF: '#EE5E89',
    ON: '#46EDCA'
};

export const palette: PaletteOptions = {
    common: { black: '#000', white: '#fff' },
    primary: { ...PRIMARY },
    secondary: { ...SECONDARY },
    info: { ...INFO },
    success: { ...SUCCESS },
    warning: { ...WARNING },
    error: { ...ERROR },
    grey: GREY,
    divider: GREY[500_24],
    text: { primary: PRIMARY.main, secondary: GREY[600], disabled: GREY[500] },
    background: { paper: '#fff', default: '#ffffff' },
    action: {
        active: GREY[600],
        hover: GREY[500_8],
        selected: GREY[500_16],
        disabled: GREY[500_80],
        disabledBackground: GREY[500_24],
        focus: GREY[500_24],
        hoverOpacity: 0.08,
        disabledOpacity: 0.48
    }
};
