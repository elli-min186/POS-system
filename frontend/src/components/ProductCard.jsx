function ProductCard({ item, onClick, children }) {
  return (
    <div className="card" onClick={onClick}>
      <div className="card-content">
        <span className="brand">{item.brand}</span>
        <h3 className="title">{item.name}</h3>
        <span className="sku">{item.sku}</span>

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