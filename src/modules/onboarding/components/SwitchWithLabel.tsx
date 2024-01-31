import * as React from 'react';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { small1 } from '../../../theme/typography';
import { WRSwitch } from '../../../components/switch/WRSwitch';
import { NEUTRAL } from '../../../theme/palette';
import { useTheme } from '@mui/material';

interface SwitchWithLabelProps {
    rightValue: string;
    leftValue: string;
    selected: string;
    handleToggle: Function;
    backgroungColor?: string;
}

export const SwitchWithLabel = ({
    rightValue,
    leftValue,
    selected,
    handleToggle,
    backgroungColor = 'none'
}: SwitchWithLabelProps): React.ReactElement => {
    const theme = useTheme();

    const getColor = (value: string): string => {
        if (selected === value) {
            return NEUTRAL.medium;
        } else {
            return NEUTRAL.light;
        }
    };
    return (
        <FormGroup>
            <Stack direction="row" spacing={1} alignItems="center">
                <Typography color={getColor(leftValue)} sx={small1}>
                    {leftValue}
                </Typography>
                <WRSwitch
                    backgroundColor={backgroungColor}
                    thumbColor={theme.palette.grey[50]}
                    value={selected === rightValue ? true : false}
                    handleToggle={handleToggle}
                />
                <Typography color={getColor(rightValue)} sx={small1}>
                    {rightValue}
                </Typography>
            </Stack>
        </FormGroup>
    );
};
