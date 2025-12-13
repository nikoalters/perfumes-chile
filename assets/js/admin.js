// assets/js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    renderizarTabla();
    actualizarEstadisticas(); // NUEVO: Calculamos números al cargar
});

const formulario = document.getElementById('form-admin');
const tabla = document.getElementById('tabla-productos');

// --- NUEVO: FUNCIÓN PARA CALCULAR ESTADÍSTICAS ---
function actualizarEstadisticas() {
    const productos = obtenerProductos();
    
    // 1. Total de Productos
    const totalCantidad = productos.length;
    document.getElementById('stat-total-prods').innerText = totalCantidad;

    // 2. Suma Total del Dinero (Precio de todos los perfumes)
    // Usamos .reduce para sumar: acumulador + precio actual
    const totalDinero = productos.reduce((suma, prod) => suma + prod.precio, 0);
    
    // Formateamos como dinero chileno
    document.getElementById('stat-total-dinero').innerText = 
        formatearPeso(totalDinero);
}

// 1. FUNCIÓN PARA MOSTRAR LA TABLA
function renderizarTabla() {
    const productos = obtenerProductos(); 
    tabla.innerHTML = ''; 

    // Copia invertida para ver los últimos primero
    [...productos].reverse().forEach(prod => {
        
        // Asignamos colores según categoría para que se vea bonito
        let badgeColor = 'bg-secondary';
        if(prod.categoria === 'hombre') badgeColor = 'bg-primary';
        if(prod.categoria === 'mujer') badgeColor = 'bg-danger';
        if(prod.categoria === 'unisex') badgeColor = 'bg-success';

        const fila = `
            <tr>
                <td class="ps-4">
                    <div class="d-flex align-items-center">
                        <img src="${prod.imagen}" width="45" height="45" class="rounded-circle border me-3" style="object-fit: cover;">
                        <span class="fw-bold text-dark">${prod.nombre}</span>
                    </div>
                </td>
                <td>
                    <span class="badge ${badgeColor} rounded-pill text-uppercase" style="font-size: 0.7rem;">
                        ${prod.categoria}
                    </span>
                </td>
                <td class="fw-bold text-success">${formatearPeso(prod.precio)}</td>
                <td>
                    <button class="btn btn-outline-danger btn-sm rounded-circle" onclick="borrar(${prod.id})" title="Eliminar">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
        tabla.innerHTML += fila;
    });
}

// 2. FUNCIÓN PARA AGREGAR PRODUCTO
formulario.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const nombre = document.getElementById('nombre-prod').value.trim();
    const ml = document.getElementById('ml-prod').value.trim();
    const precio = Number(document.getElementById('precio-prod').value);
    const categoria = document.getElementById('categoria-prod').value;
    let imgNombre = document.getElementById('img-prod').value.trim();

    if (!imgNombre) imgNombre = 'logo.jpg';
    if (!imgNombre.includes('assets/img/')) imgNombre = `assets/img/${imgNombre}`; 

    const nombreFinal = `${nombre} ${ml}ml`;

    const nuevoProducto = {
        id: Date.now(),
        nombre: nombreFinal,
        precio: precio,
        categoria: categoria,
        imagen: imgNombre
    };

    guardarProducto(nuevoProducto); 
    
    // Actualizamos todo
    renderizarTabla(); 
    actualizarEstadisticas(); // ¡Importante! Recalcular totales
    
    formulario.reset(); 
    
    Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: `Se agregó: ${nombreFinal}`,
        timer: 1500,
        showConfirmButton: false
    });
});

// 3. FUNCIÓN PARA BORRAR
window.borrar = function(id) {
    Swal.fire({
        title: '¿Eliminar producto?',
        text: "Esta acción descontará del inventario.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            eliminarProductoDB(id); 
            
            // Actualizamos todo
            renderizarTabla();
            actualizarEstadisticas(); // Recalcular totales al borrar
            
            Swal.fire('¡Borrado!', '', 'success');
        }
    })
};