export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function fetchImageUrl(theme) {
    try {
        const apiKey = import.meta.env?.VITE_PIXABAY_API_KEY;
        if (!apiKey) return null;

        const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(theme)}&image_type=photo&per_page=3`;

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
        console.warn(err);
        return null;
    }
}

function reorderPile(pile) {
    const cards = Array.from(pile.querySelectorAll(".card"));
    cards.forEach((card, i) => {
        card.style.zIndex = i + 1;
        card.style.top = -6 * i + "px";
    });
}

export function animateCardMovement(card, targetPile, callback, is_front) {
    const cardRect = card.getBoundingClientRect();
    const targetRect = targetPile.getBoundingClientRect();

    const clone = card.cloneNode(true);
    clone.style.position = "absolute";
    clone.style.left = `${cardRect.left}px`;
    clone.style.top = `${cardRect.top}px`;
    clone.style.width = `${cardRect.width}px`;
    clone.style.height = `${cardRect.height}px`;
    clone.style.margin = "0";
    clone.style.zIndex = is_front ? "1000" : "-1";
    document.body.appendChild(clone);

    const targetTopOffset = is_front
        ? -6 * targetPile.querySelectorAll(".card").length
        : 0;

    card.style.visibility = "hidden";

    const deltaX =
        targetRect.left +
        targetRect.width / 2 -
        (cardRect.left + cardRect.width / 2);
    const deltaY =
        targetRect.top +
        targetTopOffset +
        targetRect.height / 2 -
        (cardRect.top + cardRect.height / 2);

    const anim = clone.animate(
        [
            { transform: "translate(0, 0)" },
            {
                transform: `translate(${deltaX}px, ${deltaY}px)`,
            },
        ],
        {
            duration: 600,
            easing: "ease-in-out",
            fill: "forwards",
        }
    );

    anim.onfinish = () => {
        document.body.removeChild(clone);
        if (is_front) {
            targetPile.appendChild(card);
        } else {
            targetPile.insertBefore(card, targetPile.firstChild);
        }

        card.classList.remove("flipped");

        card.style.visibility = "visible";
        reorderPile(targetPile);

        const current = document.querySelector(".pile.current");
        if (current) {
            reorderPile(current);
        }

        if (callback) {
            callback();
        }
    };
}

async function createCard(front, back, article, imageName) {
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
        }
    }

    const hiddenArticle = document.createElement("div");
    hiddenArticle.className = "hidden-article";
    hiddenArticle.textContent = article;

    card.appendChild(hiddenArticle);
    card.appendChild(frontDiv);
    card.appendChild(backDiv);

    return card;
}

export async function renderCards(cardData) {
    const currentPile = document.querySelector(".pile.current");
    if (!currentPile) {
        console.error("No .pile.current container found");
        return;
    }

    currentPile.innerHTML = "";

    for (const { front, back, article, imageName } of cardData.reverse()) {
        const card = await createCard(front, back, article, imageName);
        currentPile.appendChild(card);
    }

    reorderPile(currentPile);
}

function moveCardFromTo(sourceSelector, targetSelector, callback, is_front) {
    const source = document.querySelector(sourceSelector);
    if (!source) return;

    const card = source.querySelector(".card:last-child");
    if (!card) return;

    const target = document.querySelector(targetSelector);
    animateCardMovement(card, target, callback, is_front);
}

export function moveCardTo(targetSelector, callback, is_front) {
    moveCardFromTo(".pile.current", targetSelector, callback, is_front);
}

export function switchEndStartCards() {
    function switchCallback() {
        moveCardFromTo(".pile.empty", ".pile.current", null, false);
    }

    moveCardFromTo(".pile.current", ".pile.empty", switchCallback, true);
}

const piles = document.querySelectorAll(".pile");
piles.forEach(reorderPile);

document.querySelectorAll(".pile").forEach((pile) => {
    pile.addEventListener("click", (e) => {
        const cards = pile.querySelectorAll(".card");
        if (cards.length === 0) return;

        const lastCard = cards[cards.length - 1];

        if (e.target === lastCard || lastCard.contains(e.target)) {
            lastCard.classList.toggle("flipped");
        }
    });
});
