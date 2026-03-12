import React, { useEffect, useRef } from "react";
import "./Step.css";
import ph1 from "../../assets/photo1.jpg";
const STEPS = [
	{
		id: 1 ,
		title: "Purchasing Raw Fabrics-Aarudhara Textiles,Palladam",
		desc: "We purcahse large amount of white grey fabrics ",
		caption: "Step-1",
		image: ph1,
	},
	{
		id: 2,
		title: "Dying Fabrics-Amman Dying, Manikamplayam, Erode",
		desc: "We dye the puchased fabrics using eco‑friendly dyes based on client's request and will allow them to dry for 3-4 days",
		caption: "Step-2",
		image: ph1,
	},
	{
		id: 3,
		title: "Calendering & Stitching-Baagayalakshmi Calendering, Erode",
		desc: "Here we will iron the dyed fabrics using calendering machines to make it smooth and shiny. After that we will stitch the fabrics into required products",
		caption: "Step-3",
		image: ph1,
	},
	{
		id: 4,
		title: "Finished Product-Prema Textile Mills, Erode",
		desc: "The finished product will arrive at our premises and  involves inspecting the finished products for quality assurance before packaging and delivery to clients.",
		caption: "Step-4",
		image: ph1,
	},
	
];

export default function Steps() {
	const containerRef = useRef(null);

	useEffect(() => {
		const root = containerRef.current;
		if (!root || typeof IntersectionObserver === "undefined") return;

		const items = root.querySelectorAll(".step-item");
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("in-view");
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.2 }
		);

		items.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	}, []);

	return (
		<section className="steps-section" ref={containerRef}>
			<div className="steps-header">
				<h2 className="steps-title">Our Textile Process</h2>
				<p className="steps-subtitle">
					From concept to delivery — a seamless, quality‑first journey.
				</p>
			</div>

			<div className="steps-timeline">
				<div className="timeline-line" aria-hidden="true" />

				{STEPS.map((s, idx) => (
					<div
						className={`step-item ${idx % 2 === 0 ? "left" : "right"}`}
						style={{ transitionDelay: `${idx * 120}ms` }}
					>
						<div className="step-dot" aria-hidden="true">
							<span className="step-caption">{s.caption}</span>
						</div>

						<div className="step-card">
							<div className="step-index">{String(s.id).padStart(2, "0")}</div>
							{s.image && (
								<div className="step-media">
									<img src={s.image} alt={`${s.title} visual`} loading="lazy" />
								</div>
							)}
							<h3 className="step-title">{s.title}</h3>
							<p className="step-desc">{s.desc}</p>

							<div className="step-progress">
								<div className="step-progress-bar" />
							</div>
						</div>
					</div>
				))}
			</div>

			
		</section>
	);
}

