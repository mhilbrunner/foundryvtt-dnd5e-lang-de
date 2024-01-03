const module_id = "FoundryVTT-dnd5e-DE";
const module_lang = "de";

const Config = [
    {
        name: 'enableCompendiumTranslation',
        data: {
            name: 'Kompendiuminhalte übersetzen',
            hint: 'Übersetzen der Kompendiuminhalte. Benötigt das Babele-Modul. (Erfordert Neuladen.)',
            scope: 'client',
            type: Boolean,
            config: true,
            default: true,
            requiresReload: true
        }
    },
    {
        name: 'enableSystemSheetFixes',
        data: {
            name: 'Systembögen verbessern',
            hint: 'Aktiviert Patches für Probleme der im System enthaltenen Bögen mit Übersetzungen. Bei Kompatibilitätsproblemen deaktivieren. (Erfordert Neuladen)',
            scope: 'client',
            type: Boolean,
            config: true,
            default: true,
            requiresReload: true
        }
    },
    {
        name: 'enableI18NOverride',
        data: {
            name: 'Foundry-Übersetzung erweitern',
            hint: 'Aktiviert Erweiterungen der Foundry-Übersetzungsfunktionen (z.B. um Aufzählungen und Stufenangaben korrekt übersetzen zu können). Benötigt libWrapper. Bei Kompatibilitätsproblemen deaktivieren. (Erfordert Neuladen)',
            scope: 'client',
            type: Boolean,
            config: true,
            default: true,
            requiresReload: true
        }
    },
    {
        name: 'enableRangeTranslation',
        data: {
            name: 'Reichweite übersetzen',
            hint: 'Die Reichweite von Gegenständen und Zaubern wird in Meter (m) bzw. Kilometer (km) umgerechnet. Für Gewichtseinheiten existiert eine Systemeinstellung. (Erfordert Neuladen)',
            scope: 'client',
            type: Boolean,
            config: true,
            default: true,
            requiresReload: true
        }
    },
    {
        name: 'compendiumSrcKeepOriginal',
        data: {
            name: 'Englische Quellen auch anzeigen',
            hint: 'Englische Quellenangaben/Seitenzahlen werden zusätzlich in Klammern angegeben. (Erfordert Neuladen)',
            scope: 'client',
            type: Boolean,
            config: true,
            default: true,
            requiresReload: true
        }
    },
    {
        name: 'translationDialog',
        data: {
            name: 'Zeige Updatedialog',
            hint: 'Zeigt den Changelog / Update-Dialog.',
            scope: 'world',
            type: Boolean,
            config: true,
            default: true
        }
    }
];

Hooks.once("init", () => {
    // Create settings
    Config.forEach((cfg) => {
        // Skip settings not applicable for this system version
        if ("onlyUntilSystemVersionIncluding" in cfg &&
            isNewerVersion(game.system.data.version,
                cfg.onlyUntilSystemVersionIncluding)) {
            return;
        } else {
            game.settings.register(module_id, cfg.name, cfg.data);
        }
    });

    // Register Babele compendium translations
    if (typeof Babele !== 'undefined' &&
        game.i18n.lang === module_lang &&
        game.settings.get(module_id, "enableCompendiumTranslation")) {
        Babele.get().register({
            module: module_id,
            lang: module_lang,
            dir: "compendium"
        });
        registerConverters();
    }
});

Hooks.once("ready", function () {
    if (game.i18n.lang !== module_lang) {
        return;
    }

    patchCoreI18NFuncs();

    if (game.settings.get(module_id, "enableSystemSheetFixes")) {
        Hooks.on("renderActorSheet5eNPC", onRenderActorSheet);
        Hooks.on("renderActorSheet5eCharacter", onRenderActorSheet);
    }
});

function patchCoreI18NFuncs() {
    if (!game.settings.get(module_id, "enableI18NOverride") ||
        !libWrapper || !game.modules.get('lib-wrapper')?.active) {
        return;
    }
    libWrapper.register(module_id, "game.i18n.format", function (wrapped, ...args) {
        if (args.length == 2 && args[0] === "DND5E.LevelCount") {
            if ("ordinal" in args[1]) {
                args[1].ordinal = args[1].ordinal.replace(/\D/g, "") + ".";
            }
        }
        let result = wrapped(...args);
        return result;
    }, "WRAPPER");
}

function onRenderActorSheet(app, html, options) {
    switch (app.constructor.name) {
        case "ActorSheet5eNPC":
            onRenderSheetNPCSystem(app, html, options);
            return;
        case "ActorSheet5eCharacter":
            onRenderSheetPCSystem(app, html, options);
            return;
    }
}

function onRenderSheetNPCSystem(app, html, options) {
    // Fix 'Übungsbonus' being too long on the top right of the NPC sheet
    // by replacing 'Übungsbonus +X' with 'ÜB +X'.
    const prof = html[0].querySelector(".sheet-header .proficiency span");
    if (prof) {
        prof.innerHTML = prof.innerHTML.replace(
            game.i18n.localize("DND5E.Proficiency"),
            game.i18n.localize("dnd5e-DE.ProficiencyAbbrev"));
    }

    // Adds 20px of width to NPC skill list so 'Mit Tieren umgehen' fits.
    const skills = html[0].querySelector(".dnd5e.sheet.actor .skills-list");
    if (skills) {
        skills.style.flex = "0 0 200px";
    }
}

function onRenderSheetPCSystem(app, html, options) {
    // Replace 'SR' recharge label on PC sheet resources with 'KR'.
    const resources = html[0].querySelectorAll(".dnd5e.sheet.actor .attributes .resource .recharge span");
    if (resources && resources.length > 0) {
        resources.forEach((resource) => {
            resource.innerHTML = resource.innerHTML.replace("SR", "KR");
        });
    }
}

// --------- BABELE COMPENDIUM CONVERTERS ---------

function registerConverters() {
    Babele.get().registerConverters({
        'classNameFormula': convertClass,
        'classRequirements': convertClassRequirements,
        'alignment': convertAlignment,
        'type': convertType,
        'languages': convertLanguages,
        'race': convertRace,
        'monstername': convertMonsterName,
        'source': convertSource,
        'monsterenvironment': convertMonsterEnvironment,
        'monstertoken': convertMonsterToken,
        'range': convertRange,
        'weight': convertWeight,
    });
}

// Classes

const classes = {
    "Barbarian": "Barbar",
    "Bard": "Barde",
    "Cleric": "Kleriker",
    "Druid": "Druide",
    "Fighter": "Kämpfer",
    "Monk": "Mönch",
    "Paladin": "Paladin",
    "Ranger": "Waldläufer",
    "Rogue": "Schurke",
    "Sorcerer": "Zauberer",
    "Warlock": "Hexenmeister",
    "Wizard": "Magier"
};

function convertClass(c) {
    if (c && typeof c === 'string') {
         let translated = c;
         const names = Object.keys(classes);
         names.forEach(name => {
            translated = translated.replaceAll(name.toLowerCase(), classes[name].toLowerCase())
         });
         return translated;
    }
}

function convertClassRequirements(requirements) {
    let translated = requirements;
    const names = Object.keys(classes);
    names.forEach(name => {
        translated = translated.replaceAll(name, classes[name])
    });
    return translated;
}

// Alignments

var alignments = {
    'chaotic evil': 'Chaotisch Böse',
    'chaotic neutral': 'Chaotisch Neutral',
    'chaotic good': 'Chaotisch Gut',
    'neutral evil': 'Neutral Böse',
    'true neutral': 'Neutral',
    'neutral': 'Neutral',
    'neutral good': 'Neutral Gut',
    'lawful evil': 'Rechtschaffen Böse',
    'lawful neutral': 'Rechtschaffen Neutral',
    'lawful good': 'Rechtschaffen Gut',
    'chaotic good evil': 'Chaotisch Gut/Böse',
    'lawful chaotic evil': 'Rechtschaffen/Chaotisch Böse',
    'unaligned': 'Gesinnungslos',
    'any evil': 'Jede böse Gesinnung',
    'any neutral': 'Jede neutrale Gesinnung',
    'any good': 'Jede gute Gesinnung',
    'any chaotic': 'Jede chaotische Gesinnung',
    'any lawful': 'Jede rechtschaffende Gesinnung',
    'any non evil': 'Jede nicht böse Gesinnung',
    'any non neutral': 'Jede nicht neutrale Gesinnung',
    'any non good': 'Jede nicht gute Gesinnung',
    'any non chaotic': 'Jede nicht chaotische Gesinnung',
    'any non lawful': 'Jede nicht rechtschaffende Gesinnung',
    'any': 'Jede Gesinnung',
    'any alignment': 'Jede Gesinnung'
};

function convertAlignment(a, translation, data) {
    var id = a.toString().toLowerCase().replace('-', ' ');
    return alignments[id] ? alignments[id] : translation;
}

var types = {
    'any': 'Jedes Volk',
    'any race': 'Jedes Volk',
    'aberration (shapechanger)': 'Aberration (Gestaltwandler)',
    'aberration': 'Aberration',
    'beast': 'Tier',
    'celestial (titan)': 'Himmlisches Wesen (Titan)',
    'celestial': 'Himmlisches Wesen',
    'construct': 'Konstrukt',
    'demon': 'Dämon',
    'dragon': 'Drache',
    'elemental': 'Elementar',
    'fey': 'Feenwesen',
    'fiend (demon)': 'Unhold (Dämon)',
    'fiend (demon, orc)': 'Unhold (Dämon, Ork)',
    'fiend (demon, shapechanger)': 'Unhold (Dämon, Gestaltwandler)',
    'fiend (devil)': 'Unhold (Teufel)',
    'fiend (devil, shapechanger)': 'Unhold (Teufel, Gestaltwandler)',
    'fiend (gnoll)': 'Unhold (Gnoll)',
    'fiend (shapechanger)': 'Unhold (Gestaltwandler)',
    'fiend (yugoloth)': 'Unhold (Yugoloth)',
    'fiend': 'Unhold',
    'giant (cloud giant)': 'Riese (Wolkenriese)',
    'giant (fire giant)': 'Riese (Feuerriese)',
    'giant (frost giant)': 'Riese (Frostriese)',
    'giant (hill giant)': 'Riese (Hügelriese)',
    'giant (stone giant)': 'Riese (Steinriese)',
    'giant (storm giant)': 'Riese (Sturmriese)',
    'giant': 'Riese',
    'goblinoid': 'Goblinoider',
    'humanoid (aarakocra)': 'Humanoider (Aarakocra)',
    'humanoid (any race)': 'Humanoider (jedes Volk)',
    'humanoid (bullywug)': 'Humanoider (Bullywug)',
    'humanoid (dwarf)': 'Humanoider (Zwerg)',
    'humanoid (elf)': 'Humanoider (Elf)',
    'humanoid (firenewt)': 'Humanoider (Feuermolch)',
    'humanoid (gith)': 'Humanoider (Gith)',
    'humanoid (gnoll)': 'Humanoider (Gnoll)',
    'humanoid (gnome)': 'Humanoider (Gnom)',
    'humanoid (goblinoid)': 'Humanoider (Goblinoider)',
    'humanoid (grimlock)': 'Humanoider (Grimlock)',
    'humanoid (grung)': 'Humanoider (Grung)',
    'humanoid (human)': 'Humanoider (Mensch)',
    'humanoid (human, shapechanger)': 'Humanoider (Mensch, Gestaltwandler)',
    'humanoid (kenku)': 'Humanoider (Kenku)',
    'humanoid (kobold)': 'Humanoider (Kobold)',
    'humanoid (kuo-toa)': 'Humanoider (Kuo-toa)',
    'humanoid (lizardfolk)': 'Humanoider (Echsenmensch)',
    'humanoid (merfolk)': 'Humanoider (Meervolk)',
    'humanoid (orc)': 'Humanoider (Ork)',
    'humanoid (quaggoth)': 'Humanoider (Quaggoth)',
    'humanoid (sahuagin)': 'Humanoider (Sahuagin)',
    'humanoid (shapechanger)': 'Humanoider (Gestaltwandler)',
    'humanoid (thri-kreen)': 'Humanoider (Thri-kreen)',
    'humanoid (troglodyte)': 'Humanoider (Troglodyt)',
    'humanoid (xvart)': 'Humanoider (Xvart)',
    'humanoid (yuan-ti)': 'Humanoider (Yuan-ti)',
    'humanoid': 'Humanoider',
    'monstrosity (shapechanger)': 'Monstrosität (Gestaltwandler)',
    'monstrosity (shapechanger, yuan-ti)': 'Monstrosität (Gestaltwandler, Yuan-ti)',
    'monstrosity (titan)': 'Monstrosität (Titan)',
    'monstrosity': 'Monstrosität',
    'ooze': 'Schlick',
    'plant': 'Pflanze',
    'shapechanger': 'Gestaltwandler',
    'swarm of tiny beasts': 'Schwarm winziger Tier',
    'undead (shapechanger)': 'Untoter (Gestaltwandler)',
    'undead': 'Untoter',
    'yuan-ti': 'Yuan-ti',
    'Xvart': 'Xvart'
}

function convertType(t, translation, data) {
    if (!t) {
        return t;
    }

    if (typeof t === 'string') {
        if (t.indexOf(',') > -1) {
            var res = '';
            t.split(',').forEach(function (part) {
                var tr = convertType(part.trim(), part.trim(), data);
                if (res.length > 0) {
                    res += ", ";
                }
                res += tr;
            });
            return res;
        }

        return types[t.toString().toLowerCase()] ? types[t.toString().toLowerCase()] : (translation ? translation : t);
    }

    return translation;
}

var races = {
    'dragonborn': 'Drachenblütiger',
    'dwarf': 'Zwerg',
    'hill dwarf': 'Hügelzwerg',
    'mountain dwarf': 'Gebirgszwerg',
    'elf': 'Elf',
    'high elf': 'Hochelf',
    'gnome': 'Gnom',
    'rock gnome': 'Felsengnom',
    'half elf': 'Halbelf',
    'half-elf': 'Halbelf',
    'halfling': 'Halbling',
    'lightfoot halfling': 'Leichtfuss-Halbling',
    'half orc': 'Halbork',
    'half-orc': 'Halbork',
    'human': 'Mensch',
    'variant human': 'Mensch Variante',
    'tiefling': 'Tiefling'
}

function convertRace(r, t, data) {
    console.log("RACE", r, t);
    return races[r.toString().toLowerCase()] ? races[r.toString().toLowerCase()] : t;
}

var languages = {
    'all': 'Alle',
    'aarakocra': 'Aarakocra',
    'abyssal': 'Abyssisch',
    'aquan': 'Aqual',
    'auran': 'Aural',
    'celestial': 'Celestisch',
    'common': 'Gemeinsprache',
    'deepspeech': 'Tiefensprache',
    'draconic': 'Drakonisch',
    'druidic': 'Druidisch',
    'druid': 'Druidisch',
    'dwarvish': 'Zwergisch',
    'dwarven': 'Zwergisch',
    'elvish': 'Elfisch',
    'elven': 'Elfisch',
    'giant': 'Riesisch',
    'gith': 'Gith',
    'gnoll': 'Gnollisch',
    'gnomish': 'Gnomisch',
    'goblin': 'Goblinisch',
    'halfling': 'Halbingisch',
    'ignan': 'Ignal',
    'infernal': 'Infernalisch',
    'orc': 'Orkisch',
    'primordial': 'Urtümlich',
    'sylvan': 'Sylvanisch',
    'terran': 'Terral',
    'thievescant': 'Diebessprache',
    'thieves cant': 'Diebessprache',
    'thieves\' cant': 'Diebessprache',
    'thieve\'s cant': 'Diebessprache',
    'undercommon': 'Gemeinsprache der Unterreiche',
    'giant eagle': 'Riesenadler',
    'giant owl': 'Rieseneule',
    'giant elk': 'Riesenelch',
    'worg': 'Worg',
    'winter wolf': 'Winterwolf',
    'sahuagin': 'Sahuagin',
    'common and auran': 'Gemeinsprache und Aural',
    'understands common, elvish, and sylvan but can\'t speak them': 'versteht Gemeinsprache, Elfisch und Sylvanisch, aber kann sie nicht sprechen',
    'understands infernal but can\'t speak it': 'versteht Infernalisch, kann es aber nicht sprechen',
    'understands draconic but can\'t speak': 'versteht Drakonisch, kann es aber nicht sprechen',
    'understands common but doesn\'t speak it': 'versteht Gemeinsprache, kann sie aber nicht sprechen',
    'understands abyssal but can\'t speak': 'versteht Abbysisch, kann es aber nicht sprechen',
    'understands all languages it knew in life but can\'t speak': 'versteht alle zur Lebzeiten gesprochenen, kann aber nicht sprechen',
    'understands commands given in any language but can\'t speak': 'versteht Befehle in allen Sprachen, kann aber nicht sprechen',
    '(can\'t speak in rat form)': '(kann in Rattengestalt nicht sprechen)',
    '(can\'t speak in boar form)': '(kann in Schweinegestalt nicht sprechen)',
    '(can\'t speak in bear form)': '(kann in Bärengestalt nicht sprechen)',
    '(can\'t speak in tiger form)': '(kann in Tigergestalt nicht sprechen)',
    'any one language': 'eine nach Wahl',
    'any two languages': 'zwei nach Wahl',
    'any three languages': 'drei nach Wahl',
    'any four languages': 'vier nach Wahl',
    'any five languages': 'fünf nach Wahl',
    '5 other languages': '5 andere Sprachen',
    'any, usually common': 'beliebig, normalerweise Gemeinsprache',
    'one language known by its creator': 'eine Sprache des Erschaffers',
    'the languages it knew in life': 'jede zu Lebzeiten gesprochene',
    'those it knew in life': 'jede zu Lebzeiten gesprochene',
    'all it knew in life': 'jede zu Lebzeiten gesprochene',
    'any it knew in life': 'jede zu Lebzeiten gesprochene',
    'all, telepathy 120 ft.': 'alle, Telepathie 36m (120ft)',
    'telepathy 60 ft.': 'Telepathie 18m (60ft)',
    'telepathy 60ft. (works only with creatures that understand abyssal)': 'Telepathie 18m (60ft, funktioniert nur mit Kreaturen, die Abyssisch verstehen)',
    'telepathy 60 ft. (works only with creatures that understand abyssal)': 'Telepathie 18m (60ft, funktioniert nur mit Kreaturen, die Abyssisch verstehen)',
    'telepathy 120 ft.': 'Telepathie 36m (120ft)',
    'but can\'t speak': 'aber kann nicht sprechen',
    'but can\'t speak it': 'aber kann es nicht sprechen',
    'choice': 'nach Wahl',
    'understands the languages of its creator but can\'t speak': 'versteht die Sprachen des Erschaffers, aber kann nicht sprechen',
    'understands common and giant but can\'t speak': 'versteht Gemeinsprache und Riesisch, aber kann nicht sprechen',
    'cannot speak': 'Kann nicht sprechen',
    'cant speak': 'Kann nicht sprechen',
    'can\'t speak': 'Kann nicht sprechen'
}

var languages_suffixes = {
    ' (usually common)': ' (normalerweise Gemeinsprache)',
    ' (understands but cannot speak)': ' (beherrscht, aber kann nicht sprechen)',
    ' (understands but can\'t speak)': ' (beherrscht, aber kann nicht sprechen)',
    ' but can\'t speak them': ' aber kann sie nicht sprechen',
    ' but cannot speak': ' aber kann nicht sprechen',
    ' but can\'t speak': ' aber kann nicht sprechen'
}

function convertLanguages(l) {
    // Languages are seperated by semicolons
    var parts = l.split(';');
    var result = [];
    parts.forEach(part => {
        // For each language part
        part = part.trim();

        // First, check simple match against languages
        if (languages[part.toString().toLowerCase()]) {
            part = languages[part.toString().toLowerCase()]
        } else {
            // Check if it has a suffix listed in languages_suffixes,
            // if so, remove suffix and match against languages again
            for (var suffix in languages_suffixes) {
                if (part.toString().toLowerCase().endsWith(suffix)) {
                    var without_suffix = part.substring(0, part.length - suffix.length);
                    if (languages[without_suffix.toString().toLowerCase()]) {
                        part = languages[without_suffix.toString().toLowerCase()];
                        part = part + languages_suffixes[suffix];
                    }
                    break;
                }
            }
        }

        if (part.length > 0) {
            result.push(part);
        }
    })

    return result.join('; ');
}

var monster_name_additional = {
    'succubus/incubus': 'Sukkubus/Inkubus',
    'horned devil': 'Hornteufel',
    'giant rat (diseased)': 'Riesenratte (Erkrankt)',
    'chain devil': 'Kettenteufel',
    'avatar of death': 'Avatar des Todes',
    'deep gnome': 'Tiefen-Gnom'
}

function convertMonsterName(m, translation, data) {
    if (monster_name_additional[m.toString().toLowerCase()]) {
        return monster_name_additional[m.toString().toLowerCase()];
    }

    if (translation == null) {
        return m;
    }

    return translation;
}

function convertMonsterToken(m, translation, data) {
    if (!m) {
        return translation;
    }

    if ('name' in m) {
        m.name = convertMonsterName(m.name, translation, data);
    }

    if (translation == null) {
        return m;
    }

    return translation;
}

function convertBookName(m, translation, data) {
    if (game.settings.get(module_id, 'compendiumSrcKeepOriginal')) {
        translation = translation + ' (' + m.replace('pg.', 'S.').replace('PG.', 'S.') + ')';
    }

    if (translation == null) {
        return m;
    }

    return translation;
}

function convertSource(m, translation, data) {
    if (!m) {
        return translation;
    }

    if (translation == null) {
        return m;
    }

    if ('book' in m) {
        m.book = convertBookName(m.book, translation, data);
    }

    return translation
}

function convertMonsterEnvironment(m, translation, data) {
    if (translation == null) {
        return m;
    }
    return translation;
}

// Range

function round(num) {
	return Math.round((num + Number.EPSILON) * 100) / 100;
}

function footsToMeters(ft) {
	return round(parseInt(ft) * 0.3);
}

function milesToKilometers(mi) {
	return round(parseInt(mi) * 1.5);
}

function convertRange(range) {
    if (!game.settings.get(module_id, 'enableRangeTranslation')) {
        return range;
    }

    if (range.units === 'ft') {
        if (range.long) {
            range = mergeObject(range, { long: footsToMeters(range.long) });
        }
        return mergeObject(range, { value: footsToMeters(range.value), units: 'm' });
    }

    if(range.units === 'mi') {
        if(range.long) {
            range = mergeObject(range, { long: milesToKilometers(range.long) });
        }
        return mergeObject(range, { value: milesToKilometers(range.value), units: 'km' });
    }

    return range;
}

// Weight

function lbToKg(lb) {
	return parseInt(lb)/2;
}

function convertWeight(value) {
    if (game.system.id !== 'dnd5e' || !game.settings.get('dnd5e', 'metricWeightUnits')) {
        return value;
    }

    return lbToKg(value);
}
