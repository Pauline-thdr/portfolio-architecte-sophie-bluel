// Vérification de connexion
function isConnected() {
  return !!localStorage.getItem("authToken");
}

// Sélecteurs DOM
const logoutLink = document.getElementById("logout-link");
const loginLink = document.getElementById("login-link");

const modal = document.getElementById("modal");
const modalOverlay = modal.querySelector(".modal-overlay");
const closeBtn = modal.querySelector(".close");
const editBtn = document.querySelector(".edit-btn");

const galleryView = modal.querySelector(".modal-gallery-view");
const formView = modal.querySelector(".modal-form-view");
const addPhotoBtn = modal.querySelector(".add-photo-btn");
const backArrow = modal.querySelector(".back-arrow");
const modalGallery = modal.querySelector(".modal-gallery");

const editionBar = document.getElementById("edition-bar");
const navItems = document.querySelectorAll(".navItem");
const filtersContainer = document.querySelector(".filters");
const defaultTitle = document.querySelector(".default-title");
const editHeader = document.querySelector(".edit-header");

// Inputs du formulaire
const imageInput = document.getElementById("image-upload-input");
const imagePreview = document.getElementById("image-preview");
const titleInput = document.getElementById("photo-title");
const categorySelect = document.getElementById("category-select");
const submitBtn = document.querySelector(".submit-btn");
const form = document.getElementById("photo-form");
const errorMsg = document.getElementById("form-error-message");

// Fonction reset propre du formulaire
function resetAddPhotoForm() {
  imageInput.value = "";
  titleInput.value = "";
  categorySelect.selectedIndex = 0;

  imagePreview.innerHTML = `
    <i class="fa-regular fa-image"></i>
    <label for="image-upload-input" class="upload-label">+ Ajouter photo</label>
    <p>jpg, png : 4mo max</p>
  `;

  submitBtn.disabled = true;
  submitBtn.classList.remove("active-submit");
}

// Interface selon connexion
function manageInterface() {
  if (isConnected()) {
    console.log("Connecté");
    editionBar.style.display = "block";

    loginLink.classList.add("hidden");
    logoutLink.classList.remove("hidden");
    logoutLink.addEventListener("click", () => {
      localStorage.removeItem("authToken");
      window.location.reload();
    });

    filtersContainer.classList.add("hidden");
    defaultTitle.classList.add("hidden");
    editHeader.classList.remove("hidden");
    fillCategorySelect();
  } else {
    console.log("Non connecté");
    editionBar.style.display = "none";

    logoutLink.classList.add("hidden");
    loginLink.classList.remove("hidden");

    filtersContainer.classList.remove("hidden");
    defaultTitle.classList.remove("hidden");
    editHeader.classList.add("hidden");
  }
}

// Ouverture de la modale
editBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
  galleryView.classList.remove("hidden");
  formView.classList.add("hidden");
  generateModalGallery(works);
});

// Fermeture de la modale
function closeModal() {
  modal.classList.add("hidden");
}
closeBtn.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", closeModal);

// Navigation dans la modale
addPhotoBtn.addEventListener("click", () => {
  galleryView.classList.add("hidden");
  formView.classList.remove("hidden");
});
backArrow.addEventListener("click", () => {
  resetAddPhotoForm();
  formView.classList.add("hidden");
  galleryView.classList.remove("hidden");
});

// Génération de la galerie modale
function generateModalGallery(works) {
  modalGallery.innerHTML = "";

  works.forEach(work => {
    const figure = document.createElement("figure");
    figure.dataset.id = work.id;
    figure.classList.add("modal-figure");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.dataset.id = work.id;

    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-trash-can");
    deleteBtn.appendChild(icon);

    deleteBtn.addEventListener("click", handleDeleteProject);

    figure.appendChild(img);
    figure.appendChild(deleteBtn);
    modalGallery.appendChild(figure);
  });
}

// Suppression d’un projet
async function handleDeleteProject(event) {
  const id = event.currentTarget.dataset.id;
  try {
    const response = await fetch(`http://localhost:5678/api/works/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
    });

    if (response.ok) {
      works = works.filter(work => work.id !== parseInt(id));
      generateGallery();
      generateModalGallery(works);
    } else {
      alert("Erreur lors de la suppression de l'image.");
    }
  } catch (error) {
    console.error("Erreur réseau :", error);
    alert("Échec de la suppression.");
  }
}

// Appel des catégories
async function fillCategorySelect() {
  const selectElement = document.querySelector("#category-select");

  // Ajout d'une option vide par défaut
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.text = "";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  selectElement.add(defaultOption);

  const filters = await fetchFilters();
  filters.forEach((filter) => {
    const option = document.createElement("option");
    option.value = filter.id;
    option.text = filter.name;
    selectElement.add(option);
  });
}

// Preview de l'image
imageInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
  }
  checkFormValidity();
});

// Vérification du formulaire
function checkFormValidity() {
  const isValid = (imageInput.files.length > 0 && titleInput.value.trim() !== "" && categorySelect.value !== "");
  submitBtn.disabled = !isValid;
  if (isValid) {
    submitBtn.classList.add("active-submit");
  } else {
    submitBtn.classList.remove("active-submit");
  }
}
titleInput.addEventListener("input", checkFormValidity);
categorySelect.addEventListener("change", checkFormValidity);

// Envoi du formulaire à l’API
form.addEventListener("submit", async function (e) {
  e.preventDefault();
  errorMsg.textContent = "";

  if (!(imageInput.files.length > 0 && titleInput.value.trim() && categorySelect.value)) {
    errorMsg.textContent = "Veuillez remplir tous les champs.";
    return;
  }

  const formData = new FormData();
  formData.append("image", imageInput.files[0]);
  formData.append("title", titleInput.value.trim());
  formData.append("category", categorySelect.value);

  try {
    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      body: formData,
    });

    if (!response.ok) throw new Error("Erreur API");

    const newWork = await response.json();
    works.push(newWork); // Ajout dynamique dans la galerie
    generateGallery();
    generateModalGallery(works);

    resetAddPhotoForm();
    closeModal(); // ferme la modale après succès

  } catch (error) {
    errorMsg.textContent = "Une erreur est survenue lors de l'ajout.";
    console.error(error);
  }
});

// Initialisation de l'interface
manageInterface();
