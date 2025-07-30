import { base } from "./base.js";

document.addEventListener("DOMContentLoaded", () => {
    fetchData(base + "data/vocabulary.json")
        .then(initPage)
        .catch((error) => console.error("Fetch or parsing error:", error));
});

async function fetchData(url) {
    const response = await fetch(url);
    console.log("Fetch response received:", response);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

function initPage(data) {
    const container = document.getElementById("themes-container");
    if (!container) {
        console.error("Couldn't find #themes-container");
        return;
    }

    let index = 0;
    for (const [themeName, subthemes] of Object.entries(data)) {
        const themeBlock = createThemeBlock(themeName, subthemes, index);
        container.appendChild(themeBlock);
        index++;
    }

    addThemeCheckboxListeners();
    setupNavigation("general-selected", "lernkarten-general.html");
    setupNavigation("articles-selected", "lernkarten-articles.html");

    document.body.style.backgroundColor =
        index % 2 === 1 ? "#fffbd4" : "#fcf6c5";
}

function createThemeBlock(themeName, subthemes, index) {
    const themeBlock = document.createElement("div");
    themeBlock.className = "theme-block";
    themeBlock.style.backgroundColor = index % 2 === 0 ? "#fcf6c5" : "#fffbd4";

    const themeTitle = document.createElement("h2");
    themeTitle.className = "theme-title";

    const themeLabel = document.createElement("label");
    themeLabel.style.cursor = "pointer";

    const themeCheckbox = document.createElement("input");
    themeCheckbox.type = "checkbox";
    themeCheckbox.className = "theme-checkbox";
    themeCheckbox.dataset.index = index;

    themeLabel.appendChild(themeCheckbox);
    themeLabel.append(` ${themeName}`);

    themeTitle.appendChild(themeLabel);
    themeBlock.appendChild(themeTitle);

    const subthemesContainer = document.createElement("div");
    subthemesContainer.className = "subtheme-container";

    for (const subthemeName of Object.keys(subthemes)) {
        const label = document.createElement("label");
        label.className = "subtheme-title";

        const subthemeCheckbox = document.createElement("input");
        subthemeCheckbox.type = "checkbox";
        subthemeCheckbox.className = "subtheme-checkbox";
        subthemeCheckbox.dataset.theme = themeName;
        subthemeCheckbox.dataset.subtheme = subthemeName;

        label.appendChild(subthemeCheckbox);
        label.append(` ${subthemeName}`);
        subthemesContainer.appendChild(label);
    }

    themeBlock.appendChild(subthemesContainer);
    return themeBlock;
}

function addThemeCheckboxListeners() {
    document.querySelectorAll(".theme-checkbox").forEach((themeCheckbox) => {
        themeCheckbox.addEventListener("change", () => {
            const themeName = themeCheckbox.parentNode.textContent.trim();
            const subChecks = document.querySelectorAll(
                `.subtheme-checkbox[data-theme="${themeName}"]`
            );
            subChecks.forEach((cb) => {
                cb.checked = themeCheckbox.checked;
            });
        });
    });
}

function setupNavigation(buttonId, redirectUrl) {
    const button = document.getElementById(buttonId);
    if (!button) {
        console.warn(`Button with ID '${buttonId}' not found.`);
        return;
    }

    button.addEventListener("click", () => {
        const selected = getSelectedSubthemes();
        localStorage.setItem("selectedSubthemes", JSON.stringify(selected));
        window.location.href = redirectUrl;
    });
}

function getSelectedSubthemes() {
    return Array.from(document.querySelectorAll(".subtheme-checkbox"))
        .filter((cb) => cb.checked)
        .map((cb) => ({
            theme: cb.dataset.theme,
            subtheme: cb.dataset.subtheme,
        }));
}
