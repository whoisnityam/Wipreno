import * as React from 'react';
import { Task } from 'gantt-task-react';

export const Tooltip = (): React.FunctionComponent<{
    task: Task;
    fontSize: string;
    fontFamily: string;
}> => {
    // eslint-disable-next-line react/display-name
    return (): React.ReactElement => {
        return <></>;
    };
};
