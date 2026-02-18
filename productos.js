const productos = [
    {
        id: "1",
        nombre: "Camara Canon",
        precio: 499.95,
        cantidadDisponible: 29,
        imagen: "IMG/camara2.webp",
        tallaStock: { Negro: 10, Marino: 19, }
    },
    {
        id: "2",
        nombre: "Playstation 5",
        precio: 569.95,
        cantidadDisponible: 15,
        imagen: "IMG/play5.jpeg",
        tallaStock: { Disk: 5, Digital: 10, }
    },
    {
        id: "3",
        nombre: "iPhone 17",
        precio: 1275.95,
        cantidadDisponible: 16,
        imagen: "IMG/iphone17-2.webp",
        tallaStock: {Gris: 4, Negro: 8, Blanco: 4, }
    },
    {
        id: "4",
        nombre: "Lenovo - IdeaPad Slim 3",
        precio: 499.00,
        cantidadDisponible: 22,
        imagen: "IMG/laptop.webp",
        tallaStock: { Gris: 12 , Marino: 6, Negra: 4, }
       
    },
    {
        id: "5",
        nombre: "Samsung TV - UHD",
        precio: 329.99,
        cantidadDisponible: 24,
        imagen: "IMG/samsung2.webp",
        tallaStock: { Pulg32: 10, Pulg48: 8, Pulg65: 6, }
    },
    {
        id: "6",
        nombre: "Freidora de Aire",
        precio: 44.95,
        cantidadDisponible: 18,
        imagen: "IMG/freidora2.webp" ,
        tallaStock: { Negro: 12, Plateado: 6, }
    },
    
];

// Depuración: confirma que la lista cargó correctamente
console.log('productos cargados:', productos.length);
