export default [
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
