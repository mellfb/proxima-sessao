if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js")
    .then(() => console.log("Service Worker registrado!"))
    .catch(err => console.log("Erro no Service Worker", err));
}

const apiKey = "5f59dabf0b957ae19dabe86f2c64e5ef";
const baseUrl = "https://api.themoviedb.org/3";
const imageBaseUrl = "https://image.tmdb.org/t/p/w500";
let watchedHistory = JSON.parse(localStorage.getItem("watched")) || [];
let favoriteMedia = [];
let genres = [];

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const searchResults = document.getElementById("searchResults");
const genreSelect = document.getElementById("genreSelect");
const spinButton = document.getElementById("spinButton");
const markWatchedButton = document.getElementById("markWatched");

searchButton.addEventListener("click", searchMedia);
spinButton.addEventListener("click", spinRoulette);
markWatchedButton.addEventListener("click", markAsWatched);
document.getElementById("coverImage").addEventListener("click", () => {
    document.getElementById("overview").style.display = "block";
});

fetchGenres();

function fetchGenres() {
    fetch(`${baseUrl}/genre/movie/list?api_key=${apiKey}&language=pt-BR`)
        .then(response => response.json())
        .then(data => {
            genres = data.genres;
            genres.forEach(genre => {
                const option = document.createElement("option");
                option.value = genre.id;
                option.textContent = genre.name;
                genreSelect.appendChild(option);
            });
        });
}

function searchMedia() {
    const query = searchInput.value;
    fetch(`${baseUrl}/search/multi?api_key=${apiKey}&query=${query}&language=pt-BR`)
        .then(response => response.json())
        .then(data => {
            searchResults.innerHTML = "";
            data.results.forEach(item => {
                if (item.media_type === "movie" || item.media_type === "tv") {
                    const img = document.createElement("img");
                    img.src = imageBaseUrl + item.poster_path;
                    img.alt = item.title || item.name;
                    img.onclick = () => addToRoulette(item);
                    searchResults.appendChild(img);
                }
            });
        });
}

function addToRoulette(item) {
    favoriteMedia.push(item);
    alert(`${item.title || item.name} foi adicionado à roleta!`);
    displayFavorites();
}

function displayFavorites() {
    const favoritesList = document.getElementById("favoritesDisplayList");
    favoritesList.innerHTML = "";
    favoriteMedia.forEach((media, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = media.title || media.name;
        const removeButton = document.createElement("button");
        removeButton.textContent = "Remover";
        removeButton.onclick = () => removeFromFavorites(index);
        listItem.appendChild(removeButton);
        favoritesList.appendChild(listItem);
    });
}

function removeFromFavorites(index) {
    favoriteMedia.splice(index, 1);
    displayFavorites();
}

function spinRoulette() {
    const selectedGenre = genreSelect.value;
    let filteredMedia = [];

    if (selectedGenre === "minhas-escolhas") {
        filteredMedia = favoriteMedia;
    } else if (selectedGenre) {
        fetch(`${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=${selectedGenre}&language=pt-BR`)
            .then(response => response.json())
            .then(data => {
                filteredMedia = data.results;
                if (filteredMedia.length > 0) {
                    animateRoulette(filteredMedia);
                } else {
                    alert("Nenhum item disponível no gênero selecionado.");
                }
            });
        return;
    }

    if (filteredMedia.length > 0) {
        animateRoulette(filteredMedia);
    } else {
        alert("Nenhum item disponível na roleta para a opção selecionada.");
    }
}

function animateRoulette(mediaList) {
    const randomMedia = mediaList[Math.floor(Math.random() * mediaList.length)];
    document.getElementById("rouletteResult").style.display = "block";
    document.getElementById("coverImage").src = imageBaseUrl + randomMedia.poster_path;
    document.getElementById("title").textContent = randomMedia.title || randomMedia.name;
    document.getElementById("overview").textContent = randomMedia.overview;
    document.getElementById("releaseDate").textContent = `Data de Lançamento: ${randomMedia.release_date || randomMedia.first_air_date}`;
}

function markAsWatched() {
    const title = document.getElementById("title").textContent;
    watchedHistory.push(title);
    localStorage.setItem("watched", JSON.stringify(watchedHistory));
    updateHistory();
}

function updateHistory() {
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = "";
    watchedHistory.forEach(title => {
        const listItem = document.createElement("li");
        listItem.textContent = title;
        historyList.appendChild(listItem);
    });
}

updateHistory();
displayFavorites();
