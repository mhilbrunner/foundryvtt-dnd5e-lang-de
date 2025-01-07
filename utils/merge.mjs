#!/usr/bin/env node

import { argv } from 'node:process';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { deepMergeObjects, unsetPathInObject, sortObjectByKeys } from './_functions.mjs';

// display help if requested
if (argv.includes('--help')) {
    [
        'Usage: node utils/merge.mjs [--overwrite] [--removed]',
        '',
        'Merge the new and updated translations from the "_missing.json", "_updated.json"',
        'and "_duplicates.json" files back into the main "de.json" translation file.',
        '',
        'Options:',
        '  --overwrite  Overwrite already existing translations in de.json. Must be enabled if',
        '               changes from "_updated.json" and "_duplicates.json" should be applied.',
        '  --removed    Also delete all obsolete keys listed in "_removed.json", which had',
        '               been detected to be missing from the english translation file.',
    ].forEach((line) => console.log(line));
    process.exit(0);
}

// gather options from argv
const isOverwritingAllowed = argv.includes('--overwrite');
const isRemovedModeEnabled = argv.includes('--removed');

// resolve path to 'languages' directory, no matter where the script was executed from
const languagesDir = join(import.meta.dirname, '..', 'languages');

// resolve path to the de translation file and validate it's existence
const deTranslationFile = join(languagesDir, 'de.json');
if (!existsSync(deTranslationFile)) {
    console.error(`ERROR: Cannot find "de.json" file in "${languagesDir}"!`);
    process.exit(1);
}

// load and parse the main translation file into memory for processing
let deTranslations = JSON.parse(await readFile(deTranslationFile, { encoding: 'utf8' }));

let missingTranslationsCount = 0;
let updatedTranslationsCount = 0;
let removedTranslationsCount = 0;

// apply all missing translations
const missingDiffFile = join(languagesDir, '_missing.json');
if (existsSync(missingDiffFile)) {
    const missingTranslations = JSON.parse(await readFile(missingDiffFile, { encoding: 'utf8' }));
    missingTranslationsCount = deepMergeObjects(deTranslations, missingTranslations, isOverwritingAllowed);
} else {
    console.log(`Could not find "_missing.json" in "${languagesDir}". Skipping ...`);
}

// apply all updated translations if enabled
if (isOverwritingAllowed === true) {
    const updatedDiffFile = join(languagesDir, '_updated.json');
    if (existsSync(updatedDiffFile)) {
        const updatedTranslations = JSON.parse(await readFile(updatedDiffFile, { encoding: 'utf8' }));
        updatedTranslationsCount = deepMergeObjects(deTranslations, updatedTranslations, true);
    } else {
        console.log(`Could not find "_updated.json" in "${languagesDir}". Skipping ...`);
    }

    const duplicatesDiffFile = join(languagesDir, '_duplicates.json');
    if (existsSync(duplicatesDiffFile)) {
        const updatedDuplicates = JSON.parse(await readFile(duplicatesDiffFile, { encoding: 'utf8' }));
        updatedTranslationsCount += deepMergeObjects(deTranslations, updatedDuplicates, true);
    }
}

// delete all removed keys if enabled
if (isRemovedModeEnabled === true) {
    const removedDiffFile = join(languagesDir, '_removed.json');
    if (existsSync(removedDiffFile)) {
        const removedTranslations = JSON.parse(await readFile(removedDiffFile, { encoding: 'utf8' }));
        for (const path of removedTranslations) {
            unsetPathInObject(deTranslations, path);
            removedTranslationsCount++;
        }
    } else {
        console.log(`Could not find "_removed.json" in "${languagesDir}". Skipping ...`);
    }
}

// sort the entire translations object recursively to ensure consistency in git diffs
deTranslations = sortObjectByKeys(deTranslations, true);

// overwrite the main translation file with the processed results
await writeFile(deTranslationFile, JSON.stringify(deTranslations, null, 4));

// display a summary of the changes
console.log('Successfully updated de.json.');

if (missingTranslationsCount > 0) {
    console.log(`${missingTranslationsCount} translations have been added.`);
}

if (updatedTranslationsCount > 0) {
    console.log(`${updatedTranslationsCount} translations have been updated.`);
}

if (removedTranslationsCount > 0) {
    console.log(`${removedTranslationsCount} translations have been removed.`);
}
