import {
    renderCards,
    moveCardTo,
    switchEndStartCards,
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

                const entries = subData["noun"];
                if (!Array.isArray(entries)) return;

                entries.forEach((entry) => {
                    if (entry.word && entry.russian && entry.article) {
                        cards.push({
                            front: entry.russian,
                            back: entry.word,
                            article: entry.article,
                            imageName: entry.english,
                        });
                    }
                });
            });

            await renderCards(cards);
        })
        .catch((error) => {
            document.body.innerHTML = `<p>Error loading vocabulary: ${error.message}</p>`;
        });
});

function moveArticleCard(target) {
    const current = document.querySelector(".pile.current");
    if (!current) return;

    const card = current.querySelector(".card:last-child");
    if (!card) return;

    const correct = card.querySelector(".hidden-article");
    if (!correct) return;

    if (correct.textContent === target) {
        moveCardTo(
            ".pile." + target,
            () => {
                const targetSelector = document.querySelector("." + target);
                targetSelector.lastChild.classList.toggle("flipped");
            },
            true
        );
    } else {
        switchEndStartCards();
    }
}

function moveDerCard() {
    moveArticleCard("der");
}
function moveDieCard() {
    moveArticleCard("die");
}
function moveDasCard() {
    moveArticleCard("das");
}

document.getElementById("der").addEventListener("click", moveDerCard);
document.getElementById("die").addEventListener("click", moveDieCard);
document.getElementById("das").addEventListener("click", moveDasCard);
