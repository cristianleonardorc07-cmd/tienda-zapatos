import ShopImage from "./ShopImage";
import { Heart, ArrowUpRight } from "lucide-react";
import { money } from "../utils/shop";
export default function ProductCard({
  product: p,
  favorite,
  onFavorite,
  onOpen,
}) {
  return (
    <article className="product-card">
      <div className="product-image">
        <button
          className="image-link"
          onClick={() => onOpen(p.id)}
          aria-label={`Ver ${p.name}`}
        >
          <ShopImage
            src={p.images[0]}
            alt={`Calzado ${p.name}, fotografía ilustrativa`}
            loading="lazy"
          />
        </button>
        <div className="tags">
          {p.promotion ? (
            <span className="tag sale">{p.promotion}</span>
          ) : p.new ? (
            <span className="tag">NUEVO</span>
          ) : null}
          {!p.available && <span className="tag">AGOTADO</span>}
        </div>
        <button
          className={`favorite icon-button ${favorite ? "active" : ""}`}
          aria-label={`${favorite ? "Quitar de" : "Agregar a"} favoritos: ${p.name}`}
          aria-pressed={favorite}
          onClick={() => onFavorite(p.id)}
        >
          <Heart size={18} fill={favorite ? "currentColor" : "none"} />
        </button>
        <button className="quick-view" onClick={() => onOpen(p.id)}>
          Descubrir <ArrowUpRight size={17} />
        </button>
      </div>
      <div className="product-meta">
        <span>{p.category} · Lifestyle</span>
        <span>{p.colors.length} colores</span>
      </div>
      <button className="product-name" onClick={() => onOpen(p.id)}>
        {p.name}
      </button>
      <div className="price">
        {money(p.price)}{" "}
        {p.originalPrice && <del>{money(p.originalPrice)}</del>}
      </div>
    </article>
  );
}
