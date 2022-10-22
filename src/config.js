export default [
    {
        name: 'enableCompendiumTranslation',
        data: {
            name: 'Kompendiuminhalte übersetzen',
            hint: 'Übersetzen der Kompendiuminhalte. Benötigt das Babele-Modul. (Bei Änderung wird Foundry neu geladen.)',
            scope: 'client',
            type: Boolean,
            config: true,
            default: true,
            onChange: () => window.location.reload()
        }
    },
    {
        name: 'enableRangeTranslation',
        data: {
            name: 'Reichweite übersetzen',
            hint: 'Die Reichweite von Gegenständen und Zaubern wird in Meter (m) bzw. Kilometer (km) umgerechnet. Für Gewichtseinheiten existiert eine Systemeinstellung. (Bei Änderung wird Foundry neu geladen.)',
            scope: 'client',
            type: Boolean,
            config: true,
            default: true,
            onChange: () => window.location.reload()
        }
    },
    {
        name: 'compendiumSrcTranslateBooks',
        data: {
            name: 'Buchtitel-Abkürzungen für Quellen übersetzen',
            hint: 'Übersetzt die Abkürzungen für Buchtitel in Quellenangaben, z.B. wird aus PHB (Player\'s Handbook) dann SHB (Spielerhandbuch). (Bei Änderung wird Foundry neu geladen.)',
            scope: 'client',
            type: Boolean,
            config: true,
            default: true,
            onChange: () => window.location.reload()
        }
    },
    {
        name: 'compendiumSrcKeepOriginal',
        data: {
            name: 'Englische Quellenangabe mit anzeigen',
            hint: 'Englische Quellenangaben/Seitenzahlen werden zusätzlich in Klammern angegeben. (Bei Änderung wird Foundry neu geladen.)',
            scope: 'client',
            type: Boolean,
            config: true,
            default: true,
            onChange: () => window.location.reload()
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
