// Module
import Config from "./src/config.js";
import Converters from "./src/converters.js";
import Dialog from "./src/window_popup.js";

const module_id = "FoundryVTT-dnd5e-DE";
const module_lang = "de";
const module_sys = "dnd5e";

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

    // Register Babele compendium translations if module is present
    if (typeof Babele !== "undefined" &&
        game.settings.get(module_id, "enableCompendiumTranslation")) {
        Babele.get().register({
            module: module_id,
            lang: module_lang,
            dir: "compendium"
        });
        Converters(module_id);
    }
});

Hooks.once("ready", function () {
    if (game.i18n.lang === module_lang &&
        game.system.id === module_sys &&
        game.settings.get(module_id, "translationDialog")){
            Dialog();
        }
});

Hooks.on("renderActorSheet5eNPC", onRenderActorSheet);

function onRenderActorSheet(app, html, options) {
    switch (app.constructor.name) {
        case "ActorSheet5eNPC":
            if (game.settings.get(module_id, "enableSystemSheetFixes")) {
                onRenderSheetNPCSystem(app, html, options);
            }
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
}
