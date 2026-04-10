const API_KEY = "1a6e2de59d9948b4816d09656c0484f0";

const NEWS_URL = "https://newsapi.org/v2/everything";
const DEFAULT_QUERY = "war OR disaster OR accident";

const newsContainer = document.getElementById("newsContainer");
const statusText = document.getElementById("statusText");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const categoryButtons = document.getElementById("categoryButtons");

let map;
let markers = [];

// Fetch news
async function fetchNews(query) {
    const res = await fetch(`${NEWS_URL}?q=${encodeURIComponent(query)}&apiKey=${API_KEY}`);
    const data = await res.json();

    if (data.status !== "ok") throw new Error(data.message);

    return data.articles;
}

// Render cards
function renderNews(articles) {
    newsContainer.innerHTML = "";

    articles.forEach(a => {
        const card = `
        <div class="card">
            ${a.urlToImage ? `<img src="${a.urlToImage}">` : ""}
            <div class="card-body">
                <h3>${a.title}</h3>
                <p>${a.description || ""}</p>
                <a href="${a.url}" target="_blank">Read more</a>
            </div>
        </div>
        `;
        newsContainer.innerHTML += card;
    });
}

// ✅ Map plotting (fixed)
function plotMap(articles) {
    // clear old markers
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    articles.slice(0, 10).forEach(a => {
        const lat = (Math.random()*140)-70;
        const lon = (Math.random()*360)-180;

        const marker = L.marker([lat, lon])
            .addTo(map)
            .bindPopup(a.title);

        markers.push(marker);
    });
}

// ✅ Main update
async function updateNews(query) {
    try {
        statusText.textContent = "Loading...";

        const articles = await fetchNews(query);

        renderNews(articles);
        plotMap(articles);

        statusText.textContent = `Loaded ${articles.length} articles`;

    } catch (err) {
        statusText.textContent = "Error: " + err.message;
    }
}

// ✅ Events
searchButton.onclick = () => {
    updateNews(searchInput.value || DEFAULT_QUERY);
};

categoryButtons.addEventListener("click", (e) => {
    if (!e.target.dataset.query) return;
    updateNews(e.target.dataset.query);
});

// ✅ INIT (FIXED ORDER)
window.onload = () => {
    map = L.map("map").setView([20, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
    }).addTo(map);

    updateNews(DEFAULT_QUERY);
};