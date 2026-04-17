import {
  auth, db, doc, setDoc, createUserWithEmailAndPassword
} from "../firebase/config.js";

// UTILIDADES
function mostrarMensaje(titulo, mensaje, tipo = "success") {
  const toastElement = document.getElementById("liveToast");
  if (!toastElement) { alert(`${titulo}: ${mensaje}`); return; }
  document.getElementById("toastTitle").textContent = titulo;
  document.getElementById("toastBody").textContent = mensaje;
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}

// NAVEGACION
window.validarYCambiarAPaso2 = () => {
  const email = document.getElementById("inputEmail").value;
  if (!email || !email.includes("@")) return mostrarMensaje("Error", "Email inválido", "error");
  document.getElementById("inputEmail2").value = email;
  document.getElementById("paso1").classList.add("d-none");
  document.getElementById("paso2").classList.remove("d-none");
};

window.validarYCambiarAPaso3 = () => {
  const pass = document.getElementById("inputPassword").value;
  if (pass.length < 6) return mostrarMensaje("Error", "La contraseña debe tener al menos 6 caracteres", "error");
  if (pass !== document.getElementById("inputConfirmPassword").value) return mostrarMensaje("Error", "Las contraseñas no coinciden", "error");
  document.getElementById("paso2").classList.add("d-none");
  document.getElementById("paso3").classList.remove("d-none");
};

window.validarYCambiarAPaso4 = () => {
  if (!document.getElementById("inputIdNumber").value) return mostrarMensaje("Error", "DNI/Identificación requerida", "error");
  document.getElementById("paso3").classList.add("d-none");
  document.getElementById("paso4").classList.remove("d-none");
};

// CREAR CUENTA Y REDIRIGIR A EMPLEOS
window.añadirFormacion = async function () {
  const email = document.getElementById("inputEmail2").value;
  const password = document.getElementById("inputPassword").value;
  const nombres = document.getElementById("inputName").value;
  const apellidos = document.getElementById("inputSurname").value;

  try {
    mostrarMensaje("Procesando", "Preparando tu perfil de Match Talento...", "success");

    // 1. Crear en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Guardar en colección 'users' (Datos de cuenta)
    await setDoc(doc(db, "users", user.uid), {
      nombres,
      apellidos,
      email,
      rol: "postulante",
      registroCompletado: true,
      fechaRegistro: new Date()
    });

    // 3. Guardar en colección 'perfiles' (Datos para el Match IA)
    await setDoc(doc(db, "perfiles", user.uid), {
      dni: document.getElementById("inputIdNumber").value,
      telefono: document.getElementById("inputPhone").value,
      formacion: [{
        institucion: document.getElementById("inputInstitution").value,
        titulo: document.getElementById("inputDegree").value,
        estado: document.querySelector('input[name="estado"]:checked')?.value || "Finalizado"
      }],
      documentos: { cvUrl: "", certiJoven: "" }
    });

    mostrarMensaje("¡Éxito!", "Perfil creado. ¡Mira nuestras vacantes!", "success");

    // REDIRECCIÓN A EMPLEOS (Se usa ./ porque está en la misma raíz que userRegistration.html)
    setTimeout(() => {
      window.location.href = "./empleos.html"; 
    }, 2000);

  } catch (error) {
    console.error("Error en registro:", error);
    mostrarMensaje("Error", "No se pudo completar el registro: " + error.message, "error");
  }
};