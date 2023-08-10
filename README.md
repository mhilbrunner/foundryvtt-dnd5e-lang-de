# DnD5e German Translation (Deutsch) for FoundryVTT (FoundryVTT-dnd5e-DE)

![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/mhilbrunner/foundryvtt-dnd5e-lang-de?label=Latest+Release)
![GitHub Downloads All Releases](https://img.shields.io/github/downloads/mhilbrunner/foundryvtt-dnd5e-lang-de/total?label=Downloads+(Total))
![GitHub Downloads Release](https://img.shields.io/github/downloads/mhilbrunner/foundryvtt-dnd5e-lang-de/latest/total?label=Downloads+(Latest))
![GitHub Release Date](https://img.shields.io/github/release-date/mhilbrunner/foundryvtt-dnd5e-lang-de?label=Release+Date)

German translation module for the
[Dungeons & Dragons 5th Edition (dnd5e) system](https://foundryvtt.com/packages/dnd5e)
for [Foundry Virtual Tabletop](https://foundryvtt.com/).

Aims to provide consistent and usable translations in german for all 5E
system content, including compendia via Babele.

If you want to help out, get in touch by creating an issue here or on Discord.

## How to use

Install via Foundry or by pasting the URL below into Foundry's module manager:

<https://github.com/mhilbrunner/foundryvtt-dnd5e-lang-de/releases/latest/download/module.json>

If you want to install a specific release, have a look at the releases page:

<https://github.com/mhilbrunner/foundryvtt-dnd5e-lang-de/releases>

There you can find the link to the manifest of a specific release version to use instead.

## Installing and using the german translation

1. Install the module via the Foundry module manager as described above
2. Install the dependencies: the [german core translation](https://foundryvtt.com/packages/lang-de) and [Babele](https://foundryvtt.com/packages/babele)
3. Make sure to enable all these installed modules
4. Make sure to set the client language to german in the settings

## Requirements & dependencies

You can see all past releases and compatible versions on the official package listing [here](https://foundryvtt.com/packages/FoundryVTT-dnd5e-DE).\
Old versions may still be available on the [old League repository](https://github.com/League-of-Foundry-Developers/foundryvtt-dnd5e-lang-de/).

Release 1.6.0 is compatible with Foundry versions 0.7.5 to 9.\
Releases 1.7.0+ are only compatible with Foundry 10+.\
Releases 2.0.0+ are only compatible with Foundry 11+.

The module depends on the [german core translation](https://foundryvtt.com/packages/lang-de) for ease of use.\
The module also depends on [Babele](https://foundryvtt.com/packages/babele) for compendium translations.

## Changelog

See the [releases page](https://github.com/mhilbrunner/foundryvtt-dnd5e-lang-de/releases).

## Contributing & adding translations

Contributions are always welcome! Below are some ways to contribute and how to get started.

### Adding new translation strings

To add new translations:

0. Fork this repo and check it out locally
1. Copy the up to date english language file into languages/en.json
(from [here](https://github.com/foundryvtt/dnd5e/raw/master/lang/en.json))
2. Run compare.py
3. languages/diff.txt should now contain keys which need to be translated
4. After translating, run merge.py
5. de.json should now contain updated translations
6. Commit, push and submit a Pull Request!

### Adding new compendium translations

This is a bit more involved, as compendia are currently translated using the
awesome [Babele](https://foundryvtt.com/packages/babele) module.
The [Babele repository](https://gitlab.com/riccisi/foundryvtt-babele) has a
brief tutorial.

Compendium translations are located in `compendium/`.

In cases where there is only a small set of values for a field (like *Alignments*),
those are translated using Babele converter functions in `src/`:
<https://github.com/mhilbrunner/foundryvtt-dnd5e-lang-de/blob/compendia/src/converters.js>

Those are also useful for translation values that are used in multiple places,
like *Item Rarities*.

## Thanks and credits

Thanks to all current, past and future contributors, including: \
**Hydroxi, Smicman, ThoGri, Morvar, Fallayn, crash, elbracht, stillday, CarnVanBeck, glont, mhilbrunner**

Much love to [Foundry](https://foundryvtt.com/), Atropos & team and the awesome Foundry community,
especially the [League](https://discord.com/invite/2rHs78h),
the official [Discord](https://discord.gg/foundryvtt) and
[Reddit](https://www.reddit.com/r/FoundryVTT/) and the
[Wiki](https://foundryvtt.wiki/) and [Hub](https://www.foundryvtt-hub.com/).

Thanks to all the module authors and contributors who work tirelessly and
largely for free to make using Foundry such an amazing and fun experience.

Thanks to the other Foundry translations, especially the
[italian](https://gitlab.com/riccisi/foundryvtt-dnd5e-lang-it-it/),
[polish](https://gitlab.com/fvtt-poland/dnd-5e),
[japanese](https://github.com/BrotherSharper/foundryVTTja)
and [brazilian portoguese](https://gitlab.com/fvtt-brasil/dnd5e) ones
for paving the way - we learned a lot from them. :)

Thanks to [Simone Ricciardi (riccisi)](https://gitlab.com/riccisi) for
[Babele](https://foundryvtt.com/packages/babele), without which translating
compendium contents would be hard to impossible. Thanks!

And thanks to [henry4k](https://gitlab.com/henry4k/) who provides the german
core translation, letting us focus on the 5E system translations.

Finally, thanks to WotC for the support and all the wonderful authors - for everything.

Based on work by Hydroxi at <https://gitlab.com/Hydroxi/foundryvtt-dnd5e-lang-de>
and by Fallayn at <https://github.com/League-of-Foundry-Developers/foundryvtt-dnd5e-lang-de/>.

## Legal & license

This repository aims to only provide translations and no original content,
and is provided as-is, for free, at no charge,
with no guarantees or warranties, implied or otherwise.

As such, it is not an original work and doesn't hold any creativity and thus
shouldn't meet the bars and requirements for copyright in most countries and
jurisdictions. We as authors intend for it to enrich the community and be part
of the public domain.

If that is not enough for you however, you may alternatively use all contents
and source code that aren't owned by anyone else (e.g. Foundry, or other
module authors, or WotC) under the terms of either the
[MIT](https://opensource.org/licenses/MIT) or
the [Creative Commons Attribution 4.0 International
(CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) licenses, whichever you prefer.

Regarding Foundry, this is a work under the Limited License Agreement
for module development, as outlined [here](https://foundryvtt.com/article/license/).

SRD content is licensed from Wizards of the Coast under the terms of the
Creative Commons CC-BY-4.0 license. Open Gaming License (OGL) content is
licensed under the OGL license as outlined
[here](https://dnd.wizards.com/articles/features/systems-reference-document-srd).

Copyrighted content is licensed or used with permission. If you believe there
to be an error, please feel free to contact us on Discord or by creating an Issue
[here](https://github.com/mhilbrunner/foundryvtt-dnd5e-lang-de/issues).
