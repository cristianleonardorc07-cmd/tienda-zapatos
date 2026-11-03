import { useState } from "react";
import { LoaderCircle } from "lucide-react";
/** Local photography with a loading indicator and an explicit failure message. */
export default function ShopImage(props) {
  const [loaded, setLoaded] = useState(false),
    [failed, setFailed] = useState(false);
  return (
    <>
      <img
        {...props}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setFailed(true);
          setLoaded(true);
        }}
      />
      {!loaded && (
        <span
          className="image-status"
          role="status"
          aria-label="Cargando imagen"
        >
          <LoaderCircle size={22} />
        </span>
      )}
      {failed && (
        <span className="image-status image-failed">Imagen no disponible</span>
      )}
    </>
  );
}
