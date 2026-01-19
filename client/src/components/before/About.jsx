import React from "react";
import { Link } from "react-router-dom";
import ph1 from "../../assets/photo1.jpg";
export default function About() {
	const pageStyle = {
		width: "100%",
		boxSizing: "border-box",
		color: "#1f2937"
	};

	// Hero
	const heroStyle = {
		background:
			"linear-gradient(180deg, rgba(17,24,39,0.70) 0%, rgba(17,24,39,0.60) 100%), url('https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1600&q=60')",
		backgroundSize: "cover",
		backgroundPosition: "center",
		color: "#fff",
		padding: "72px 24px"
	};
	const heroInner = {
		maxWidth: 1100,
		margin: "0 auto"
	};
	const heroTitle = {
		fontSize: "2.4rem",
		fontWeight: 800,
		margin: 0
	};
	const heroSubtitle = {
		marginTop: 12,
		fontSize: "1.05rem",
		lineHeight: 1.7,
		opacity: 0.95
	};

	// Content
	const section = {
		maxWidth: 1100,
		margin: "36px auto",
		padding: "0 24px"
	};
	const twoCol = {
		display: "grid",
		gridTemplateColumns: "1.2fr 0.8fr",
		gap: 28,
		alignItems: "start"
	};
	const card = {
		background: "#ffffff",
		border: "1px solid #e5e7eb",
		borderRadius: 12,
		padding: 24,
		boxShadow: "0 8px 24px rgba(0,0,0,0.06)"
	};
	const h2 = {
		fontSize: "1.6rem",
		fontWeight: 800,
		margin: 0
	};
	const p = {
		marginTop: 12,
		fontSize: "1rem",
		color: "#4b5563",
		lineHeight: 1.8
	};

	const statGrid = {
		display: "grid",
		gridTemplateColumns: "repeat(3, 1fr)",
		gap: 16,
		marginTop: 20
	};
	const statCard = {
		background: "#f9fafb",
		border: "1px solid #e5e7eb",
		borderRadius: 10,
		padding: 18,
		textAlign: "center"
	};
	const statNumber = {
		fontSize: "1.6rem",
		fontWeight: 800,
		color: "#111827",
		margin: 0
	};
	const statLabel = {
		fontSize: ".9rem",
		color: "#6b7280",
		marginTop: 6
	};

	const imageCard = {
		...card,
		padding: 0,
		overflow: "hidden"
	};
	const imageEl = {
		width: "100%",
		height: 320,
		objectFit: "cover",
		display: "block"
	};

	const ctaRow = {
		display: "flex",
		gap: 12,
		marginTop: 20
	};
	const primaryBtn = {
		background: "#d4a574",
		color: "#fff",
		border: "none",
		borderRadius: 999,
		padding: "10px 20px",
		fontWeight: 700,
		cursor: "pointer"
	};
	const ghostBtn = {
		background: "transparent",
		color: "#374151",
		border: "1px solid #d1d5db",
		borderRadius: 999,
		padding: "10px 16px",
		fontWeight: 600,
		cursor: "pointer"
	};

	return (
		<main style={pageStyle}>
			{/* Hero */}
			<section style={heroStyle}>
				<div style={heroInner}>
					<h1 style={heroTitle}>About Prema Textile Mills</h1>
					<p style={heroSubtitle}>
						We are a fabric company dedicated to quality, durability, and sustainable
						practices. From sourcing premium materials to precision dyeing and finishing, our
						team blends tradition and technology to deliver textiles you can trust.
					</p>
				</div>
			</section>

			{/* Mission + Image */}
			<section style={section}>
				<div style={twoCol}>
					<div className="mission-card" style={card}>
						<h2 style={h2}>Our Mission</h2>
						<p style={p}>
							To empower brands and creators with high-performance fabrics, delivered through
							ethical processes and transparent partnerships. We continually invest in color
							research, eco-friendly dyeing, and rigorous quality checks to ensure every yard
							meets our standards.
						</p>
						<div style={statGrid}>
							<div className="stat-card" style={statCard}>
								<p style={statNumber}>20+ yrs</p>
								<p style={statLabel}>Industry Experience</p>
							</div>
							<div className="stat-card" style={statCard}>
								<p style={statNumber}>99%</p>
								<p style={statLabel}>Customer Satisfaction</p>
							</div>
							<div className="stat-card" style={statCard}>
								<p style={statNumber}>98%</p>
								<p style={statLabel}>On-time Orders</p>
							</div>
						</div>
						<div style={ctaRow}>
							<button className="primary-btn" style={primaryBtn}><Link to="/login" style={{ textDecoration: "none", color: "inherit", display: "inline-block" }}>
                                                            Get a Quote
                                                        </Link> </button>
							
						</div>
					</div>

					<div className="image-card" style={imageCard}>
						<img
							src={ph1}
							alt="Color cards and fabrics"
							style={imageEl}
						/>
					</div>
				</div>
			</section>

			{/* Values */}
			<section style={section}>
				<div style={{ ...card, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
					{[
						{
							title: "Quality First",
							desc:
								"Every batch is tested for colorfastness, shrinkage, and tensile strength so your products last longer."
						},
						{
							title: "Sustainable Process",
							desc:
								"Closed-loop water systems and low-impact dyes reduce environmental footprint across our facilities."
						},
						{
							title: "Reliable Support",
							desc:
								"From sampling to bulk orders, our team supports you with clear timelines and proactive communication."
						}
					].map((v, i) => (
						<div key={i} className="value-card" style={{
							border: "1px solid #e5e7eb",
							borderRadius: 10,
							padding: 18,
							background: "#f9fafb",
							transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease"
						}}>
							<h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>{v.title}</h3>
							<p style={{ ...p, marginTop: 10 }}>{v.desc}</p>
						</div>
					))}
				</div>
			</section>

			{/* CTA */}
			<section style={{ ...section, textAlign: "center" }}>
				<div style={{ ...card, display: "inline-block" }}>
					<h2 style={h2}>Let's Build Something Durable</h2>
					<p style={{ ...p, maxWidth: 720, margin: "12px auto 0" }}>
						Share your requirements and we’ll recommend fabric bases, dye recipes, and finishing
						options tailored to your product goals.
					</p>
					<div style={{ marginTop: 18 }}>
						<button className="primary-btn" style={primaryBtn} type="button">
							<Link to="/signin" style={{ textDecoration: "none", color: "inherit", display: "inline-block" }}>
								More Info
							</Link>
						</button>
						
					</div>
				</div>
			</section>  

			{/* Responsive tweaks */}
			<style>{`
				@media (max-width: 900px) {
					section div[style*='grid-template-columns: 1.2fr 0.8fr'] { grid-template-columns: 1fr; }
					img[alt='Color cards and fabrics'] { height: 240px !important; }
				}

				/* Hover effects */
				.value-card:hover {
					transform: translateY(-2px);
					box-shadow: 0 10px 24px rgba(0,0,0,0.12);
					border-color: #d1d5db;
					background: #ffffff;
				}

				.primary-btn:hover {
					filter: brightness(1.05);
				}

				.ghost-btn:hover {
					border-color: #bfc5cc;
					background: #ffffff;
				}

				.stat-card:hover {
					transform: translateY(-2px);
					box-shadow: 0 8px 20px rgba(0,0,0,0.10);
					background: #ffffff;
					border-color: #d1d5db;
				}

				.mission-card:hover {
					box-shadow: 0 12px 28px rgba(0,0,0,0.12);
					border-color: #d1d5db;
				}

				.image-card:hover img {
					transform: scale(1.02);
				}

				.image-card img {
					transition: transform .25s ease;
				}
			`}</style>
		</main>
	);
}

