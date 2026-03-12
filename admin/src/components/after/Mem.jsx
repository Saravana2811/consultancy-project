import React, { useEffect, useRef } from "react";
import "./Mem.css";
import m1 from "../../assets/mem.jpg";
const MEMBERS = [
	{ id: 1, name: "Prema G", role: "Proprietor", phone: "+91 9488137165", image: undefined },
	{ id: 2, name: "Muthuvel K", role: "Manager", image: undefined, phone: "+91 9443534549"},
	{ id: 3, name: "Maithiri M", role: "Accountant", image: m1, phone: "+91 638181668" },
	{ id: 4, name: "Karthi", role: "Employee", image: undefined, phone: "+91 9788991234" },
	
	
];

function InitialsAvatar({ name }) {
	const initials = name
		.split(" ")
		.map((n) => n[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
	return (
		<div className="mem-avatar mem-avatar--initials" aria-hidden>
			{initials}
		</div>
	);
}

export default function Mem() {
	const ref = useRef(null);

	useEffect(() => {
		const el = ref.current;
		if (!el || typeof IntersectionObserver === "undefined") return;
		const cards = el.querySelectorAll(".mem-card");
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) {
						e.target.classList.add("in-view");
						io.unobserve(e.target);
					}
				});
			},
			{ threshold: 0.15 }
		);
		cards.forEach((c) => io.observe(c));
		return () => io.disconnect();
	}, []);

	return (
		<section className="mem-section" ref={ref}>
			<div className="mem-header">
				<h2 className="mem-title">Meet Our Team</h2>
				<p className="mem-subtitle">People behind the craft and quality.</p>
			</div>
			<div className="mem-grid">
				{MEMBERS.map((m, i) => (
					<article
						key={m.id}
						className="mem-card"
						style={{ transitionDelay: `${i * 100}ms` }}
					>
						<div className="mem-card-bg" aria-hidden />
						<div className="mem-media">
							{m.image ? (
								<img className="mem-avatar" src={m.image} alt={`${m.name} photo`} loading="lazy" />
							) : (
								<InitialsAvatar name={m.name} />
							)}
						</div>
						<h3 className="mem-name">{m.name}</h3>
						<p className="mem-role">{m.role}</p>
						{m.phone && (
							<p className="mem-phone" aria-label={`Phone number for ${m.name}`}>
								{m.phone}
							</p>
						)}
						<div className="mem-socials" aria-label={`${m.name} socials`}>
							{m.socials?.x && (
								<a href={m.socials.x} aria-label="X/Twitter" className="mem-social">×</a>
							)}
							{m.socials?.li && (
								<a href={m.socials.li} aria-label="LinkedIn" className="mem-social">in</a>
							)}
						</div>
					</article>
				))}
			</div>
		</section>
	);
}

