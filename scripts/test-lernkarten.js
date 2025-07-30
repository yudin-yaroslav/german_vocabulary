async function fetchImageUrl(theme) {
    const apiKey = import.meta.env.VITE_PIXABAY_API_KEY;
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(theme)}&image_type=photo&per_page=3`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("API request failed");
        const data = await response.json();
        if (data.hits && data.hits.length > 0) {
            const firstImage = data.hits[0];
            return firstImage.webformatURL;
        } else {
            return null;
        }
    } catch (err) {
        console.error(err);
        return null;
    }
}

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

    fetch("../data/vocabulary.json")
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

async function createCard(front, back, imageName) {
    const card = document.createElement("div");
    card.className = "card";

    const frontDiv = document.createElement("div");
    frontDiv.className = "card-front card-content";
    frontDiv.textContent = front;

    const backDiv = document.createElement("div");
    backDiv.className = "card-back card-content";
    backDiv.textContent = back;

    if (imageName) {
        const imageUrl = await fetchImageUrl(imageName);
        if (imageUrl) {
            const imgDiv = document.createElement("div");
            imgDiv.className = "card-image-div";

            const img = document.createElement("img");
            img.className = "card-image";
            img.src = imageUrl;
            img.alt = front;

            imgDiv.appendChild(img);
            backDiv.appendChild(imgDiv);
        } else {
            console.log(imageUrl);
        }
    }

    card.appendChild(frontDiv);
    card.appendChild(backDiv);

    return card;
}

async function renderCards(cardData) {
    const currentPile = document.querySelector(".pile.current");
    if (!currentPile) {
        console.error("No .pile.current container found");
        return;
    }

    currentPile.innerHTML = "";

    for (const { front, back, imageName } of cardData.reverse()) {
        const card = await createCard(front, back, imageName);
        currentPile.appendChild(card);
    }

    reorderPile(currentPile);
}
