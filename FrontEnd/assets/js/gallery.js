// gallery.js
// Initialisation d'une variable projet (work) et d'une varible catégories (filters)
let works = []
let filters = []

// Récupération des projets (work) depuis l’API
async function fetchWorks() {
  const reponse = await fetch("http://localhost:5678/api/works");
  const projets = await reponse.json();
  works = projets
  return projets
} 

// Récupère les catégories (filters) depuis l’API
async function fetchFilters() {
  const response = await fetch("http://localhost:5678/api/categories");
  filters = await response.json();
  return filters;
}

// Fonction d’affichage dynamique de la galerie
function generateGallery(projects) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = ""

  let projets;
  if(!projects) {
     projets = works
  } else {
     projets = projects
  }

  for (let i = 0; i < projets.length; i++) {
    const projet = projets[i];

    // Création des balises
    const figure = document.createElement("figure");

    const imageElement = document.createElement("img");
    imageElement.src = projet.imageUrl;
    imageElement.alt = projet.title;

    const figcaption = document.createElement("figcaption");
    figcaption.innerText = projet.title;

    // Assemblage
    figure.appendChild(imageElement);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  }
}
// Fonction d'affichage des catégories

// Génére dynamiquement les boutons filtres
function generateFilters() {
  const container = document.querySelector(".filters");
  container.innerHTML = "";

  // Bouton "Tous"
  const allBtn = document.createElement("button");
  allBtn.innerText = "Tous";
  allBtn.classList.add("filter-btn", "active");
  allBtn.addEventListener("click", () => {
    generateGallery();
    setActiveButton(allBtn);
  });
  container.appendChild(allBtn);

  // Autres boutons par catégorie
  for (let filter of filters) {
    const btn = document.createElement("button");
    btn.innerText = filter.name;
    btn.classList.add("filter-btn");

    btn.addEventListener("click", () => {
      const filtered = works.filter(item => item.categoryId === filter.id);
      generateGallery(filtered);
      setActiveButton(btn);
    });

    container.appendChild(btn);
  }
}

// Gère le style du bouton actif
function setActiveButton(clickedBtn) {
  const allBtns = document.querySelectorAll(".filter-btn");
  allBtns.forEach(btn => btn.classList.remove("active"));
  clickedBtn.classList.add("active");
}

// Appel initial
async function main () {
  await fetchWorks();
  await fetchFilters();
  generateGallery();
  generateFilters();
}

main ()
