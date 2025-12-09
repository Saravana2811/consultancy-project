import React from "react";

export default function Buy() {
	const products = [
		{
			id: 1,
			title: "Premium Cotton Fabric",
			desc: "Soft, breathable, and ideal for everyday wear.",
			price: 399,
			rating: 4.7,
			image:
				"https://images.unsplash.com/photo-1605733160314-4f53a220c581?auto=format&fit=crop&w=1200&q=60",
			tag: "Best Seller"
		},
		{
			id: 2,
			title: "Classic Denim",
			desc: "Durable twill weave with rich indigo tone.",
			price: 549,
			rating: 4.6,
			image:
				"https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=60",
			tag: "New"
		},
		{
			id: 3,
			title: "Lightweight Linen",
			desc: "Cool, airy fabric perfect for warm climates.",
			price: 629,
			rating: 4.5,
			image:
				"https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=1200&q=60",
			tag: "Eco"
		},
		{
			id: 4,
			title: "Merino Wool Blend",
			desc: "Soft touch with excellent temperature regulation.",
			price: 799,
			rating: 4.8,
			image:
				"https://images.unsplash.com/photo-1542831371-39b3dad4b8a5?auto=format&fit=crop&w=1200&q=60",
			tag: "Limited"
		}
	];

	const section = {
		maxWidth: 1100,
		margin: "36px auto",
		padding: "0 24px",
		boxSizing: "border-box"
	};

	const header = {
		display: "flex",
		alignItems: "baseline",
		justifyContent: "space-between",
		marginBottom: 16
	};

	const title = { fontSize: "1.6rem", fontWeight: 800, margin: 0 };
	const subtitle = { color: "#6b7280", fontSize: "0.95rem" };

	const grid = {
		display: "grid",
		gridTemplateColumns: "repeat(4, 1fr)",
		gap: 18
	};

	const card = {
		background: "#ffffff",
		border: "1px solid #e5e7eb",
		borderRadius: 12,
		overflow: "hidden",
		boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
		display: "flex",
		flexDirection: "column"
	};

	const imgWrap = { height: 170, overflow: "hidden", position: "relative" };
	const img = { width: "100%", height: "100%", objectFit: "cover", display: "block" };

	const tag = {
		position: "absolute",
		top: 10,
		left: 10,
		background: "rgba(0,0,0,0.65)",
		color: "#fff",
		fontSize: 12,
		padding: "4px 8px",
		borderRadius: 999
	};

	const body = { padding: 14, flex: 1 };
	const name = { fontWeight: 700, margin: 0 };
	const desc = { color: "#4b5563", marginTop: 6, fontSize: 14 };

	const row = {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		marginTop: 12
	};

	const price = { fontWeight: 800, color: "#111827" };
	const rating = { color: "#f59e0b", fontWeight: 600 };

	const cta = {
		display: "flex",
		gap: 10,
		padding: 14,
		borderTop: "1px solid #e5e7eb"
	};

	const buyBtn = {
		background: "#d4a574",
		color: "#fff",
		border: "none",
		borderRadius: 10,
		padding: "10px 14px",
		fontWeight: 700,
		cursor: "pointer",
		flex: 1
	};

	const outlineBtn = {
		background: "transparent",
		color: "#374151",
		border: "1px solid #d1d5db",
		borderRadius: 10,
		padding: "10px 14px",
		fontWeight: 600,
		cursor: "pointer",
		flex: 1
	};

	const onBuy = (p) => {
		alert(`Buying: ${p.title} - Rs.${p.price}`);
	};

	return (
		<section style={section} aria-label="Buy Now">
			<div style={header}>
				<h2 style={title}>Buy Now</h2>
				
			</div>

			<div style={grid}>
				{products.map((p) => (
					<article key={p.id} style={card} className="buy-card">
						<div style={imgWrap}>
							<img src={p.image} alt={p.title} style={img} />
							<span style={tag}>{p.tag}</span>
						</div>
						<div style={body}>
							<h3 style={name}>{p.title}</h3>
							<p style={desc}>{p.desc}</p>

							<div style={row}>
								<span style={price}>Rs.{p.price}</span>
								<span style={rating}>★ {p.rating}</span>
							</div>
						</div>
						<div style={cta}>
							<button className="buy-primary" style={buyBtn} onClick={() => onBuy(p)}>Buy Now</button>
							
						</div>
					</article>
				))}
			</div>

			<style>{`
				.buy-card { transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
				.buy-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.12); }
				.buy-primary:hover { filter: brightness(1.05); }
				.buy-secondary:hover { background: #fff; border-color: #bfc5cc; }

				@media (max-width: 1000px) {
					section[aria-label='Buy Now'] > div + div { grid-template-columns: repeat(2, 1fr) !important; }
				}
				@media (max-width: 560px) {
					section[aria-label='Buy Now'] > div + div { grid-template-columns: 1fr !important; }
				}
			`}</style>
		</section>
	);
}
