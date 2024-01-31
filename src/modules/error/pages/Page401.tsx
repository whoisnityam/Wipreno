import React from 'react';
import { ErrorLayout } from '../layouts/ErrorLayout';
import error401 from '../../../assets/error401.svg';

export function Page401(): React.ReactElement {
    return (
        <ErrorLayout
            title="unauthorizedPageTitle"
            subtitle="unauthorizedPageSubTitle"
            image={error401}
        />
    );
}
