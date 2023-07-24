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
        game.settings.get(module_id, "translationDialog")) {
            Dialog();
    }

    if (game.settings.get(module_id, "enableI18NOverride")) {
        patchCoreI18NFuncs();
    }

    
    if (game.settings.get(module_id, "enableSystemSheetFixes")) {
        Hooks.on("renderActorSheet5eNPC", onRenderActorSheet);
        Hooks.on("renderActorSheet5eCharacter", onRenderActorSheet);
    }
});

function patchCoreI18NFuncs() {
    if (!libWrapper || !game.modules.get('lib-wrapper')?.active) {
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
