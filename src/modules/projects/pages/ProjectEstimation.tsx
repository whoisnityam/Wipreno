import React, { useCallback, useContext, useEffect, useState } from 'react';
import { EmptyState } from '../../../components/emptyState/EmptyState';
import { useTranslation } from 'react-i18next';
import { CreateNotice } from '../components/estimation/CreateNotice';
import { Box, useMediaQuery } from '@mui/material';
import { ProjectContext } from '../layout/ProjectDetailLayout';
import { Lot } from '../models/Lot';
import { getLots } from '../services/LotService';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { EstimationTabHeading } from '../components/estimation/EstimationTabHeading';
import { LotListSummary } from '../components/estimation/lotListSummary';
import { LotListDesktop } from '../components/estimation/LotListDesktop';
import { CollapsableList } from '../../../components/collapsable/CollapsableList';
import { LotDetails } from '../components/estimation/LotDetails';
import { Collapsable } from '../../../components/collapsable/Collapsable';

export function ProjectEstimation(): React.ReactElement {
    const { t } = useTranslation();
    const isLarge = useMediaQuery('(min-width:920px)');
    const projectContext = useContext(ProjectContext);
    const project = projectContext?.project;
    const [displayCreateNoticeModal, setDisplayCreateNoticeModal] = React.useState(false);
    const [lotList, setLotList] = React.useState<Lot[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchLots = useCallback(async () => {
        if (project && project.notices) {
            setLoading(true);
            if (project.notices.length > 0) {
                const list = await getLots(project.notices[0].id);
                setLotList(list);
            }
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLots();
    }, []);

    const RenderComponents = (): React.ReactElement => {
        if (project?.notices && project?.notices?.length > 0) {
            return (
                <>
                    {loading ? (
                        <LoadingIndicator />
                    ) : (
                        <Box sx={{ width: '100%' }}>
                            <EstimationTabHeading
                                lots={lotList}
                                onLotCreated={(lot): void => {
                                    setLotList([...lotList, lot]);
                                    window.scrollTo(0, document.body.scrollHeight);
                                }}
                            />
                            <LotListSummary lots={lotList} />
                            {isLarge ? (
                                <LotListDesktop lotList={lotList} setLotList={setLotList} />
                            ) : (
                                <CollapsableList showDivider={true}>
                                    {lotList.map((item) => {
                                        return (
                                            <Collapsable
                                                key={item.id}
                                                title={item.title}
                                                count={item.estimation_tasks?.length}>
                                                <LotDetails lot={item} />
                                            </Collapsable>
                                        );
                                    })}
                                </CollapsableList>
                            )}
                        </Box>
                    )}
                </>
            );
        } else {
            return (
                <Box width={'100%'}>
                    <EmptyState
                        title={''}
                        subtitle={t('createNoticeEmptyStateTitle')}
                        description={isLarge ? t('createNoticeEmptyStateDescription') : ''}
                        buttonTitle={isLarge ? t('createNoticeEmptyStateButtonTitle') : undefined}
                        buttonType={'contained'}
                        buttonOnClick={(): void => {
                            setDisplayCreateNoticeModal(true);
                        }}
                    />
                    {displayCreateNoticeModal && (
                        <CreateNotice
                            projectId=""
                            onClose={(): void => {
                                setDisplayCreateNoticeModal(false);
                            }}
                        />
                    )}
                </Box>
            );
        }
    };
    return <>{RenderComponents()}</>;
}
