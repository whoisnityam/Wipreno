import React, { useEffect, useState } from 'react';
import { Box, InputAdornment, TextField } from '@mui/material';
import { Search } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../Hooks/useDebounce';

interface SearchbarProps {
    type?: 'outlined' | 'standard';
    searchText: string;
    onChange: (searchTerm: string) => void;
    onClick?: Function;
    width?: string;
    iconAtRight?: boolean;
    label?: string;
}

export function Searchbar({
    type = 'standard',
    searchText,
    onChange,
    width = 'auto',
    iconAtRight,
    label,
    onClick = (): void => {}
}: SearchbarProps): React.ReactElement {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState(searchText);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(
        () => {
            onChange(searchTerm);
        },
        [debouncedSearchTerm] // Only call effect if debounced search term changes
    );

    return (
        <>
            {type === 'outlined' ? (
                <TextField
                    variant={'outlined'}
                    sx={{
                        '& .MuiOutlinedInput-input': {
                            marginTop: '-12px'
                        },
                        width
                    }}
                    placeholder={t('searchByNameLabel')}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search
                                    style={{ marginBottom: '4px' }}
                                    onClick={(): void => {
                                        onClick();
                                    }}
                                />
                            </InputAdornment>
                        )
                    }}
                    defaultValue={searchText}
                    onChange={(event): void => setSearchTerm(event.target.value)}
                />
            ) : iconAtRight ? (
                <Box pt={1} sx={{ display: 'inline-block', height: '100%', width: '100%' }}>
                    <TextField
                        fullWidth
                        variant={'standard'}
                        sx={{
                            width,
                            margin: 'auto 0'
                        }}
                        label={label}
                        InputLabelProps={{
                            shrink: true
                        }}
                        autoFocus
                        InputProps={{
                            disableUnderline: true,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Search
                                        onClick={(): void => {
                                            onClick();
                                        }}
                                    />
                                </InputAdornment>
                            )
                        }}
                        defaultValue={searchText}
                        onChange={(event): void => setSearchTerm(event.target.value)}
                    />
                </Box>
            ) : (
                <TextField
                    variant={'standard'}
                    sx={{
                        width
                    }}
                    placeholder={t('searchByNameLabel')}
                    InputProps={{
                        disableUnderline: true,
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search
                                    onClick={(): void => {
                                        onClick();
                                    }}
                                />
                            </InputAdornment>
                        )
                    }}
                    defaultValue={searchText}
                    onChange={(event): void => setSearchTerm(event.target.value)}
                />
            )}
        </>
    );
}
