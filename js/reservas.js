obtenerReservas();

const nuevaReservaModal = document.getElementById("nuevaReservaModal");

document.getElementById("logoutBtn").addEventListener("click", logout);
document.getElementById("newReservaBtn").addEventListener("click", mostrarModal);
document.getElementById("cancelarReservaBtn").addEventListener("click", cerrarModal);
document.getElementById("reservaForm").addEventListener("submit", crearReserva);

// Mostrar modal
function mostrarModal() {
    nuevaReservaModal.showModal();

    // Establecer fecha mínima al día actual
    const hoy = new Date().toISOString().split("T")[0];
    document.getElementById("fecha").setAttribute("min", hoy);

    // Escuchar cambios en fecha y hora para cargar mesas (solo una vez por apertura)
    document.getElementById("fecha").addEventListener("change", cargarMesasDisponibles);
    document.getElementById("hora").addEventListener("change", cargarMesasDisponibles);
}

// Cerrar modal
function cerrarModal() {
    nuevaReservaModal.close();
    document.getElementById("reservaForm").reset();
    document.getElementById("mesa").innerHTML = '<option value="">Selecciona fecha y hora primero</option>';
    document.getElementById("mesa").disabled = true;
}

async function obtenerReservas() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No hay token, inicia sesión.");
        }
        const response = await fetch("http://localhost:8080/reservas", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Sesión expirada. Inicia sesión de nuevo.");
            }
            throw new Error("Error al obtener las reservas");
        }
        const reservas = await response.json();

        document.getElementById("reservasBody").innerHTML = "";

        reservas.forEach(reserva => {
            const fila = document.createElement("tr");
            fila.id = "filaReserva_" + reserva.id;
            fila.innerHTML = `
                <td>${reserva.id}</td>
                <td>${reserva.fecha}</td>
                <td>${reserva.hora}</td>
                <td>${reserva.nPersonas}</td>
                <td>${reserva.mesa.id}</td>
                <td><button class="btn btn-danger btn-sm" onclick="borrarReserva(${reserva.id}, this)">Borrar</button></td>
            `;
            document.getElementById("reservasBody").appendChild(fila);
        });
    } catch (error) {
        console.error("Error:", error);
        alert(error.message);
        location.href = "index.html";
    }
}

async function borrarReserva(id, boton) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No hay token, inicia sesión.");
        }

        const response = await fetch(`http://localhost:8080/reservas/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Sesión expirada. Inicia sesión de nuevo.");
            }
            if (response.status === 403) {
                throw new Error("No tienes permiso para borrar esta reserva.");
            }
            throw new Error("Error al borrar la reserva");
        }

        const fila = boton.closest("tr");
        fila.remove();
        alert("Reserva borrada con éxito");
    } catch (error) {
        console.error("Error al borrar:", error);
        alert(error.message);
    }
}

async function cargarMesasDisponibles() {
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const mesaSelect = document.getElementById("mesa");

    if (!fecha || !hora) return;

    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8080/mesas/disponibles?fecha=${fecha}&hora=${hora}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Error al obtener mesas disponibles");
        }

        const mesas = await response.json();
        mesaSelect.innerHTML = '<option value="">Selecciona una mesa</option>';
        mesas.forEach(mesa => {
            const option = document.createElement("option");
            option.value = mesa.id; // Usamos id como valor
            option.textContent = `Mesa ${mesa.nMesa} (${mesa.descripcion})`; // Mostramos nMesa y descripcion
            mesaSelect.appendChild(option);
        });
        mesaSelect.disabled = false;
    } catch (error) {
        console.error("Error:", error);
        mesaSelect.innerHTML = '<option value="">Error al cargar mesas</option>';
        mesaSelect.disabled = true;
    }
}

async function crearReserva(event) {
    event.preventDefault();

    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const nPersonas = document.getElementById("nPersonas").value;
    const mesaId = document.getElementById("mesa").value;

    if (!mesaId) {
        alert("Por favor, selecciona una mesa.");
        return;
    }

    try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/reservas", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fecha,
                hora,
                nPersonas,
                mesa: { id: mesaId }
            })
        });

        if (!response.ok) {
            throw new Error("Error al crear la reserva");
        }

        const nuevaReserva = await response.json();
        const fila = document.createElement("tr");
        fila.id = "filaReserva_" + nuevaReserva.id;
        fila.innerHTML = `
            <td>${nuevaReserva.id}</td>
            <td>${nuevaReserva.fecha}</td>
            <td>${nuevaReserva.hora}</td>
            <td>${nuevaReserva.nPersonas}</td>
            <td>${nuevaReserva.mesa.id}</td>
            <td><button class="btn btn-danger btn-sm" onclick="borrarReserva(${nuevaReserva.id}, this)">Borrar</button></td>
        `;
        document.getElementById("reservasBody").appendChild(fila);

        alert("Reserva creada con éxito");
        cerrarModal();
    } catch (error) {
        console.error("Error al crear reserva:", error);
        alert(error.message);
    }
}

async function logout() {
    try {
        localStorage.removeItem("token");
        location.href = "index.html";
    } catch (error) {
        console.error("Error:", error);
    }
}