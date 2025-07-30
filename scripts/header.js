import { base } from "./base.js";

document.addEventListener("DOMContentLoaded", () => {
    const header = document.createElement("header");

    const headerLeft = document.createElement("div");
    headerLeft.className = "header-left";

    const homeLink = document.createElement("a");
    homeLink.href = base + "index.html";

    const homeImg = document.createElement("img");
    homeImg.className = "header-icon";
    homeImg.src = base + "images/home.svg";
    homeImg.alt = "home";

    homeLink.appendChild(homeImg);
    headerLeft.appendChild(homeLink);

    const headerName = document.createElement("a");
    headerName.className = "header-name";
    headerName.href = base + "./index.html";
    headerName.textContent = "Deutsch Wörterbuch";

    const headerCenter = document.createElement("div");
    headerCenter.className = "header-center";

    headerCenter.appendChild(headerName);

    header.appendChild(headerLeft);
    header.appendChild(headerCenter);

    document.body.insertBefore(header, document.body.firstChild);
});
