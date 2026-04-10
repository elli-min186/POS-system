import { Trash2 } from "lucide-react";
import ProductCard from "./ProductCard"; 

function InventoryCard({ item, onDelete, onClick }) {
  const deleteButton = (
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
  );

  return (
    <ProductCard 
      item={item} 
      onClick={onClick} 
      actionElement={deleteButton} 
    />
  );
}

export default InventoryCard;