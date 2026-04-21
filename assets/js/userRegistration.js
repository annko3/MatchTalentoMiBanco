import {
  auth,
  googleProvider,
  db,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "../firebase/config.js";
import {
  writeBatch,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let emailTemp = "";
let formaciones = [];
let archivosTemporales = [];
let experiencias = [];

function normalizarTexto(valor = "") {
  return String(valor).replace(/_/g, " ").trim();
}

function capitalizarPalabras(valor = "") {
  return normalizarTexto(valor)
    .split(" ")
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase())
    .join(" ");
}

function obtenerTextoSeleccionado(id) {
  const elemento = document.getElementById(id);
  if (!elemento) return "";

  if ("options" in elemento && elemento.selectedIndex >= 0) {
    const option = elemento.options[elemento.selectedIndex];
    return option?.textContent?.trim() || elemento.value || "";
  }

  return elemento.value?.trim() || "";
}

async function sincronizarPerfilCV(userId, formacionesGuardadas, experienciasGuardadas) {
  const batch = writeBatch(db);

  formacionesGuardadas.forEach((form) => {
    const educacionRef = doc(db, "users", userId, "educacion", String(form.id));
    batch.set(educacionRef, {
      tipo: "Educación",
      campo1: form.titulo,
      campo2: form.institucion,
      descripcion: `Estado: ${capitalizarPalabras(form.estado)}`,
      inicio: `${form.desde.año || ""}-${String(form.desde.mes || "").padStart(2, "0")}`,
      fin: `${form.hasta.año || ""}-${String(form.hasta.mes || "").padStart(2, "0")}`,
      multimedia: form.multimedia || [],
      creadoEn: serverTimestamp(),
    });
  });

  experienciasGuardadas.forEach((exp) => {
    const experienciaRef = doc(db, "users", userId, "experiencia", String(exp.id));
    batch.set(experienciaRef, {
      tipo: "Experiencia",
      campo1: exp.cargo,
      campo2: exp.empresa,
      descripcion: exp.descripcion || "",
      inicio: `${exp.desde.año || ""}-${String(exp.desde.mes || "").padStart(2, "0")}`,
      fin: `${exp.hasta.año || ""}-${String(exp.hasta.mes || "").padStart(2, "0")}`,
      creadoEn: serverTimestamp(),
    });
  });

  await batch.commit();
}

// Función para mostrar mensajes
function mostrarMensaje(titulo, mensaje, tipo = "success") {
  const toastElement = document.getElementById("liveToast");
  if (!toastElement) {
    alert(`${titulo}: ${mensaje}`);
    return;
  }

  document.getElementById("toastTitle").textContent = titulo;
  document.getElementById("toastBody").textContent = mensaje;

  const toastHeader = document.querySelector(".toast-header");
  if (tipo === "error") {
    toastHeader.style.backgroundColor = "#dc3545";
    toastHeader.style.color = "white";
  } else {
    toastHeader.style.backgroundColor = "#198754";
    toastHeader.style.color = "white";
  }

  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}

window.validarYCambiarAPaso2 = function () {
  const email = document.getElementById("inputEmail").value;

  if (!email) {
    mostrarMensaje("Error", "Ingresa un correo electrónico", "error");
    return;
  }

  if (!email.includes("@")) {
    mostrarMensaje("Error", "Email inválido", "error");
    return;
  }

  emailTemp = email;
  document.getElementById("inputEmail2").value = email;
  document.getElementById("paso1").classList.add("d-none");
  document.getElementById("paso2").classList.remove("d-none");
};

window.validarYCambiarAPaso3 = function () {
  const nombres = document.getElementById("inputName").value;
  const apellidos = document.getElementById("inputSurname").value;
  const password = document.getElementById("inputPassword").value;
  const confirmPassword = document.getElementById("inputConfirmPassword").value;
  const departamento = document.getElementById("selectDepartamento").value;
  const distrito = document.getElementById("selectDistrito").value;

  if (!nombres) {
    mostrarMensaje("Error", "Ingresa tus nombres", "error");
    return;
  }

  if (!apellidos) {
    mostrarMensaje("Error", "Ingresa tus apellidos", "error");
    return;
  }

  if (!password) {
    mostrarMensaje("Error", "Ingresa una contraseña", "error");
    return;
  }

  if (password !== confirmPassword) {
    mostrarMensaje("Error", "Las contraseñas no coinciden", "error");
    return;
  }

  if (password.length < 6) {
    mostrarMensaje("Error", "La contraseña debe tener al menos 6 caracteres", "error");
    return;
  }

  if (!departamento) {
    mostrarMensaje("Error", "Selecciona un departamento", "error");
    return;
  }

  if (!distrito) {
    mostrarMensaje("Error", "Selecciona un distrito", "error");
    return;
  }

  document.getElementById("paso2").classList.add("d-none");
  document.getElementById("paso3").classList.remove("d-none");
};

window.validarYCambiarAPaso4 = function () {
  const birthDate = document.getElementById("inputBirthDate").value;
  const idType = document.getElementById("inputIdType").value;
  const idNumber = document.getElementById("inputIdNumber").value;
  const phone = document.getElementById("inputPhone").value;

  if (!birthDate) {
    mostrarMensaje("Error", "Ingresa tu fecha de nacimiento", "error");
    return;
  }

  const birthDateObj = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }

  if (age < 18) {
    mostrarMensaje("Error", "Debes ser mayor de 18 años", "error");
    return;
  }

  if (!idType) {
    mostrarMensaje("Error", "Selecciona un tipo de identificación", "error");
    return;
  }

  if (!idNumber) {
    mostrarMensaje("Error", "Ingresa tu número de identificación", "error");
    return;
  }

  if (idType === "dni" && !/^\d{8}$/.test(idNumber)) {
    mostrarMensaje("Error", "El DNI debe tener 8 dígitos", "error");
    return;
  }

  if (!phone) {
    mostrarMensaje("Error", "Ingresa tu número de teléfono", "error");
    return;
  }

  if (!/^\d{9}$/.test(phone)) {
    mostrarMensaje("Error", "El teléfono debe tener 9 dígitos", "error");
    return;
  }

  document.getElementById("paso3").classList.add("d-none");
  document.getElementById("paso4").classList.remove("d-none");
};

window.añadirFormacion = function () {
  const institucionEducativa = document.getElementById("inputInstitution").value;
  const tituloObtenido = document.getElementById("inputDegree").value;
  const estadoSeleccionado = document.querySelector('input[name="estado"]:checked');
  const estadoFormacion = estadoSeleccionado ? estadoSeleccionado.value : "";
  const mesInicio = document.getElementById("inputMesInicio").value;
  const anioInicio = document.getElementById("inputAnioInicio").value;
  const mesFin = document.getElementById("inputMesFin").value;
  const anioFin = document.getElementById("inputAnioFin").value;

  if (!institucionEducativa) {
    mostrarMensaje("Error", "Ingresa el Nombre de la Institución", "error");
    return;
  }

  if (!tituloObtenido) {
    mostrarMensaje("Error", "Ingresa el Título Obtenido", "error");
    return;
  }

  if (!estadoFormacion) {
    mostrarMensaje("Error", "Selecciona el Estado de la Formación", "error");
    return;
  }

  if (!mesInicio || !anioInicio) {
    mostrarMensaje("Error", "Selecciona la fecha de inicio", "error");
    return;
  }

  if (!mesFin || !anioFin) {
    mostrarMensaje("Error", "Selecciona la fecha de fin", "error");
    return;
  }

  const multimediaTemp = [...archivosTemporales];

  const nuevaFormacion = {
    id: Date.now(),
    institucion: institucionEducativa,
    titulo: tituloObtenido,
    estado: estadoFormacion,
    desde: { mes: mesInicio, año: anioInicio },
    hasta: { mes: mesFin, año: anioFin },
    multimedia: multimediaTemp,
  };

  formaciones.push(nuevaFormacion);

  document.getElementById("inputInstitution").value = "";
  document.getElementById("inputDegree").value = "";
  document.getElementById("inputMesInicio").value = "";
  document.getElementById("inputAnioInicio").value = "";
  document.getElementById("inputMesFin").value = "";
  document.getElementById("inputAnioFin").value = "";
  document.getElementById("estadoCursando").checked = true;

  archivosTemporales = [];
  mostrarListaArchivos();
  mostrarFormacionesEnPaso5();

  document.getElementById("paso4").classList.add("d-none");
  document.getElementById("paso5").classList.remove("d-none");

  mostrarMensaje("Éxito", "Formación añadida correctamente", "success");
};

window.validarYCambiarAPaso6 = function () {
  if (formaciones.length === 0) {
    mostrarMensaje("Error", "Debes agregar al menos una formación académica", "error");
    return;
  }
  document.getElementById("paso5").classList.add("d-none");
  document.getElementById("paso6").classList.remove("d-none");
};

function mostrarFormacionesEnPaso5() {
  const container = document.getElementById("listaFormacionesContainer");
  if (!container) return;

  if (formaciones.length === 0) {
    container.innerHTML = '<p class="text-muted text-center">No hay formaciones añadidas</p>';
    return;
  }

  container.innerHTML = formaciones.map((form) => `
    <div class="border rounded-3 p-3 mb-3" style="background-color: #ffce00;">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <div class="fw-bold">${form.institucion}</div>
          <div class="text-muted">${form.titulo}</div>
          <div class="small text-muted mt-1 text-black-50">
            ${form.desde.mes}/${form.desde.año} - ${form.hasta.mes}/${form.hasta.año}
          </div>
        </div>
        <button class="btn btn-sm btn-link text-danger" onclick="eliminarFormacion(${form.id})">
          🗑️
        </button>
      </div>
      ${form.multimedia && form.multimedia.length > 0 ? `
        <div class="mt-3">
          <div class="row g-2">
            ${form.multimedia.map((archivo) => `
              <div class="col-auto">
                <div class="border rounded-2 p-1 text-center" style="width: 70px;">
                  <img src="${archivo.miniatura}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                  <div class="small text-muted" style="font-size: 10px;">${archivo.nombre.substring(0, 8)}${archivo.nombre.length > 8 ? "..." : ""}</div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      ` : ""}
    </div>
  `).join("");
}

window.eliminarFormacion = function (id) {
  formaciones = formaciones.filter((form) => form.id !== id);
  mostrarFormacionesEnPaso5();
  mostrarMensaje("Info", "Formación eliminada", "success");
};

window.volverAFormulario = function () {
  archivosTemporales = [];
  mostrarListaArchivos();
  document.getElementById("paso5").classList.add("d-none");
  document.getElementById("paso4").classList.remove("d-none");
};

// ========== MULTIMEDIA ==========
const inputArchivos = document.getElementById("inputArchivos");
const btnSeleccionar = document.getElementById("btnSeleccionarArchivos");
const listaArchivos = document.getElementById("listaArchivos");

btnSeleccionar?.addEventListener("click", () => {
  inputArchivos.click();
});

inputArchivos?.addEventListener("change", (e) => {
  agregarArchivos(e.target.files);
  inputArchivos.value = "";
});

function obtenerMiniatura(file) {
  if (file.type.startsWith("image/")) {
    return URL.createObjectURL(file);
  } else if (file.type === "application/pdf") {
    return "https://cdn-icons-png.flaticon.com/512/337/337946.png";
  } else if (file.type.startsWith("video/")) {
    return "https://cdn-icons-png.flaticon.com/512/564/564327.png";
  } else {
    return "https://cdn-icons-png.flaticon.com/512/136/136540.png";
  }
}

function agregarArchivos(files) {
  const maxSize = 10 * 1024 * 1024;
  const formatosPermitidos = ["image/jpeg", "image/png", "image/jpg", "application/pdf", "video/mp4"];

  for (let file of files) {
    if (file.size > maxSize) {
      mostrarMensaje("Error", `El archivo ${file.name} excede 10MB`, "error");
      continue;
    }

    if (!formatosPermitidos.includes(file.type)) {
      mostrarMensaje("Error", `Formato no permitido: ${file.name}`, "error");
      continue;
    }

    archivosTemporales.push({
      file: file,
      nombre: file.name,
      tipo: file.type,
      tamaño: file.size,
      miniatura: obtenerMiniatura(file),
    });
  }

  mostrarListaArchivos();
}

function mostrarListaArchivos() {
  if (!listaArchivos) return;

  if (archivosTemporales.length === 0) {
    listaArchivos.innerHTML = "";
    return;
  }

  listaArchivos.innerHTML = `
    <div class="border rounded-3 p-3" style="background-color: #f8f9fa;">
      <div class="fw-bold mb-2">Archivos para esta formación (${archivosTemporales.length})</div>
      <div class="row g-2">
        ${archivosTemporales.map((archivo, index) => `
          <div class="col-auto">
            <div class="border rounded-2 p-2 text-center position-relative">
              <button class="btn btn-sm btn-link text-danger position-absolute top-0 end-0 p-0" onclick="eliminarArchivoTemp(${index})" style="font-size: 12px;">✕</button>
              <img src="${archivo.miniatura}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
              <div class="small text-muted mt-1">${archivo.nombre.substring(0, 10)}${archivo.nombre.length > 10 ? "..." : ""}</div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

window.eliminarArchivoTemp = function (index) {
  archivosTemporales.splice(index, 1);
  mostrarListaArchivos();
};

async function subirTodosLosArchivos(userId) {
  const todasLasUrls = [];

  for (let formacion of formaciones) {
    const urlsFormacion = [];

    if (formacion.multimedia && formacion.multimedia.length > 0) {
      for (let item of formacion.multimedia) {
        try {
          if (!item.file) continue;

          const file = item.file;
          const extension = file.name.split(".").pop();
          const nombreArchivo = `${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
          const path = `users/${userId}/formaciones/${formacion.id}/${nombreArchivo}`;

          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);

          urlsFormacion.push({
            nombre: item.nombre,
            url: url,
            path: path,
            gsUrl: `gs://${storage.app.options.storageBucket}/${path}`,
            tipo: item.tipo,
            tamaño: item.tamaño,
            fecha: new Date(),
          });
        } catch (error) {
          console.error("Error al subir archivo:", error);
        }
      }
    }
    todasLasUrls.push({
      formacionId: formacion.id,
      archivos: urlsFormacion,
    });
  }

  return todasLasUrls;
}

// ========== EXPERIENCIA ==========
window.saltarExperiencia = function () {
  if (confirm("¿Estás seguro de que buscas tu primer empleo?")) {
    window.registrarUsuario();
  }
};

window.añadirExperiencia = function () {
  const cargo = document.getElementById("inputCargo").value;
  const empresa = document.getElementById("inputEmpresa").value;
  const mesInicio = document.getElementById("inputExpMesInicio").value;
  const anioInicio = document.getElementById("inputExpAnioInicio").value;
  const mesFin = document.getElementById("inputExpMesFin").value;
  const anioFin = document.getElementById("inputExpAnioFin").value;
  const descripcion = document.getElementById("inputExpDescripcion").value;

  if (!cargo) {
    mostrarMensaje("Error", "Ingresa el cargo", "error");
    return;
  }

  if (!empresa) {
    mostrarMensaje("Error", "Ingresa el nombre de la empresa", "error");
    return;
  }

  if (!mesInicio || !anioInicio) {
    mostrarMensaje("Error", "Selecciona la fecha de inicio", "error");
    return;
  }

  if (!mesFin || !anioFin) {
    mostrarMensaje("Error", "Selecciona la fecha de fin", "error");
    return;
  }

  if (anioFin < anioInicio || (anioFin == anioInicio && mesFin < mesInicio)) {
    mostrarMensaje("Error", "La fecha de fin no puede ser menor a la fecha de inicio", "error");
    return;
  }

  const nuevaExperiencia = {
    id: Date.now(),
    cargo: cargo,
    empresa: empresa,
    desde: { mes: mesInicio, año: anioInicio },
    hasta: { mes: mesFin, año: anioFin },
    descripcion: descripcion || "",
  };

  experiencias.push(nuevaExperiencia);

  document.getElementById("inputCargo").value = "";
  document.getElementById("inputEmpresa").value = "";
  document.getElementById("inputExpMesInicio").value = "";
  document.getElementById("inputExpAnioInicio").value = "";
  document.getElementById("inputExpMesFin").value = "";
  document.getElementById("inputExpAnioFin").value = "";
  document.getElementById("inputExpDescripcion").value = "";

  mostrarExperienciasEnPaso7();

  document.getElementById("paso6").classList.add("d-none");
  document.getElementById("paso7").classList.remove("d-none");

  mostrarMensaje("Éxito", "Experiencia añadida correctamente", "success");
};

function mostrarExperienciasEnPaso7() {
  const container = document.getElementById("listaExperienciasContainer");
  if (!container) return;

  if (experiencias.length === 0) {
    container.innerHTML = '<p class="text-muted text-center">No hay experiencias añadidas</p>';
    return;
  }

  container.innerHTML = experiencias.map((exp) => `
    <div class="border rounded-3 p-3 mb-3" style="background-color: #e9ecef;">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <div class="fw-bold">${exp.cargo}</div>
          <div class="text-muted">${exp.empresa}</div>
          <div class="small text-muted mt-1">
            ${getNombreMes(exp.desde.mes)}/${exp.desde.año} - ${getNombreMes(exp.hasta.mes)}/${exp.hasta.año}
          </div>
          ${exp.descripcion ? `<div class="small mt-2">${exp.descripcion.substring(0, 100)}${exp.descripcion.length > 100 ? "..." : ""}</div>` : ""}
        </div>
        <button class="btn btn-sm btn-link text-danger" onclick="eliminarExperiencia(${exp.id})">
          🗑️
        </button>
      </div>
    </div>
  `).join("");
}

window.eliminarExperiencia = function (id) {
  if (confirm("¿Eliminar esta experiencia laboral?")) {
    experiencias = experiencias.filter((exp) => exp.id !== id);
    mostrarExperienciasEnPaso7();
    mostrarMensaje("Info", "Experiencia eliminada", "success");
  }
};

window.volverAFormularioExperiencia = function () {
  document.getElementById("paso7").classList.add("d-none");
  document.getElementById("paso6").classList.remove("d-none");
};

// REGISTRO FINAL 
window.finalizarRegistro = function () {
  if (formaciones.length === 0) {
    mostrarMensaje("Error", "Agrega al menos una formación académica", "error");
    return;
  }
  window.registrarUsuario();
};

window.registrarUsuario = async function () {
  const nombres = document.getElementById("inputName").value;
  const apellidos = document.getElementById("inputSurname").value;
  const email = document.getElementById("inputEmail2").value;
  const password = document.getElementById("inputPassword").value;
  const confirmPassword = document.getElementById("inputConfirmPassword").value;
  const departamento = document.getElementById("inputDepartamentoFijo")?.value?.trim() || obtenerTextoSeleccionado("selectDepartamento");
  const distrito = obtenerTextoSeleccionado("selectDistrito");
  const birthDate = document.getElementById("inputBirthDate").value;
  const idType = document.getElementById("inputIdType").value;
  const idNumber = document.getElementById("inputIdNumber").value;
  const phone = document.getElementById("inputPhone").value;

  if (!nombres || !apellidos || !email || !password || !confirmPassword) {
    mostrarMensaje("Error", "Completa todos los campos", "error");
    return;
  }

  if (password !== confirmPassword) {
    mostrarMensaje("Error", "Las contraseñas no coinciden", "error");
    return;
  }

  if (password.length < 6) {
    mostrarMensaje("Error", "La contraseña debe tener al menos 6 caracteres", "error");
    return;
  }

  mostrarMensaje("Procesando", "Creando cuenta...", "success");

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: `${nombres} ${apellidos}` });

    let archivosSubidos = [];
    try {
      archivosSubidos = await subirTodosLosArchivos(user.uid);
    } catch (error) {
      console.error("Error al subir archivos:", error);
    }

    const formacionesParaGuardar = formaciones.map((form) => ({
      id: form.id,
      institucion: form.institucion,
      titulo: form.titulo,
      estado: form.estado,
      desde: form.desde,
      hasta: form.hasta,
      multimedia: archivosSubidos.find((f) => f.formacionId === form.id)?.archivos || [],
    }));

    const cvInicial = formacionesParaGuardar
      .flatMap((form) => form.multimedia || [])
      .find((archivo) => archivo.tipo === "application/pdf");

    await setDoc(doc(db, "users", user.uid), {
      nombres: nombres,
      apellidos: apellidos,
      email: email,
      fechaNacimiento: birthDate,
      tipoIdentificacion: idType,
      numeroIdentificacion: idNumber,
      telefono: phone,
      departamento: departamento,
      distrito: distrito,
      formaciones: formacionesParaGuardar,
      experiencias: experiencias,
      cvNombre: cvInicial?.nombre || "",
      cvUrl: cvInicial?.url || "",
      cvPath: cvInicial?.path || "",
      cvTipo: cvInicial?.tipo || "",
      cvGsUrl: cvInicial?.gsUrl || "",
      cvCargado: Boolean(cvInicial),
      fechaRegistro: new Date(),
      rol: "postulante",
      activo: true,
    });

    await sincronizarPerfilCV(user.uid, formacionesParaGuardar, experiencias);

    mostrarMensaje("Éxito", "¡Usuario registrado correctamente!", "success");
    limpiarFormulario();

    setTimeout(() => {
      window.location.href = "./candidata/dashboard.html";
    }, 2000);

  } catch (error) {
    console.error("Error al registrar usuario:", error);

    let mensajeError = "Error al registrar usuario";
    switch (error.code) {
      case "auth/email-already-in-use":
        mensajeError = "Este correo electrónico ya está registrado";
        break;
      case "auth/invalid-email":
        mensajeError = "El correo electrónico no es válido";
        break;
      case "auth/weak-password":
        mensajeError = "La contraseña es demasiado débil (mínimo 6 caracteres)";
        break;
      default:
        mensajeError = error.message;
    }
    mostrarMensaje("Error", mensajeError, "error");
  }
};

// Botón de Google
document.getElementById("btn-google")?.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      await setDoc(doc(db, "users", user.uid), {
        nombres: user.displayName?.split(" ")[0] || "",
        apellidos: user.displayName?.split(" ").slice(1).join(" ") || "",
        email: user.email,
        fotoUrl: user.photoURL || "",
        fechaRegistro: new Date(),
        rol: "postulante",
        activo: true,
      });
    }

    mostrarMensaje("Éxito", `Bienvenido ${user.displayName || "Usuario"}`, "success");

    setTimeout(() => {
      window.location.href = "./candidata/dashboard.html";
    }, 2000);
  } catch (error) {
    console.error(error);
    mostrarMensaje("Error", "Error con Google", "error");
  }
});

function limpiarFormulario() {
  const inputs = ["inputName", "inputSurname", "inputEmail", "inputEmail2", "inputPassword", "inputConfirmPassword", "inputBirthDate", "inputIdNumber", "inputPhone"];
  inputs.forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });
  emailTemp = "";
  archivosTemporales = [];
  formaciones = [];
  experiencias = [];
  mostrarListaArchivos();
  mostrarFormacionesEnPaso5();
  mostrarExperienciasEnPaso7();
}

function getNombreMes(numeroMes) {
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  return meses[parseInt(numeroMes) - 1];
}

// Datos de ubicación
const distritosPorDepartamento = {
  lima: ["Cercado de Lima", "Ancón", "Ate", "Barranco", "Breña", "Carabayllo", "Chaclacayo", "Chorrillos", "Cieneguilla", "Comas", "El Agustino", "Independencia", "Jesús María", "La Molina", "La Victoria", "Lince", "Los Olivos", "Lurigancho", "Lurín", "Magdalena del Mar", "Miraflores", "Pachacámac", "Pucusana", "Pueblo Libre", "Puente Piedra", "Punta Hermosa", "Punta Negra", "Rímac", "San Bartolo", "San Borja", "San Isidro", "San Juan de Lurigancho", "San Juan de Miraflores", "San Luis", "San Martín de Porres", "San Miguel", "Santa Anita", "Santa María del Mar", "Santa Rosa", "Santiago de Surco", "Surquillo", "Villa El Salvador", "Villa María del Triunfo"],
  arequipa: ["Arequipa", "Cayma", "Yanahuara", "Sachaca", "Cerro Colorado", "Socabaya"],
  cusco: ["Cusco", "San Sebastián", "San Jerónimo", "Santiago", "Wanchaq"],
  piura: ["Piura", "Castilla", "Catacaos", "Veintiséis de Octubre"],
  lambayeque: ["Chiclayo", "José Leonardo Ortiz", "La Victoria", "Pimentel"],
  la_libertad: ["Trujillo", "Víctor Larco", "El Porvenir", "Florencia de Mora"],
  junin: ["Huancayo", "El Tambo", "Chilca", "San Carlos"],
  ancash: ["Huaraz", "Independencia", "Centenario", "Vichay"],
  cajamarca: ["Cajamarca", "Baños del Inca", "Los Baños", "Porcón"],
  ica: ["Ica", "Parcona", "Los Aquijes", "Subtanjalla"],
};

document.getElementById("selectDepartamento")?.addEventListener("change", function () {
  const departamento = this.value;
  const selectDistrito = document.getElementById("selectDistrito");
  selectDistrito.innerHTML = '<option value="" disabled selected>Distrito</option>';
  if (departamento && distritosPorDepartamento[departamento]) {
    distritosPorDepartamento[departamento].forEach((distrito) => {
      const option = document.createElement("option");
      option.value = distrito.toLowerCase().replace(/ /g, "_");
      option.textContent = distrito;
      selectDistrito.appendChild(option);
    });
  }
});

const departamentosPeru = ["Amazonas", "Áncash", "Apurímac", "Arequipa", "Ayacucho", "Cajamarca", "Callao", "Cusco", "Huancavelica", "Huánuco", "Ica", "Junín", "La Libertad", "Lambayeque", "Lima", "Loreto", "Madre de Dios", "Moquegua", "Pasco", "Piura", "Puno", "San Martín", "Tacna", "Tumbes", "Ucayali"];

const selectDepartamento = document.getElementById("selectDepartamento");
if (selectDepartamento) {
  departamentosPeru.forEach((depto) => {
    const option = document.createElement("option");
    option.value = depto.toLowerCase().replace(/ /g, "_");
    option.textContent = depto;
    selectDepartamento.appendChild(option);
  });
}

function poblarDistritosLima() {
  const selectDistrito = document.getElementById("selectDistrito");
  if (!selectDistrito) return;

  selectDistrito.innerHTML = '<option value="" disabled selected>Distrito de Lima</option>';
  distritosPorDepartamento.lima.forEach((distrito) => {
    const option = document.createElement("option");
    option.value = distrito.toLowerCase().replace(/ /g, "_");
    option.textContent = distrito;
    selectDistrito.appendChild(option);
  });
}

function llenarSelectoresAnios() {
  const anioActual = new Date().getFullYear();
  const anioInicio = 1980;
  const selectores = ["inputExpAnioInicio", "inputExpAnioFin"];
  selectores.forEach((selectorId) => {
    const selector = document.getElementById(selectorId);
    if (selector) {
      selector.innerHTML = '<option value="" disabled selected>Año</option>';
      for (let i = anioActual; i >= anioInicio; i--) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        selector.appendChild(option);
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  llenarSelectoresAnios();
  poblarDistritosLima();
  const btnSeleccionarArchivos = document.getElementById("btnSeleccionarArchivos");
  if (btnSeleccionarArchivos) {
    btnSeleccionarArchivos.textContent = "+ Añadir CV o contenido multimedia";
  }
});
