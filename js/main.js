import { auth, db } from '../assets/firebase/config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export async function cargarNavbarCandidata() {
	const placeholder = document.getElementById('navbar-placeholder');
	if (!placeholder) return;

	const esSub = window.location.pathname.includes('/admin/') || window.location.pathname.includes('/candidata/');
	const rutaNav = esSub ? '../components/navbar.html' : './components/navbar.html';
	const prefijoRuta = esSub ? '../' : './';

	try {
		const response = await fetch(rutaNav);
		placeholder.innerHTML = await response.text();

		const navLogo = document.getElementById('nav-logo-link');
		const navInicio = document.getElementById('nav-link-inicio');
		const navOportunidades = document.getElementById('nav-link-oportunidades');
		const navInicioMobile = document.getElementById('nav-mobile-inicio');
		const navOportunidadesMobile = document.getElementById('nav-mobile-oportunidades');
		const navActionsMobile = document.getElementById('nav-actions-mobile');

		if (navLogo) navLogo.href = `${prefijoRuta}index.html`;
		if (navInicio) navInicio.href = `${prefijoRuta}index.html`;
		if (navOportunidades) navOportunidades.href = `${prefijoRuta}empleos.html`;
		if (navInicioMobile) navInicioMobile.href = `${prefijoRuta}index.html`;
		if (navOportunidadesMobile) navOportunidadesMobile.href = `${prefijoRuta}empleos.html`;

		resaltarNavbarActivo();

		const btnMenu = document.getElementById('mobile-menu-button');
		const menu = document.getElementById('mobile-menu');
		if (btnMenu && menu) {
			btnMenu.onclick = () => menu.classList.toggle('hidden');
		}

		onAuthStateChanged(auth, async (user) => {
			const actions = document.getElementById('nav-actions');
			const navLinks = document.getElementById('nav-links');
			if (!actions || !navLinks) return;

			if (user) {
				const snap = await getDoc(doc(db, "users", user.uid));
				const data = snap.exists() ? snap.data() : {};
				const nombre = data?.nombres?.split(' ')[0] || "Candidata";
				const foto = data?.fotoUrl || `https://ui-avatars.com/api/?name=${nombre}&background=008f39&color=fff`;

				navLinks.classList.remove('hidden');
				actions.innerHTML = `
					<div class="relative group">
						<div class="flex items-center space-x-3 cursor-pointer py-4">
							<span class="text-mi-verde font-bold font-helvetica text-sm">Hola, ${nombre}</span>
							<div class="flex flex-col items-center">
								<div class="w-10 h-10 rounded-full border-2 border-mi-amarillo overflow-hidden shadow-sm group-hover:border-mi-verde transition">
									<img src="${foto}" class="w-full h-full object-cover">
								</div>
								<span class="text-[10px] font-black text-mi-verde uppercase">
									Yo <i class='bx bxs-chevron-down'></i>
								</span>
							</div>
						</div>

						<div class="absolute right-0 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 hidden group-hover:block z-50">
							<a href="${prefijoRuta}candidata/dashboard.html" class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-mi-verde transition">
								<i class='bx bx-user-circle text-xl'></i> Mi Perfil / CV
							</a>
							<div class="border-t border-gray-100 my-1"></div>
							<button id="btn-logout-nav" class="w-full flex items-center gap-3 px-4 py-3 text-sm text-mi-rojo hover:bg-red-50 transition font-bold">
								<i class='bx bx-log-out text-xl'></i> Cerrar Sesion
							</button>
						</div>
					</div>
				`;

				if (navActionsMobile) {
					navActionsMobile.innerHTML = `
						<a href="${prefijoRuta}candidata/dashboard.html"
							class="block px-4 py-3 rounded-2xl text-gray-700 font-bold hover:bg-gray-50 hover:text-mi-verde transition">
							Mi Perfil / CV
						</a>
						<button id="btn-logout-nav-mobile"
							class="w-full text-left px-4 py-3 rounded-2xl text-mi-rojo font-bold hover:bg-red-50 transition">
							Cerrar Sesion
						</button>
					`;
				}

				document.getElementById('btn-logout-nav').onclick = async () => {
					await signOut(auth);
					window.location.href = prefijoRuta + 'index.html';
				};

				const btnLogoutMobile = document.getElementById('btn-logout-nav-mobile');
				if (btnLogoutMobile) {
					btnLogoutMobile.onclick = async () => {
						await signOut(auth);
						window.location.href = prefijoRuta + 'index.html';
					};
				}
			} else {
				navLinks.classList.remove('hidden');
				actions.innerHTML = `
					<button onclick="location.href='${prefijoRuta}login.html'" class="text-mi-naranja font-bold px-4 hover:underline">
						Ingresar
					</button>
					<button onclick="location.href='${prefijoRuta}userRegistration.html'" class="bg-mi-verde text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-green-700 transition">
						Registro
					</button>
				`;

				if (navActionsMobile) {
					navActionsMobile.innerHTML = `
						<button onclick="location.href='${prefijoRuta}login.html'"
							class="w-full px-4 py-3 rounded-2xl border border-gray-200 text-mi-naranja font-bold hover:bg-orange-50 transition">
							Ingresar
						</button>
						<button onclick="location.href='${prefijoRuta}userRegistration.html'"
							class="w-full px-4 py-3 rounded-2xl bg-mi-verde text-white font-bold hover:bg-green-700 transition">
							Registro
						</button>
					`;
				}
			}
		});
	} catch (error) {
		console.error("Error cargando el Navbar:", error);
	}
}

function resaltarNavbarActivo() {
	const path = window.location.pathname.toLowerCase();
	const inicioActivo = path.endsWith('/index.html') || path === '/' || path.endsWith('/matchtalentomibanco');
	const oportunidadesActivo = path.includes('empleos.html');

	const items = [
		{ activo: inicioActivo, desktop: document.getElementById('nav-link-inicio'), mobile: document.getElementById('nav-mobile-inicio') },
		{ activo: oportunidadesActivo, desktop: document.getElementById('nav-link-oportunidades'), mobile: document.getElementById('nav-mobile-oportunidades') }
	];

	items.forEach(({ activo, desktop, mobile }) => {
		if (!activo) return;
		desktop?.classList.add('text-mi-verde', 'underline', 'decoration-mi-amarillo', 'decoration-2', 'underline-offset-8');
		mobile?.classList.add('bg-gray-50', 'text-mi-verde', 'underline', 'decoration-mi-amarillo', 'decoration-2');
	});
}

export async function cargarSidebarAdmin() {
	const placeholder = document.getElementById('sidebar-placeholder');
	if (!placeholder) return;

	try {
		const response = await fetch('../components/sidebar-admin.html');
		placeholder.innerHTML = await response.text();

		const path = window.location.pathname;
		if (path.includes('vacantes.html') || path.includes('crear-vacante.html') || path.includes('detalle-vacante.html')) {
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

function activarLink(id) {
	const link = document.getElementById(id);
	if (!link) return;

	link.classList.add('bg-white/10', 'font-bold');
	const span = link.querySelector('span');
	if (span) {
		span.classList.add('underline', 'decoration-mi-amarillo', 'decoration-2');
	}
}

document.addEventListener('DOMContentLoaded', () => {
	cargarNavbarCandidata();
	cargarSidebarAdmin();
});
