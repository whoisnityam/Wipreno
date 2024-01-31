import React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { NEUTRAL } from '../../theme/palette';
import { small1 } from '../../theme/typography';

export interface CollapsableType {
    title: string;
    titleColor?: string;
    count?: number;
    subtitle?: React.ReactElement;
    actionButton?: React.ReactElement;
    children?: React.ReactElement;
}

export function Collapsable({
    title,
    titleColor,
    subtitle,
    count,
    actionButton,
    children
}: CollapsableType): React.ReactElement {
    return (
        <Accordion
            disableGutters
            sx={{
                boxShadow: 'unset',
                background: 'transparent',
                '&.MuiAccordion-root:before': { opacity: 0 }
            }}>
            <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="collapsable-content"
                id="collapsable-header"
                sx={{ padding: '0' }}>
                <Stack spacing={'8px'}>
                    <Stack direction={'row'} spacing={'8px'} alignItems={'center'}>
                        <Typography variant={'h6'} color={titleColor ?? 'primary'}>
                            {title}
                        </Typography>
                        {count ? (
                            <Typography sx={{ ...small1 }} color={NEUTRAL.medium}>
                                ({count})
                            </Typography>
                        ) : (
                            <></>
                        )}
                        {actionButton ? actionButton : <></>}
                    </Stack>
                    {subtitle ?? <></>}
                </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: '0' }}>{children}</AccordionDetails>
        </Accordion>
    );
}
