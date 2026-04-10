function ProductCard({ item, onClick, actionElement, children }) {
  return (
    <div className="card" onClick={onClick}>
      {/* This renders the delete button if provided */}
      {actionElement} 
      
      <div className="card-content">
        <span className="brand">{item.brand}</span>
        <h3 className="title">{item.name}</h3>
        <span 
          className="sku" 
          style={{ 
            display: "block", 
            whiteSpace: "nowrap", 
            overflow: "hidden", 
            textOverflow: "ellipsis" 
          }}
        >
          {item.sku}
        </span>

        <div className="card-footer">
          <span className="price">${Number(item.price).toFixed(2)}</span>
          <span className="stock-badge">{item.stock_quantity} Left</span>
        </div>

        {children}
      </div>
    </div>
  );
}

export default ProductCard;