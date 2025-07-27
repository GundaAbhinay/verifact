import React, { useState, useEffect, useRef } from 'react';
import Typed from 'typed.js';
import axios from 'axios';
import './Verifier.css';
import Switch from "@mui/material/Switch";

function Verifier() {
    const [input, setInput] = useState('');
    const [lang, setLang] = useState('en');
    const [verdict, setVerdict] = useState(null);
    const [reason, setReason] = useState('');
    const [sources, setSources] = useState([]);
    const [trust, setTrust] = useState(0);
    const [loading, setLoading] = useState(false);
    const [dark, setDark] = useState(false);
    const verdictRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setVerdict(null);
        try {
            const res = await axios.post('http://localhost:5000/api/verifier', { news: input });
            setVerdict(res.data.verdict);
            setReason(res.data.reason);
            setSources(res.data.sources);
            setTrust(res.data.trust_score);
        } catch (err) {
            alert("Verification failed.");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (dark) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, [dark]);

    useEffect(() => {
        if (verdict && verdictRef.current) {
            new Typed(verdictRef.current, {
                strings: [verdict],
                typeSpeed: 100,
                showCursor: false,
            });
        }
    }, [verdict]);

    const handleSpeech = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = {
            hi: "hi-IN", te: "te-IN", ta: "ta-IN"
        }[lang] || "en-US";

        recognition.start();
        recognition.onresult = (event) => {
            setInput(event.results[0][0].transcript);
        };
    };

    return (
        <div className={dark ? "verifier dark" : "verifier"}>
            <header>
                <h1 style={{ display: "flex", alignItems: "center" }}>🕵️ Fake News Verifier</h1>
                <div style={{ display: "flex", alignItems: "center" }}>
                    {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
                    <Switch checked={dark} onChange={() => setDark(!dark)} />
                </div>
            </header>


            <form onSubmit={handleSubmit}>
                <span>Choose prefered language: </span>
                <select onChange={e => setLang(e.target.value)} value={lang}>
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="te">Telugu</option>
                    <option value="ta">Tamil</option>
                </select>
                <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste or speak your news claim here..." required />
                <button type="button" onClick={handleSpeech}>🎙️ Speak</button>
                <button type="submit">🚀 Verify Claim</button>
            </form>

            {loading && <p>🔍 Verifying your claim... Please wait...</p>}

            {verdict && (
                <div className={`result-card ${verdict?.toLowerCase()}`}>
                    <div className="verdict-badge">
                        <span>Result: </span>
                        <span ref={verdictRef}></span>
                    </div>
                    <blockquote>🧠 {reason}</blockquote>

                    <div className="trust-bar">
                        <div className="trust-fill" style={{ width: `${trust}%` }}></div>
                    </div>
                    <p>✅ Trust Score: {trust}%</p>
                </div>
            )}
        </div>
    );
}

export default Verifier;
