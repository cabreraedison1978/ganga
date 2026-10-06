const menuLinks = document.querySelector("#menu-links");

async function fetchMenu(tipo) {
    const params = new URLSearchParams({
        tipo: String(tipo),
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

    return menuItems;
}

function findCurrentMenuItem(menuItems) {
    const currentPath = window.location.pathname.toLowerCase();

    return menuItems.find((item) => {
        if (!item.url) return false;
        const menuPath = item.url.replace(/\\/g, "/").toLowerCase();
        return currentPath.includes(menuPath.split("/")[0]);
    });
}

function renderMenuNode(node) {
    const { nombre, url, children } = node;
    if (!nombre) return null;

    const li = document.createElement("li");

    // 1. Si el nodo tiene hijos, renderizamos un acordeón (<details>)
    if (Array.isArray(children) && children.length > 0) {
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.textContent = nombre;

        const ul = document.createElement("ul");
        ul.className = "menu-submenu";

        // Recursión: procesar los nodos hijos
        children.forEach((child) => {
            const childElement = renderMenuNode(child);
            if (childElement) ul.append(childElement);
        });

        details.append(summary, ul);
        li.append(details);
    }
    // 2. Si no tiene hijos pero tiene URL, renderizamos un enlace (<a>)
    else if (url) {
        const a = document.createElement("a");
        a.href = url;
        a.textContent = nombre;
        li.append(a);
    }
    // 3. Si no tiene hijos ni URL, renderizamos un texto estático (<span>)
    else {
        const span = document.createElement("span");
        span.className = "menu-label";
        span.textContent = nombre;
        li.append(span);
    }

    return li;
}

function appendMenuLink(container, nombre, href) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = href;
    link.textContent = nombre;
    item.append(link);
    container.append(item);
}

function appendModuleNavigation(container, moduleItem) {
    if (typeof moduleItem.url !== "string" || !moduleItem.url) {
        throw new Error(`El módulo "${moduleItem.nombre}" no tiene una URL válida`);
    }

    const modulePath = moduleItem.url.replace(/\\/g, "/").split("/");
    const modulePage = modulePath.pop();
    if (!modulePage) {
        throw new Error(`El módulo "${moduleItem.nombre}" no tiene una página principal válida`);
    }

    const moduleDirectoryDepth = modulePath.filter(Boolean).length;
    const moduleHomeHref = new URL(modulePage, window.location.href).href;
    const indexHref = new URL(`${"../".repeat(moduleDirectoryDepth)}index.html`, window.location.href).href;

    appendMenuLink(container, moduleItem.nombre, moduleHomeHref);
    appendMenuLink(container, "Inicio", indexHref);
}

async function loadMenu() {
    if (!menuLinks) {
        console.error("El contenedor #menu-links no existe en el DOM.");
        return;
    }

    try {
        const rootMenuItems = await fetchMenu(0);
        const currentMenuItem = findCurrentMenuItem(rootMenuItems);

        // Si la página actual corresponde a un módulo, pedimos las opciones de ese módulo
        const menuType = currentMenuItem ? Number(currentMenuItem.id) : 0;
        const menuData = menuType !== 0
            ? await fetchMenu(menuType)
            : rootMenuItems;

        menuLinks.textContent = "";

        const fragment = document.createDocumentFragment();

        // Renderizar los nodos del árbol directamente
        menuData.forEach((node) => {
            const element = renderMenuNode(node);
            if (element) fragment.append(element);
        });

        if (Number(menuType) !== 0 && currentMenuItem) {
            appendModuleNavigation(fragment, currentMenuItem);
        }

        menuLinks.append(fragment);

    } catch (error) {
        console.error("Error al cargar el menú:", error);
        menuLinks.textContent = "";
        const item = document.createElement("li");
        item.className = "menu-error";
        item.textContent = error.message || "No se pudo cargar el menú";
        menuLinks.append(item);
    }
}

loadMenu();