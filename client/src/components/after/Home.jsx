import React, { useEffect } from "react";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";
import Buy from "./Buy.jsx";
import SampleRequest from "./SampleRequest.jsx";
import Steps from "./Step.jsx";
import Location from "./Location.jsx";
import Mem from "./Mem.jsx";
import "./Home.css";
import video1 from "../../assets/v1.mp4";

export default function Home() {
    useEffect(() => {
        const embedBaseUrl = "http://192.168.244.44:3000";
        const scriptId = "home-chatbot-embed";
        const existing = document.getElementById(scriptId);

        if (!existing) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = `${embedBaseUrl}/embed.js`;
            script.async = true;
            script.setAttribute("data-bot-id", "cmmod0jfq000pn0drt5ehnvjm");
            script.setAttribute("data-color", "#000000");
            document.body.appendChild(script);
        }

        return () => {
            const mountedScript = document.getElementById(scriptId);
            if (mountedScript) mountedScript.remove();

            document
                .querySelectorAll(`iframe[src^="${embedBaseUrl}"]`)
                .forEach((el) => el.remove());
        };
    }, []);

    return (
        <>
            {/* Full-page background video - put file at public/videos/home-bg.mp4 */}
                      

            <div className="home-content">
              <Navbar  />
              <Buy />
              <SampleRequest />
                            <Steps />

                            {/* Video Banner */}
                            <section className="video-banner">
                                <video
                                    className="banner-video"
                                    src={video1}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                />
                            </section>

                            <Location />
              <Mem />
              <Footer />
            </div>
        </>
    );
}
