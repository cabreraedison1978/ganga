const menuLinks = document.querySelector("#menu-links");

async function loadMenu() {
    // 1. Prevenir errores si el nodo no existe en el HTML
    if (!menuLinks) {
        console.error("El contenedor #menu-links no existe en el DOM.");
        return;
    }

    try {
        const params = new URLSearchParams({
            tipo: "0",
            usuario: "",
            rol: ""
        });
        const response = await fetch(`http://localhost:5000/api/menu?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
        }

        const menuItems = await response.json();
        if (!Array.isArray(menuItems)) {
            throw new Error("La respuesta de la API no es un arreglo");
        }

        // Limpiar el contenedor antes de insertar los ítems
        menuLinks.textContent = "";

        // Fragmento en memoria para evitar múltiples renderizados
        const fragment = document.createDocumentFragment();

        menuItems.forEach(({ nombre, url }) => {
            if (!nombre || !url) return;

            const item = document.createElement("li");
            const link = document.createElement("a");
            link.href = url;
            link.textContent = nombre;

            item.append(link);
            fragment.append(item);
        });

        // Insertar todos los ítems en una sola operación
        menuLinks.append(fragment);

    } catch (error) {
        // console.error("No se pudo cargar el menú:", error);
        console.error(error.message, error);
        menuLinks.textContent = ""; // Limpiar antes de mostrar el mensaje de error
        const item = document.createElement("li");
        // item.textContent = "No se pudo cargar el menú";
        item.textContent = error.message || "No se pudo cargar el menú";
        menuLinks.append(item);
    }
}

loadMenu();
