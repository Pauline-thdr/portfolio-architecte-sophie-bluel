// login.js

// Fonction pour envoyer la requête de connexion
async function loginUser(email, password) {
  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

    if (!response.ok) {
      throw new Error("Email ou mot de passe incorrect.");
    }

    const data = await response.json();
    return data.token; // On récupère le token dans la réponse

  } catch (error) {
    throw error;
  }
}

// Fonction message d'erreur, manipulation du DOM (pas async) :
// Afficher un message d'erreur
function showError(message) {
  const errorElement = document.getElementById("error-message");
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

// Cacher le message d'erreur
function hideError() {
  const errorElement = document.getElementById("error-message");
  errorElement.textContent = "";
  errorElement.style.display = "none";
}

// Fonction d'initialisation du formulaire
function setupLoginForm() {
  const form = document.querySelector("#login form");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    hideError();

    const email = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) {
      showError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const token = await loginUser(email, password);

      // Stockage du token
      localStorage.setItem("authToken", token);

      // Redirection vers la page d’accueil
      window.location.href = "index.html";

    } catch (error) {
      showError(error.message || "Erreur lors de la connexion.");
    }
  });
}

// Fonction principale appelée au chargement de la page
function main() {
  setupLoginForm();
}

// Démarrage du script
main();

const isLoggedIn = !!localStorage.getItem('authToken');

