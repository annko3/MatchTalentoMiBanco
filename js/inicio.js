import { db } from '../assets/firebase/config.js';
import {
	collection,
	getDocs,
	query,
	where
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const historiasExito = [
  {
    nombre: "Roxana",
    cargo: "Asesora de Negocios",
    historia: "Entro buscando su primera oportunidad formal y hoy acompana a emprendedoras de su comunidad con metas mas grandes.",
    tono: "naranja"
  },
  {
    nombre: "Milagros",
    cargo: "Analista de Creditos",
    historia: "Fortalecio su manejo comercial, gano confianza en campo y se convirtio en referente para nuevas companeras del equipo.",
    tono: "verde"
  },
  {
    nombre: "Yuliana",
    cargo: "Supervisora de Agencia",
    historia: "Comenzo en un rol operativo y fue creciendo con acompanamiento, formacion y una ruta clara de desarrollo interno.",
    tono: "amarillo"
  }
];

document.addEventListener('DOMContentLoaded', () => {
	renderHistoriasExito();
	cargarPreviewTech();
	cargarFooter();
	inicializarCarrusel3D();
});

function renderHistoriasExito() {
	const contenedor = document.getElementById("historias-exito-grid");
	if (!contenedor) return;

	const estilos = {
		naranja: "border-mi-naranja text-mi-naranja",
		verde: "border-mi-verde text-mi-verde",
		amarillo: "border-mi-amarillo text-yellow-600"
	};

	contenedor.innerHTML = historiasExito.map((historia, index) => `
		<article class="bg-white rounded-[28px] p-8 shadow-xl border border-white/80">
			<div class="flex items-center justify-between mb-6">
				<span class="text-xs font-black uppercase tracking-[0.25em] text-gray-400">Historia ${index + 1}</span>
				<span class="inline-flex items-center justify-center w-11 h-11 rounded-full border-2 ${estilos[historia.tono]} font-black">
					${historia.nombre.charAt(0)}
				</span>
			</div>
			<h3 class="text-2xl font-black text-mi-verde uppercase">${historia.nombre}</h3>
			<p class="text-sm font-bold text-gray-500 uppercase mt-2">${historia.cargo}</p>
			<p class="text-gray-600 leading-relaxed mt-6">${historia.historia}</p>
		</article>
	`).join('');
}

async function cargarPreviewTech() {
	const contenedor = document.getElementById("tech-preview-grid");
	if (!contenedor) return;

	try {
		const ahora = new Date();
		const q = query(collection(db, "vacantes"), where("estado", "==", "abierta"));
		const snap = await getDocs(q);

		const vacantes = snap.docs
			.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
			.filter((vacante) => {
				const inicio = vacante.fechaInicio?.toDate?.();
				const fin = vacante.fechaFin?.toDate?.();
				return inicio && fin && ahora >= inicio && ahora <= fin;
			});

		const techKeywords = [
			'tech', 'tecnologia', 'tecnologico', 'tecnica', 'tecnico',
			'software', 'desarrollo', 'desarrollador', 'frontend', 'backend',
			'full stack', 'fullstack', 'qa', 'datos', 'data', 'analitica',
			'analytics', 'bi', 'cloud', 'nube', 'ux', 'ui', 'producto',
			'soporte', 'sistemas', 'devops', 'seguridad', 'ciberseguridad',
			'programacion', 'programador', 'automatizacion', 'scrum'
		];

		const techVacantes = vacantes.filter((vacante) => {
			const texto = [
				vacante.titulo || '',
				vacante.descripcion || '',
				...(vacante.requisitos || [])
			].join(' ').toLowerCase();

			return techKeywords.some((keyword) => texto.includes(keyword));
		});

		const seleccion = (techVacantes.length ? techVacantes : vacantes).slice(0, 3);
		if (!seleccion.length) {
			renderFallbackTech(contenedor);
			return;
		}

		contenedor.innerHTML = seleccion.map((vacante, index) => {
			const tonos = [
				'border-mi-naranja text-mi-naranja',
				'border-mi-verde text-mi-verde',
				'border-mi-amarillo text-yellow-600'
			];
			const tono = tonos[index % tonos.length];
			const modalidad = vacante.modalidad || 'Flexible';
			const distrito = modalidad === 'Remoto' ? 'Remoto' : (vacante.distrito || 'Lima');
			const descripcion = resumirTexto(vacante.descripcion || 'Explora una oportunidad tech con impacto real en Mibanco.', 150);
			const requisitos = (vacante.requisitos || []).slice(0, 2).map((item) => `<li>${item}</li>`).join('');

			return `
				<a href="./empleos.html" class="group block bg-white rounded-[30px] p-8 shadow-xl border border-gray-100 hover:-translate-y-1 hover:shadow-2xl transition">
					<div class="flex items-start justify-between gap-4">
						<div>
							<p class="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">Tech role</p>
							<h3 class="mt-3 text-2xl font-black text-mi-verde uppercase leading-tight">${vacante.titulo || 'Oportunidad tech'}</h3>
						</div>
						<span class="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 ${tono} font-black shrink-0">
							${String(vacante.titulo || 'T').trim().charAt(0).toUpperCase()}
						</span>
					</div>

					<div class="mt-6 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-500">
						<span class="rounded-full bg-gray-100 px-3 py-2">${modalidad}</span>
						<span class="rounded-full bg-gray-100 px-3 py-2">${distrito}</span>
					</div>

					<p class="mt-6 text-gray-600 leading-relaxed min-h-[84px]">${descripcion}</p>

					<div class="mt-6">
						<p class="text-xs font-black uppercase tracking-[0.25em] text-gray-400 mb-3">Puntos clave</p>
						<ul class="space-y-2 text-sm text-gray-600">
							${requisitos || '<li>Rol orientado a tecnologia, analisis y mejora continua.</li>'}
						</ul>
					</div>

					<div class="mt-8 flex items-center justify-between">
						<span class="text-sm font-black uppercase tracking-[0.18em] text-mi-verde group-hover:text-mi-naranja transition">
							Ir a oportunidades
						</span>
						<span class="inline-flex items-center justify-center w-11 h-11 rounded-full bg-mi-verde text-white text-xl group-hover:bg-mi-naranja transition">
							+
						</span>
					</div>
				</a>
			`;
		}).join('');
	} catch (error) {
		console.error('No se pudo cargar la vista previa tech:', error);
		renderFallbackTech(contenedor);
	}
}

function renderFallbackTech(contenedor) {
	const fallback = [
		{
			titulo: 'Frontend Developer',
			modalidad: 'Hibrido',
			distrito: 'San Isidro',
			descripcion: 'Construye interfaces claras para productos financieros con foco en experiencia de usuaria.',
			puntos: ['React y maquetacion UI', 'Trabajo con producto y negocio']
		},
		{
			titulo: 'Analista de Datos',
			modalidad: 'Remoto',
			distrito: 'Remoto',
			descripcion: 'Convierte datos en decisiones para mejorar procesos, seguimiento comercial y oportunidades de crecimiento.',
			puntos: ['SQL y visualizacion', 'Metricas y analisis accionable']
		},
		{
			titulo: 'QA Automation',
			modalidad: 'Presencial',
			distrito: 'Lima',
			descripcion: 'Impulsa calidad en cada entrega con pruebas automatizadas y mirada critica sobre la experiencia final.',
			puntos: ['Testing automatizado', 'Mejora continua']
		}
	];

	contenedor.innerHTML = fallback.map((vacante, index) => {
		const tonos = [
			'border-mi-naranja text-mi-naranja',
			'border-mi-verde text-mi-verde',
			'border-mi-amarillo text-yellow-600'
		];
		const tono = tonos[index % tonos.length];

		return `
			<a href="./empleos.html" class="group block bg-white rounded-[30px] p-8 shadow-xl border border-gray-100 hover:-translate-y-1 hover:shadow-2xl transition">
				<div class="flex items-start justify-between gap-4">
					<div>
						<p class="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">Tech role</p>
						<h3 class="mt-3 text-2xl font-black text-mi-verde uppercase leading-tight">${vacante.titulo}</h3>
					</div>
					<span class="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 ${tono} font-black shrink-0">
						${vacante.titulo.charAt(0)}
					</span>
				</div>
				<div class="mt-6 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-500">
					<span class="rounded-full bg-gray-100 px-3 py-2">${vacante.modalidad}</span>
					<span class="rounded-full bg-gray-100 px-3 py-2">${vacante.distrito}</span>
				</div>
				<p class="mt-6 text-gray-600 leading-relaxed min-h-[84px]">${vacante.descripcion}</p>
				<div class="mt-6">
					<p class="text-xs font-black uppercase tracking-[0.25em] text-gray-400 mb-3">Puntos clave</p>
					<ul class="space-y-2 text-sm text-gray-600">
						${vacante.puntos.map((item) => `<li>${item}</li>`).join('')}
					</ul>
				</div>
				<div class="mt-8 flex items-center justify-between">
					<span class="text-sm font-black uppercase tracking-[0.18em] text-mi-verde group-hover:text-mi-naranja transition">
						Ir a oportunidades
					</span>
					<span class="inline-flex items-center justify-center w-11 h-11 rounded-full bg-mi-verde text-white text-xl group-hover:bg-mi-naranja transition">
						+
					</span>
				</div>
			</a>
		`;
	}).join('');
}

function resumirTexto(texto, maxLength) {
	if (!texto || texto.length <= maxLength) return texto;
	return `${texto.slice(0, maxLength).trim()}...`;
}

function inicializarCarrusel3D() {
	const shell = document.getElementById('inicio-carousel');
	if (!shell) return;

	const items = Array.from(shell.querySelectorAll('.carousel-item'));
	if (!items.length) return;

	let angle = 0;
	let targetAngle = 0;
	let isDragging = false;
	let startX = 0;
	let startAngle = 0;
	let paused = false;
	let resumeTimeout = null;

	function getRadius() {
		const width = shell.offsetWidth;
		return width < 240 ? width * 0.7 : width * 0.8;
	}

	function posicionarItems() {
		const radius = getRadius();
		items.forEach((item, index) => {
			const itemAngle = (360 / items.length) * index;
			item.style.transform = `rotateY(${itemAngle}deg) translateZ(${radius}px)`;
		});
	}

	function render() {
		angle += (targetAngle - angle) * 0.08;
		if (!paused && !isDragging) {
			targetAngle -= 0.15;
		}
		shell.style.transform = `rotateX(-10deg) rotateY(${angle}deg)`;
		requestAnimationFrame(render);
	}

	function pauseTemporal() {
		paused = true;
		clearTimeout(resumeTimeout);
		resumeTimeout = setTimeout(() => {
			if (!isDragging) paused = false;
		}, 1400);
	}

	function onPointerDown(clientX) {
		isDragging = true;
		paused = true;
		startX = clientX;
		startAngle = targetAngle;
		shell.classList.add('is-dragging');
	}

	function onPointerMove(clientX) {
		if (!isDragging) return;
		const delta = clientX - startX;
		targetAngle = startAngle + delta * 0.28;
	}

	function onPointerUp() {
		isDragging = false;
		shell.classList.remove('is-dragging');
		pauseTemporal();
	}

	shell.addEventListener('mouseenter', () => {
		paused = true;
	});

	shell.addEventListener('mouseleave', () => {
		if (!isDragging) paused = false;
	});

	shell.addEventListener('mousemove', () => {
		if (!isDragging) pauseTemporal();
	});

	shell.addEventListener('mousedown', (event) => onPointerDown(event.clientX));
	window.addEventListener('mousemove', (event) => onPointerMove(event.clientX));
	window.addEventListener('mouseup', onPointerUp);

	shell.addEventListener('touchstart', (event) => {
		onPointerDown(event.touches[0].clientX);
	}, { passive: true });

	window.addEventListener('touchmove', (event) => {
		onPointerMove(event.touches[0].clientX);
	}, { passive: true });

	window.addEventListener('touchend', onPointerUp);
	window.addEventListener('resize', posicionarItems);

	posicionarItems();
	render();
}

async function cargarFooter() {
	const placeholder = document.getElementById('footer-placeholder');
	if (!placeholder) return;

	try {
		const response = await fetch('./components/footer.html');
		placeholder.innerHTML = await response.text();
	} catch (error) {
		console.error('No se pudo cargar el footer:', error);
	}
}
