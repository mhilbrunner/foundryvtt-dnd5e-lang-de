# -*- coding: utf-8 -*-
#!/usr/bin/env python

"""spellcheck.py: Runs LanguageTool spell checking on compendium JSONs. Requires LT server."""

import os
import re
import glob
import json
import pickle
import requests
from datetime import date

VERSION = 1

# See https://dev.languagetool.org/http-server
LANGUAGETOOL_API = "http://localhost:8081/v2/check"
LANGUAGETOOL_LANG = "de-DE"

LANGUAGE_DICT = "spellcheck_dict.txt"

# Cache, set to empty string to disable
CACHE_PATH = "spelling_cache.bin"
CACHE = {}

TARGET_PATH = "compendium"
TARGET_PATH_FULL = os.path.join(TARGET_PATH, "*.json")

ANSI_UNDERLINE_START = "\x1B[4m"
ANSI_UNDERLINE_END = "\x1B[0m"
CLEAN_TABLE = re.compile("<table>(.|\n|\r)*<\/table>")
CLEAN_HTML = re.compile("<.*?>")
CLEAN_FOUNDRY_COMP = re.compile("@Compendium\[.*?} ?")
CLEAN_FOUNDRY_UUID = re.compile("@UUID\[.*?} ?")

CUSTOM_DICT = {}
DICT_IGNORE = {
    "mit": True,
    "oder)": True,
    "Verbreiten": True,
    "göttliche": True,
    ")": True
}

CUSTOM_DICT_ENABLED = True
CHECK_ALL = False
PRINT_PROGRESS = True
PRINT_RULE = True

def main():
    os.system("") # Required for ANSI codes to work
    load_dict(LANGUAGE_DICT)
    cached_req("") # Initialize cache

    if CHECK_ALL:
        for file in glob.glob(TARGET_PATH_FULL):
            check_file(file)
    else:
        #check_file("./compendium/dnd5e.backgrounds.json")
        #check_file("./compendium/dnd5e.classes.json")
        #check_file("./compendium/dnd5e.classfeatures.json")
        #check_file("./compendium/dnd5e.heroes.json")
        #check_file("./compendium/dnd5e.items.json")
        #check_file("./compendium/dnd5e.monsterfeatures.json")
        #check_file("./compendium/dnd5e.monsters.json")
        #check_file("./compendium/dnd5e.races.json")
        #check_file("./compendium/dnd5e.rules.json")
        #check_file("./compendium/dnd5e.spells.json")
        #check_file("./compendium/dnd5e.subclasses.json")
        #check_file("./compendium/dnd5e.tables.json")
        #check_file("./compendium/dnd5e.tradegoods.json")
        pass

def check_file(path):
    with open(path, mode="r", encoding="utf-8") as f:
        j = json.load(f)
        entries = j["entries"]
        print("Checking " + os.path.abspath(path) + " (" + str(len(entries)) + " entries)")
        entry_num = 0
        for key in entries:
            entry_num += 1
            if PRINT_PROGRESS:
                print("Checking " + str(entry_num) + " of " + str(len(entries)))
            name = ""
            if "name" in entries[key]:
                name = entries[key]["name"]
            fields = parse_entry(path, entries[key])
            for field in fields:
                c = check(fields[field])
                if len(c["matches"]) < 1:
                    continue
                print(path + ", entry #" + str(entry_num) + " (\"" + name + "\", \"" + field + "\")")
                print(c["marked"])
                if PRINT_RULE:
                    for m in c["matches"]:
                        print("> " + m)
    print()

def parse_entry(path, entry):
    return format_entry(entry, ["name", "description"])

def format_entry(entry, fields):
    out = {}
    for field in fields:
        if field in entry:
            out[field] = entry[field]
    return out

def clean(raw):
  clean = raw
  clean = clean.replace("<br />", "\n")
  clean = clean.replace("<br>", "\n")
  clean = clean.replace("<p></p>", "\n")
  clean = re.sub(CLEAN_TABLE, "", clean)
  clean = re.sub(CLEAN_HTML, "", clean)
  clean = re.sub(CLEAN_FOUNDRY_COMP, "", clean)
  clean = re.sub(CLEAN_FOUNDRY_UUID, "", clean)
  return clean

def filter_matches(text, matches):
    out = []
    for m in matches:
        issue = m["rule"]["issueType"].lower()
        type_name = m["type"]["typeName"].lower()
        start = m["offset"]
        end = m["offset"] + m["length"]
        match_text = text[start: end]

        previous_char = ""
        if start > 0:
            previous_char = text[start-1]

        replacement = ""

        if "replacements" in m and len(m["replacements"]) > 0:
            replacement = m["replacements"][0]["value"]

        if replacement == "." or replacement == ",":
            continue

        if replacement in DICT_IGNORE and DICT_IGNORE[replacement]:
            continue

        if issue == "whitespace":
            continue

        if type_name == "unknownword":
            if CUSTOM_DICT_ENABLED:
                if normalize_dict(match_text) in CUSTOM_DICT:
                    continue
            elif match_text == replacement.replace("ß", "ss"):
                continue
            elif match_text.endswith("-"):
                continue

        if issue == "uncategorized" and type_name == "other":
            if match_text.lower() == replacement.lower():
                if previous_char == "\r" or previous_char == "\n":
                    continue

        out.append(m)
    return out

def check(text):
    original = text
    text = clean(text)
    r = cached_req(text)

    out = {"in": original, "clean": text, "marked": text, "matches": []}

    if not "matches" in r:
        return out

    matches = filter_matches(text, r["matches"])

    if len(matches) < 1:
        return out

    underline = [False] * (len(text))

    for m in matches:
        for x in range(m["length"]):
            underline[m["offset"] + x] = True

    out["marked"] = ""
    for c in range(len(text)):
        if underline[c]:
            out["marked"] += ANSI_UNDERLINE_START + text[c] + ANSI_UNDERLINE_END
        else:
            out["marked"] += text[c]

    for m in matches:
        out["matches"].append(format_match(text, m))

    return out

def format_match(text, match):
    start = match["offset"]
    end = match["offset"] + match["length"]
    out = text[start: end] + " (" + str(start) + ", " + str(end) + ") - " + match["rule"]["issueType"] + "/" + match["type"]["typeName"]
    if "replacements" in match and len(match["replacements"]) > 0 :
        out += " (\"" + str(match["replacements"][0]["value"]) + "\")"
    return out

def cached_req(text):
    if len(CACHE_PATH) > 0:
        if len(CACHE) < 1:
            load_cache(CACHE_PATH)
            print("Loaded " + str(len(CACHE)-2) + " cached entries from " + \
                  CACHE_PATH + " (" + CACHE["a_date"] + ")")
        if text in CACHE:
            return CACHE[text]

    r = req(text)

    if len(CACHE_PATH) > 0:
        CACHE[text] = r
        save_cache(CACHE_PATH)

    return r

def save_cache(path):
    if len(path) < 1:
        return
    with open(path, mode="wb") as f:
        pickle.dump(CACHE, f)

def load_cache(path):
    if len(path) < 1:
        return

    global CACHE

    CACHE["a_version"] = VERSION
    CACHE["a_date"] = date.today().strftime("%Y-%m-%d")
    if not os.path.isabs(path):
        p = os.path.join(os.path.dirname(os.path.realpath(__file__)), path)
    if os.path.exists(path):
        with open(path, mode="rb") as f:
            c = pickle.load(f)
            if not "a_version" in c or c["a_version"] != VERSION:
                return
            if not "a_date" in c:
                return
            CACHE = c

def req(text):
    r = requests.post(LANGUAGETOOL_API, data={"language": LANGUAGETOOL_LANG, "text": text})
    if r.status_code != 200:
        raise RuntimeError("Unexpected HTTP status: ", r, r.text, text)
    return r.json()

def normalize_dict(s):
    return s.strip().lower().replace("-", "") \
           .replace("ü", "u").replace("ä", "a").replace("ö", "o").replace("ß", "ss")

def load_dict(path):
    endings = ["e", "en", "s", "n", "er", "es"]
    with open(path, mode="r", encoding="utf-8") as f:
        for line in f:
            line = normalize_dict(line)
            if len(line) < 1 or line.startswith("#"):
                continue
            if line in CUSTOM_DICT:
                print("Duplicate entry in custom dict: " + line)
            CUSTOM_DICT[line] = True
            for ending in endings:
                CUSTOM_DICT[line + ending] = True

if __name__ == "__main__":
    main()
