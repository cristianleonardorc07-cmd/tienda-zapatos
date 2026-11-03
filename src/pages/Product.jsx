import ShopImage from "../components/ShopImage";
import { useState } from "react";
import {
  ArrowLeft,
  ShoppingBag,
  MessageCircle,
  ZoomIn,
  Check,
  Truck,
} from "lucide-react";
import { money } from "../utils/shop";
import ProductCard from "../components/ProductCard";
export default function Product({
  product: p,
  products,
  onOpen,
  onAdd,
  onBuy,
  favorites,
  onFavorite,
}) {
  const [size, setSize] = useState(""),
    [color, setColor] = useState(""),
    [quantity, setQuantity] = useState(1),
    [photo, setPhoto] = useState(0),
    [zoom, setZoom] = useState(false),
    [error, setError] = useState("");
  function select(buy) {
    if (!size || !color) {
      setError("Selecciona una talla y un color para continuar.");
      return;
    }
    setError("");
    const item = { ...p, size: Number(size), color, quantity };
    buy ? onBuy(item) : onAdd(item);
  }
  return (
    <main className="container product-page">
      <button className="text-button" onClick={() => onOpen(null)}>
        <ArrowLeft size={16} /> Volver a la colección
      </button>
      <div className="product-detail">
        <div>
          <button
            className={`detail-image ${zoom ? "zoomed" : ""}`}
            onClick={() => setZoom(!zoom)}
            aria-label={zoom ? "Reducir imagen" : "Ampliar imagen"}
          >
            <img
              src={p.images[photo]}
              alt={`${p.name}, vista ilustrativa ${photo + 1}`}
            />
            <ZoomIn />
          </button>
          <div className="thumbnails">
            {p.images.map((img, i) => (
              <button
                key={img}
                className={photo === i ? "selected" : ""}
                onClick={() => {
                  setPhoto(i);
                  setZoom(false);
                }}
                aria-label={`Ver foto ${i + 1}`}
              >
                <img src={img} alt="" />
              </button>
            ))}
          </div>
          <p className="muted small">
            Fotografías ilustrativas. Las imágenes adicionales no representan
            necesariamente el mismo modelo.
          </p>
        </div>
        <div className="detail-info">
          <span className="eyebrow">{p.category} / COLECCIÓN ESENCIAL</span>
          <h1>{p.name}</h1>
          <p className="muted">
            Referencia {p.reference} · Producto de ejemplo
          </p>
          <div className="detail-price">
            {money(p.price)} <small>COP</small>{" "}
            {p.originalPrice && <del>{money(p.originalPrice)}</del>}
          </div>
          <p>{p.description}</p>
          <p className={p.available ? "stock" : "error"}>
            <Check size={15} />
            {p.available ? "Disponible en catálogo de demostración" : "Agotado"}
          </p>
          <fieldset>
            <legend>
              Talla <span>EU</span>
            </legend>
            <div className="options">
              {p.sizes.map((s) => (
                <button
                  key={s}
                  className={size === s ? "selected" : ""}
                  aria-pressed={size === s}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Color {color && <span> / {color}</span>}</legend>
            <div className="options colors">
              {p.colors.map((c) => (
                <button
                  key={c}
                  className={color === c ? "selected" : ""}
                  aria-pressed={color === c}
                  onClick={() => setColor(c)}
                >
                  <i
                    style={{
                      background: {
                        Blanco: "#f2f1ec",
                        Negro: "#222",
                        Arena: "#c8b798",
                        Verde: "#74836b",
                      }[c],
                    }}
                  />
                  {c}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="quantity-label">
            Cantidad{" "}
            <input
              type="number"
              min="1"
              max="20"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.max(1, Math.min(20, Number(e.target.value) || 1)),
                )
              }
            />
          </label>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <button
            className="button full"
            disabled={!p.available}
            onClick={() => select(false)}
          >
            <ShoppingBag size={18} /> Agregar al carrito
          </button>
          <button
            className="button outline full"
            disabled={!p.available}
            onClick={() => select(true)}
          >
            <MessageCircle size={18} /> Comprar por WhatsApp
          </button>
          <div className="delivery-note">
            <Truck size={22} />
            <div>
              Tu próximo par, más cerca.
              <small>
                Envío, disponibilidad y pago se coordinan por WhatsApp.
              </small>
            </div>
          </div>
        </div>
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">SIGUE EXPLORANDO</span>
          <h2>También van contigo.</h2>
        </div>
      </div>
      <div className="product-grid">
        {products
          .filter((x) => x.category === p.category && x.id !== p.id)
          .slice(0, 4)
          .map((x) => (
            <ProductCard
              key={x.id}
              product={x}
              onOpen={onOpen}
              favorite={favorites.includes(x.id)}
              onFavorite={onFavorite}
            />
          ))}
      </div>
    </main>
  );
}
