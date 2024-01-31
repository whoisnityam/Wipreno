import { Box, Button, Typography } from '@mui/material';
import { NEUTRAL } from '../../theme/palette';

import React from 'react';
import { Plus } from 'react-feather';

interface EmptyStateProps {
    title: string;
    subtitle: string;
    description: string;
    buttonTitle?: string;
    buttonType?: 'contained' | 'outlined';
    buttonOnClick?: Function;
    secondaryButtonTitle?: string;
    secondaryButtonType?: 'contained' | 'outlined';
    secondaryButtonOnClick?: Function;
    displayButtons?: boolean;
}

export function EmptyState({
    displayButtons = true,
    title,
    subtitle,
    description,
    buttonTitle,
    buttonType = 'outlined',
    buttonOnClick = (): void => {}
}: EmptyStateProps): React.ReactElement {
    const getButton = (): React.ReactElement => {
        if (buttonTitle) {
            if (buttonType === 'outlined') {
                return (
                    <Button
                        variant={'outlined'}
                        color={'secondary'}
                        onClick={(): void => buttonOnClick()}
                        startIcon={<Plus />}
                        sx={{
                            borderRadius: '4px',
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}>
                        {buttonTitle}
                    </Button>
                );
            } else {
                return (
                    <Button variant={'contained'} onClick={(): void => buttonOnClick()}>
                        {buttonTitle}
                    </Button>
                );
            }
        } else {
            return <></>;
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                height: '100%',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginRight: '80%',
                    paddingLeft: '45%',
                    width: '100%'
                }}>
                <Typography variant={'h2'} color="primary">
                    {title}
                </Typography>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                }}>
                <Typography variant={'h3'} color={NEUTRAL.light}>
                    {subtitle}
                </Typography>
                <Box height={'24px'} />
                <Typography variant={'body1'} color={NEUTRAL.medium}>
                    {description}
                </Typography>
                <Box height={'48px'} />
                {displayButtons && getButton()}
            </Box>
            <Box />
        </Box>
    );
}
