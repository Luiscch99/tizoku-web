/* ============================================================
   TIZOKU · datos editables del sitio
   Cambia aquí teléfonos, links, horarios y ubicaciones.
   No necesitas tocar index.html ni main.js.
   ============================================================ */
window.TIZOKU = {
  // WhatsApp: código de país 52 + 10 dígitos, sin signos ni espacios
  whatsapp: {
    number: "526567091759",
    message: "¡Hola Tizoku! Quiero hacer un pedido 🍣",
  },

  // Botón "Llama, ordena y recoge"
  phone: { display: "656 709 1759", tel: "+526567091759" },

  // Botones de delivery (orden = orden en pantalla)
  delivery: [
    {
      id: "uber",
      name: "Uber Eats",
      note: "Entrega a domicilio",
      url: "https://www.ubereats.com/store/tizoku-ciudad-juarez/HwL97BlwXa-BX6Fha_QnCA?diningMode=DELIVERY",
    },
    {
      id: "rappi",
      name: "Rappi",
      note: "Entrega a domicilio",
      url: "https://www.rappi.com.mx/restaurantes/1923460672-tizoku",
    },
    {
      id: "didi",
      name: "DiDi Food",
      note: "Entrega a domicilio",
      url: "https://www.didi-food.com/es-MX/food/store/5764608170966910008/?location_country=MX&country=MX&lang=es-MX",
    },
  ],

  // Portal de facturación
  billing: "https://facturacion.parrot.rest/tizoku",

  // Redes y reseñas
  social: {
    instagram: "https://www.instagram.com/tizokusushi/",
    facebook: "https://www.facebook.com/Tizoku.jrz",
    tiktok: "https://www.tiktok.com/@tizoku.jrz",
    reviews: "https://maps.app.goo.gl/PAiskcFoqers69rG6",
  },

  // Menú SEP 26 (páginas ya diseñadas en formato vertical)
  menu: {
    pdf: "assets/menu-sep-26.pdf",
    // Botones por categoría: page = número de página del menú (1-4), y = punto de esa página (0 = arriba, 1 = abajo).
    // Si cambias el diseño del menú, ajusta estos números.
    categories: [
      { label: "Yakimeshi", page: 1, y: 0.19 },
      { label: "Boneless", page: 1, y: 0.19 },
      { label: "Bebidas", page: 1, y: 0.60 },
      { label: "Rollos empanizados", page: 2, y: 0.0 },
      { label: "Rollos fríos", page: 3, y: 0.58 },
    ],
    pages: [
      { src: "assets/menu/menu-1.jpg", alt: "Menú de Tizoku: Yakimeshi, Boneless, Fusión Mexicana-Japonesa, Bebidas y promociones." },
      { src: "assets/menu/menu-2.jpg", alt: "Rollos empanizados: Panko Especial, Cowboy, El Santo, Alan, George y Classic Roll." },
      { src: "assets/menu/menu-3.jpg", alt: "Rollos empanizados y fríos: Tizoku Roll, Salmon Spicy, Mar y Tierra, Bermudez, Tuna Classic Roll y Tuna Spicy Roll." },
      { src: "assets/menu/menu-4.jpg", alt: "Rollos fríos: Nevado Roll, Playero Roll, California Love, Noruega, Mango Roll y Salmon Roll." },
    ],
  },

  // Sucursales. Para agregar una, copia un bloque y cambia los datos.
  locations: [
    {
      name: "Gómez Morín",
      tag: "Dentro de Playa Bichis",
      address: "Blvd. Manuel Gómez Morín 8125, Col. Partido Senecú, Cd. Juárez, Chih.",
      // Texto que se muestra en la tarjeta. null = "Consulta el horario por WhatsApp".
      hours: "Dom a jue · 1:00 pm a 9:30 pm | Vie y sáb · 1:00 pm a 10:30 pm",
      mapQuery: "Playa Bichis Gómez Morín, Blvd. Manuel Gómez Morín 8125, Ciudad Juárez, Chihuahua",
    },
    {
      // Sucursal en preparación: soon = true muestra la tarjeta "Próximamente" (sin mapa).
      // Cuando abra, agrega address, hours y mapQuery como arriba y quita la línea "soon".
      name: "Simona Barba",
      tag: "Próximamente",
      soon: true,
    },
  ],
};
