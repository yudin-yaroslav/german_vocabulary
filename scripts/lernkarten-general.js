import {
    renderCards,
    moveCardTo,
    animateCardMovement,
} from "./lernkarten-utils.js";
import { base } from "./base.js";

document.addEventListener("DOMContentLoaded", () => {
    const raw = localStorage.getItem("selectedSubthemes");
    if (!raw) {
        document.body.innerHTML = "<p>No subthemes selected.</p>";
        return;
    }

    let selectedSubthemes;
    try {
        selectedSubthemes = JSON.parse(raw); // [{ theme, subtheme }, ...]
    } catch (e) {
        document.body.innerHTML = `<p>Could not parse selections: ${e.message}</p>`;
        return;
    }

    fetch(base + "data/vocabulary.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    `Failed to load vocabulary.json (status ${response.status})`
                );
            }
            return response.json();
        })
        .then(async (vocabData) => {
            const cards = [];

            selectedSubthemes.forEach(({ theme, subtheme }) => {
                const themeBlock = vocabData[theme];
                if (!themeBlock) {
                    console.warn(`Theme not found: ${theme}`);
                    return;
                }

                const subData = themeBlock[subtheme];
                if (!subData) {
                    console.warn(`Subtheme not found: ${subtheme} in ${theme}`);
                    return;
                }

                const categories = ["noun", "verb", "adj", "phrase", "misc"];
                categories.forEach((cat) => {
                    const entries = subData[cat];
                    if (!Array.isArray(entries)) return;

                    entries.forEach((entry) => {
                        if (entry.word && entry.russian) {
                            const article = entry.article
                                ? entry.article + " "
                                : "";
                            cards.push({
                                front: article + entry.word,
                                back: entry.russian,
                                article: entry.article,
                                imageName: cat === "noun" ? entry.english : "",
                            });
                        }
                    });
                });
            });

            await renderCards(cards);
        })
        .catch((error) => {
            document.body.innerHTML = `<p>Error loading vocabulary: ${error.message}</p>`;
        });
});

function refillEmptyFromNotLearnt() {
    const current = document.querySelector(".pile.current");
    const notLearnt = document.querySelector(".pile.not-learnt");
    const cards = Array.from(notLearnt.querySelectorAll(".card")).reverse();

    if (cards.length === 0) return;

    function animateNext() {
        const card = cards.shift();
        if (!card) return;

        animateCardMovement(card, current, refillEmptyFromNotLearnt, true);
        animateNext();
    }

    animateNext();
}

function moveKnownCard() {
    moveCardTo(
        ".pile.learnt",
        () => {
            const current = document.querySelector(".pile.current");
            if (current.querySelectorAll(".card").length === 0) {
                refillEmptyFromNotLearnt();
            }
        },
        true
    );
}

function moveUnknownCard() {
    moveCardTo(
        ".pile.not-learnt",
        () => {
            const current = document.querySelector(".pile.current");
            if (current.querySelectorAll(".card").length === 0) {
                refillEmptyFromNotLearnt();
            }
        },
        true
    );
}

document.getElementById("know").addEventListener("click", moveKnownCard);
document.getElementById("dont-know").addEventListener("click", moveUnknownCard);
