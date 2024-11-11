import * as fs from 'fs';
import * as path from 'path';

async function logErrorToFile (directoryName: string, entry: string) {

    const formattedEntry = `${Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'Africa/Algiers',
    }).format(new Date())}\n\t${entry}\n\n`;

    try {
        if (!fs.existsSync(path.join(__dirname, '..', 'logs', directoryName.toLowerCase(), "errors.log"))) {
            await fs.promises.mkdir(
                path.join(__dirname, '..', 'logs', directoryName.toLowerCase()),
            );
        }
        await fs.promises.appendFile(
            path.join(__dirname, '..', 'logs', directoryName.toLowerCase(), "errors.log"),
            formattedEntry,
        );
    } catch (error) {
        // S'il y a une erreur comment la logger !!!
        if (error instanceof Error) {
            console.error(error.message);
        }
    }
}

export default logErrorToFile;