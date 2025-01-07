#!/usr/bin/env node

import { argv } from 'node:process';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { getValueFromObject, setValueOnObject } from './_functions.mjs';

// display help if requested
if (argv.includes('--help')) {
    [
        'Usage: node utils/compare.mjs [--removed]',
        '',
        'Compares the german and english translation files in "languages" to find',
        'missing keys in de.json which still need translation, as well as keys in',
        'en.json which had their types changed and thus need re-translation.',
        '',
        'Please make sure you have the latest en.json file, which can be obtained',
        'from here: https://github.com/foundryvtt/dnd5e/raw/master/lang/en.json',
        '',
        'Options:',
        '  --removed     Also check for keys, that have been removed from the',
        '                english translation file and might be obsolete.',
        '  --duplicates  Also check for keys, that are identical in both',
        '                translation files to find possible errors.',
    ].forEach((line) => console.log(line));
    process.exit(0);
}

// gather options from argv
const isRemovedModeEnabled = argv.includes('--removed');
const isDuplicatesModeEnabled = argv.includes('--duplicates');

// resolve path to 'languages' directory, no matter where the script was executed from
const languagesDir = join(import.meta.dirname, '..', 'languages');

// resolve paths to both translation files and validate their existence
const deTranslationFile = join(languagesDir, 'de.json');
const enTranslationFile = join(languagesDir, 'en.json');

if (!existsSync(deTranslationFile)) {
    console.error(`ERROR: Cannot find "de.json" file in "${languagesDir}"!`);
    process.exit(1);
} else if (!existsSync(enTranslationFile)) {
    console.error(`ERROR: Cannot find "en.json" file in "${languagesDir}"! Please download the latest version of the file from https://github.com/foundryvtt/dnd5e/raw/master/lang/en.json and place it in the "languages" directory.`);
    process.exit(1);
}

// load and parse both translations files into memory for comparison
const deTranslations = JSON.parse(await readFile(deTranslationFile, { encoding: 'utf8' }));
const enTranslations = JSON.parse(await readFile(enTranslationFile, { encoding: 'utf8' }));

// iterate all entries in the english translation file and track missing or updated translations compared to the german one
const missingInDe = {};
const updatedInEn = {};
const duplicates = {};

(function gatherMissingAndUpdatedTranslations(object, currentPath = []) {
    for (const [key, value] of Object.entries(object)) {
        const path = [...currentPath, key];
        const compareValue = getValueFromObject(deTranslations, path);

        if (compareValue === null) {
            // key is missing completely from de translation
            setValueOnObject(missingInDe, path, value);
        } else if (typeof compareValue !== typeof value) {
            // type mismatch between de and en translation
            setValueOnObject(updatedInEn, path, value);
        } else if (typeof value === 'object') {
            // recursively iterate nested objects
            gatherMissingAndUpdatedTranslations(value, path);
        } else if (isDuplicatesModeEnabled === true && value === compareValue) {
            // both values are equal, so we assume the key to be untranslated and errorneously merged into de.json
            setValueOnObject(duplicates, path, value);
        }
    }
})(enTranslations);

// display a summary and store the results of the comparison

if (Object.keys(duplicates).length > 0) {
    const diffFile = join(languagesDir, '_duplicates.json');
    await writeFile(diffFile, JSON.stringify(duplicates, null, 4), { encoding: 'utf8' });

    console.log(`${Object.keys(duplicates).length} keys are identical in both translation files. You can find them in the "_duplicates.json" file.`);
} else if (isDuplicatesModeEnabled === true) {
    console.log('No duplicates could be found.');
}

const missingInDeCount = Object.keys(missingInDe).length;
if (missingInDeCount > 0) {
    const diffFile = join(languagesDir, '_missing.json');
    await writeFile(diffFile, JSON.stringify(missingInDe, null, 4), { encoding: 'utf8' });

    console.log(`${missingInDeCount} keys are missing a translation in de.json. You can find them in the "_missing.json" file.`);
} else {
    console.log('No missing translations could be found.');
}

const updatedInEnCount = Object.keys(updatedInEn).length;
if (updatedInEnCount > 0) {
    const diffFile = join(languagesDir, '_updated.json');
    await writeFile(diffFile, JSON.stringify(updatedInEn, null, 4), { encoding: 'utf8' });

    console.log(`${updatedInEnCount} keys have an updated type in en.json. You can find them in the "_updated.json" file.`);
} else {
    console.log('No updated translations could be found.');
}

// if --removed option enabled, iterate all entries in the german translation file too and track missing keys in the english one
if (isRemovedModeEnabled === true) {
    const removedInEn = [];

    (function gatherRemovedTranslationKeys(object, currentPath = []) {
        for (const [key, value] of Object.entries(object)) {
            // ignore any translations for this very module
            if (key.startsWith('dnd5e-DE.')) {
                continue;
            }

            const path = [...currentPath, key];
            if (getValueFromObject(enTranslations, path) === null) {
                removedInEn.push(path);
            } else if (typeof value === 'object') {
                gatherRemovedTranslationKeys(value, path);
            }
        }
    })(deTranslations);

    if (removedInEn.length > 0) {
        const diffFile = join(languagesDir, '_removed.json');
        await writeFile(diffFile, JSON.stringify(removedInEn, null, 4), { encoding: 'utf8' });

        console.log(`${removedInEn.length} keys are missing from en.json. You can find them in the "_removed.json" file.`);
    } else {
        console.log('No removed translations could be found.');
    }
}
