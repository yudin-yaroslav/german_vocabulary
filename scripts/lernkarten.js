document.addEventListener("DOMContentLoaded", () => {
    fetch("../data/vocabulary.json")
        .then((response) => {
            console.log("Fetch response received:", response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            const container = document.getElementById("themes-container");
            let index = 0;

            for (const [themeName, subthemes] of Object.entries(data)) {
                const themeBlock = document.createElement("div");
                themeBlock.className = "theme-block";
                themeBlock.style.backgroundColor =
                    index % 2 === 0 ? "#fcf6c5" : "#fffbd4";

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

                if (!container) {
                    console.error("Couldn't find #themes-container");
                    return;
                }
                container.appendChild(themeBlock);
                index++;
            }

            document
                .querySelectorAll(".theme-checkbox")
                .forEach((themeCheckbox) => {
                    themeCheckbox.addEventListener("change", () => {
                        const themeName =
                            themeCheckbox.parentNode.textContent.trim();
                        const subChecks = document.querySelectorAll(
                            `.subtheme-checkbox[data-theme="${themeName}"]`
                        );
                        subChecks.forEach(
                            (cb) => (cb.checked = themeCheckbox.checked)
                        );
                    });
                });

            document
                .getElementById("show-selected")
                .addEventListener("click", () => {
                    const selected = Array.from(
                        document.querySelectorAll(".subtheme-checkbox")
                    )
                        .filter((cb) => cb.checked)
                        .map((cb) => ({
                            theme: cb.dataset.theme,
                            subtheme: cb.dataset.subtheme,
                        }));

                    localStorage.setItem(
                        "selectedSubthemes",
                        JSON.stringify(selected)
                    );

                    window.location.href = "test-lernkarten.html";
                });

            document
                .getElementById("reset-selected")
                .addEventListener("click", () => {
                    document
                        .querySelectorAll(".theme-checkbox, .subtheme-checkbox")
                        .forEach((cb) => (cb.checked = false));

                    document.getElementById("output").textContent = "";
                });

            document.body.style.backgroundColor =
                index % 2 === 1 ? "#fffbd4" : "#fcf6c5";
        })
        .catch((error) => {
            console.error("Fetch or parsing error:", error);
        });
});
