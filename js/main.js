import { auth, db } from '../assets/firebase/config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * CARGAR NAVBAR CANDIDATA
 */
export async function cargarNavbarCandidata() {
	const placeholder = document.getElementById('navbar-placeholder');
	if (!placeholder) return;

	// Detectamos si estamos dentro de una subcarpeta (/admin/ o /candidata/) para ajustar las rutas
	const esSub = window.location.pathname.includes('/admin/') || window.location.pathname.includes('/candidata/');
	const rutaNav = esSub ? '../components/navbar.html' : './components/navbar.html';
	const prefijoRuta = esSub ? '../' : './';

	try {
		const response = await fetch(rutaNav);
		const html = await response.text();
		placeholder.innerHTML = html;

		// Lógica para el menú hamburguesa en móviles
		const btnMenu = document.getElementById('mobile-menu-button');
		const menu = document.getElementById('mobile-menu');
		if (btnMenu && menu) {
			btnMenu.onclick = () => menu.classList.toggle('hidden');
		}

		// Observador del estado de autenticación
		onAuthStateChanged(auth, async (user) => {
			const actions = document.getElementById('nav-actions');
			const navLinks = document.getElementById('nav-links');

			if (!actions || !navLinks) return;

			if (user) {
				// Si el usuario está logueado, traemos su información de Firestore
				const snap = await getDoc(doc(db, "users", user.uid));
				const d = snap.data();

				const nombre = d?.nombres?.split(' ')[0] || "Candidata";
				const foto = d?.fotoUrl || `https://ui-avatars.com/api/?name=${nombre}&background=008f39&color=fff`;

				// Mostramos los enlaces de navegación (Inicio, Oportunidades)
				navLinks.classList.remove('hidden');

				// Inyectamos el saludo y el menú desplegable "Yo"
				actions.innerHTML = `
          <div class="relative group">
            <div class="flex items-center space-x-3 cursor-pointer py-4">
              <span class="text-mi-verde font-bold font-helvetica text-sm">¡Hola, ${nombre}!</span>
              <div class="flex flex-col items-center">
                <div class="w-10 h-10 rounded-full border-2 border-mi-amarillo overflow-hidden shadow-sm group-hover:border-mi-verde transition">
                  <img src="${foto}" class="w-full h-full object-cover">
                </div>
                <span class="text-[10px] font-black text-mi-verde uppercase">
                  Yo <i class='bx bxs-chevron-down'></i>
                </span>
              </div>
            </div>

            <div class="absolute right-0 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 hidden group-hover:block z-50 animate-fade-in">
              <a href="${prefijoRuta}candidata/dashboard.html" class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-mi-verde transition">
                <i class='bx bx-user-circle text-xl'></i> Mi Perfil / CV
              </a>
			<!--MIS POSTULACIONES
              <a href="${prefijoRuta}candidata/postulaciones.html" class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-mi-verde transition">
                <i class='bx bx-briefcase-alt-2 text-xl'></i> Mis Postulaciones
              </a>-->
              <div class="border-t border-gray-100 my-1"></div>
              <button id="btn-logout-nav" class="w-full flex items-center gap-3 px-4 py-3 text-sm text-mi-rojo hover:bg-red-50 transition font-bold">
                <i class='bx bx-log-out text-xl'></i> Cerrar Sesión
              </button>
            </div>
          </div>
        `;

				// Configuramos el botón de cerrar sesión
				document.getElementById('btn-logout-nav').onclick = async () => {
					try {
						await signOut(auth);
						window.location.href = prefijoRuta + 'index.html';
					} catch (e) {
						console.error("Error al cerrar sesión:", e);
					}
				};

			} else {
				// Si no hay usuario, ocultamos links y mostramos botones de acceso
				navLinks.classList.add('hidden');
				actions.innerHTML = `
          <button onclick="location.href='${prefijoRuta}login.html'" class="text-mi-naranja font-bold px-4 hover:underline">
            Ingresar
          </button>
          <button onclick="location.href='${prefijoRuta}userRegistration.html'" class="bg-mi-verde text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-green-700 transition">
            Registro
          </button>
        `;
			}
		});

	} catch (error) {
		console.error("Error cargando el Navbar:", error);
	}
}

/**
 * CARGAR SIDEBAR ADMIN
 * Carga el menú lateral del reclutador y resalta la sección activa según la URL.
 */
export async function cargarSidebarAdmin() {
	const placeholder = document.getElementById('sidebar-placeholder');
	if (!placeholder) return;

	try {
		const response = await fetch('../components/sidebar-admin.html');
		const html = await response.text();
		placeholder.innerHTML = html;

		// Detectamos la página actual para marcar el link activo en el sidebar
		const path = window.location.pathname;

		if (path.includes('vacantes.html')) {
			activarLink('link-vacantes');
		} else if (path.includes('postulaciones.html')) {
			activarLink('link-postulaciones');
		} else if (path.includes('dashboard.html')) {
			activarLink('link-progreso');
		}

	} catch (error) {
		console.error("Error cargando el Sidebar:", error);
	}
}

/**
 * AYUDANTE: ACTIVAR LINK
 * Aplica los estilos visuales de "sección activa" al enlace correspondiente.
 */
function activarLink(id) {
	const link = document.getElementById(id);
	if (!link) return;

	// Añadimos fondo suave y resaltamos fuente
	link.classList.add('bg-white/10', 'font-bold');

	// Añadimos el subrayado corporativo de Mibanco
	const span = link.querySelector('span');
	if (span) {
		span.classList.add('underline', 'decoration-mi-amarillo', 'decoration-2');
	}
}

/**
 * INICIALIZACIÓN AUTOMÁTICA
 * Al cargar el documento, intentamos cargar los componentes si los placeholders existen.
 */
document.addEventListener('DOMContentLoaded', () => {
	cargarNavbarCandidata();
	cargarSidebarAdmin();
});