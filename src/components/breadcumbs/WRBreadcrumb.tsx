import React from 'react';
import { Box, Breadcrumbs, IconButton, Link } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { small1 } from '../../theme/typography';

interface WRBreadcrumbProps {
    onBackPress?: Function;
    links: {
        link: string;
        label: string;
    }[];
}

export function WRBreadcrumb({
    onBackPress = (): void => window.history.back(),
    links
}: WRBreadcrumbProps): React.ReactElement {
    const WRLink = (data: {
        link: string;
        label: string;
        is_primary?: boolean;
    }): React.ReactElement => {
        return (
            <Link
                underline="hover"
                color={data.is_primary ? 'secondary' : 'inherit'}
                href={data.link}
                sx={{
                    ...small1,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    maxWidth: '400px',
                    textOverflow: 'ellipsis'
                }}>
                {data.label}
            </Link>
        );
    };
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={(): void => onBackPress()}>
                <ArrowBack color={'secondary'} />
            </IconButton>
            <Breadcrumbs
                sx={{
                    '.MuiBreadcrumbs-li': {
                        whiteSpace: 'nowrap',
                        maxWidth: '500px',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden'
                    }
                }}>
                {links.map((item, index) => {
                    return (
                        <WRLink
                            key={index}
                            link={item.link}
                            label={item.label}
                            is_primary={index === links.length - 1}
                        />
                    );
                })}
            </Breadcrumbs>
        </Box>
    );
}
