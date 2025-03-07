const registerDialog = document.getElementById("registerDialog");

// Abrir diálogo
document.getElementById("openDialogRegister").addEventListener("click", () => {
    registerDialog.showModal();
});

// Cerrar diálogo
document.getElementById("exitRegisterBtn").addEventListener("click", () => {
    registerDialog.close();
});

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            alert("Email o contraseña incorrectos");
            throw new Error("Error en la autenticación");
        }

        const data = await response.json();
        localStorage.setItem("token", data.token);
        alert("Login exitoso");
        location.href = "reservas.html";
    } catch (error) {
        console.error("Error en el login:", error);
    }
}

async function register() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("emailR").value;
    const telefono = document.getElementById("telefono").value;
    const password = document.getElementById("passwordR").value;

    try {
        const response = await fetch("http://localhost:8080/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nombre: name, email, telefono, password })
        });

        if (!response.ok) {
            alert("Error al registrarse");
            throw new Error("Error en el registro");
        }

        const data = await response.json();
        alert("Registro exitoso");
        registerDialog.close();
    } catch (error) {
        console.error("Error en el registro", error);
    }
}

document.getElementById("loginBtn").addEventListener("click", login);
document.getElementById("registroBtn").addEventListener("click", register);