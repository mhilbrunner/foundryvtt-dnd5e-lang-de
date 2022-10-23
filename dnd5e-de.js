// Module
import Config from './src/config.js';
import Converters from './src/converters.js';
import Dialog from './src/window_popup.js';

const module_id = 'FoundryVTT-dnd5e-DE';
const module_lang = 'de';
const module_sys = 'dnd5e';

Hooks.once('init', () => {
    // Create settings
    Config.forEach((cfg) => {
        // Skip settings not applicable for this system version
        if ('onlyUntilSystemVersionIncluding' in cfg &&
            isNewerVersion(game.system.data.version,
                cfg.onlyUntilSystemVersionIncluding)) {
            return;
        }
        game.settings.register(module_id, cfg.name, cfg.data);
    });

    // Register Babele compendium translations if module is present
    if (typeof Babele !== 'undefined' &&
        game.settings.get(module_id, 'enableCompendiumTranslation')) {
        Babele.get().register({
            module: module_id,
            lang: module_lang,
            dir: 'compendium'
        });
        Converters(module_id);

        CONFIG.DND5E.classFeatures = {
            "barbar": CONFIG.DND5E.classFeatures["barbarian"],
            "barde": CONFIG.DND5E.classFeatures["bard"],
            "kleriker": CONFIG.DND5E.classFeatures["cleric"],
            "druide": CONFIG.DND5E.classFeatures["druid"],
            "kämpfer": CONFIG.DND5E.classFeatures["fighter"],
            "mönch": CONFIG.DND5E.classFeatures["monk"],
            "paladin": CONFIG.DND5E.classFeatures["paladin"],
            "waldläufer": CONFIG.DND5E.classFeatures["ranger"],
            "schurke": CONFIG.DND5E.classFeatures["rogue"],
            "zauberer": CONFIG.DND5E.classFeatures["sorcerer"],
            "hexenmeister": CONFIG.DND5E.classFeatures["warlock"],
            "magier": CONFIG.DND5E.classFeatures["wizard"]
        };
    }
});

Hooks.once('ready', function () {
    if (game.i18n.lang === module_lang &&
        game.system.id === module_sys &&
        game.settings.get(module_id, 'translationDialog')){
            Dialog();
        }
});
