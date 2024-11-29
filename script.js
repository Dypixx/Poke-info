const pokemonListContainer = document.getElementById("pokemon-list");
const detailsModal = document.getElementById("details-modal");
const detailsContainer = document.getElementById("details-container");
const closeModalButton = document.getElementById("close-modal");
const searchInput = document.getElementById("search");
const suggestionsDropdown = document.getElementById("suggestions");
let pokemonList = [];
fetch("https://pokeapi.co/api/v2/pokemon?limit=150")
  .then((response) => response.json())
  .then((data) => {
    pokemonList = data.results;
    renderPokemonList(pokemonList);
  })
  .catch((error) => console.error(error));
function renderPokemonList(pokemonList) {
  pokemonListContainer.innerHTML = pokemonList
    .map(
      (pokemon) => `
    <div
      class="bg-gray-800 p-4 rounded shadow hover:shadow-lg cursor-pointer text-center text-gray-200 hover:bg-gray-700"
      onclick="fetchPokemonDetails('${pokemon.url}')"
    >
      <p class="font-bold capitalize">${pokemon.name}</p>
    </div>
  `
    )
    .join("");
}
function fetchPokemonDetails(url) {
  fetch(url)
    .then((response) => response.json())
    .then((pokemon) => {
      const speciesUrl = pokemon.species.url;
      fetch(speciesUrl)
        .then((response) => response.json())
        .then((speciesData) => {
          const bio = getBio(speciesData);
          renderPokemonDetails(pokemon, bio);
        });
    })
    .catch((error) => console.error(error));
}
function getBio(speciesData) {
  const flavorEntry = speciesData.flavor_text_entries.find(
    (entry) => entry.language.name === "en"
  );
  return flavorEntry ? flavorEntry.flavor_text.replace(/\n|\f/g, " ") : "No bio available.";
}
function renderPokemonDetails(pokemon, bio) {
  const officialArtwork = pokemon.sprites.other["official-artwork"].front_default;
  detailsContainer.innerHTML = `
    <h3 class="text-2xl font-bold capitalize">${pokemon.name}</h3>
    <img
      src="${officialArtwork}"
      alt="${pokemon.name}"
      class="my-4 w-64 h-64 mx-auto object-contain"
    />
    <h4 class="text-lg font-semibold">Abilities</h4>
    <ul class="list-disc list-inside">
      ${pokemon.abilities
      .map((ability) => `<li>${ability.ability.name}</li>`)
      .join("")}
    </ul>
    <h4 class="text-lg font-semibold mt-4">Bio</h4>
    <p>${bio}</p>
  `;
  detailsModal.classList.remove("hidden");
}
closeModalButton.addEventListener("click", () => {
  detailsModal.classList.add("hidden");
});
searchInput.addEventListener("input", (event) => {
  const searchTerm = event.target.value.toLowerCase();
  const filteredSuggestions = pokemonList.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchTerm)
  );
  if (filteredSuggestions.length > 0 && searchTerm) {
    suggestionsDropdown.innerHTML = filteredSuggestions
      .map(
        (pokemon) => `
      <li
        class="p-2 hover:bg-yellow-500 hover:text-black cursor-pointer"
        onclick="selectSuggestion('${pokemon.name}', '${pokemon.url}')"
      >
        ${pokemon.name}
      </li>
    `
      )
      .join("");
    suggestionsDropdown.classList.remove("hidden");
  } else {
    suggestionsDropdown.classList.add("hidden");
  }
});
function selectSuggestion(name, url) {
  searchInput.value = name;
  suggestionsDropdown.classList.add("hidden");
  fetchPokemonDetails(url);
}
