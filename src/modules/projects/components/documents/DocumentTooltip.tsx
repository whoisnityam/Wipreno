import { styled, Tooltip, tooltipClasses, TooltipProps } from '@mui/material';
import { Info } from 'react-feather';
import React from 'react';
import { NEUTRAL } from '../../../../theme/palette';
import { body3 } from '../../../../theme/typography';

const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: theme.palette.common.white,
        color: NEUTRAL.medium,
        padding: '16px',
        maxWidth: '225px'
    }
}));

export const DocumentTooltip = ({ title }: { title: string }): React.ReactElement => {
    return (
        <CustomTooltip sx={body3} placement="bottom-end" title={title}>
            <Info />
        </CustomTooltip>
    );
};
