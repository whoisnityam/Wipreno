import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { SxProps, useMediaQuery, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';

interface ModalContainerProps {
    isModalOpen: boolean;
    content?: React.ReactElement;
    sx?: SxProps;
    width?: string;
    height?: string;
    onClose: Function;
}

export function ModalContainer({
    isModalOpen,
    content,
    sx,
    width,
    height,
    onClose
}: ModalContainerProps): React.ReactElement {
    const theme = useTheme();
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));

    const style = {
        margin: 'auto',
        backgroundColor: 'background.paper',
        boxShadow: 'none',
        padding: isLarge ? '40px' : '23px',
        outline: 'none',
        width: width ?? '440px',
        height: height ?? 'fit-content'
    };
    const useStyles = makeStyles(() => ({
        boxStyle: {
            ...sx
        },
        modalStyle: {
            overflowX: 'hidden',
            overflowY: 'auto',
            '@media (max-width: 420px)': {
                width: '440px'
            }
        }
    }));
    const classes = useStyles();
    return (
        <div>
            {isLarge ? (
                <Modal
                    open={isModalOpen}
                    onClose={(): void => onClose()}
                    sx={{ display: 'flex', overflowY: 'scroll' }}>
                    <Box sx={style} className={(classes.boxStyle, classes.modalStyle)}>
                        {content}
                    </Box>
                </Modal>
            ) : (
                <Modal
                    open={isModalOpen}
                    onClose={(): void => onClose()}
                    sx={{
                        display: 'flex',
                        overflowY: 'scroll',
                        '&::-webkit-scrollbar': { display: 'none' },
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        marginLeft: '15px',
                        marginRight: '15px'
                    }}>
                    <Box sx={style} className={(classes.boxStyle, classes.modalStyle)}>
                        {content}
                    </Box>
                </Modal>
            )}
        </div>
    );
}
