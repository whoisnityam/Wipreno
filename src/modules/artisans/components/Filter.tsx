import React, { ReactNode } from 'react';
import { Select } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

interface FilterProps {
    children: ReactNode;
    selected: string;
    onChange: Function;
}

export function Filter({ children, selected, onChange }: FilterProps): React.ReactElement {
    return (
        <Select
            variant={'standard'}
            defaultValue={selected}
            IconComponent={ExpandMore}
            disableUnderline
            onChange={(event): void => onChange(event.target.value)}>
            {children}
        </Select>
    );
}
