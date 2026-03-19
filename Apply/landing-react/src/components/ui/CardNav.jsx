import { useState } from 'react';

const CardNav = ({ items, activeItem, onItemClick, className = '' }) => {
  return (
    <nav className={`card-nav ${className}`}>
      <div className="card-nav-container">
        {items.map((item, index) => (
          <button
            key={index}
            className={`card-nav-item ${activeItem === item.label ? 'active' : ''}`}
            onClick={() => onItemClick(item)}
          >
            <span className="card-nav-label">{item.label}</span>
            {activeItem === item.label && (
              <div className="card-nav-indicator" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default CardNav;
