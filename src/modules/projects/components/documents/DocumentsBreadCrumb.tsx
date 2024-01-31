import { Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { NEUTRAL } from '../../../../theme/palette';

interface BreadCrumbProps {
    items: {
        title: string;
        path: string;
    }[];
}

export const DocumentsBreadCrumb = ({ items }: BreadCrumbProps): React.ReactElement => {
    const navigate = useNavigate();

    return (
        <Stack direction={'row'}>
            {items.map((item, index) => {
                return (
                    <Stack
                        display="flex"
                        direction="row"
                        alignItems="center"
                        key={index}
                        onClick={(): void => navigate(item.path)}>
                        <Typography
                            maxWidth="30vw"
                            color={index !== items.length - 1 ? NEUTRAL.light : ''}
                            textOverflow="ellipsis"
                            overflow="hidden"
                            whiteSpace="nowrap"
                            variant="h5">
                            {item.title}
                        </Typography>
                        <Typography
                            whiteSpace="nowrap"
                            paddingX={index !== items.length - 1 ? '4px' : ''}
                            color={index !== items.length - 1 ? NEUTRAL.light : ''}
                            variant="h5">
                            {index !== items.length - 1 ? '>' : ''}
                        </Typography>
                    </Stack>
                );
            })}
        </Stack>
    );
};
