import { Trash2 } from "lucide-react";

function InventoryCard({ item, onDelete, onClick }) {
  return (
    <div className="card" onClick={onClick}>
      <button
        className="delete-btn"
        style={{ opacity: 1, transform: "scale(1)" }}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(item.product_id, item.name);
        }}
        type="button"
        title="Delete item"
      >
        <Trash2 size={16} />
      </button>

      <div className="card-content">
        <span className="brand">{item.brand}</span>
        <h3 className="title">{item.name}</h3>
        <span className="sku">{item.sku}</span>

        <div className="card-footer">
          <span className="price">${Number(item.price).toFixed(2)}</span>
          <span className="stock-badge">{item.stock_quantity} Left</span>
        </div>
      </div>
    </div>
  );
}

export default InventoryCard;