const menuItems = [
    { label: "Compras", href: "Compras/compras.html" },
    { label: "Inventario", href: "Inventario/inventario.html" },
    { label: "Ventas", href: "Ventas/ventas.html" },
    { label: "CXC", href: "CXC/cxc.html" },
    { label: "CXP", href: "CXP/cxp.html" },
    { label: "Bancos", href: "Bancos/bancos.html" },
    { label: "Contabilidad", href: "Contabilidad/contabilidad.html" },
    { label: "Presupuesto", href: "Presupuesto/presupuesto.html" },
    { label: "SAC", href: "SAC/sac.html" },
    { label: "Logistica", href: "Logistica/logistica.html" },
    { label: "Proveeduria", href: "Proveeduria/proveeduria.html" },
    { label: "RRHH", href: "RRHH/rrhh.html" }
];

const menuLinks = document.querySelector("#menu-links");

menuItems.forEach(({ label, href }) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    item.append(link);
    menuLinks.append(item);
});