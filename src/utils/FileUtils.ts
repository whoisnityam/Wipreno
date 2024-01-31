export const readFile = (file: File): Promise<{ header: string[]; values: string[][] }> => {
    const reader = new FileReader();
    reader.readAsText(file);
    return new Promise((resolve, reject) => {
        reader.onload = function (event): void {
            if (event.target) {
                const data = event.target.result?.toString().trim()?.split('\n');
                if (data) {
                    const header: string[] = [];
                    const values: string[][] = [];
                    data.forEach((value, i) => {
                        if (i === 0) {
                            header.push(...value.split(';'));
                        } else {
                            values.push([...value.split(';')]);
                        }
                    });
                    resolve({ header, values });
                } else {
                    reject('Unable to parse CSV data');
                }
            } else {
                reject('Unable to read CSV file');
            }
        };
    });
};
