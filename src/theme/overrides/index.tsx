import { merge } from 'lodash';
import { Components, Theme } from '@mui/material';
import { Button } from './Button';
import { InputLabel } from './InputLabel';
import { OutlinedInput } from './OutlinedInput';
import { Select } from './Select';
import { StandardInput } from './StandardInput';
import { TableCell } from './TableCell';

export function ComponentsOverrides(_theme: Theme): Components {
    // Material UI component overrides
    // The components theat need to be overriden has to be put in its own file and imported here.
    return merge(
        Button(_theme),
        InputLabel(_theme),
        OutlinedInput(_theme),
        StandardInput(_theme),
        Select(_theme),
        TableCell(_theme)
    );
}
