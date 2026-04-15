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
  updateProfile
} from "../firebase/config.js";

let emailTemp = "";

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
}

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
}

window.registrarUsuario = async function () {
  const nombres = document.getElementById("inputName").value;
  const apellidos = document.getElementById("inputSurname").value;
  const email = document.getElementById("inputEmail2").value;
  const password = document.getElementById("inputPassword").value;
  const confirmPassword = document.getElementById("inputConfirmPassword").value;
  const departamento = document.getElementById('selectDepartamento')?.value;
  const distrito = document.getElementById('selectDistrito')?.value;

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

  try {
    mostrarMensaje("Procesando", "Creando cuenta...", "success");

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: `${nombres} ${apellidos}` });

    const archivosSubidos = await subirArchivos(user.uid);

    await setDoc(doc(db, "usuarios", user.uid), {
      nombres: nombres,
      apellidos: apellidos,
      email: email,
      fechaRegistro: new Date(),
      rol: "usuario",
      activo: true,
      departamento: departamento,
      distrito: distrito,
      multimedia: archivosSubidos
    });

    mostrarMensaje("Éxito", archivosSubidos.length > 0 ? 
      `¡Registro exitoso! Se subieron ${archivosSubidos.length} archivos` : 
      "¡Usuario registrado correctamente!", "success");
    limpiarFormulario();

    setTimeout(() => {
      alert("Usuario registrado");
    }, 2000);

  } catch (error) {
    console.error("Error al registrar usuario:", error);

    let mensajeError = "Error al registrar usuario";
    switch (error.code) {
      case 'auth/email-already-in-use':
        mensajeError = "Este correo electrónico ya está registrado";
        break;
      case 'auth/invalid-email':
        mensajeError = "El correo electrónico no es válido";
        break;
      case 'auth/weak-password':
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

    const userDoc = await getDoc(doc(db, "usuarios", user.uid));

    if (!userDoc.exists()) {
      await setDoc(doc(db, "usuarios", user.uid), {
        nombres: user.displayName?.split(" ")[0] || "",
        apellidos: user.displayName?.split(" ").slice(1).join(" ") || "",
        email: user.email,
        fotoURL: user.photoURL || "",
        fechaRegistro: new Date(),
        rol: "usuario",
        activo: true,
      });
    }

    mostrarMensaje("Éxito", `Bienvenido ${user.displayName || "Usuario"}`, "success");

    setTimeout(() => {
      alert("Redirigiendo...");
    }, 2000);
  } catch (error) {
    console.error(error);
    mostrarMensaje("Error", "Error con Google", "error");
  }
});

// ========== MULTIMEDIA ==========
const inputArchivos = document.getElementById('inputArchivos');
const btnSeleccionar = document.getElementById('btnSeleccionarArchivos');
const listaArchivos = document.getElementById('listaArchivos');
let archivosSeleccionados = [];

btnSeleccionar?.addEventListener('click', () => {
  inputArchivos.click();
});

inputArchivos?.addEventListener('change', (e) => {
  agregarArchivos(e.target.files);
  inputArchivos.value = '';
});

function agregarArchivos(files) {
  const maxSize = 10 * 1024 * 1024;
  const formatosPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'video/mp4'];
  
  for (let file of files) {
    if (file.size > maxSize) {
      mostrarMensaje('Error', `El archivo ${file.name} excede 10MB`, 'error');
      continue;
    }
    
    if (!formatosPermitidos.includes(file.type)) {
      mostrarMensaje('Error', `Formato no permitido: ${file.name}. Usa JPG, PNG, PDF o MP4`, 'error');
      continue;
    }
    
    archivosSeleccionados.push(file);
  }
  
  mostrarListaArchivos();
}

function mostrarListaArchivos() {
  if (!listaArchivos) return;
  
  if (archivosSeleccionados.length === 0) {
    listaArchivos.innerHTML = '';
    return;
  }
  
  listaArchivos.innerHTML = `
    <div class="border rounded-3 p-3" style="background-color: #f8f9fa;">
      <div class="fw-bold mb-2">Archivos seleccionados (${archivosSeleccionados.length})</div>
      ${archivosSeleccionados.map((file, index) => `
        <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
          <div class="d-flex align-items-center gap-2">
            <span>${file.type.includes('image') ? '🖼️' : file.type.includes('pdf') ? '📄' : '🎥'}</span>
            <div>
              <div class="small fw-bold">${file.name}</div>
              <div class="small text-muted">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
          </div>
          <button class="btn btn-sm btn-link text-danger text-decoration-none" onclick="eliminarArchivo(${index})">✕</button>
        </div>
      `).join('')}
    </div>
  `;
}

window.eliminarArchivo = function(index) {
  archivosSeleccionados.splice(index, 1);
  mostrarListaArchivos();
}

async function subirArchivos(userId) {
  if (archivosSeleccionados.length === 0) return [];
  
  const urls = [];
  
  for (let file of archivosSeleccionados) {
    try {
      const extension = file.name.split('.').pop();
      const nombreArchivo = `${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
      const path = `usuarios/${userId}/multimedia/${nombreArchivo}`;
      
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      urls.push({
        nombre: file.name,
        url: url,
        tipo: file.type,
        tamaño: file.size,
        fecha: new Date()
      });
      
    } catch (error) {
      console.error('Error al subir archivo:', error);
      mostrarMensaje('Error', `Error al subir ${file.name}`, 'error');
    }
  }
  
  return urls;
}

function limpiarFormulario() {
  const inputs = ["inputName", "inputSurname", "inputEmail", "inputEmail2", "inputPassword", "inputConfirmPassword"];
  inputs.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });
  emailTemp = "";
  archivosSeleccionados = [];
  mostrarListaArchivos();
}

// Datos de ubicación
const distritosPorDepartamento = {
  lima: ['Lima', 'Miraflores', 'San Isidro', 'San Borja', 'Surco', 'La Molina', 'Barranco'],
  arequipa: ['Arequipa', 'Cayma', 'Yanahuara', 'Sachaca', 'Cerro Colorado', 'Socabaya'],
  cusco: ['Cusco', 'San Sebastián', 'San Jerónimo', 'Santiago', 'Wanchaq'],
  piura: ['Piura', 'Castilla', 'Catacaos', 'Veintiséis de Octubre'],
  lambayeque: ['Chiclayo', 'José Leonardo Ortiz', 'La Victoria', 'Pimentel'],
  la_libertad: ['Trujillo', 'Víctor Larco', 'El Porvenir', 'Florencia de Mora'],
  junin: ['Huancayo', 'El Tambo', 'Chilca', 'San Carlos'],
  ancash: ['Huaraz', 'Independencia', 'Centenario', 'Vichay'],
  cajamarca: ['Cajamarca', 'Baños del Inca', 'Los Baños', 'Porcón'],
  ica: ['Ica', 'Parcona', 'Los Aquijes', 'Subtanjalla']
};

document.getElementById('selectDepartamento')?.addEventListener('change', function() {
  const departamento = this.value;
  const selectDistrito = document.getElementById('selectDistrito');

  selectDistrito.innerHTML = '<option value="" disabled selected>Distrito</option>';

  if (departamento && distritosPorDepartamento[departamento]) {
    distritosPorDepartamento[departamento].forEach(distrito => {
      const option = document.createElement('option');
      option.value = distrito.toLowerCase().replace(/ /g, '_');
      option.textContent = distrito;
      selectDistrito.appendChild(option);
    });
  }
});

const departamentosPeru = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 
  'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 
  'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 
  'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'
];

const selectDepartamento = document.getElementById('selectDepartamento');
if (selectDepartamento) {
  departamentosPeru.forEach(depto => {
    const option = document.createElement('option');
    option.value = depto.toLowerCase().replace(/ /g, '_');
    option.textContent = depto;
    selectDepartamento.appendChild(option);
  });
}