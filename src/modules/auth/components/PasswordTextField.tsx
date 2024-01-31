import { IconButton, TextField, TextFieldProps, useMediaQuery, useTheme } from '@mui/material';
import { Eye, EyeOff } from 'react-feather';
import React, { useState } from 'react';

export const PasswordTextField = (props: TextFieldProps): React.ReactElement => {
    const [showPassword, setShowPassword] = useState(false);
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));

    return (
        <TextField
            variant="outlined"
            type={showPassword ? 'text' : 'password'}
            InputProps={{
                endAdornment: (
                    <IconButton
                        aria-label="toggle password visibility"
                        onClick={(): void => setShowPassword(!showPassword)}
                        edge="end">
                        {!isLarge && (
                            <>
                                {showPassword ? (
                                    <Eye height="20px" color={theme.palette.primary.medium} />
                                ) : (
                                    <EyeOff height="20px" color={theme.palette.primary.medium} />
                                )}
                            </>
                        )}
                        {isLarge && <>{showPassword ? <Eye /> : <EyeOff />}</>}
                    </IconButton>
                )
            }}
            {...props}
        />
    );
};
