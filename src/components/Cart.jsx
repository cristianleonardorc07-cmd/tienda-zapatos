import { useState } from "react";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import Modal from "./Modal";
import {
  money,
  total,
  itemKey,
  orderMessage,
  whatsappUrl,
} from "../utils/shop";
import { store, whatsappConfigured } from "../config/store";
export default function Cart({
  items,
  onClose,
  onQuantity,
  onRemove,
  onClear,
  initialCheckout = false,
}) {
  const [checkout, setCheckout] = useState(initialCheckout),
    [confirm, setConfirm] = useState(false),
    [sent, setSent] = useState(false);
  function submit(e) {
    e.preventDefault();
    if (!whatsappConfigured) return;
    const customer = Object.fromEntries(new FormData(e.currentTarget));
    if (Object.entries(customer).some(([k, v]) => k !== "notes" && !v.trim()))
      return;
    const url = whatsappUrl(store.whatsapp, orderMessage(items, customer));
    window.open(url, "_blank", "noopener,noreferrer");
    setSent(true);
  }
  return (
    <Modal
      title={
        checkout
          ? "Finalizar pedido"
          : `Tu carrito (${items.reduce((s, i) => s + i.quantity, 0)})`
      }
      onClose={onClose}
      drawer
    >
      <div className="cart-body">
        {items.length === 0 ? (
          <div className="empty">
            <ShoppingBag size={46} />
            <h3>Tu próximo par te espera.</h3>
            <p>Explora la colección y encuentra el que va contigo.</p>
            <button className="button" onClick={onClose}>
              Seguir explorando <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            {checkout ? (
              <>
                <button
                  className="text-button"
                  onClick={() => setCheckout(false)}
                >
                  <ArrowLeft size={16} /> Volver al carrito
                </button>
                <p>
                  Completa tus datos para coordinar el pedido con la tienda.
                </p>
                {!whatsappConfigured && (
                  <p className="notice" role="status">
                    Tienda de demostración: falta configurar el número de
                    WhatsApp. No se enviarán pedidos todavía.
                  </p>
                )}
                <form id="checkout" onSubmit={submit}>
                  <div className="form-grid">
                    {[
                      ["name", "Nombre completo"],
                      ["city", "Ciudad"],
                      ["neighborhood", "Barrio"],
                      ["address", "Dirección de entrega"],
                    ].map(([name, label]) => (
                      <label key={name}>
                        {label}
                        <input
                          name={name}
                          required
                          maxLength={150}
                          pattern=".*\S.*"
                          autoComplete={
                            name === "name"
                              ? "name"
                              : name === "city"
                                ? "address-level2"
                                : name === "address"
                                  ? "street-address"
                                  : "off"
                          }
                        />
                      </label>
                    ))}
                  </div>
                  <label>
                    Observaciones <span className="muted">(opcional)</span>
                    <textarea
                      name="notes"
                      rows="3"
                      maxLength={1000}
                      placeholder="Indicaciones de entrega, preguntas…"
                    />
                  </label>
                  <p className="small muted">
                    Tus datos se incluyen únicamente en el mensaje que abrirás
                    en WhatsApp. El pedido se confirma con la tienda.
                  </p>
                </form>
                {sent && (
                  <p role="status" className="notice">
                    Se solicitó abrir WhatsApp. Si tu navegador lo bloqueó,
                    vuelve a intentarlo. El carrito se conserva hasta que
                    decidas vaciarlo.
                  </p>
                )}
              </>
            ) : (
              <div className="cart-items">
                {items.map((i) => (
                  <article className="cart-item" key={itemKey(i)}>
                    <img src={i.images[0]} alt={i.name} />
                    <div>
                      <h3>{i.name}</h3>
                      <p>
                        Talla {i.size} · {i.color}
                      </p>
                      <strong>{money(i.price)}</strong>
                      <div className="quantity">
                        <button
                          aria-label={`Reducir cantidad de ${i.name}`}
                          disabled={i.quantity <= 1}
                          onClick={() => onQuantity(itemKey(i), i.quantity - 1)}
                        >
                          <Minus size={14} />
                        </button>
                        <span>{i.quantity}</span>
                        <button
                          aria-label={`Aumentar cantidad de ${i.name}`}
                          disabled={i.quantity >= 20}
                          onClick={() => onQuantity(itemKey(i), i.quantity + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <small>Subtotal {money(i.price * i.quantity)}</small>
                    </div>
                    <button
                      className="icon-button remove"
                      aria-label={`Eliminar ${i.name}`}
                      onClick={() => onRemove(itemKey(i))}
                    >
                      <Trash2 size={17} />
                    </button>
                  </article>
                ))}
              </div>
            )}
            {confirm ? (
              <div className="notice">
                <p>¿Quieres eliminar todos los productos del carrito?</p>
                <button
                  className="text-button"
                  onClick={() => {
                    onClear();
                    setConfirm(false);
                  }}
                >
                  Sí, vaciar carrito
                </button>
                <button
                  className="text-button"
                  onClick={() => setConfirm(false)}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                className="text-button muted"
                onClick={() => setConfirm(true)}
              >
                Vaciar carrito
              </button>
            )}
          </>
        )}
      </div>
      {items.length > 0 && (
        <footer className="cart-footer">
          <div className="total">
            <span>Total de productos</span>
            <strong>
              {money(total(items))} <small>COP</small>
            </strong>
          </div>
          <p className="small muted">Envío por confirmar. Sin pago en línea.</p>
          {checkout ? (
            <button
              form="checkout"
              type="submit"
              className="button full whatsapp"
              disabled={!whatsappConfigured}
            >
              <MessageCircle size={19} /> Enviar pedido por WhatsApp
            </button>
          ) : (
            <button className="button full" onClick={() => setCheckout(true)}>
              Continuar con mi pedido <ArrowRight size={18} />
            </button>
          )}
        </footer>
      )}
    </Modal>
  );
}
