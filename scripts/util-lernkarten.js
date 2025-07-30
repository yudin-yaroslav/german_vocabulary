function reorderPile(pile) {
    const cards = Array.from(pile.querySelectorAll(".card"));
    cards.forEach((card, i) => {
        card.style.zIndex = i;
        card.style.top = -6 * i + "px";
    });
}

const piles = document.querySelectorAll(".pile");
piles.forEach(reorderPile);

function animateCardMovement(card, targetPile) {
    const cardRect = card.getBoundingClientRect();
    const targetRect = targetPile.getBoundingClientRect();

    const clone = card.cloneNode(true);
    clone.style.position = "absolute";
    clone.style.left = `${cardRect.left}px`;
    clone.style.top = `${cardRect.top}px`;
    clone.style.width = `${cardRect.width}px`;
    clone.style.height = `${cardRect.height}px`;
    clone.style.margin = "0";
    clone.style.zIndex = "1000";
    document.body.appendChild(clone);

    const targetTopOffset = -6 * targetPile.querySelectorAll(".card").length;

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
        targetPile.appendChild(card);

        card.classList.remove("flipped");

        card.style.visibility = "visible";
        reorderPile(targetPile);

        const current = document.querySelector(".pile.current");
        if (current) {
            reorderPile(current);
            if (current.querySelectorAll(".card").length === 0) {
                refillFromNotLearnt();
            }
        }
    };
}

function refillFromNotLearnt() {
    const current = document.querySelector(".pile.current");
    const notLearnt = document.querySelector(".pile.not-learnt");
    const cards = Array.from(notLearnt.querySelectorAll(".card")).reverse();

    if (cards.length === 0) return;

    function animateNext() {
        const card = cards.shift();
        if (!card) return;

        animateCardMovement(card, current);
        animateNext();
    }

    animateNext();
}

function moveCard(targetSelector) {
    const current = document.querySelector(".pile.current");
    if (!current) return;

    const card = current.querySelector(".card:last-child");
    if (!card) {
        refillFromNotLearnt();
        return;
    }

    const target = document.querySelector(targetSelector);
    animateCardMovement(card, target);
}

function moveKnownCard() {
    moveCard(".pile.learnt");
}

function moveUnknownCard() {
    moveCard(".pile.not-learnt");
}

document.getElementById("know").addEventListener("click", moveKnownCard);
document.getElementById("dont-know").addEventListener("click", moveUnknownCard);

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
