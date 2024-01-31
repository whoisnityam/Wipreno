import React from 'react';
import { ErrorLayout } from '../layouts/ErrorLayout';
import error500 from '../../../assets/error500.svg';

export function Page500(): React.ReactElement {
    return (
        <ErrorLayout
            title="serverErrorPageTitle"
            subtitle="serverErrorPageSubTitle"
            image={error500}
        />
    );
}
