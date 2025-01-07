
/**
 * Get a nested property from an object.
 * 
 * @param {object} object The object to get the value from
 * @param {string[]} path The path of the value to get
 * @returns {?any}
 */
export function getValueFromObject(object, path) {
    if (!Array.isArray(path) || path.length < 1) {
        throw new TypeError('path must be a non-empty array!');
    }

    // we must use slice here to prevent altering the path argument directly
    const [lastSegment] = path.slice(-1);
    for (const segment of path.slice(0, -1)) {
        if (!Object.hasOwn(object, segment) || typeof object[segment] !== 'object') {
            return null; // can't traverse any further, so the path cannot possibly exist
        }

        object = object[segment];
    }

    return object[lastSegment] ?? null;
}

/**
 * Set a nested property on an object.
 * 
 * Please note, that `object` will be modified directly!
 * 
 * @param {object} object The object to set the value on
 * @param {string[]} path The path where to set the value
 * @param {any} value The value to set
 * @returns {void}
 * @throws {TypeError} If trying to recurse into non-object along path
 */
export function setValueOnObject(object, path, value) {
    if (!Array.isArray(path) || path.length < 1) {
        throw new TypeError('path must be a non-empty array!');
    }

    // we must use slice here to prevent altering the path argument directly
    const [lastSegment] = path.slice(-1);
    for (const segment of path.slice(0, -1)) {
        if (!Object.hasOwn(object, segment)) {
            object[segment] = {}; // create missing parent objects on the fly
        } else if (typeof object[segment] !== 'object') {
            throw new TypeError('Cannot recurse deeper into non-object!');
        }

        object = object[segment];
    }

    object[lastSegment] = value;
}

/**
 * Unset a value from an object by it's path.
 * 
 * Please note, that `object` will be modified directly!
 * 
 * @param {object} object The object to delete from
 * @param {string[]} path The path to the property to delete
 * @returns {void} `object` is altered directly!
 * @throws {TypeError} If trying to recurse into non-object along path
 */
export function unsetPathInObject(object, path) {
    if (!Array.isArray(path) || path.length < 1) {
        throw new TypeError('path must be a non-empty array!');
    }

    // we must use slice here to prevent altering the path argument directly
    const [lastSegment] = path.slice(-1);
    for (const segment of path.slice(0, -1)) {
        if (!Object.hasOwn(object, segment)) {
            return; // no need to traverse any further, the given path already doesn't exist
        } else if (typeof object[segment] !== 'object') {
            throw new TypeError('Cannot recurse deeper into non-object!');
        }

        object = object[segment];
    }

    delete object[lastSegment];
}

/**
 * Merge multiple objects together in order.
 * 
 * Please note, that the first object will be modified directly!
 * 
 * @param {object} target The first object to merge
 * @param {object} source The second object to merge
 * @param {boolean} overwrite Wether existing values should be overwritten
 * @returns {number} The amount of changes that have been made
 */
export function deepMergeObjects(target, source, overwrite = false) {
    let changes = 0;

    for (const [key, value] of Object.entries(source)) {
        if (!Object.hasOwn(target, key)) {
            // if the key doesn't exist on the target yet we can safely apply it anyway
            target[key] = value;
            changes++;
        } else if (typeof target[key] === 'object' && typeof value === 'object') {
            // if both the source key and the current value are objects we merge them recursively
            changes += deepMergeObjects(target[key], value);
        } else if (overwrite === true) {
            // in all other cases, we only overwrite the key if that has been enabled
            target[key] = value;
            changes++;
        }
    }

    return changes;
}

/**
 * Sort an object by it's keys.
 * 
 * @param {object} object The object to sort
 * @param {boolean} recursive Wether to sort nested objects recursively
 * @returns {object}
 */
export function sortObjectByKeys(object, recursive = false) {
    let result = Object.fromEntries(Object.entries(object).toSorted());

    if (recursive === true) {
        for (const [key, value] of Object.entries(result)) {
            if (typeof value === 'object') {
                result[key] = sortObjectByKeys(value, true);
            }
        }
    }

    return result;
}
