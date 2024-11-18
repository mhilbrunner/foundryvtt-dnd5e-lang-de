# -*- coding: utf-8 -*-
#!/usr/bin/env python

"""merge.py: Merges new keys in diff.txt into de.json."""

import json

sort_only = False
overwrite = False

# Paths for input and output files
DIFF_FILE_PATH = "languages/diff.txt"
JSON_FILE_PATH = "languages/de.json"


def main():
    line = ""
    line_number = 0

    try:
        with open(DIFF_FILE_PATH, "r", encoding="utf-8") as diff:
            with open(JSON_FILE_PATH, "r", encoding="utf-8") as file:
                j = json.load(file)

                for line in diff:
                    line_number += 1
                    line = line.strip()

                    # Remove trailing comma if any, making it valid JSON format
                    if line.endswith(","):
                        line = line[:-1]
                    line = "{" + line + "}"

                    # Load the diff content as a dictionary
                    n = json.loads(line)

                    for k in n.keys():
                        if k in j:
                            if overwrite:
                                # If overwrite is true, replace the existing key-value pair
                                print(f"Overwriting: key {k}")
                                j[k] = n[k]
                            else:
                                # If key exists and overwrite is false, skip
                                print(f"Conflict: key {k} exists, ignoring")
                                continue
                        else:
                            # If key doesn't exist, add it
                            print(f"Adding new key: {k}")
                            j[k] = n[k]

    except Exception as e:
        print(f"Error parsing line {line_number}: {line}")
        raise e from None

    # Save the merged content to the JSON file, with proper formatting
    with open(JSON_FILE_PATH, "w", encoding="utf-8") as out:
        json.dump(j, out, sort_keys=True, indent=4, ensure_ascii=False)


if __name__ == "__main__":
    main()
