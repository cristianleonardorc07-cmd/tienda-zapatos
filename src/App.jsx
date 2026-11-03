import { useState, useEffect, useCallback } from "react";
import {
  Search,
  ShoppingBag,
  Heart,
  ArrowUpRight,
  ArrowRight,
  Truck,
  ShieldCheck,
  MessageCircle,
  SlidersHorizontal,
  X,
  Menu,
  Plus,
  Minus,
} from "lucide-react";
import products from "./data/products.json";
import ProductCard from "./components/ProductCard";
import Cart from "./components/Cart";
import Modal from "./components/Modal";
import Product from "./pages/Product";
import { readLocal, itemKey, money, whatsappUrl } from "./utils/shop";
import { store, whatsappConfigured } from "./config/store";
const categories = ["Todos", "Hombres", "Mujeres", "Niños"];
function initialCart() {
  const saved = readLocal("nova-cart", []);
  if (!Array.isArray(saved)) return [];
  return saved.flatMap((i) => {
    const p = products.find((p) => p.id === i?.id);
    return p &&
      p.available &&
      p.sizes.includes(i.size) &&
      p.colors.includes(i.color) &&
      Number.isInteger(i.quantity) &&
      i.quantity > 0
      ? [
          {
            ...p,
            size: i.size,
            color: i.color,
            quantity: Math.min(20, i.quantity),
          },
        ]
      : [];
  });
}
function currentProduct() {
  return new URLSearchParams(location.search).get("producto");
}
export default function App() {
  const [cart, setCart] = useState(initialCart),
    [favorites, setFavorites] = useState(() => {
      const s = readLocal("nova-favorites", []);
      return Array.isArray(s)
        ? s.filter((id) => products.some((p) => p.id === id))
        : [];
    }),
    [cartOpen, setCartOpen] = useState(false),
    [checkout, setCheckout] = useState(false),
    [productId, setProductId] = useState(currentProduct),
    [category, setCategory] = useState("Todos"),
    [query, setQuery] = useState(""),
    [size, setSize] = useState(""),
    [color, setColor] = useState(""),
    [maxPrice, setMaxPrice] = useState(""),
    [stock, setStock] = useState(false),
    [view, setView] = useState("all"),
    [sort, setSort] = useState("featured"),
    [filtersOpen, setFiltersOpen] = useState(false),
    [menu, setMenu] = useState(false),
    [toast, setToast] = useState(""),
    [info, setInfo] = useState(null),
    [faq, setFaq] = useState(null);
  useEffect(() => {
    try {
      localStorage.setItem("nova-cart", JSON.stringify(cart));
      localStorage.setItem("nova-favorites", JSON.stringify(favorites));
    } catch {
      setToast(
        "El navegador no permite guardar los cambios. Se conservarán durante esta sesión.",
      );
    }
  }, [cart, favorites]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const handler = () => setProductId(currentProduct());
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);
  const closeCart = useCallback(() => setCartOpen(false), []),
    closeInfo = useCallback(() => setInfo(null), []);
  function openProduct(id) {
    const url = new URL(location.href);
    id
      ? url.searchParams.set("producto", id)
      : url.searchParams.delete("producto");
    history.pushState({}, "", url);
    setProductId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function browse(cat = "Todos", mode = "all") {
    if (productId) openProduct(null);
    setCategory(cat);
    setView(mode);
    setMenu(false);
    setTimeout(
      () =>
        document
          .getElementById("coleccion")
          ?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  }
  function favorite(id) {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }
  function add(item, buy = false) {
    const key = itemKey(item);
    setCart((prev) => {
      const old = prev.find((x) => itemKey(x) === key);
      return old
        ? prev.map((x) =>
            itemKey(x) === key
              ? { ...x, quantity: Math.min(20, x.quantity + item.quantity) }
              : x,
          )
        : [...prev, item];
    });
    setToast("Tu par se agregó al carrito. Máximo 20 unidades por variante.");
    if (buy) {
      setCheckout(true);
      setCartOpen(true);
    }
  }
  function reset() {
    setCategory("Todos");
    setQuery("");
    setSize("");
    setColor("");
    setMaxPrice("");
    setStock(false);
    setView("all");
  }
  let filtered = products.filter(
    (p) =>
      (category === "Todos" || p.category === category) &&
      `${p.name} ${p.reference} ${p.category}`
        .toLocaleLowerCase("es")
        .includes(query.toLocaleLowerCase("es")) &&
      (!size || p.sizes.includes(Number(size))) &&
      (!color || p.colors.includes(color)) &&
      (!maxPrice || p.price <= Number(maxPrice)) &&
      (!stock || p.available) &&
      (view === "all" ||
        (view === "new" && p.new) ||
        (view === "popular" && p.popular) ||
        (view === "sale" && p.promotion) ||
        (view === "favorites" && favorites.includes(p.id))),
  );
  if (sort === "low") filtered.sort((a, b) => a.price - b.price);
  if (sort === "high") filtered.sort((a, b) => b.price - a.price);
  const product = products.find((p) => p.id === productId),
    count = cart.reduce((s, i) => s + i.quantity, 0);
  const viewTitle = {
    all: "Encuentra tu próximo par.",
    new: "Lo nuevo está aquí.",
    popular: "Los favoritos de la calle.",
    sale: "Un buen par. Un mejor precio.",
    favorites: "Tus próximos favoritos.",
  }[view];
  return (
    <>
      <a className="skip" href="#main">
        Ir al contenido
      </a>
      <div className="announcement">
        <span>MUÉVETE DIFERENTE. DEJA TU HUELLA.</span>
        <span>
          Pedidos fáciles por WhatsApp <ArrowUpRight size={12} />
        </span>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <a
            className="logo"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              openProduct(null);
              reset();
              window.scrollTo({ top: 0 });
            }}
          >
            NOVA
            <span>
              KICKS<span className="logo-dot">®</span>
            </span>
          </a>
          <nav
            aria-label="Navegación principal"
            className={menu ? "mobile-open" : ""}
          >
            {["Hombres", "Mujeres", "Niños"].map((c) => (
              <button
                key={c}
                className={category === c ? "nav-active" : ""}
                onClick={() => browse(c)}
              >
                {c}
              </button>
            ))}
            <button onClick={() => browse("Todos", "new")}>Novedades</button>
            <button
              className="sale-link"
              onClick={() => browse("Todos", "sale")}
            >
              Sale <ArrowUpRight size={12} />
            </button>
          </nav>
          <div className="header-actions">
            <label className="search">
              <Search size={17} />
              <input
                aria-label="Buscar productos"
                placeholder="Busca tu próximo par"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (productId) openProduct(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") browse(category);
                }}
              />
            </label>
            <button
              className="icon-button"
              aria-label={`Favoritos (${favorites.length})`}
              onClick={() => browse("Todos", "favorites")}
            >
              <Heart size={21} />
              {favorites.length > 0 && (
                <span className="tiny-count">{favorites.length}</span>
              )}
            </button>
            <button
              className="icon-button bag"
              aria-label={`Abrir carrito, ${count} productos`}
              onClick={() => {
                setCheckout(false);
                setCartOpen(true);
              }}
            >
              <ShoppingBag size={21} />
              <span className="cart-count">{count}</span>
            </button>
            <button
              className="icon-button menu-toggle"
              aria-label="Abrir menú"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <div id="main">
        {productId ? (
          product ? (
            <Product
              key={product.id}
              product={product}
              products={products}
              onOpen={openProduct}
              onAdd={add}
              onBuy={(item) => add(item, true)}
              favorites={favorites}
              onFavorite={favorite}
            />
          ) : (
            <main className="container empty">
              <h1>No encontramos este producto.</h1>
              <button className="button" onClick={() => openProduct(null)}>
                Volver a la tienda
              </button>
            </main>
          )
        ) : (
          <main>
            <section className="hero">
              <div className="hero-copy">
                <div className="eyebrow light">
                  <span className="mini-line" /> NUEVA COLECCIÓN / 2026
                </div>
                <h1>
                  No sigas
                  <br />
                  el camino.
                  <br />
                  <em>Márcalo.</em>
                </h1>
                <p>
                  Estilo que se siente. Comodidad que te mueve.
                  <br />
                  Encuentra el par que habla por ti.
                </p>
                <button className="button lime" onClick={() => browse()}>
                  Explorar colección <ArrowUpRight size={20} />
                </button>
                <div className="hero-foot">
                  <span>DISEÑADOS PARA TU DÍA A DÍA</span>
                  <span>COLECCIÓN 01</span>
                </div>
              </div>
              <div className="hero-visual">
                <img
                  src="/images/shoe-hero.png"
                  alt="Calzado deportivo de ejemplo, fotografía de inspiración"
                  fetchPriority="high"
                />
                <div className="hero-word">MOVE.</div>
                <span className="vertical-label">
                  NOVA KICKS — EVERYDAY CULTURE
                </span>
                <button
                  className="hero-product"
                  onClick={() => openProduct("nk-001")}
                >
                  <span>
                    <small>EL ESTILO NO SE DETIENE</small>Air District{" "}
                    <ArrowUpRight size={20} />
                  </span>
                  <span className="circle-arrow">
                    <ArrowUpRight />
                  </span>
                </button>
              </div>
            </section>
            <div className="benefits container">
              <div>
                <Truck />
                <span>
                  Envíos en Colombia
                  <small>Cobertura y costo por confirmar</small>
                </span>
              </div>
              <div>
                <ShieldCheck />
                <span>
                  Compra a tu manera
                  <small>Sin registros ni complicaciones</small>
                </span>
              </div>
              <div>
                <MessageCircle />
                <span>
                  Atención cercana<small>Coordina tu pedido por WhatsApp</small>
                </span>
              </div>
            </div>
            <section className="container categories-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">UN PAR PARA CADA HISTORIA</span>
                  <h2>Tu estilo. Tus reglas.</h2>
                </div>
                <span className="muted desktop-note">
                  Encuentra dónde empieza tu próxima aventura.
                </span>
              </div>
              <div className="category-grid">
                {[
                  ["Hombres", "Para ir un paso adelante.", "shoe-2.png"],
                  ["Mujeres", "Actitud en cada paso.", "shoe-3.png"],
                  ["Niños", "Grandes pasos, pequeños pies.", "shoe-hero.png"],
                ].map(([name, sub, photo], i) => (
                  <button
                    className={`category-tile category-${i}`}
                    key={name}
                    onClick={() => browse(name)}
                  >
                    <img
                      src={`/images/${photo}`}
                      alt={`Inspiración de calzado para ${name.toLowerCase()}`}
                      loading="lazy"
                    />
                    <span>
                      <small>{sub}</small>
                      <strong>{name}</strong>
                    </span>
                    <i>
                      <ArrowUpRight />
                    </i>
                  </button>
                ))}
              </div>
            </section>
            <section className="catalog container" id="coleccion">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">BUENOS PARES. GRANDES PLANES.</span>
                  <h2>{viewTitle}</h2>
                </div>
                <button
                  className="text-button"
                  onClick={() => {
                    reset();
                    browse();
                  }}
                >
                  Ver toda la colección <ArrowUpRight size={17} />
                </button>
              </div>
              <div
                className="catalog-tabs"
                role="group"
                aria-label="Colecciones"
              >
                {[
                  ["all", "Todos"],
                  ["new", "Novedades"],
                  ["popular", "Más populares"],
                  ["sale", "Promociones"],
                  ["favorites", `Favoritos (${favorites.length})`],
                ].map(([id, label]) => (
                  <button
                    className={view === id ? "selected" : ""}
                    key={id}
                    onClick={() => setView(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="catalog-toolbar">
                <div className="category-pills">
                  {categories.map((c) => (
                    <button
                      key={c}
                      className={category === c ? "selected" : ""}
                      onClick={() => setCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className="sort-actions">
                  <button
                    className={`filter-button ${filtersOpen ? "selected" : ""}`}
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    aria-expanded={filtersOpen}
                  >
                    <SlidersHorizontal size={16} /> Filtros
                  </button>
                  <select
                    aria-label="Ordenar productos"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="featured">Destacados</option>
                    <option value="low">Menor precio</option>
                    <option value="high">Mayor precio</option>
                  </select>
                </div>
              </div>
              {filtersOpen && (
                <div className="filters">
                  <label>
                    Precio máximo
                    <select
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    >
                      <option value="">Todos los precios</option>
                      <option value="190000">Hasta $190.000</option>
                      <option value="220000">Hasta $220.000</option>
                      <option value="260000">Hasta $260.000</option>
                    </select>
                  </label>
                  <label>
                    Talla EU
                    <select
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                    >
                      <option value="">Todas las tallas</option>
                      {[...new Set(products.flatMap((p) => p.sizes))]
                        .sort((a, b) => a - b)
                        .map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                    </select>
                  </label>
                  <label>
                    Color
                    <select
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                    >
                      <option value="">Todos los colores</option>
                      {["Blanco", "Negro", "Arena", "Verde"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={stock}
                      onChange={(e) => setStock(e.target.checked)}
                    />{" "}
                    Solo disponibles
                  </label>
                  <button className="text-button" onClick={reset}>
                    Limpiar filtros <X size={14} />
                  </button>
                </div>
              )}
              <div className="results-line">
                <span>
                  {filtered.length} productos{query && ` para “${query}”`}
                </span>
                <span>CATÁLOGO DE DEMOSTRACIÓN · FOTOS ILUSTRATIVAS</span>
              </div>
              {filtered.length ? (
                <div className="product-grid">
                  {filtered.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onOpen={openProduct}
                      favorite={favorites.includes(p.id)}
                      onFavorite={favorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <Search size={36} />
                  <h3>No encontramos pares con esos filtros.</h3>
                  <button className="button" onClick={reset}>
                    Ver todos los productos
                  </button>
                </div>
              )}
            </section>
            <section className="promo container">
              <div>
                <span className="eyebrow">BUEN ESTILO, MEJOR PRECIO</span>
                <h2>
                  Tu próximo favorito.
                  <br />
                  Por menos.
                </h2>
                <p>Descubre los pares de ejemplo con precio especial.</p>
                <button
                  className="button"
                  onClick={() => browse("Todos", "sale")}
                >
                  Explorar promociones <ArrowUpRight size={19} />
                </button>
              </div>
              <div className="promo-art">
                <span>
                  EXTRA
                  <br />
                  <em>STYLE.</em>
                </span>
                <ArrowUpRight size={96} strokeWidth={1} />
              </div>
            </section>
            <section className="faq container">
              <span className="eyebrow">ASÍ DE FÁCIL</span>
              <h2>De tu pantalla a tus pasos.</h2>
              {[
                [
                  "¿Cómo hago mi pedido?",
                  "Elige tu par, selecciona talla y color y agrégalo al carrito. Completa tus datos y envía el mensaje por WhatsApp. La tienda confirmará disponibilidad, envío y forma de pago.",
                ],
                [
                  "¿Cuánto cuesta el envío?",
                  "El costo y el tiempo de entrega dependen de tu ciudad. La tienda los confirmará por WhatsApp antes de concretar el pedido.",
                ],
                [
                  "¿Son productos reales?",
                  "Este catálogo contiene 24 ejemplos con fotografías ilustrativas. Los precios, modelos y disponibilidad deben reemplazarse con información real antes de abrir la tienda al público.",
                ],
              ].map(([q, a], i) => (
                <div className="faq-item" key={q}>
                  <button
                    aria-expanded={faq === i}
                    onClick={() => setFaq(faq === i ? null : i)}
                  >
                    {q}
                    {faq === i ? <Minus size={19} /> : <Plus size={19} />}
                  </button>
                  {faq === i && <p>{a}</p>}
                </div>
              ))}
            </section>
          </main>
        )}
      </div>
      <footer className="site-footer">
        <div className="container footer-top">
          <div>
            <a className="logo footer-logo" href="/">
              NOVA<span>KICKS®</span>
            </a>
            <p>
              Un par. Infinitas posibilidades.
              <br />
              Camina a tu manera.
            </p>
            <span className="footer-tag">HECHO PARA MOVERTE ↗</span>
          </div>
          <div>
            <h3>Explora</h3>
            {["Hombres", "Mujeres", "Niños"].map((c) => (
              <button key={c} onClick={() => browse(c)}>
                {c}
              </button>
            ))}
            <button onClick={() => browse("Todos", "sale")}>Promociones</button>
          </div>
          <div>
            <h3>Estamos cerca</h3>
            <button
              onClick={() =>
                whatsappConfigured
                  ? window.open(
                      whatsappUrl(
                        store.whatsapp,
                        "Hola NOVA KICKS, quisiera información.",
                      ),
                      "_blank",
                      "noopener,noreferrer",
                    )
                  : setInfo("contact")
              }
            >
              WhatsApp <ArrowUpRight size={14} />
            </button>
            {store.instagram.startsWith("https://") ? (
              <a href={store.instagram} target="_blank" rel="noreferrer">
                Instagram ↗
              </a>
            ) : null}
            <button onClick={() => setInfo("shipping")}>
              Envíos y cambios
            </button>
            <button onClick={() => setInfo("privacy")}>Privacidad</button>
          </div>
          <div className="footer-manifesto">
            MENOS RUTINA.
            <br />
            MÁS <em>MOVIMIENTO.</em>
            <ArrowUpRight />
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} NOVA KICKS. Catálogo de demostración.
          </span>
          <span>Colombia · Precios en COP</span>
        </div>
      </footer>
      {cartOpen && (
        <Cart
          items={cart}
          onClose={closeCart}
          initialCheckout={checkout}
          onQuantity={(key, n) =>
            setCart((prev) =>
              prev.map((i) => (itemKey(i) === key ? { ...i, quantity: n } : i)),
            )
          }
          onRemove={(key) =>
            setCart((prev) => prev.filter((i) => itemKey(i) !== key))
          }
          onClear={() => setCart([])}
        />
      )}
      {toast && (
        <div role="status" className="toast">
          <ShoppingBag size={18} />
          {toast}
          <button
            className="icon-button"
            aria-label="Cerrar aviso"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {info && (
        <Modal
          title={
            info === "privacy"
              ? "Tu privacidad"
              : info === "shipping"
                ? "Envíos y cambios"
                : "Hablemos"
          }
          onClose={closeInfo}
        >
          <div className="info-content">
            {info === "privacy" ? (
              <p>
                El carrito y tus favoritos se guardan en este navegador. Los
                datos de entrega se usan para componer tu mensaje de WhatsApp y
                no se guardan en una base de datos. Al abrir WhatsApp, se
                aplican las condiciones de ese servicio. Puedes vaciar el
                carrito o eliminar los datos del sitio desde tu navegador.
              </p>
            ) : info === "shipping" ? (
              <p>
                Los costos, cobertura, tiempos de entrega y condiciones de
                cambios deben confirmarse directamente con la tienda antes de
                comprar. Este catálogo es de demostración y aún no representa
                una oferta comercial real.
              </p>
            ) : (
              <p>
                El canal de atención aún no está configurado. La tienda debe
                indicar su número real mediante VITE_WHATSAPP_NUMBER antes de
                recibir pedidos.
              </p>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
