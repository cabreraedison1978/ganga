const quotationRows = document.querySelector("#quotation-rows");
const quotationMessage = document.querySelector("#quotation-message");
const quotationCount = document.querySelector("#quotation-count");
const quotationTotal = document.querySelector("#quotation-total");
const quotationSearch = document.querySelector("#quotation-search");
const refreshQuotations = document.querySelector("#refresh-quotations");

const hiddenFields = [
    "id",
    "codTp",
    "codCnl",
    "validez",
    "descripcion",
    "empresa",
    "codReg",
    "codDiv",
    "idSuc",
    "codSuc",
    "cuotas",
    "idClt",
    "vendedor",
    "idVend"
];

const displayFields = [
    ["estado", "Estado"],
    ["tipo", "Tipo"],
    ["canal", "Canal"],
    ["numero", "Número"],
    ["fecha", "Fecha"],
//    ["validez", "Validez"],
//    ["descripcion", "Descripción"],
    ["region", "Región"],
    ["division", "División"],
//    ["codSuc", "Cód. sucursal"],
    ["sucursal", "Sucursal"],
//    ["cuotas", "Cuotas"],
    ["plazo", "Plazo"],
    ["identCliente", "Identificación"],
    ["cliente", "Cliente"],
//    ["vendedor", "Vendedor"],
    ["total", "Total"]
];

const rowActions = [
    ["editar", "Editar", "editar.png"],
    ["aprobar", "Aprobar", "aprobar.png"],
    ["anular", "Anular", "anular.png"],
    ["facturar", "Facturar", "facturar.png"]
];

let quotations = [];

function displayValue(value) {
    return value === null || value === undefined || value === ""
        ? "—"
        : String(value);
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return displayValue(value);

    return new Intl.DateTimeFormat("es-EC", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(date);
}

function formatTotal(value) {
    const total = Number(value);
    if (value === null || value === undefined || value === "" || !Number.isFinite(total)) {
        return "—";
    }

    return new Intl.NumberFormat("es-EC", {
        style: "currency",
        currency: "USD"
    }).format(total);
}

function formatNumber(value) {
    if (value === null || value === undefined || value === "") return "—";

    return String(value).padStart(9, "0");
}

function getCellValue(key, value) {
    if (key === "fecha" || key === "validez") return formatDate(value);
    if (key === "total") return formatTotal(value);
    if (key === "numero") return formatNumber(value);
    return displayValue(value);
}

function showMessage(message, isError = false) {
    quotationMessage.textContent = message;
    quotationMessage.classList.add("is-visible");
    quotationMessage.classList.toggle("is-error", isError);
}

function formatCount(count) {
    return `${count} ${count === 1 ? "cotización" : "cotizaciones"}`;
}

function createRowActions(quotation) {
    const cell = document.createElement("td");
    cell.className = "row-actions";
    const buttons = document.createElement("div");
    buttons.className = "row-action-buttons";

    rowActions.forEach(([action, label, image]) => {
        const button = document.createElement("button");
        button.className = "icon-button";
        button.type = "button";
        button.dataset.action = action;
        button.setAttribute("aria-label", `${label} cotización ${formatNumber(quotation.numero)}`);
        button.title = label;

        const icon = document.createElement("img");
        icon.src = `../images/16X16/${image}`;
        icon.alt = "";
        icon.width = 16;
        icon.height = 16;
        button.append(icon);
        buttons.append(button);
    });

    cell.append(buttons);
    return cell;
}

function renderQuotations() {
    const query = quotationSearch.value.trim().toLocaleLowerCase("es-EC");
    const filteredQuotations = quotations.filter((quotation) => {
        const searchableText = displayFields
            .map(([key]) => displayValue(quotation[key]))
            .join(" ")
            .toLocaleLowerCase("es-EC");
        return searchableText.includes(query);
    });

    quotationRows.replaceChildren();
    const fragment = document.createDocumentFragment();

    filteredQuotations.forEach((quotation) => {
        const row = document.createElement("tr");
        hiddenFields.forEach((field) => {
            row.dataset[field] = displayValue(quotation[field]) === "—"
                ? ""
                : String(quotation[field]);
        });

        row.append(createRowActions(quotation));

        displayFields.forEach(([key]) => {
            const cell = document.createElement("td");
            cell.textContent = getCellValue(key, quotation[key]);
            if (key === "total") cell.className = "numeric-cell";
            row.append(cell);
        });

        fragment.append(row);
    });

    quotationRows.append(fragment);
    quotationCount.textContent = query
        ? `${formatCount(filteredQuotations.length)} de ${formatCount(quotations.length)}`
        : formatCount(quotations.length);
    const total = filteredQuotations.reduce((sum, quotation) => {
        const value = Number(quotation.total);
        return Number.isFinite(value) && quotation.total !== null && quotation.total !== ""
            ? sum + value
            : sum;
    }, 0);
    quotationTotal.textContent = `Total: ${formatTotal(total)}`;

    if (filteredQuotations.length === 0) {
        showMessage(query ? "No hay cotizaciones que coincidan con la búsqueda." : "No hay cotizaciones para mostrar.");
    } else {
        quotationMessage.classList.remove("is-visible", "is-error");
    }
}

async function loadQuotations() {
    refreshQuotations.disabled = true;
    refreshQuotations.textContent = "Cargando…";
    quotationCount.textContent = "Cargando cotizaciones…";
    quotationTotal.textContent = "Total: —";
    showMessage("Cargando cotizaciones…");

    try {
        const response = await fetch("http://localhost:5000/api/ventas");
        if (!response.ok) {
            throw new Error(`El servicio respondió con HTTP ${response.status}.`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error("La respuesta del servicio no es un arreglo.");
        }

        quotations = data;
        renderQuotations();
    } catch (error) {
        console.error("Error al cargar las cotizaciones:", error);
        quotations = [];
        quotationRows.replaceChildren();
        quotationCount.textContent = "No se pudieron cargar las cotizaciones";
        quotationTotal.textContent = "Total: —";
        showMessage(
            error instanceof TypeError
                ? "No fue posible conectar con el servicio de ventas."
                : `No se pudieron cargar las cotizaciones: ${error.message}`,
            true
        );
    } finally {
        refreshQuotations.disabled = false;
        refreshQuotations.textContent = "Actualizar";
    }
}

quotationSearch.addEventListener("input", renderQuotations);
refreshQuotations.addEventListener("click", loadQuotations);

loadQuotations();
