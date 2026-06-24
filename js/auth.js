// auth.js — simple credential gate for personal use

const USERNAME = "admin";
const PASSWORD = "admin123";

function login() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === USERNAME && password === PASSWORD) {

        sessionStorage.setItem("authenticated", "true");
        loadApplication();

    } else {

        document.getElementById("login-error").innerText =
            "Invalid Username or Password";
    }
}

function logout() {
    sessionStorage.clear();
    location.reload();
}

function checkAuthentication() {

    const authenticated = sessionStorage.getItem("authenticated");

    if (authenticated === "true") {
        loadApplication();
    }
}

window.onload = checkAuthentication;
