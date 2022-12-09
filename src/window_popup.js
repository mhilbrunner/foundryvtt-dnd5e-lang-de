export default function DialogWindow() {
    let d = new Dialog({
        title: "Modul aktiviert!",
        content: `
        <div style="text-align: justify;">
            <h2>
                Willkommen in der deutschen DnD5e Übersetzung
            </h2>
            <p>
                Wir freuen uns, dass du unser Modul verwendest, um dein Spielsystem ins Deutsche zu übersetzen.
            </p>
            <p>
                Wir arbeiten gerade an der Fertigstellung der Übersetzung. Das bedeutet, dass noch nicht alle Texte auf Deutsch verfügbar sind.
                Falls du einen Fehler findest, kannst du diesen <a href="https://github.com/mhilbrunner/foundryvtt-dnd5e-lang-de/issues" target="_blank">hier melden</a>.
            </p>
            <p>
                Wenn du uns helfen oder unterstützen möchtest, kannst du gerne auf unsere <a href="https://translator.gilneas.at/" target="_blank">Übersetzungsseite</a> kommen und mithelfen.
            </p>
            <p>
                Jede Hilfe ist eine große Unterstützung für uns und für die Community.
            </p>
            <p>
                Das Übersetzungstool befindet sich aktuell in einer offenen Beta. Wenn du Fehler findest, kannst du ihn <a href="https://github.com/League-of-Foundry-Developers/foundryvtt-dnd5e-lang-de-ui/issues" target="_blank">hier melden.</a>
            </p>
            <hr>
            <h3>
                Wir bedanken uns bei:
            </h3>
            <p>
                <i>mhilbrunner, glont, Fallayn, Crash, AlexElbracht, JPrince, Sinon, Zeku, vttom, Hydroxi, Smicman, ThoGri, Morvar, Icy</i>
            </p>
            <p>
                für ihre Arbeit und die Zeit, die sie bisher investiert haben.
            </p>
            <p>
                <b>Wir wünschen dir viel Vergnügen beim Spielen und Leiten von DnD.</b>
            </p>
        </div>
        `,
        buttons: {
            one: {
                icon: '<i class="fas fa-clipboard-list"></i>',
                label: "OK",
            },
            two: {
                icon: '<i class="fas fa-clipboard-check"></i>',
                label: "Nicht mehr anzeigen",
                callback: () => game.settings.set("FoundryVTT-dnd5e-DE", "translationDialog", false)
            },
        },

    },{ width: 550});
    d.render(true);
}
