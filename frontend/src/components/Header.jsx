function Header({
  title,
  tagText,
  titleId, 
  tagId, 
  showSearch = false,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  searchClass = "",
  rightAction = null 
}) {
  return (
    <header className="top-bar">
      <div className="header-left">
        <h1 id={titleId}>{title}</h1>
        {tagText && (
          <span className="tag" id={tagId}>
            {tagText}
          </span>
        )}
      </div>

      {showSearch && (
        <div className={`search-bar ${searchClass}`.trim()}>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={onSearchChange}
          />
        </div>
      )}

      {rightAction && (
        <div className="header-right">
          {rightAction}
        </div>
      )}
    </header>
  );
}

export default Header