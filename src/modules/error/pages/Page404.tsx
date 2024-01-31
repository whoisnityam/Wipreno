import React from 'react';
import { ErrorLayout } from '../layouts/ErrorLayout';
import error404 from '../../../assets/error404.svg';

export function Page404(): React.ReactElement {
    return (
        <ErrorLayout title="pageNotFoundTitle" subtitle="pageNotFoundSubtitle" image={error404} />
    );
}
