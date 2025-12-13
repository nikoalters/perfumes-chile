// assets/js/app.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("APP.JS CARGADO CORRECTAMENTE");
    cargarMarcasFiltro(); 
    renderizarCatalogo(); 
    actualizarContadorCarrito();
    setupFiltros(); 
});

// --- LISTA DE MARCAS ---
const MARCAS_CONOCIDAS = [
    "ADOLFO DOMINGUEZ", "AFNAN", "AL HARAMAIN", "ANTONIO BANDERAS", "ARIANA GRANDE", 
    "ARMAF", "ARMANI", "AZZARO", "BENETTON", "BHARARA", "BURBERRY", "CACHAREL", 
    "CALVIN KLEIN", "CAROLINA HERRERA", "CLINIQUE", "COACH", "DIESEL", "DOLCE & GABBANA", 
    "DONNA KARAN", "GIVENCHY", "GUCCI", "GUESS", "HALLOWEEN", "HERMES", "HUGO BOSS", 
    "ISSEY MIYAKE", "JEAN PAUL GAULTIER", "JIMMY CHOO", "KENZO", "LACOSTE", "LANCOME", 
    "LATTAFA", "MAISON ALHAMBRA", "MONCLER", "MONTBLANC", "MOSCHINO", "MUGLER", 
    "PACO RABANNE", "RALPH LAUREN", "RASSASI", "SALVATORE FERRAGAMO", "TOMMY HILFIGER", 
    "TOUS", "VERSACE", "VICTOR&ROLF", "VICTORINOX", "YVES SAINT LAURENT"
];

// --- 1. LÓGICA DE RENDERIZADO OPTIMIZADA ---

/* REEMPLAZA TU FUNCIÓN renderizarCatalogo POR ESTA: */

function renderizarCatalogo() {
    const productos = obtenerProductos(); 
    const contenedor = document.getElementById('contenedor-productos');
    
    // 1. Obtener valores de los filtros
    const textoBusqueda = document.getElementById('input-buscador').value.toLowerCase();
    const precioMax = Number(document.getElementById('rangoPrecio').value);
    const marcaSeleccionada = document.getElementById('selectMarca').value;
    const mlSeleccionado = document.getElementById('selectML').value;
    const generosSeleccionados = Array.from(document.querySelectorAll('.filtro-genero:checked')).map(cb => cb.value);

    // 2. Filtrar productos (Esta lógica no cambia)
    const productosFiltrados = productos.filter(prod => {
        const nombre = prod.nombre.toLowerCase();
        
        if (!nombre.includes(textoBusqueda)) return false;
        if (prod.precio > precioMax) return false;
        if (generosSeleccionados.length > 0 && !generosSeleccionados.includes(prod.categoria)) return false;

        if (marcaSeleccionada !== 'todas') {
            if (!nombre.toUpperCase().includes(marcaSeleccionada.toUpperCase())) return false;
        }

        if (mlSeleccionado !== 'todos') {
            const mlEnNombre = extraerML(prod.nombre);
            if (mlSeleccionado === "30" && mlEnNombre > 35) return false;
            if (mlSeleccionado === "50" && (mlEnNombre < 35 || mlEnNombre > 75)) return false;
            if (mlSeleccionado === "80" && (mlEnNombre < 76 || mlEnNombre > 95)) return false;
            if (mlSeleccionado === "100" && (mlEnNombre < 96 || mlEnNombre > 125)) return false;
            if (mlSeleccionado === "200" && mlEnNombre < 126) return false;
        }

        return true;
    });

    // 3. Actualizar contador
    const contadorEl = document.getElementById('cantidad-resultados');
    if(contadorEl) contadorEl.innerText = productosFiltrados.length;

    // 4. DIBUJAR EN DOM (¡Aquí está la magia de la limpieza!)
    if (productosFiltrados.length === 0) {
        contenedor.innerHTML = '<div class="col-12 text-center py-5"><h3>😕 No hay resultados</h3><p>Intenta ajustar tus filtros.</p></div>';
        return;
    }

    // Usamos la nueva función "crearTarjetaHTML" que hicimos abajo
    const htmlString = productosFiltrados.map(crearTarjetaHTML).join('');

    contenedor.innerHTML = htmlString;
}

// --- UTILIDADES ---

function cargarMarcasFiltro() {
    const select = document.getElementById('selectMarca');
    if (!select) return;
    
    MARCAS_CONOCIDAS.sort().forEach(marca => {
        const option = document.createElement('option');
        option.value = marca;
        option.textContent = marca;
        select.appendChild(option);
    });
}

function extraerML(texto) {
    const match = texto.match(/(\d+)\s*ml/i);
    return match ? parseInt(match[1]) : 0;
}

function setupFiltros() {
    let timeout;
    const filtrarConRetraso = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => renderizarCatalogo(), 100);
    };

    document.getElementById('input-buscador').addEventListener('input', filtrarConRetraso);
    
    const rangoPrecio = document.getElementById('rangoPrecio');
    const precioValor = document.getElementById('precio-valor');
    
    rangoPrecio.addEventListener('input', (e) => {
        precioValor.innerText = `$${parseInt(e.target.value).toLocaleString('es-CL')}`;
        filtrarConRetraso();
    });

    document.getElementById('selectMarca').addEventListener('change', renderizarCatalogo);
    document.getElementById('selectML').addEventListener('change', renderizarCatalogo);
    
    document.querySelectorAll('.filtro-genero').forEach(cb => {
        cb.addEventListener('change', renderizarCatalogo);
    });
}

window.limpiarFiltros = function() {
    document.getElementById('input-buscador').value = '';
    document.getElementById('rangoPrecio').value = 150000;
    document.getElementById('precio-valor').innerText = '$150.000';
    document.getElementById('selectMarca').value = 'todas';
    document.getElementById('selectML').value = 'todos';
    document.querySelectorAll('.filtro-genero').forEach(cb => cb.checked = false);
    renderizarCatalogo();
};

// --- NAVEGACIÓN DESDE MENÚ Y BANNER (NUEVO) ---

window.filtrarDesdeMenu = function(genero) {
    // 1. Limpiamos cualquier filtro previo
    window.limpiarFiltros();

    // 2. Marcamos el checkbox correspondiente
    if (genero === 'hombre') document.getElementById('checkHombre').checked = true;
    if (genero === 'mujer') document.getElementById('checkMujer').checked = true;
    if (genero === 'unisex') document.getElementById('checkUnisex').checked = true;

    // 3. Aplicamos el filtro y bajamos suavemente
    renderizarCatalogo();
    
    // Si estamos en móvil, cerramos el menú offcanvas si está abierto (Bootstrap)
    const sidebarElement = document.getElementById('sidebarFiltros');
    if (sidebarElement.classList.contains('show')) {
        const bsOffcanvas = bootstrap.Offcanvas.getInstance(sidebarElement);
        if (bsOffcanvas) bsOffcanvas.hide();
    }

    // Scroll suave al contenedor de productos
    setTimeout(() => {
        document.getElementById('contenedor-productos').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
};

window.verCatalogoCompleto = function() {
    window.limpiarFiltros();
    // Scroll suave
    document.getElementById('contenedor-productos').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// --- CARRITO ---
function obtenerCarrito() {
    const carritoGuardado = localStorage.getItem('carrito_compras');
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
}

function agregarAlCarrito(idProducto) {
    const productos = obtenerProductos();
    const carrito = obtenerCarrito();
    const productoEncontrado = productos.find(p => p.id === idProducto);

    if (productoEncontrado) {
        carrito.push(productoEncontrado);
        localStorage.setItem('carrito_compras', JSON.stringify(carrito));
        
        Swal.fire({
            title: '¡Excelente!',
            text: `Agregaste ${productoEncontrado.nombre}`,
            imageUrl: productoEncontrado.imagen,
            imageWidth: 80,
            timer: 1000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        });

        actualizarContadorCarrito();
    }
}

function actualizarContadorCarrito() {
    const carrito = obtenerCarrito();
    const contador = document.getElementById('contador-carrito');
    if (contador) contador.innerText = carrito.length;
}

// --- MODAL Y WHATSAPP ---
const modalCarrito = document.getElementById('modalCarrito');
if (modalCarrito) {
    modalCarrito.addEventListener('show.bs.modal', renderizarCarritoEnModal);
}

function renderizarCarritoEnModal() {
    const carrito = obtenerCarrito();
    const contenedor = document.getElementById('contenido-carrito-modal');
    let total = 0;

    if (carrito.length === 0) {
        contenedor.innerHTML = '<p class="text-center py-3">Tu carrito está vacío 😢</p>';
        return;
    }

    let html = '<ul class="list-group mb-3">';
    carrito.forEach((prod, index) => {
        html += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <img src="${prod.imagen}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px; margin-right: 10px;">
                    <div style="line-height: 1.2;">
                        <small class="fw-bold d-block text-truncate" style="max-width: 180px;">${prod.nombre}</small>
                        <small class="text-muted">${formatearPeso(prod.precio)}</small>
                    </div>
                </div>
                <button class="btn btn-outline-danger btn-sm py-0 px-2" onclick="eliminarDelCarrito(${index})">×</button>
            </li>
        `;
        total += prod.precio;
    });
    html += '</ul>';
    html += `<div class="d-flex justify-content-between fw-bold border-top pt-2"><span>Total:</span><span>${formatearPeso(total)}</span></div>`;
    
    contenedor.innerHTML = html;
}

window.eliminarDelCarrito = function(index) {
    const carrito = obtenerCarrito();
    carrito.splice(index, 1);
    localStorage.setItem('carrito_compras', JSON.stringify(carrito));
    renderizarCarritoEnModal();
    actualizarContadorCarrito();
}

window.finalizarCompraWhatsApp = function() {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) return Swal.fire('Carrito vacío', '', 'warning');

    const nombre = document.getElementById('cliente-nombre').value.trim();
    const direccion = document.getElementById('cliente-direccion').value.trim();

    if (!nombre) return Swal.fire('Falta tu nombre', 'Escribe tu nombre para saber quién eres', 'error');

    let mensaje = `Hola! Soy *${nombre}* y quiero pedir:%0A%0A`;
    if (direccion) mensaje += `📍 *Envío a:* ${direccion}%0A%0A`;

    let total = 0;
    carrito.forEach(prod => {
        mensaje += `▪️ ${prod.nombre} - $${prod.precio.toLocaleString('es-CL')}%0A`;
        total += prod.precio;
    });

    mensaje += `%0A💰 *TOTAL: $${total.toLocaleString('es-CL')}*`;
    
    const numero = "56958547236"; 
    window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank');
}

/* AGREGAR AL FINAL DE assets/js/app.js */

function crearTarjetaHTML(producto) {
    // Calculamos si tiene ML para mostrar la etiqueta
    const mlDisplay = extraerML(producto.nombre) ? `${extraerML(producto.nombre)}ml` : '';
    
    // Devolvemos el HTML limpio
    return `
        <div class="col-md-4 col-sm-6 mb-4 fade-in">
            <div class="card h-100 shadow-sm position-relative">
                ${mlDisplay ? `<div class="badge-ml">${mlDisplay}</div>` : ''}
                
                <img 
                    src="${producto.imagen}" 
                    class="card-img-top" 
                    alt="${producto.nombre}" 
                    loading="lazy"
                    onerror="this.onerror=null; this.src='assets/img/logo.jpg';"
                >
                
                <div class="card-body d-flex flex-column">
                    <small class="text-muted text-uppercase mb-1" style="font-size:0.7rem">
                        ${producto.categoria}
                    </small>
                    <h6 class="card-title text-truncate" title="${producto.nombre}">
                        ${producto.nombre}
                    </h6>
                    <div class="mt-auto">
                        <p class="card-text fw-bold text-success fs-5 mb-2">
                            ${formatearPeso(producto.precio)}
                        </p>
                        <button class="btn btn-agregar" onclick="agregarAlCarrito(${producto.id})">
                            Añadir 🛒
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}