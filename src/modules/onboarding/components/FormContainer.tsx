import React from 'react';
import { Button, Container, Grid } from '@mui/material';
import { NEUTRAL } from '../../../theme/palette';
import { useTranslation } from 'react-i18next';

interface FormContainerProps {
    children: React.ReactElement;
    primaryButtonDisabled: boolean;
    primaryButtonOnClick: Function;
    secondaryButtonVisible?: boolean;
    secondaryButtonOnClick?: Function;
}

export function FormContainer({
    children,
    primaryButtonDisabled,
    primaryButtonOnClick,
    secondaryButtonOnClick = (): void => {},
    secondaryButtonVisible = true
}: FormContainerProps): React.ReactElement {
    const { t } = useTranslation();

    return (
        <Container
            sx={{
                backgroundColor: NEUTRAL.lighter,
                height: '100%',
                paddingTop: '5%'
            }}>
            {children}
            <Grid
                container
                rowSpacing={1}
                columnSpacing={{ xs: 0, sm: 2, md: 3 }}
                sx={{ flexDirection: 'row-reverse', marginTop: '48px' }}>
                <Grid item xs={12} sm={3}>
                    <Button
                        fullWidth
                        disabled={primaryButtonDisabled}
                        variant={'contained'}
                        onClick={(): void => primaryButtonOnClick()}>
                        {t('following')}
                    </Button>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Button
                        fullWidth
                        variant={'outlined'}
                        sx={{
                            display: !secondaryButtonVisible ? 'none' : ''
                        }}
                        color={'secondary'}
                        onClick={(): void => secondaryButtonOnClick()}>
                        {t('previous')}
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
}
