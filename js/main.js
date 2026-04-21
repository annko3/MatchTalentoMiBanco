import { auth, db, firebaseConfig } from '../assets/firebase/config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
	doc,
	getDoc,
	collection,
	getDocs,
	query,
	where
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { initializeApp as initializeAiApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAI, getGenerativeModel, VertexAIBackend } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-ai.js";

const aiApp = initializeAiApp(firebaseConfig, 'career-chat-ai');
const ai = getAI(aiApp, { backend: new VertexAIBackend() });
const careerAssistantModel = getGenerativeModel(ai, {
	model: 'gemini-2.5-flash'
});

let chatbotMontado = false;
let chatbotAbierto = false;
let chatbotSaludoMostrado = false;
let chatHistorial = [];
let userContextCache = null;
let jobsContextCache = null;

const CHATBOT_WIDGET_ID = 'career-chatbot-widget';

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

		const sidebar = document.getElementById('admin-sidebar');
		const toggle = document.getElementById('admin-sidebar-toggle');
		const overlay = document.getElementById('admin-sidebar-overlay');
		const cerrarSidebar = () => {
			sidebar?.classList.add('-translate-x-full');
			overlay?.classList.add('hidden');
		};
		const abrirSidebar = () => {
			sidebar?.classList.remove('-translate-x-full');
			overlay?.classList.remove('hidden');
		};

		toggle?.addEventListener('click', () => {
			if (sidebar?.classList.contains('-translate-x-full')) abrirSidebar();
			else cerrarSidebar();
		});
		overlay?.addEventListener('click', cerrarSidebar);
		window.addEventListener('resize', () => {
			if (window.innerWidth >= 1024) {
				overlay?.classList.add('hidden');
				sidebar?.classList.remove('-translate-x-full');
			} else {
				sidebar?.classList.add('-translate-x-full');
			}
		});

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

function debeMostrarChatbot() {
	const path = window.location.pathname.toLowerCase();
	return !path.includes('/admin/') && !path.endsWith('/login.html') && !path.endsWith('/userregistration.html');
}

function inyectarEstilosChatbot() {
	if (document.getElementById('career-chatbot-styles')) return;

	const style = document.createElement('style');
	style.id = 'career-chatbot-styles';
	style.textContent = `
		#${CHATBOT_WIDGET_ID} {
			position: fixed;
			right: 22px;
			bottom: 22px;
			z-index: 120;
			font-family: inherit;
		}
		.career-chatbot-fab {
			width: 64px;
			height: 64px;
			border: none;
			border-radius: 999px;
			background: linear-gradient(135deg, #ffdf00, #ff8000);
			color: #0f3a1b;
			font-size: 28px;
			font-weight: 900;
			box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
			cursor: pointer;
			transition: transform 0.2s ease, box-shadow 0.2s ease;
		}
		.career-chatbot-fab:hover {
			transform: translateY(-2px) scale(1.03);
			box-shadow: 0 24px 46px rgba(0, 0, 0, 0.28);
		}
		.career-chatbot-panel {
			position: absolute;
			right: 0;
			bottom: 80px;
			width: min(380px, calc(100vw - 28px));
			height: min(620px, calc(100vh - 110px));
			border-radius: 30px;
			overflow: hidden;
			background: #ffffff;
			box-shadow: 0 30px 80px rgba(0, 0, 0, 0.24);
			display: none;
			flex-direction: column;
			border: 1px solid rgba(0, 0, 0, 0.06);
		}
		.career-chatbot-panel.is-open {
			display: flex;
		}
		.career-chatbot-header {
			padding: 18px 20px;
			background: linear-gradient(135deg, #0f3a1b, #008f39);
			color: #fff;
		}
		.career-chatbot-header h3 {
			margin: 0;
			font-size: 1.02rem;
			font-weight: 900;
			text-transform: uppercase;
			letter-spacing: 0.04em;
		}
		.career-chatbot-header p {
			margin: 6px 0 0;
			font-size: 0.83rem;
			color: rgba(255,255,255,0.86);
			line-height: 1.45;
		}
		.career-chatbot-quick {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;
			padding: 14px 16px 0;
			background: #fff;
		}
		.career-chatbot-quick button {
			border: none;
			border-radius: 999px;
			background: #f3f4f6;
			color: #166534;
			padding: 9px 12px;
			font-size: 0.75rem;
			font-weight: 800;
			cursor: pointer;
		}
		.career-chatbot-body {
			flex: 1;
			padding: 16px;
			overflow-y: auto;
			background: linear-gradient(180deg, #fffdf6 0%, #ffffff 45%);
		}
		.career-chatbot-msg {
			max-width: 88%;
			padding: 12px 14px;
			border-radius: 18px;
			margin-bottom: 12px;
			line-height: 1.5;
			font-size: 0.9rem;
			white-space: pre-wrap;
		}
		.career-chatbot-msg.bot {
			background: #f3f4f6;
			color: #1f2937;
			border-top-left-radius: 6px;
		}
		.career-chatbot-msg.user {
			margin-left: auto;
			background: #008f39;
			color: #fff;
			border-top-right-radius: 6px;
		}
		.career-chatbot-footer {
			padding: 14px;
			border-top: 1px solid rgba(0,0,0,0.06);
			background: #fff;
		}
		.career-chatbot-form {
			display: flex;
			gap: 10px;
		}
		.career-chatbot-input {
			flex: 1;
			border: 1px solid #e5e7eb;
			border-radius: 18px;
			padding: 12px 14px;
			font-size: 0.92rem;
			outline: none;
		}
		.career-chatbot-send {
			border: none;
			border-radius: 16px;
			padding: 0 16px;
			background: #ffdf00;
			color: #14532d;
			font-weight: 900;
			cursor: pointer;
		}
		.career-chatbot-status {
			margin-top: 8px;
			font-size: 0.74rem;
			color: #6b7280;
			min-height: 18px;
		}
		.career-chatbot-empty {
			font-size: 0.82rem;
			color: #6b7280;
			text-align: center;
			padding: 12px 20px 4px;
		}
		@media (max-width: 640px) {
			#${CHATBOT_WIDGET_ID} {
				right: 12px;
				left: 12px;
				bottom: 12px;
			}
			.career-chatbot-panel {
				width: 100%;
				right: 0;
				bottom: 76px;
				height: min(70vh, 560px);
			}
			.career-chatbot-fab {
				margin-left: auto;
				display: block;
			}
		}
	`;

	document.head.appendChild(style);
}

function montarChatbot() {
	if (chatbotMontado || !debeMostrarChatbot()) return;
	injectQuickFixes();
	injectChatbotDom();
	iniciarEventosChatbot();
	chatbotMontado = true;
}

function injectQuickFixes() {
	inyectarEstilosChatbot();
}

function injectChatbotDom() {
	const widget = document.createElement('div');
	widget.id = CHATBOT_WIDGET_ID;
	widget.innerHTML = `
		<div id="career-chatbot-panel" class="career-chatbot-panel" aria-live="polite">
			<div class="career-chatbot-header">
				<h3>Asistente Match Talento</h3>
				<p>Puedo explicarte cada pestaña, ayudarte a completar tu perfil y sugerirte vacantes segun tu experiencia.</p>
			</div>
			<div class="career-chatbot-quick">
				<button type="button" data-chatbot-prompt="Explícame para qué sirve cada sección o pestaña de esta página.">Explícame esta página</button>
				<button type="button" data-chatbot-prompt="¿Qué debería colocar en mi perfil para que esté más completo?">Mejora mi perfil</button>
				<button type="button" data-chatbot-prompt="Recomiéndame el puesto que mejor encaja con mi perfil actual.">Recomiéndame una vacante</button>
			</div>
			<div class="career-chatbot-empty">Pregúntame sobre tu perfil, vacantes o cómo usar la plataforma.</div>
			<div id="career-chatbot-body" class="career-chatbot-body"></div>
			<div class="career-chatbot-footer">
				<form id="career-chatbot-form" class="career-chatbot-form">
					<input id="career-chatbot-input" class="career-chatbot-input" type="text" placeholder="Escribe tu pregunta..." autocomplete="off" />
					<button class="career-chatbot-send" type="submit">Enviar</button>
				</form>
				<div id="career-chatbot-status" class="career-chatbot-status"></div>
			</div>
		</div>
		<button id="career-chatbot-fab" class="career-chatbot-fab" type="button" aria-label="Abrir asistente">
			?
		</button>
	`;

	document.body.appendChild(widget);
}

function iniciarEventosChatbot() {
	const fab = document.getElementById('career-chatbot-fab');
	const panel = document.getElementById('career-chatbot-panel');
	const form = document.getElementById('career-chatbot-form');
	const input = document.getElementById('career-chatbot-input');
	const quickButtons = Array.from(document.querySelectorAll('[data-chatbot-prompt]'));

	fab?.addEventListener('click', async () => {
		chatbotAbierto = !chatbotAbierto;
		panel?.classList.toggle('is-open', chatbotAbierto);
		if (chatbotAbierto && !chatbotSaludoMostrado) {
			await mostrarSaludoChatbot();
		}
		if (chatbotAbierto) {
			input?.focus();
		}
	});

	form?.addEventListener('submit', async (event) => {
		event.preventDefault();
		const mensaje = input?.value?.trim();
		if (!mensaje) return;
		input.value = '';
		await enviarPreguntaChatbot(mensaje);
	});

	quickButtons.forEach((button) => {
		button.addEventListener('click', async () => {
			const mensaje = button.getAttribute('data-chatbot-prompt') || '';
			await enviarPreguntaChatbot(mensaje);
		});
	});
}

async function mostrarSaludoChatbot() {
	chatbotSaludoMostrado = true;
	const saludo = await construirSaludoInicial();
	appendChatMessage('bot', saludo);
}

async function construirSaludoInicial() {
	const contextoPagina = obtenerContextoPagina();
	const perfil = await obtenerContextoUsuario();
	const nombre = perfil?.nombre || 'Hola';

	if (contextoPagina.tipo === 'dashboard') {
		return `Hola ${nombre}. Estoy aquí para ayudarte a completar tu perfil, entender cada pestaña y decirte qué podrías mejorar para postular con más confianza.`;
	}

	if (contextoPagina.tipo === 'empleos') {
		return `Hola ${nombre}. Puedo explicarte esta página, contarte qué vacantes tech abiertas encajan mejor contigo y decirte cómo fortalecer tu perfil antes de postular.`;
	}

	return `Hola ${nombre}. Soy tu asistente de Match Talento Mibanco. Puedo explicarte la plataforma, contarte qué información conviene subir a tu perfil y sugerirte vacantes tech según tu experiencia.`;
}

async function enviarPreguntaChatbot(mensaje) {
	const status = document.getElementById('career-chatbot-status');
	appendChatMessage('user', mensaje);
	status.textContent = 'Pensando una respuesta útil para ti...';

	try {
		const respuesta = await responderConGemini(mensaje);
		appendChatMessage('bot', respuesta);
		status.textContent = '';
	} catch (error) {
		console.error('Error en chatbot:', error);
		appendChatMessage('bot', 'No pude responder en este momento. Intenta de nuevo en unos segundos.');
		status.textContent = '';
	}
}

function appendChatMessage(role, text) {
	const body = document.getElementById('career-chatbot-body');
	const empty = document.querySelector('.career-chatbot-empty');
	if (!body) return;
	if (empty) empty.style.display = 'none';

	const bubble = document.createElement('div');
	bubble.className = `career-chatbot-msg ${role}`;
	bubble.textContent = text;
	body.appendChild(bubble);
	body.scrollTop = body.scrollHeight;
	chatHistorial.push({ role, text });
	chatHistorial = chatHistorial.slice(-10);
}

function detectarIntencionChatbot(message) {
	const texto = (message || '').toLowerCase();
	if (texto.includes('expl') && (texto.includes('página') || texto.includes('pagina') || texto.includes('sección') || texto.includes('seccion'))) {
		return 'explicar_pagina';
	}
	if (texto.includes('perfil') || texto.includes('completo')) {
		return 'perfil';
	}
	if (texto.includes('recom') || texto.includes('vacante') || texto.includes('puesto')) {
		return 'recomendacion';
	}
	return 'general';
}

function limpiarRespuestaChatbot(texto, intencion) {
	let salida = String(texto || '')
		.replace(/\*+/g, '')
		.replace(/^[\-\s]+/gm, '- ')
		.replace(/\n{3,}/g, '\n\n')
		.trim();

	if (!salida) {
		return 'Aún no estoy entrenado para responder esta solicitud, pero puedo ayudarte con tu perfil, las pestañas de la plataforma o las vacantes disponibles.';
	}

	if (/no tengo suficiente información|no cuento con información|no puedo determinar|no puedo responder/i.test(salida)) {
		return 'Aún no estoy entrenado para responder esta solicitud, pero puedo ayudarte con tu perfil, las pestañas de la plataforma o las vacantes disponibles.';
	}

	const lineas = salida.split('\n').map((linea) => linea.trim()).filter(Boolean);
	const limites = {
		explicar_pagina: 6,
		perfil: 7,
		recomendacion: 6,
		general: 7
	};

	if (lineas.length > (limites[intencion] || 7)) {
		salida = lineas.slice(0, limites[intencion] || 7).join('\n');
	}

	return salida;
}

async function responderConGemini(userMessage) {
	const contextoPagina = obtenerContextoPagina();
	const perfil = await obtenerContextoUsuario();
	const vacantes = await obtenerVacantesContexto();
	const intencion = detectarIntencionChatbot(userMessage);
	const historial = chatHistorial
		.filter((item) => item.role === 'user' || item.role === 'bot')
		.slice(-6)
		.map((item) => `${item.role === 'user' ? 'Usuario' : 'Asistente'}: ${item.text}`)
		.join('\n');

	const prompt = `
Eres el Asistente Match Talento Mibanco.
Tu trabajo es ayudar a candidatas a entender la plataforma, completar su perfil y descubrir la vacante tech que más les conviene.

Responde SIEMPRE en español, con tono cálido, claro y práctico.
Usa únicamente la información del contexto que se te entrega aquí. Si algo no está en el contexto, dilo con honestidad.
No uses markdown, no uses asteriscos, no uses títulos largos, no hagas respuestas extensas.
Si no puedes responder con el contexto dado, responde exactamente: "Aún no estoy entrenado para responder esta solicitud, pero puedo ayudarte con tu perfil, las pestañas de la plataforma o las vacantes disponibles."
Si la pregunta es sobre pestañas o secciones, responde con una lista corta de 3 opciones para que la usuaria elija en cuál profundizar.
Si la pregunta es sobre cómo mejorar el perfil, responde con una lista breve de 3 o 4 áreas a reforzar y cierra preguntando cuál quiere completar primero.
Si la pregunta pide recomendación, responde en 4 líneas máximas con este formato:
Puesto: ...
Por qué: ...
Puntos a reforzar: ...
Mucha suerte con tu postulación.
Si la pregunta es general, responde en máximo 5 líneas y termina ofreciendo una ayuda concreta relacionada con perfil, pestañas o vacantes.
No hables como un sistema ni menciones prompts, modelos o JSON.

Página actual:
${contextoPagina.descripcion}

Pestañas o secciones visibles:
${contextoPagina.secciones.join(', ') || 'No identificadas'}

Perfil de la candidata:
${perfil.resumen}

Vacantes abiertas:
${vacantes.map((vacante, index) => `${index + 1}. ${vacante.titulo} | ${vacante.modalidad} | ${vacante.distrito} | ${vacante.descripcion} | Requisitos: ${(vacante.requisitos || []).join(', ')}`).join('\n') || 'No hay vacantes visibles'}

Historial breve:
${historial || 'Sin historial'}

Pregunta de la candidata:
${userMessage}
	`.trim();

	const result = await careerAssistantModel.generateContent(prompt);
	return limpiarRespuestaChatbot(result.response.text(), intencion);
}

function obtenerContextoPagina() {
	const path = window.location.pathname.toLowerCase();

	if (path.includes('dashboard.html')) {
		return {
			tipo: 'dashboard',
			descripcion: 'La candidata está en su perfil. Aquí puede editar datos personales, subir foto, cargar CV y completar experiencia, educación, certificaciones, idiomas y documentos.',
			secciones: ['Experiencia', 'Educación', 'Certificaciones', 'Idiomas', 'Documentos']
		};
	}

	if (path.includes('empleos.html')) {
		return {
			tipo: 'empleos',
			descripcion: 'La candidata está explorando oportunidades. Puede filtrar vacantes por búsqueda, distrito, modalidad y experiencia, ver detalle y postular.',
			secciones: ['Buscar', 'Distritos', 'Modalidad', 'Experiencia', 'Ver detalle', 'Postular']
		};
	}

	return {
		tipo: 'inicio',
		descripcion: 'La candidata está en la página de inicio. Aquí puede conocer la propuesta de Match Talento Mibanco, ver beneficios, explorar puestos tech y leer historias de éxito.',
		secciones: ['Bienvenida', 'Nuestros beneficios', 'Explora puestos tech', 'Historias de éxito']
	};
}

async function obtenerContextoUsuario() {
	if (userContextCache) return userContextCache;
	if (!auth.currentUser) {
		userContextCache = {
			nombre: 'hola',
			resumen: 'La candidata aún no ha iniciado sesión. Solo puedes dar orientación general sobre el uso de la plataforma y las vacantes visibles.'
		};
		return userContextCache;
	}

	const uid = auth.currentUser.uid;
	const userSnap = await getDoc(doc(db, 'users', uid));
	const userData = userSnap.exists() ? userSnap.data() : {};

	const [experiencia, educacion, idiomas, certificaciones] = await Promise.all([
		leerSubcoleccion(uid, 'experiencia'),
		leerSubcoleccion(uid, 'educacion'),
		leerSubcoleccion(uid, 'idiomas'),
		leerSubcoleccion(uid, 'certificaciones')
	]);

	const nombre = userData.nombres || 'hola';
	userContextCache = {
		nombre,
		resumen: [
			`Nombre: ${[userData.nombres, userData.apellidos].filter(Boolean).join(' ') || 'No registrado'}`,
			`Distrito: ${userData.distrito || 'No registrado'}`,
			`Teléfono: ${userData.telefono || 'No registrado'}`,
			`CV cargado: ${userData.cvNombre ? `Sí, ${userData.cvNombre}` : 'No'}`,
			`Experiencia: ${experiencia.length ? experiencia.map((item) => `${item.campo1} en ${item.campo2}`).join('; ') : 'Sin registros'}`,
			`Educación: ${educacion.length ? educacion.map((item) => `${item.campo1} - ${item.campo2}`).join('; ') : 'Sin registros'}`,
			`Certificaciones: ${certificaciones.length ? certificaciones.map((item) => `${item.campo1} - ${item.campo2}`).join('; ') : 'Sin registros'}`,
			`Idiomas: ${idiomas.length ? idiomas.map((item) => `${item.campo1} (${item.campo2})`).join('; ') : 'Sin registros'}`
		].join('\n')
	};

	return userContextCache;
}

async function obtenerVacantesContexto() {
	if (jobsContextCache) return jobsContextCache;

	const snap = await getDocs(query(collection(db, 'vacantes'), where('estado', '==', 'abierta')));
	jobsContextCache = snap.docs
		.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
		.slice(0, 8)
		.map((vacante) => ({
			titulo: vacante.titulo || 'Vacante',
			modalidad: vacante.modalidad || 'Flexible',
			distrito: vacante.distrito || 'Lima',
			descripcion: resumir(vacante.descripcion || 'Sin descripción registrada.', 180),
			requisitos: Array.isArray(vacante.requisitos) ? vacante.requisitos.slice(0, 5) : []
		}));

	return jobsContextCache;
}

async function leerSubcoleccion(uid, nombreColeccion) {
	try {
		const snap = await getDocs(collection(db, 'users', uid, nombreColeccion));
		return snap.docs.map((docSnap) => docSnap.data());
	} catch (error) {
		console.warn(`No se pudo leer la subcolección ${nombreColeccion}:`, error);
		return [];
	}
}

function resumir(texto, maxLength = 180) {
	if (!texto || texto.length <= maxLength) return texto;
	return `${texto.slice(0, maxLength).trim()}...`;
}

document.addEventListener('DOMContentLoaded', () => {
	cargarNavbarCandidata();
	cargarSidebarAdmin();
	montarChatbot();
});
