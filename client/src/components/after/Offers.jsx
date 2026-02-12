import React from "react";
import "./Offers.css";

export default function Offers() {
    const offers = [
        {
            id: 1,
            title: "First Order Discount",
            discount: "15% OFF",
            code: "FIRST15",
            description: "Get 15% off on your first purchase",
            minOrder: 299,
            expiryDays: 7,
            color: "#dd551f",
            icon: "🎁"
        },
        {
            id: 2,
            title: "Bulk Buy Offer",
            discount: "20% OFF",
            code: "BULK20",
            description: "Order 5+ items and save 20%",
            minOrder: 1500,
            expiryDays: 15,
            color: "#4c6c51",
            icon: "📦"
        },
        {
            id: 3,
            title: "Premium Offer",
            discount: "25% OFF",
            code: "BULK50",
            description: "Exclusive for premium members",
            minOrder: 500,
            expiryDays: 30,
            color: "rgb(61, 80, 88)",
            icon: "👑"
        },
    ];

    // Show only first 3 offers
    const displayOffers = offers.slice(0, 3);

    return (
        <section className="offers-section">
            <div className="offers-container">
                {/* Header Section */}
                <div className="offers-header">
                    <h2 className="offers-title">
                        <span className="offers-icon"></span>
                        Special Offers For You!
                    </h2>
                    <p className="offers-subtitle">
                        Save more on your purchase with exclusive deals
                    </p>
                </div>

                {/* Offers Grid */}
                <div className="offers-grid">
                    {displayOffers.map((offer) => (
                        <div 
                            key={offer.id}
                            className="offer-card"
                            style={{ '--offer-color': offer.color }}
                        >
                            <div className="offer-badge" style={{ background: offer.color }}>
                                <span className="offer-icon-large">{offer.icon}</span>
                                <span className="offer-discount">{offer.discount}</span>
                            </div>
                            
                            <div className="offer-content">
                                <h3 className="offer-title">{offer.title}</h3>
                                <p className="offer-description">{offer.description}</p>
                                
                                <div className="offer-details">
                                    <div className="offer-detail-item">
                                        <span className="detail-label">Code:</span>
                                        <span className="detail-value code">{offer.code}</span>
                                    </div>
                                    <div className="offer-detail-item">
                                        <span className="detail-label">Min Order:</span>
                                        <span className="detail-value">₹{offer.minOrder}</span>
                                    </div>
                                    <div className="offer-detail-item">
                                        <span className="detail-label">Valid for:</span>
                                        <span className="detail-value">{offer.expiryDays} days</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Info Banner */}
                
            </div>
        </section>
    );
}

