import { Box, Typography } from '@mui/material';
import React from 'react';
import { fontWeightSemiBold, small2 } from '../../../theme/typography';

interface HighlightBoxProps {
    text: string | number;
    fontColour: string;
    backgroundColour: string;
}

export function HighlightBox({
    text,
    fontColour,
    backgroundColour
}: HighlightBoxProps): React.ReactElement {
    if (typeof text === 'string') {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: backgroundColour,
                    width: 'fit-content'
                }}>
                <Typography
                    sx={{
                        ...small2,
                        color: fontColour,
                        padding: '4px 8px',
                        fontWeight: fontWeightSemiBold,
                        maxWidth: '100px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                    {text}
                </Typography>
            </Box>
        );
    } else {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: backgroundColour,
                    width: 'fit-content'
                }}>
                <Typography
                    sx={{
                        ...small2,
                        color: fontColour,
                        padding: '4px 8px',
                        fontWeight: fontWeightSemiBold
                    }}>
                    {`+`}
                    {text}
                </Typography>
            </Box>
        );
    }
}
