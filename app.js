/* ============================================================
   KFZ MEISTER Wiki - app.js
   ============================================================
   Fahrzeug-Navigation:
   Hersteller -> Modell -> Baureihe -> Motor / Getriebe
   ============================================================ */

let DB = null;

let routeState = {
  brand: null,
  vehicle: null
};

const $ = (selector) => document.querySelector(selector);

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function arr(value) {
  return Array.isArray(value) ? value : [];
}

function text(value, fallback = "") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return String(value);
}

function go(hash) {
  if (location.hash === hash) {
    render();
  } else {
    location.hash = hash;
  }
}

function setCrumb(items) {
  const el = $("#breadcrumb");
  if (!el) return;

  el.innerHTML = arr(items)
    .map((item, index) => {
      if (item && item.href) {
        return `<a href="${esc(item.href)}">${esc(item.label)}</a>`;
      }

      return `<span>${esc(item?.label ?? item)}</span>`;
    })
    .join(' <span class="crumb-separator">›</span> ');
}

function getStorage(key, fallback = []) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage kann im Browser deaktiviert sein.
  }
}

function addRecent(item) {
  const recent = getStorage("kfz_recent", []);

  const filtered = recent.filter((x) => {
    return !(
      x &&
      item &&
      x.type === item.type &&
      x.id === item.id
    );
  });

  filtered.unshift(item);
  setStorage("kfz_recent", filtered.slice(0, 20));
}

function getFavorites() {
  return getStorage("kfz_favorites", []);
}

function isFavorite(id) {
  return getFavorites().some((x) => String(x.id) === String(id));
}

function toggleFavorite(id, data = {}) {
  const favorites = getFavorites();
  const index = favorites.findIndex(
    (x) => String(x.id) === String(id)
  );

  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.unshift({
      id,
      ...data,
      createdAt: Date.now()
    });
  }

  setStorage("kfz_favorites", favorites);
  render();
}

function favoriteButton(id, data = {}) {
  const active = isFavorite(id);

  return `
    <button
      class="icon-button favorite-button ${active ? "active" : ""}"
      onclick='event.stopPropagation(); toggleFavorite(${JSON.stringify(id)}, ${JSON.stringify(data)})'
      title="${active ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}"
      aria-label="${active ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}"
    >
      ${active ? "★" : "☆"}
    </button>
  `;
}

function normalizeId(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9äöüß_-]/gi, "");
}

function brandById(id) {
  return arr(DB?.brands).find(
    (brand) => String(brand.id) === String(id)
  );
}

function vehicleById(id) {
  return arr(DB?.vehicles).find(
    (vehicle) => String(vehicle.id) === String(id)
  );
}

function modelName(brand, modelId) {
  const model = arr(brand?.models).find(
    (item) => String(item.id) === String(modelId)
  );

  return model?.name || String(modelId ?? "");
}

function allVehiclesForModel(brandId, modelId) {
  return arr(DB?.vehicles).filter((vehicle) => {
    return (
      String(vehicle.brand) === String(brandId) &&
      String(vehicle.model) === String(modelId)
    );
  });
}

function generationName(generation) {
  return text(
    generation?.name ||
    generation?.generation ||
    generation?.series,
    "Unbekannte Baureihe"
  );
}

function generationYears(generation) {
  return text(
    generation?.years ||
    generation?.year ||
    generation?.production,
    ""
  );
}

function engineName(engine) {
  if (typeof engine === "string") {
    return engine;
  }

  return text(
    engine?.name ||
    engine?.engine ||
    engine?.designation ||
    engine?.code,
    "Unbekannter Motor"
  );
}

function transmissionName(transmission) {
  if (typeof transmission === "string") {
    return transmission;
  }

  return text(
    transmission?.name ||
    transmission?.transmission ||
    transmission?.designation ||
    transmission?.code,
    "Unbekanntes Getriebe"
  );
}

function pageShell(title, subtitle = "") {
  return `
    <section class="page-header">
      <div>
        <h1>${esc(title)}</h1>
        ${subtitle ? `<p>${esc(subtitle)}</p>` : ""}
      </div>
    </section>
  `;
}

function emptyState(title, message) {
  return `
    <div class="empty-state">
      <h3>${esc(title)}</h3>
      <p>${esc(message)}</p>
    </div>
  `;
}

function loadingState() {
  return `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Daten werden geladen …</p>
    </div>
  `;
}

function errorState(message) {
  return `
    <div class="error-state">
      <h2>Fehler</h2>
      <p>${esc(message)}</p>
    </div>
  `;
}

function brandCard(brand) {
  const id = String(brand.id);

  return `
    <article
      class="card brand-card"
      onclick="go('#vehicles/brand/${encodeURIComponent(id)}')"
      tabindex="0"
      role="button"
      onkeydown="if(event.key==='Enter')go('#vehicles/brand/${encodeURIComponent(id)}')"
    >
      <div class="brand-logo">
        ${
          brand.flag
            ? `<img src="${esc(brand.flag)}" alt="${esc(brand.name)}">`
            : `<span>${esc(text(brand.name).charAt(0))}</span>`
        }
      </div>

      <div class="card-content">
        <h3>${esc(brand.name)}</h3>
        <p>${arr(brand.models).length} Modelle</p>
      </div>

      <span class="card-arrow">›</span>
    </article>
  `;
}

function modelCard(brand, model) {
  const brandId = String(brand.id);
  const modelId = String(model.id);

  return `
    <article
      class="card model-card"
      onclick="go('#vehicles/${encodeURIComponent(brandId)}/${encodeURIComponent(modelId)}')"
      tabindex="0"
      role="button"
      onkeydown="if(event.key==='Enter')go('#vehicles/${encodeURIComponent(brandId)}/${encodeURIComponent(modelId)}')"
    >
      <div class="model-icon">🚗</div>

      <div class="card-content">
        <h3>${esc(model.name)}</h3>
        ${
          model.description
            ? `<p>${esc(model.description)}</p>`
            : `<p>Baureihen und Fahrzeugdaten anzeigen</p>`
        }
      </div>

      <span class="card-arrow">›</span>
    </article>
  `;
}

function generationCard(vehicle, generation, generationIndex, brand, model) {
  const vehicleId = String(vehicle.id);
  const genName = generationName(generation);
  const years = generationYears(generation);

  const engines = arr(generation.engines);
  const transmissions = arr(generation.transmissions);

  return `
    <article
      class="card generation-card"
      onclick="go('#vehicle/${encodeURIComponent(vehicleId)}/${generationIndex}')"
      tabindex="0"
      role="button"
      onkeydown="if(event.key==='Enter')go('#vehicle/${encodeURIComponent(vehicleId)}/${generationIndex}')"
    >
      <div class="generation-header">
        <div>
          <span class="generation-label">BAUREIHE</span>
          <h3>${esc(genName)}</h3>
          ${
            years
              ? `<p class="generation-years">${esc(years)}</p>`
              : ""
          }
        </div>

        <span class="generation-arrow">›</span>
      </div>

      <div class="generation-data">
        <div>
          <strong>Motoren</strong>
          <div class="chip-list">
            ${
              engines.length
                ? engines
                    .map(
                      (engine) =>
                        `<span class="chip">${esc(engineName(engine))}</span>`
                    )
                    .join("")
                : `<span class="muted">Keine Angaben</span>`
            }
          </div>
        </div>

        <div>
          <strong>Getriebe</strong>
          <div class="chip-list">
            ${
              transmissions.length
                ? transmissions
                    .map(
                      (transmission) =>
                        `<span class="chip">${esc(transmissionName(transmission))}</span>`
                    )
                    .join("")
                : `<span class="muted">Keine Angaben</span>`
            }
          </div>
        </div>
      </div>
    </article>
  `;
}

function engineCard(engine, index, vehicleId, generationIndex, selected) {
  const name = engineName(engine);

  return `
    <button
      type="button"
      class="selection-card ${selected ? "selected" : ""}"
      onclick="selectVehicleConfig(
        '${String(vehicleId).replace(/'/g, "\\'")}',
        ${generationIndex},
        'engine',
        ${index}
      )"
    >
      <span class="selection-icon">⚙</span>
      <span class="selection-content">
        <strong>${esc(name)}</strong>
        ${
          typeof engine === "object" && engine.code
            ? `<small>${esc(engine.code)}</small>`
            : ""
        }
      </span>
      <span class="selection-check">${selected ? "✓" : "›"}</span>
    </button>
  `;
}

function transmissionCard(
  transmission,
  index,
  vehicleId,
  generationIndex,
  selected
) {
  const name = transmissionName(transmission);

  return `
    <button
      type="button"
      class="selection-card ${selected ? "selected" : ""}"
      onclick="selectVehicleConfig(
        '${String(vehicleId).replace(/'/g, "\\'")}',
        ${generationIndex},
        'transmission',
        ${index}
      )"
    >
      <span class="selection-icon">▣</span>
      <span class="selection-content">
        <strong>${esc(name)}</strong>
        ${
          typeof transmission === "object" && transmission.code
            ? `<small>${esc(transmission.code)}</small>`
            : ""
        }
      </span>
      <span class="selection-check">${selected ? "✓" : "›"}</span>
    </button>
  `;
}

function homePage() {
  setCrumb([{ label: "Startseite" }]);

  const brands = arr(DB?.brands);

  return `
    ${pageShell(
      "KFZ MEISTER Wiki",
      "Technische Fahrzeugdaten, Reparaturen, Systeme und Diagnose."
    )}

    <div class="dashboard-grid">
      <article
        class="dashboard-card"
        onclick="go('#vehicles')"
        tabindex="0"
        role="button"
      >
        <div class="dashboard-icon">🚘</div>
        <h2>Fahrzeuge</h2>
        <p>Hersteller, Modelle, Baureihen, Motoren und Getriebe.</p>
        <span>Öffnen ›</span>
      </article>

      <article
        class="dashboard-card"
        onclick="go('#repairs')"
        tabindex="0"
        role="button"
      >
        <div class="dashboard-icon">🔧</div>
        <h2>Reparaturen</h2>
        <p>Reparaturinformationen und Arbeitsschritte.</p>
        <span>Öffnen ›</span>
      </article>

      <article
        class="dashboard-card"
        onclick="go('#systems')"
        tabindex="0"
        role="button"
      >
        <div class="dashboard-icon">⚙️</div>
        <h2>Systeme</h2>
        <p>Fahrzeugsysteme und technische Übersichten.</p>
        <span>Öffnen ›</span>
      </article>

      <article
        class="dashboard-card"
        onclick="go('#diagnosis')"
        tabindex="0"
        role="button"
      >
        <div class="dashboard-icon">🩺</div>
        <h2>Diagnose</h2>
        <p>Fehlersuche und Diagnoseinformationen.</p>
        <span>Öffnen ›</span>
      </article>
    </div>

    <section class="section">
      <div class="section-header">
        <h2>Hersteller</h2>
        <button class="text-button" onclick="go('#vehicles')">
          Alle anzeigen
        </button>
      </div>

      <div class="card-grid">
        ${brands.slice(0, 12).map(brandCard).join("")}
      </div>
    </section>
  `;
}

function vehiclesPage() {
  setCrumb([
    { label: "Startseite", href: "#home" },
    { label: "Fahrzeuge" }
  ]);

  const brands = arr(DB?.brands);

  return `
    ${pageShell(
      "Fahrzeuge",
      "Wähle zuerst den Hersteller aus."
    )}

    ${
      brands.length
        ? `<div class="card-grid">${brands.map(brandCard).join("")}</div>`
        : emptyState(
            "Keine Hersteller vorhanden",
            "In der Datenbank wurden keine Hersteller gefunden."
          )
    }
  `;
}

function brandPage(brandId) {
  const brand = brandById(brandId);

  if (!brand) {
    setCrumb([
      { label: "Startseite", href: "#home" },
      { label: "Fahrzeuge", href: "#vehicles" },
      { label: "Nicht gefunden" }
    ]);

    return emptyState(
      "Hersteller nicht gefunden",
      "Der angegebene Hersteller existiert nicht in der Datenbank."
    );
  }

  routeState.brand = brand;

  setCrumb([
    { label: "Startseite", href: "#home" },
    { label: "Fahrzeuge", href: "#vehicles" },
    { label: brand.name }
  ]);

  const models = arr(brand.models);

  return `
    ${pageShell(
      brand.name,
      "Wähle ein Modell aus, um die verfügbaren Baureihen anzuzeigen."
    )}

    ${
      models.length
        ? `<div class="card-grid">${models
            .map((model) => modelCard(brand, model))
            .join("")}</div>`
        : emptyState(
            "Keine Modelle vorhanden",
            "Für diesen Hersteller sind derzeit keine Modelle hinterlegt."
          )
    }
  `;
}
function modelPage(brandId, modelId) {
  const brand = brandById(brandId);

  if (!brand) {
    return emptyState(
      "Hersteller nicht gefunden",
      "Der Hersteller konnte nicht gefunden werden."
    );
  }

  const model = arr(brand.models).find(
    (item) => String(item.id) === String(modelId)
  );

  if (!model) {
    setCrumb([
      { label: "Startseite", href: "#home" },
      { label: "Fahrzeuge", href: "#vehicles" },
      { label: brand.name, href: `#vehicles/brand/${encodeURIComponent(brandId)}` },
      { label: "Modell nicht gefunden" }
    ]);

    return emptyState(
      "Modell nicht gefunden",
      "Das angegebene Modell existiert nicht."
    );
  }

  const vehicles = allVehiclesForModel(brandId, modelId);

  setCrumb([
    { label: "Startseite", href: "#home" },
    { label: "Fahrzeuge", href: "#vehicles" },
    {
      label: brand.name,
      href: `#vehicles/brand/${encodeURIComponent(brandId)}`
    },
    { label: model.name }
  ]);

  /*
   * Wichtig:
   * Ein Modell kann mehrere Datensätze in DB.vehicles haben.
   * Deshalb werden ALLE Fahrzeuge des Modells durchsucht und
   * sämtliche Generationen/Baureihen gesammelt.
   */
  const generations = [];

  vehicles.forEach((vehicle) => {
    arr(vehicle.generations).forEach((generation, index) => {
      generations.push({
        vehicle,
        generation,
        index
      });
    });
  });

  return `
    ${pageShell(
      `${brand.name} ${model.name}`,
      "Wähle eine Baureihe aus. Danach kannst du Motor und Getriebe auswählen."
    )}

    <div class="model-overview">
      <div class="overview-item">
        <span class="overview-label">Hersteller</span>
        <strong>${esc(brand.name)}</strong>
      </div>

      <div class="overview-item">
        <span class="overview-label">Modell</span>
        <strong>${esc(model.name)}</strong>
      </div>

      <div class="overview-item">
        <span class="overview-label">Baureihen</span>
        <strong>${generations.length}</strong>
      </div>
    </div>

    <section class="section">
      <div class="section-header">
        <h2>Baureihen / Generationen</h2>
      </div>

      ${
        generations.length
          ? `
            <div class="generation-grid">
              ${generations
                .map(({ vehicle, generation, index }) =>
                  generationCard(
                    vehicle,
                    generation,
                    index,
                    brand,
                    model
                  )
                )
                .join("")}
            </div>
          `
          : emptyState(
              "Keine Baureihen vorhanden",
              "Für dieses Modell wurden noch keine Baureihen in der Datenbank hinterlegt."
            )
      }
    </section>
  `;
}

function generationPage(vehicleId, generationIndex) {
  const vehicle = vehicleById(vehicleId);

  if (!vehicle) {
    setCrumb([
      { label: "Startseite", href: "#home" },
      { label: "Fahrzeuge", href: "#vehicles" },
      { label: "Fahrzeug nicht gefunden" }
    ]);

    return emptyState(
      "Fahrzeug nicht gefunden",
      "Der Fahrzeugdatensatz konnte nicht gefunden werden."
    );
  }

  const index = Number(generationIndex);
  const generation = arr(vehicle.generations)[index];

  if (!generation) {
    return emptyState(
      "Baureihe nicht gefunden",
      "Die angegebene Baureihe konnte nicht gefunden werden."
    );
  }

  const brand = brandById(vehicle.brand);
  const model = brand ? arr(brand.models).find(
    (item) => String(item.id) === String(vehicle.model)
  ) : null;

  const genName = generationName(generation);
  const years = generationYears(generation);

  const engines = arr(generation.engines);
  const transmissions = arr(generation.transmissions);

  const selected = routeState.vehicle &&
    String(routeState.vehicle.vehicleId) === String(vehicleId) &&
    Number(routeState.vehicle.generationIndex) === index
      ? routeState.vehicle
      : {
          vehicleId,
          generationIndex: index,
          engine: null,
          transmission: null
        };

  routeState.vehicle = selected;

  const selectedEngine =
    selected.engine !== null &&
    selected.engine !== undefined &&
    engines[selected.engine]
      ? engines[selected.engine]
      : null;

  const selectedTransmission =
    selected.transmission !== null &&
    selected.transmission !== undefined &&
    transmissions[selected.transmission]
      ? transmissions[selected.transmission]
      : null;

  const titleParts = [];

  if (brand?.name) titleParts.push(brand.name);
  if (model?.name) titleParts.push(model.name);

  titleParts.push(genName);

  setCrumb([
    { label: "Startseite", href: "#home" },
    { label: "Fahrzeuge", href: "#vehicles" },
    ...(brand
      ? [
          {
            label: brand.name,
            href: `#vehicles/brand/${encodeURIComponent(brand.id)}`
          }
        ]
      : []),
    ...(model
      ? [
          {
            label: model.name,
            href: `#vehicles/${encodeURIComponent(vehicle.brand)}/${encodeURIComponent(vehicle.model)}`
          }
        ]
      : []),
    { label: genName }
  ]);

  addRecent({
    type: "generation",
    id: `${vehicleId}:${index}`,
    vehicleId,
    generationIndex: index,
    title: titleParts.join(" ")
  });

  return `
    ${pageShell(
      titleParts.join(" "),
      years
        ? `Baureihe ${years} – Motor und Getriebe auswählen`
        : "Motor und Getriebe auswählen"
    )}

    <div class="vehicle-config">
      <div class="config-summary">
        <div class="config-summary-main">
          <span class="eyebrow">BAUREIHE</span>
          <h2>${esc(genName)}</h2>
          ${
            years
              ? `<p>${esc(years)}</p>`
              : ""
          }
        </div>

        ${
          vehicle.id
            ? favoriteButton(
                `generation:${vehicle.id}:${index}`,
                {
                  type: "generation",
                  vehicleId: vehicle.id,
                  generationIndex: index,
                  title: titleParts.join(" ")
                }
              )
            : ""
        }
      </div>

      <section class="selection-section">
        <div class="section-header">
          <div>
            <h2>Motor auswählen</h2>
            <p>Wähle den passenden Motor für diese Baureihe.</p>
          </div>
        </div>

        ${
          engines.length
            ? `
              <div class="selection-grid">
                ${engines
                  .map((engine, i) =>
                    engineCard(
                      engine,
                      i,
                      vehicleId,
                      index,
                      selected.engine === i
                    )
                  )
                  .join("")}
              </div>
            `
            : emptyState(
                "Keine Motoren hinterlegt",
                "Für diese Baureihe sind derzeit keine Motorinformationen vorhanden."
              )
        }
      </section>

      <section class="selection-section">
        <div class="section-header">
          <div>
            <h2>Getriebe auswählen</h2>
            <p>Wähle das passende Getriebe für diese Baureihe.</p>
          </div>
        </div>

        ${
          transmissions.length
            ? `
              <div class="selection-grid">
                ${transmissions
                  .map((transmission, i) =>
                    transmissionCard(
                      transmission,
                      i,
                      vehicleId,
                      index,
                      selected.transmission === i
                    )
                  )
                  .join("")}
              </div>
            `
            : emptyState(
                "Keine Getriebe hinterlegt",
                "Für diese Baureihe sind derzeit keine Getriebeinformationen vorhanden."
              )
        }
      </section>

      ${
        selectedEngine || selectedTransmission
          ? `
            <section class="selected-configuration">
              <div class="section-header">
                <div>
                  <h2>Ausgewählte Konfiguration</h2>
                  <p>Diese Auswahl bleibt beim Wechsel zwischen Motor und Getriebe erhalten.</p>
                </div>
              </div>

              <div class="configuration-grid">
                <div class="configuration-item">
                  <span>Motor</span>
                  <strong>
                    ${
                      selectedEngine
                        ? esc(engineName(selectedEngine))
                        : "Nicht ausgewählt"
                    }
                  </strong>
                </div>

                <div class="configuration-item">
                  <span>Getriebe</span>
                  <strong>
                    ${
                      selectedTransmission
                        ? esc(transmissionName(selectedTransmission))
                        : "Nicht ausgewählt"
                    }
                  </strong>
                </div>
              </div>
            </section>
          `
          : ""
      }
    </div>
  `;
}

function selectVehicleConfig(
  vehicleId,
  generationIndex,
  type,
  value
) {
  const vehicle = vehicleById(vehicleId);

  if (!vehicle) return;

  const generation = arr(vehicle.generations)[Number(generationIndex)];

  if (!generation) return;

  /*
   * Motor und Getriebe werden getrennt gespeichert.
   * Dadurch überschreibt die Auswahl des Getriebes NICHT
   * die vorherige Motorauswahl.
   */
  const previous =
    routeState.vehicle &&
    String(routeState.vehicle.vehicleId) === String(vehicleId) &&
    Number(routeState.vehicle.generationIndex) === Number(generationIndex)
      ? routeState.vehicle
      : {
          vehicleId,
          generationIndex: Number(generationIndex),
          engine: null,
          transmission: null
        };

  routeState.vehicle = {
    vehicleId,
    generationIndex: Number(generationIndex),
    engine: previous.engine ?? null,
    transmission: previous.transmission ?? null
  };

  if (type === "engine") {
    routeState.vehicle.engine = Number(value);
  }

  if (type === "transmission") {
    routeState.vehicle.transmission = Number(value);
  }

  render();
}

function vehicleSelectOptions(selectedId = "") {
  const vehicles = arr(DB?.vehicles);

  return vehicles
    .map((vehicle) => {
      const brand = brandById(vehicle.brand);
      const model = brand
        ? arr(brand.models).find(
            (model) => String(model.id) === String(vehicle.model)
          )
        : null;

      const label = [
        brand?.name,
        model?.name,
        vehicle.name
      ]
        .filter(Boolean)
        .join(" ");

      return `
        <option
          value="${esc(vehicle.id)}"
          ${String(vehicle.id) === String(selectedId) ? "selected" : ""}
        >
          ${esc(label || vehicle.id)}
        </option>
      `;
    })
    .join("");
}

function repairVehicleInfo(vehicleId) {
  const vehicle = vehicleById(vehicleId);

  if (!vehicle) {
    return "";
  }

  const brand = brandById(vehicle.brand);
  const model = brand
    ? arr(brand.models).find(
        (item) => String(item.id) === String(vehicle.model)
      )
    : null;

  const generations = arr(vehicle.generations);

  return `
    <div class="vehicle-info">
      <div>
        <span>Hersteller</span>
        <strong>${esc(brand?.name || "-")}</strong>
      </div>

      <div>
        <span>Modell</span>
        <strong>${esc(model?.name || "-")}</strong>
      </div>

      <div>
        <span>Baureihen</span>
        <strong>${generations.length}</strong>
      </div>
    </div>
  `;
}

function setRepairVehicle(vehicleId) {
  routeState.repairVehicle = vehicleId;
  render();
}

function repairCard(repair, index) {
  const id = repair?.id || `repair-${index}`;

  return `
    <article class="card repair-card">
      <div class="card-content">
        <span class="eyebrow">REPARATUR</span>
        <h3>${esc(repair?.title || repair?.name || id)}</h3>

        ${
          repair?.description
            ? `<p>${esc(repair.description)}</p>`
            : ""
        }

        ${
          repair?.system
            ? `<span class="tag">${esc(repair.system)}</span>`
            : ""
        }
      </div>
    </article>
  `;
}

function repairsPage() {
  setCrumb([
    { label: "Startseite", href: "#home" },
    { label: "Reparaturen" }
  ]);

  const repairs = arr(DB?.repairs);
  const selectedVehicle = routeState.repairVehicle || "";

  return `
    ${pageShell(
      "Reparaturen",
      "Reparaturinformationen nach Fahrzeug durchsuchen."
    )}

    <div class="repair-selector">
      <label for="repairVehicle">
        Fahrzeug
      </label>

      <select
        id="repairVehicle"
        onchange="setRepairVehicle(this.value)"
      >
        <option value="">Alle Fahrzeuge</option>
        ${vehicleSelectOptions(selectedVehicle)}
      </select>
    </div>

    ${
      selectedVehicle
        ? repairVehicleInfo(selectedVehicle)
        : ""
    }

    <section class="section">
      ${
        repairs.length
          ? `<div class="card-grid">${repairs.map(repairCard).join("")}</div>`
          : emptyState(
              "Keine Reparaturen vorhanden",
              "In der Datenbank wurden keine Reparaturinformationen gefunden."
            )
      }
    </section>
  `;
}

function systemsPage() {
  setCrumb([
    { label: "Startseite", href: "#home" },
    { label: "Systeme" }
  ]);

  const systems = arr(DB?.systems);

  return `
    ${pageShell(
      "Fahrzeugsysteme",
      "Technische Systeme und Baugruppen."
    )}

    ${
      systems.length
        ? `
          <div class="card-grid">
            ${systems
              .map(
                (system, index) => `
                  <article class="card system-card">
                    <div class="system-icon">⚙️</div>
                    <div class="card-content">
                      <h3>${esc(
                        system?.name ||
                        system?.title ||
                        `System ${index + 1}`
                      )}</h3>
                      ${
                        system?.description
                          ? `<p>${esc(system.description)}</p>`
                          : ""
                      }
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        `
        : emptyState(
            "Keine Systeme vorhanden",
            "In der Datenbank wurden keine Systeme gefunden."
          )
    }
  `;
}
function componentsPage() {
  setCrumb([
    { label: "Startseite", href: "#home" },
    { label: "Komponenten" }
  ]);

  const components = arr(DB?.components);

  return `
    ${pageShell(
      "Komponenten",
      "Bauteile und Komponenten des Fahrzeugs."
    )}

    ${
      components.length
        ? `
          <div class="card-grid">
            ${components
              .map(
                (component, index) => `
                  <article class="card component-card">
                    <div class="component-icon">🔩</div>

                    <div class="card-content">
                      <h3>${esc(
                        component?.name ||
                        component?.title ||
                        `Komponente ${index + 1}`
                      )}</h3>

                      ${
                        component?.description
                          ? `<p>${esc(component.description)}</p>`
                          : ""
                      }
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        `
        : emptyState(
            "Keine Komponenten vorhanden",
            "In der Datenbank wurden keine Komponenten gefunden."
          )
    }
  `;
}

function diagnosisPage() {
  setCrumb([
    { label: "Startseite", href: "#home" },
    { label: "Diagnose" }
  ]);

  const diagnosis = arr(DB?.diagnosis);

  return `
    ${pageShell(
      "Diagnose",
      "Fehlersuche, Symptome und Diagnoseinformationen."
    )}

    ${
      diagnosis.length
        ? `
          <div class="card-grid">
            ${diagnosis
              .map(
                (item, index) => `
                  <article class="card diagnosis-card">
                    <div class="diagnosis-icon">🩺</div>

                    <div class="card-content">
                      <h3>${esc(
                        item?.name ||
                        item?.title ||
                        item?.symptom ||
                        `Diagnose ${index + 1}`
                      )}</h3>

                      ${
                        item?.description
                          ? `<p>${esc(item.description)}</p>`
                          : ""
                      }

                      ${
                        item?.cause
                          ? `
                            <div class="diagnosis-detail">
                              <span>Ursache</span>
                              <strong>${esc(item.cause)}</strong>
                            </div>
                          `
                          : ""
                      }
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        `
        : emptyState(
            "Keine Diagnoseinformationen vorhanden",
            "In der Datenbank wurden keine Diagnoseinformationen gefunden."
          )
    }
  `;
}

function favoritesPage() {
  setCrumb([
    { label: "Startseite", href: "#home" },
    { label: "Favoriten" }
  ]);

  const favorites = getFavorites();

  if (!favorites.length) {
    return `
      ${pageShell(
        "Favoriten",
        "Deine gespeicherten Fahrzeugdaten."
      )}

      ${emptyState(
        "Noch keine Favoriten",
        "Du kannst Baureihen über das Sternsymbol zu deinen Favoriten hinzufügen."
      )}
    `;
  }

  return `
    ${pageShell(
      "Favoriten",
      `${favorites.length} gespeicherte Einträge`
    )}

    <div class="card-grid">
      ${favorites
        .map((item) => {
          if (item.type === "generation") {
            const vehicle = vehicleById(item.vehicleId);
            const generation = vehicle
              ? arr(vehicle.generations)[Number(item.generationIndex)]
              : null;

            if (!vehicle || !generation) {
              return "";
            }

            return `
              <article
                class="card favorite-card"
                onclick="go('#vehicle/${encodeURIComponent(
                  vehicle.id
                )}/${Number(item.generationIndex)}')"
              >
                <div class="card-content">
                  <span class="eyebrow">BAUREIHE</span>
                  <h3>${esc(item.title || generationName(generation))}</h3>
                  <p>${esc(generationYears(generation))}</p>
                </div>

                ${favoriteButton(
                  `generation:${vehicle.id}:${item.generationIndex}`,
                  item
                )}
              </article>
            `;
          }

          return `
            <article class="card favorite-card">
              <div class="card-content">
                <h3>${esc(item.title || item.id)}</h3>
              </div>

              ${favoriteButton(item.id, item)}
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function recentPage() {
  setCrumb([
    { label: "Startseite", href: "#home" },
    { label: "Zuletzt geöffnet" }
  ]);

  const recent = getStorage("kfz_recent", []);

  if (!recent.length) {
    return `
      ${pageShell(
        "Zuletzt geöffnet",
        "Deine zuletzt geöffneten Fahrzeugdaten."
      )}

      ${emptyState(
        "Noch keine Einträge",
        "Geöffnete Baureihen werden hier automatisch angezeigt."
      )}
    `;
  }

  return `
    ${pageShell(
      "Zuletzt geöffnet",
      `${recent.length} Einträge`
    )}

    <div class="card-grid">
      ${recent
        .map((item) => {
          if (item.type === "generation") {
            return `
              <article
                class="card recent-card"
                onclick="go('#vehicle/${encodeURIComponent(
                  item.vehicleId
                )}/${Number(item.generationIndex)}')"
              >
                <div class="recent-icon">🕘</div>

                <div class="card-content">
                  <h3>${esc(item.title || "Baureihe")}</h3>
                  <p>Baureihe / Fahrzeugdaten</p>
                </div>

                <span class="card-arrow">›</span>
              </article>
            `;
          }

          return `
            <article class="card recent-card">
              <div class="recent-icon">🕘</div>

              <div class="card-content">
                <h3>${esc(item.title || item.id)}</h3>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function searchAll(query) {
  const q = String(query || "")
    .trim()
    .toLowerCase();

  if (!q) {
    return [];
  }

  const results = [];

  arr(DB?.brands).forEach((brand) => {
    if (
      String(brand.name || "")
        .toLowerCase()
        .includes(q)
    ) {
      results.push({
        type: "brand",
        title: brand.name,
        subtitle: "Hersteller",
        href: `#vehicles/brand/${encodeURIComponent(brand.id)}`
      });
    }

    arr(brand.models).forEach((model) => {
      if (
        String(model.name || "")
          .toLowerCase()
          .includes(q)
      ) {
        results.push({
          type: "model",
          title: `${brand.name} ${model.name}`,
          subtitle: "Modell",
          href: `#vehicles/${encodeURIComponent(
            brand.id
          )}/${encodeURIComponent(model.id)}`
        });
      }
    });
  });

  arr(DB?.vehicles).forEach((vehicle) => {
    const brand = brandById(vehicle.brand);
    const model = brand
      ? arr(brand.models).find(
          (item) => String(item.id) === String(vehicle.model)
        )
      : null;

    arr(vehicle.generations).forEach((generation, index) => {
      const name = generationName(generation);

      const haystack = [
        brand?.name,
        model?.name,
        name,
        generationYears(generation),
        ...arr(generation.engines).map(engineName),
        ...arr(generation.transmissions).map(transmissionName)
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (haystack.includes(q)) {
        results.push({
          type: "generation",
          title: [
            brand?.name,
            model?.name,
            name
          ]
            .filter(Boolean)
            .join(" "),
          subtitle: "Baureihe",
          href: `#vehicle/${encodeURIComponent(
            vehicle.id
          )}/${index}`
        });
      }
    });
  });

  return results.slice(0, 50);
}

function searchPage(query = "") {
  const results = searchAll(query);

  setCrumb([
    { label: "Startseite", href: "#home" },
    { label: "Suche" }
  ]);

  return `
    ${pageShell(
      "Suche",
      query
        ? `Suchergebnisse für „${query}“`
        : "Durchsuche Hersteller, Modelle, Baureihen, Motoren und Getriebe."
    )}

    <div class="search-page-form">
      <input
        id="searchInputPage"
        type="search"
        value="${esc(query)}"
        placeholder="z. B. Golf, BMW, E90, TDI, Automatik …"
        onkeydown="if(event.key==='Enter')performSearch()"
      >

      <button
        type="button"
        class="primary-button"
        onclick="performSearch()"
      >
        Suchen
      </button>
    </div>

    ${
      query
        ? `
          <section class="section">
            ${
              results.length
                ? `
                  <div class="search-results">
                    ${results
                      .map(
                        (result) => `
                          <article
                            class="search-result"
                            onclick="go('${String(result.href).replace(/'/g, "\\'")}')"
                          >
                            <div class="search-result-icon">
                              ${
                                result.type === "brand"
                                  ? "🏭"
                                  : result.type === "model"
                                  ? "🚗"
                                  : "⚙️"
                              }
                            </div>

                            <div class="search-result-content">
                              <span>${esc(result.subtitle)}</span>
                              <strong>${esc(result.title)}</strong>
                            </div>

                            <span>›</span>
                          </article>
                        `
                      )
                      .join("")}
                  </div>
                `
                : emptyState(
                    "Keine Treffer",
                    "Für deine Suche wurden keine passenden Einträge gefunden."
                  )
            }
          </section>
        `
        : ""
    }
  `;
}

function performSearch() {
  const input =
    $("#searchInputPage") ||
    $("#globalSearch");

  const query = input?.value?.trim() || "";

  if (query) {
    go(`#search/${encodeURIComponent(query)}`);
  }
}

function updateGlobalSearch() {
  const input = $("#globalSearch");
  const container = $("#searchSuggestions");

  if (!input || !container) return;

  const query = input.value.trim();

  if (!query) {
    container.innerHTML = "";
    container.classList.remove("visible");
    return;
  }

  const results = searchAll(query).slice(0, 8);

  if (!results.length) {
    container.innerHTML = `
      <div class="search-no-results">
        Keine Treffer
      </div>
    `;
    container.classList.add("visible");
    return;
  }

  container.innerHTML = results
    .map(
      (result) => `
        <button
          type="button"
          class="search-suggestion"
          onclick="go('${String(result.href).replace(/'/g, "\\'")}')"
        >
          <span>
            <small>${esc(result.subtitle)}</small>
            <strong>${esc(result.title)}</strong>
          </span>
          <span>›</span>
        </button>
      `
    )
    .join("");

  container.classList.add("visible");
}

function appLayout(content) {
  return `
    <div class="app-shell">

      <header class="topbar">
        <div class="topbar-inner">

          <button
            type="button"
            class="brand-button"
            onclick="go('#home')"
            aria-label="Startseite"
          >
            <span class="brand-mark">K</span>
            <span class="brand-text">
              <strong>KFZ MEISTER</strong>
              <small>Wiki</small>
            </span>
          </button>

          <div class="global-search">
            <input
              id="globalSearch"
              type="search"
              placeholder="Suche nach Fahrzeug, Modell, Baureihe …"
              autocomplete="off"
              oninput="updateGlobalSearch()"
              onkeydown="if(event.key==='Enter')performSearch()"
            >

            <button
              type="button"
              onclick="performSearch()"
              aria-label="Suchen"
            >
              🔍
            </button>

            <div
              id="searchSuggestions"
              class="search-suggestions"
            ></div>
          </div>

          <nav class="topnav">
            <button onclick="go('#favorites')" title="Favoriten">★</button>
            <button onclick="go('#recent')" title="Zuletzt geöffnet">🕘</button>
          </nav>

        </div>
      </header>

      <div class="layout">

        <aside class="sidebar">
          <nav>
            <button onclick="go('#home')">
              <span>⌂</span>
              Startseite
            </button>

            <button onclick="go('#vehicles')">
              <span>🚘</span>
              Fahrzeuge
            </button>

            <button onclick="go('#repairs')">
              <span>🔧</span>
              Reparaturen
            </button>

            <button onclick="go('#systems')">
              <span>⚙️</span>
              Systeme
            </button>

            <button onclick="go('#components')">
              <span>🔩</span>
              Komponenten
            </button>

            <button onclick="go('#diagnosis')">
              <span>🩺</span>
              Diagnose
            </button>

            <div class="sidebar-divider"></div>

            <button onclick="go('#favorites')">
              <span>★</span>
              Favoriten
            </button>

            <button onclick="go('#recent')">
              <span>🕘</span>
              Zuletzt geöffnet
            </button>
          </nav>
        </aside>

        <main class="main-content">
          <div class="content-inner">
            <div id="breadcrumb" class="breadcrumb"></div>
            <div id="appContent">
              ${content}
            </div>
          </div>
        </main>

      </div>

      <footer class="footer">
        <span>KFZ MEISTER Wiki</span>
        <span>Technische Fahrzeugdaten &amp; Werkstattwissen</span>
      </footer>

    </div>
  `;
}
function parseHash() {
  let hash = location.hash || "#home";

  if (hash.startsWith("#")) {
    hash = hash.substring(1);
  }

  const parts = hash
    .split("/")
    .filter(Boolean)
    .map((part) => {
      try {
        return decodeURIComponent(part);
      } catch {
        return part;
      }
    });

  return parts;
}

function render() {
  const app = $("#app");

  if (!app) {
    return;
  }

  if (!DB) {
    app.innerHTML = appLayout(loadingState());
    return;
  }

  const parts = parseHash();

  let html = "";

  /*
   * ----------------------------------------------------------
   * ROUTES
   * ----------------------------------------------------------
   */

  if (parts.length === 0 || parts[0] === "home") {
    html = homePage();
  }

  else if (parts[0] === "vehicles" && parts.length === 1) {
    html = vehiclesPage();
  }

  else if (
    parts[0] === "vehicles" &&
    parts[1] === "brand" &&
    parts[2]
  ) {
    html = brandPage(parts[2]);
  }

  else if (
    parts[0] === "vehicles" &&
    parts[1] &&
    parts[2]
  ) {
    html = modelPage(parts[1], parts[2]);
  }

  /*
   * NEUE ROUTE:
   *
   * #vehicle/{vehicleId}/{generationIndex}
   *
   * Diese Route öffnet eine konkrete Baureihe.
   */
  else if (
    parts[0] === "vehicle" &&
    parts[1]
  ) {
    html = generationPage(
      parts[1],
      Number(parts[2] || 0)
    );
  }

  else if (parts[0] === "repairs") {
    html = repairsPage();
  }

  else if (parts[0] === "systems") {
    html = systemsPage();
  }

  else if (parts[0] === "components") {
    html = componentsPage();
  }

  else if (parts[0] === "diagnosis") {
    html = diagnosisPage();
  }

  else if (parts[0] === "favorites") {
    html = favoritesPage();
  }

  else if (parts[0] === "recent") {
    html = recentPage();
  }

  else if (parts[0] === "search") {
    html = searchPage(parts.slice(1).join("/"));
  }

  else {
    html = `
      ${pageShell("Seite nicht gefunden")}

      ${emptyState(
        "404",
        "Die angeforderte Seite existiert nicht."
      )}

      <div class="center-action">
        <button
          class="primary-button"
          onclick="go('#home')"
        >
          Zur Startseite
        </button>
      </div>
    `;
  }

  app.innerHTML = appLayout(html);

  /*
   * Nach dem erneuten Rendern wird der globale Suchwert
   * wieder eingesetzt, falls vorher bereits gesucht wurde.
   */
  const globalSearch = $("#globalSearch");

  if (
    globalSearch &&
    parts[0] === "search" &&
    parts.length > 1
  ) {
    globalSearch.value = parts.slice(1).join(" ");
  }
}

async function loadDatabase() {
  try {
    const response = await fetch("database.json", {
      cache: "no-cache"
    });

    if (!response.ok) {
      throw new Error(
        `database.json konnte nicht geladen werden (${response.status})`
      );
    }

    DB = await response.json();

    /*
     * Grundlegende Fallbacks.
     */
    if (!DB || typeof DB !== "object") {
      DB = {};
    }

    DB.brands = arr(DB.brands);
    DB.vehicles = arr(DB.vehicles);
    DB.repairs = arr(DB.repairs);
    DB.systems = arr(DB.systems);
    DB.components = arr(DB.components);
    DB.diagnosis = arr(DB.diagnosis);

    render();
  } catch (error) {
    console.error(error);

    const app = $("#app");

    if (app) {
      app.innerHTML = appLayout(
        errorState(
          error?.message ||
          "Die Datenbank konnte nicht geladen werden."
        )
      );
    }
  }
}

function init() {
  /*
   * Hash-Änderungen navigieren innerhalb der Anwendung.
   */
  window.addEventListener("hashchange", () => {
    render();

    window.scrollTo({
      top: 0,
      behavior: "instant"
    });
  });

  /*
   * Klick außerhalb des Suchvorschlagsfensters:
   * Vorschläge schließen.
   */
  document.addEventListener("click", (event) => {
    const search = document.querySelector(".global-search");

    if (!search || search.contains(event.target)) {
      return;
    }

    const suggestions = $("#searchSuggestions");

    if (suggestions) {
      suggestions.classList.remove("visible");
    }
  });

  /*
   * Wenn noch kein Hash vorhanden ist, Startseite verwenden.
   */
  if (!location.hash) {
    history.replaceState(
      null,
      "",
      "#home"
    );
  }

  loadDatabase();
}

document.addEventListener("DOMContentLoaded", init);

/* ============================================================
   OPTIONALE HILFSFUNKTIONEN
   ============================================================ */

function getCurrentVehicleSelection() {
  if (!routeState.vehicle) {
    return null;
  }

  const vehicle = vehicleById(
    routeState.vehicle.vehicleId
  );

  if (!vehicle) {
    return null;
  }

  const generation = arr(vehicle.generations)[
    Number(routeState.vehicle.generationIndex)
  ];

  if (!generation) {
    return null;
  }

  const engine =
    routeState.vehicle.engine !== null &&
    routeState.vehicle.engine !== undefined
      ? arr(generation.engines)[
          Number(routeState.vehicle.engine)
        ]
      : null;

  const transmission =
    routeState.vehicle.transmission !== null &&
    routeState.vehicle.transmission !== undefined
      ? arr(generation.transmissions)[
          Number(routeState.vehicle.transmission)
        ]
      : null;

  return {
    vehicle,
    generation,
    engine,
    transmission
  };
}

function clearVehicleSelection() {
  routeState.vehicle = null;
  render();
}

function selectFirstEngine() {
  const selection = getCurrentVehicleSelection();

  if (!selection) {
    return;
  }

  if (arr(selection.generation.engines).length) {
    routeState.vehicle.engine = 0;
    render();
  }
}

function selectFirstTransmission() {
  const selection = getCurrentVehicleSelection();

  if (!selection) {
    return;
  }

  if (arr(selection.generation.transmissions).length) {
    routeState.vehicle.transmission = 0;
    render();
  }
}

/* ============================================================
   DATENBANK-DEBUG
   ============================================================ */

function debugDatabase() {
  console.log("KFZ MEISTER Wiki DB:", DB);
  console.log("Brands:", arr(DB?.brands));
  console.log("Vehicles:", arr(DB?.vehicles));
  console.log("Route:", routeState);
}

window.debugDatabase = debugDatabase;
window.selectVehicleConfig = selectVehicleConfig;
window.toggleFavorite = toggleFavorite;
window.performSearch = performSearch;
window.setRepairVehicle = setRepairVehicle;
window.go = go;

/*
 * ============================================================
 * ZUSÄTZLICHE KOMPATIBILITÄT / LEGACY-FUNKTIONEN
 * ============================================================
 *
 * Dieser Abschnitt sorgt dafür, dass ältere Aufrufe aus
 * vorhandenen HTML-Dateien weiterhin funktionieren.
 * ============================================================
 */

function openVehicle(vehicleId, generationIndex = 0) {
  go(
    `#vehicle/${encodeURIComponent(vehicleId)}/${Number(
      generationIndex
    )}`
  );
}

function openModel(brandId, modelId) {
  go(
    `#vehicles/${encodeURIComponent(
      brandId
    )}/${encodeURIComponent(modelId)}`
  );
}

function openBrand(brandId) {
  go(
    `#vehicles/brand/${encodeURIComponent(
      brandId
    )}`
  );
}

function openHome() {
  go("#home");
}

function openVehicles() {
  go("#vehicles");
}

function openRepairs() {
  go("#repairs");
}

function openSystems() {
  go("#systems");
}

function openComponents() {
  go("#components");
}

function openDiagnosis() {
  go("#diagnosis");
}

function openFavorites() {
  go("#favorites");
}

function openRecent() {
  go("#recent");
}

window.openVehicle = openVehicle;
window.openModel = openModel;
window.openBrand = openBrand;
window.openHome = openHome;
window.openVehicles = openVehicles;
window.openRepairs = openRepairs;
window.openSystems = openSystems;
window.openComponents = openComponents;
window.openDiagnosis = openDiagnosis;
window.openFavorites = openFavorites;
window.openRecent = openRecent;

/* ============================================================
   ENDE APP.JS
   ============================================================ */
