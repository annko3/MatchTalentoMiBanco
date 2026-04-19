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

document.addEventListener('DOMContentLoaded', async () => {
	const btnMenu = document.getElementById('mobile-menu-button');
	const menu = document.getElementById('mobile-menu');

	if (btnMenu && menu) {
		btnMenu.addEventListener('click', () => {
			menu.classList.toggle('hidden');
		});
	}

	const swiperContainer = document.querySelector('.mySwiper');
	if (swiperContainer) {
		new Swiper(".mySwiper", {
			effect: "coverflow",
			grabCursor: true,
			centeredSlides: true,
			slidesPerView: "auto",
			loop: true,
			speed: 1200,
			autoplay: {
				delay: 2000,
				disableOnInteraction: false,
			},
			coverflowEffect: {
				rotate: 30,
				stretch: 0,
				depth: 200,
				modifier: 1,
				slideShadows: true,
			},
			pagination: {
				el: ".swiper-pagination",
				clickable: true,
			},
		});
	}

	renderHistoriasExito();
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
