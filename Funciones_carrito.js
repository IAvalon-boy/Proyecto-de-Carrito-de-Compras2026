// uso de constantes para mejor manejo de variables

const cartItemsContainer = document.getElementById("cart-items");
const totalPriceElement = document.getElementById("total-price");
const subtotalPriceElement = document.getElementById("subtotal-price");
const taxPriceElement = document.getElementById("tax-price");
const checkoutButton = document.getElementById("checkout");
const countProducts = document.querySelector('.count-products');

let carrito = [];

// Carga el carrito desde localStorage

function loadCart() {
    const storedCart = localStorage.getItem("carrito");
    if (storedCart) {
        carrito = JSON.parse(storedCart);
        renderCart();
        updateTotal();
    }
}


// Actualiza el contador de productos en el navbar
 
function actualizarContadorCarrito() {
    const totalProductos = carrito.reduce((sum, item) => sum + item.quantity, 0);
    countProducts.innerText = totalProductos;
}

// Renderiza los productos en la página del carrito
 
function renderCart() {
    cartItemsContainer.innerHTML = "";

    if (carrito.length === 0) {
        cartItemsContainer.innerHTML = '<div class="cart-empty"><h5>Tu carrito está vacío</h5><p>Regresa a la tienda y agrega productos</p></div>';
        return;
    }

    carrito.forEach((product, index) => {
        const totalProducto = (product.price * product.quantity).toFixed(2);
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("cart-item");

        itemDiv.innerHTML = `
            <div class="row align-items-center">
                <div class="col-md-2">
                    <img src="${product.image}" alt="${product.title}" 
                         style="width: 100%; height: auto; border-radius: 4px;">
                </div>
                <div class="col-md-4">
                    <h6 class="mb-1">${product.title}${product.size ? ' — ' + product.size : ''}</h6>
                    <p class="text-muted mb-0">Precio unitario: $${product.price.toFixed(2)}</p>
                </div>
                <div class="col-md-3">
                    <div class="input-group" style="max-width: 150px;">
                        <button class="btn btn-outline-secondary btn-sm" onclick="updateQuantity(${index}, -1)">−</button>
                        <input type="text" class="form-control form-control-sm text-center" value="${product.quantity}" readonly>
                        <button class="btn btn-outline-secondary btn-sm" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                </div>
                <div class="col-md-2 text-end">
                    <p class="mb-0"><strong>$${totalProducto}</strong></p>
                    <small class="text-muted">x${product.quantity}</small>
                </div>
                <div class="col-md-1 text-end">
                    <button class="btn btn-sm btn-danger" onclick="removeItem(${index})">
                        🗑️
                    </button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(itemDiv);
    });

    actualizarContadorCarrito();
}

/**
 * Actualiza la cantidad de un producto en el carrito
 * @param {number} index - Índice del producto en el carrito
 * @param {number} change - Cambio en la cantidad (+1 o -1)
 */
function updateQuantity(index, change) {
    const product = carrito[index];
    const productoData = productos.find(p => p.id === product.id);
    const newQuantity = product.quantity + change;

    // Validaciones
    if (newQuantity <= 0) {
        removeItem(index);
        return;
    }

    // si el item tiene talla, validar contra stock por talla
    if (product.size) {
        const availableBySize = productoData.tallaStock[product.size] || 0;
        if (newQuantity > availableBySize) {
            Swal.fire({ icon: 'warning', title: 'Stock insuficiente', text: `Solo hay ${availableBySize} unidades disponibles de la talla ${product.size}`, confirmButtonText: 'Entendido' });
            return;
        }
    } else {
        if (newQuantity > productoData.cantidadDisponible) {
            Swal.fire({ icon: 'warning', title: 'Stock insuficiente', text: `Solo hay ${productoData.cantidadDisponible} unidades disponibles`, confirmButtonText: 'Entendido' });
            return;
        }
    }

    product.quantity = newQuantity;
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderCart();
    updateTotal();
}

/**
 * Elimina un producto del carrito
 * @param {number} index - Índice del producto a eliminar
 */
function removeItem(index) {
    const product = carrito[index];
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderCart();
    updateTotal();

    Swal.fire({
        icon: 'info',
        title: 'Producto eliminado',
        text: `${product.title} ha sido removido del carrito`,
        showConfirmButton: false,
        timer: 1500
    });
}

/**
 * Calcula y actualiza el total con subtotal, impuestos y total
 */
function updateTotal() {
    const subtotal = carrito.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.13;
    const finalTotal = subtotal + tax;

    subtotalPriceElement.textContent = `$${subtotal.toFixed(2)}`;
    taxPriceElement.textContent = `$${tax.toFixed(2)}`;
    totalPriceElement.textContent = `$${finalTotal.toFixed(2)}`;
}

/**
 * Finaliza la compra, actualiza inventario y genera PDF
 */
function checkout() {
    // Validar que el carrito no esté vacío
    if (carrito.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Carrito vacío',
            text: "Agrega productos antes de finalizar la compra",
            confirmButtonText: 'Entendido'
        });
        return;
    }

    // Validar que haya stock disponible
    for (let item of carrito) {
        const producto = productos.find(p => p.id === item.id);
        if (!producto) continue;
        if (item.size) {
            const available = producto.tallaStock[item.size] || 0;
            if (item.quantity > available) {
                Swal.fire({ icon: 'error', title: 'Stock insuficiente', text: `No hay suficiente stock de ${producto.nombre} talla ${item.size}`, confirmButtonText: 'Entendido' });
                return;
            }
        } else {
            if (item.quantity > producto.cantidadDisponible) {
                Swal.fire({ icon: 'error', title: 'Stock insuficiente', text: `No hay suficiente stock de ${producto.nombre}`, confirmButtonText: 'Entendido' });
                return;
            }
        }
    }

    // Actualizar inventario
    actualizarInventario();

    // Generar factura PDF
    generarFacturaPDF();
}

/**
 * Actualiza el inventario de productos tras compra confirmada
 */
function actualizarInventario() {
    carrito.forEach(item => {
        const producto = productos.find(p => p.id === item.id);
        if (producto) {
            producto.cantidadDisponible -= item.quantity;
            if (item.size) {
                // reducir stock por talla
                if (producto.tallaStock && producto.tallaStock[item.size] !== undefined) {
                    producto.tallaStock[item.size] -= item.quantity;
                    if (producto.tallaStock[item.size] < 0) producto.tallaStock[item.size] = 0;
                }
            }
        }
    });
    // Nota: En un sistema real, esto se guardaría en una base de datos
    localStorage.setItem('inventario', JSON.stringify(productos));
}


 // Genera una factura en PDF y la descarga
 
function generarFacturaPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configuración de colores y fuentes (Estilo minimalista)
    const grayDark = "#333333";
    const grayLight = "#666666";
    const bgCream = [245, 243, 238]; // Tono crema de fondo si quisieras aplicarlo, pero blanco es más limpio para impresión.

    // --- ENCABEZADO ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(237, 197, 178);
    doc.text("FACTURA", 20, 25);

    // Número de Factura cualquiera a modo de ejemplo con la funcion math
    const numFactura = Math.floor(1000 + Math.random() * 9000);

    doc.setFontSize(12);
    doc.rect(20, 30, 60, 10); // x, y, ancho, alto
    doc.text(`Nº: ${numFactura}`, 25, 37);

    // Logo (Simulado con una "M" estilizada como en la imagen)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Mercadito Sv", 120, 28); // "M" de Mercadito
    doc.setLineWidth(0.3);
    doc.line(120, 30, 175, 30); // Línea decorativa bajo el logo

    // --- DATOS CLIENTE Y EMPRESA (Lado a lado) ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("DATOS DEL CLIENTE", 20, 60);
    doc.text("DATOS DE LA EMPRESA", 110, 60);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(100, 55, 100, 85); // Línea vertical divisoria

    doc.setFont("helvetica", "normal");
    doc.setTextColor(grayLight);
    
    // Datos Cliente como ejemplo
    doc.text("Cliente Final / Consumidor", 20, 67);
    doc.text("Ahuachapán, El Salvador", 20, 72);
    doc.text("Tel: +503 ---- ----", 20, 77);

    // Datos Empresa (Mercadito)
    doc.text("Mercadito SA de SV", 110, 67);
    doc.text("adminJorge95@Mercaditov.com", 110, 72);
    doc.text("+503 80009595", 110, 77);
    doc.text("Calle San Rafael 25, Ahuachapán", 110, 82);

    // --- TABLA DE PRODUCTOS ---
    let y = 100;
    
    // Encabezado Tabla
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(0, 0, 0);
    doc.rect(20, y, 170, 8); // Borde de cabecera
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Detalle", 25, y + 6);
    doc.text("Cantidad", 110, y + 6);
    doc.text("Precio", 145, y + 6);
    doc.text("Total", 175, y + 6);

    y += 15;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(grayDark);

    const subtotal = carrito.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    carrito.forEach(item => {
        const totalItem = (item.price * item.quantity).toFixed(2);
        doc.text(item.title.substring(0, 35), 25, y);
        doc.text(String(item.quantity).padStart(2, '0'), 115, y);
        doc.text(`${item.price.toFixed(2)} $`, 145, y);
        doc.text(`${totalItem} $`, 175, y);
        y += 8;
    });

    // --- TOTALES ---
    y += 10;
    doc.setDrawColor(0, 0, 0);
    doc.line(20, y, 190, y); // Línea separadora

    const tax = subtotal * 0.13;
    const finalTotal = subtotal + tax;

    y += 10;
    doc.setFontSize(11);
    doc.text("IVA", 130, y);
    doc.text("13%", 150, y);
    doc.text(`${tax.toFixed(2)} $`, 175, y);

    y += 8;
    doc.rect(110, y, 80, 10); // Recuadro para el TOTAL
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("TOTAL", 115, y + 7);
    doc.text(`${finalTotal.toFixed(2)} $`, 165, y + 7);

    // --- INFORMACIÓN DE PAGO (Caja inferior izquierda) ---
    y += 30;
    doc.setLineWidth(0.3);
    doc.rect(20, y, 80, 30);
    doc.setFontSize(10);
    doc.text("INFORMACIÓN DE PAGO", 25, y + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Transferencia Bancaria", 25, y + 15);
    doc.text("Banco Cuscatlan", 25, y + 20);
    doc.text("Cuenta: *******192", 25, y + 25);

    // Footer web
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("WWW.MERCADITO.COM.SV", 105, 285, { align: "center" });

    // Guardar y Alerta
    const today = new Date();
    const formattedDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    doc.save(`Factura_${formattedDate}.pdf`);

    // SweetAlert (Mismo flujo que tenías)
    Swal.fire({
        title: "¡Compra realizada!",
        text: "Tu factura minimalista ha sido generada.",
        icon: "success",
        confirmButtonText: "Genial"
    }).then(() => {
        carrito = [];
        localStorage.removeItem("carrito");
        if(typeof renderCart === 'function') renderCart();
        if(typeof updateTotal === 'function') updateTotal();
    });
}

// Evento DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    loadCart();
});

// Evento del botón checkout
checkoutButton.addEventListener("click", checkout);


