import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'; // Import the icon
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { marked } from 'marked';


function Chatbot() {
    const [question, setQuestion] = useState('');
    const [conversation, setConversation] = useState([]);
    const [loading, setLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [rows, setRows] = useState(1);
    const [showInstructions, setShowInstructions] = useState(true);
    const textareaRef = useRef(null);

    const apiKey = import.meta.env.VITE_API_KEY;

    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);

    const particlesLoaded = useCallback(async (container) => {
        await console.log(container);
    }, []);

    const particleSectionRef = useRef(null);

    useEffect(() => {
        const particleSection = particleSectionRef.current;
        const particlesJsElement = document.getElementById("tsparticles");

        if (particleSection && particlesJsElement) {
            particleSection.style.position = "relative";
            particlesJsElement.style.position = "fixed";
            particlesJsElement.style.width = "100%";
            particlesJsElement.style.height = "50%";
        }
    }, []);

    async function generateAnswer() {
        if (!question.trim()) return;

        setShowInstructions(false);

        const newConversation = [...conversation, { type: 'question', text: question }];
        setConversation(newConversation);
        setQuestion('');
        setLoading(true);
        setRows(1);

        try {
            const response = await axios({
                url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
                method: 'post',
                data: { "contents": [{ "parts": [{ "text": question }] }] }
            });

            const answer = response.data.candidates[0].content.parts[0].text;
            setConversation([...newConversation, { type: 'answer', text: answer }]);
        } catch (error) {
            console.error("Error generating answer", error);
        } finally {
            setLoading(false);
        }
    }

    function handleInput(event) {
        setQuestion(event.target.value);

        // Adjust the rows based on the content
        const textareaLineHeight = 24; // Assuming each row is 24px tall
        const minRows = 1;
        const maxRows = 3;

        textareaRef.current.rows = minRows; // Reset to one row to calculate the correct scrollHeight
        const currentRows = ~~(textareaRef.current.scrollHeight / textareaLineHeight);

        if (currentRows >= maxRows) {
            textareaRef.current.rows = maxRows;
        } else {
            textareaRef.current.rows = currentRows;
        }

        setRows(currentRows);
    }


    function renderMessage(text, messageIndex) {
        const parts = [];
        let lastIndex = 0;
        const codeRegex = /```([^`]+)```/g;

        text.replace(codeRegex, (match, code, index) => {
            parts.push(text.slice(lastIndex, index));
            parts.push(
                <div key={index} className="relative my-2">
                    <pre className="bg-gray-950 p-4 rounded-md overflow-auto whitespace-pre-wrap">{code}</pre>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(code);
                            setCopiedIndex(messageIndex);
                            setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2 seconds
                        }}
                        className="absolute top-2 right-2 text-sm text-gray-400 bg-slate-800"
                    >
                        {copiedIndex === messageIndex ? "Copied" : "Copy code"}
                    </button>
                </div>
            );
            lastIndex = index + match.length;
        });

        if (lastIndex < text.length) {
            parts.push(text.slice(lastIndex));
        }

        return parts.map((part, index) => {
            if (typeof part === 'string') {
                return (
                    <div
                        key={index}
                        className="markdown-content"
                        dangerouslySetInnerHTML={{ __html: marked(part) }}
                    />
                );
            }
            return part;
        });
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            generateAnswer();
        }

    }




    return (
        <div className="bg-gray-900 text-white h-[85.5vh] flex flex-col">
            <Particles
                // style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}

                id="tsparticles"
                init={particlesInit}
                loaded={particlesLoaded}
                options={{
                    background: {
                        color: {
                            // value: "#000000", // Set the background color to black
                        },
                    },
                    fpsLimit: 120,
                    interactivity: {
                        events: {
                            onClick: {
                                enable: true,
                                mode: "push",
                            },
                            onHover: {
                                enable: true,
                                mode: "repulse",
                            },
                            resize: true,
                        },
                        modes: {
                            push: {
                                quantity: 4,
                            },
                            repulse: {
                                distance: 200,
                                duration: 0.4,
                            },
                        },
                    },
                    particles: {
                        color: {
                            value: "#ffffff",
                        },
                        links: {
                            color: "#ffffff",
                            distance: 150,
                            enable: true,
                            opacity: 0.5,
                            width: 1,
                        },
                        move: {
                            direction: "none",
                            enable: true,
                            outModes: {
                                default: "bounce",
                            },
                            random: false,
                            speed: 2,
                            straight: false,
                        },
                        number: {
                            density: {
                                enable: true,
                                area: 800,
                            },
                            value: 80,
                        },
                        opacity: {
                            value: 0.5,
                        },
                        shape: {
                            type: "circle",
                        },
                        size: {
                            value: { min: 1, max: 5 },
                        },
                    },
                    detectRetina: true,
                }}
            />


            <div id="particles-js" ></div>


            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {/* <h1 className="text-3xl mb-4 text-center">AI Chatbot</h1> */}
                {showInstructions && <h2 className="text-2xl text-center mt-[25vh] text-gray-400 font-serif tracking-[10px]">Ask whatever you want</h2>}

                <div id="conversation" className="space-y-4">
                    {conversation.map((message, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-3xl shadow-xl max-w-2xl mx-auto ${message.type === 'question' ? 'bg-blue-900 text-white self-end' : 'text-gray-200 bg-slate-900'}`}
                            style={message.type === 'question' ? { marginLeft: 'auto', marginRight: '20rem', width: '30%' } : { textAlign: 'left' }}
                        >
                            <pre className="whitespace-pre-wrap">{renderMessage(message.text)}</pre>
                        </div>
                    ))}
                    {loading && (
                        <div className="p-4 rounded-lg shadow-md max-w-2xl mx-auto text-gray-200">
                            <div className="animate-pulse">Loading...</div>
                        </div>
                    )}
                </div>
            </div>
            <div className="w-[70%] p-2.5 bg-gray-800 self-center rounded-3xl mb-2 h-auto">
                <div className="flex items-center w-full">
                    <textarea
                        ref={textareaRef}
                        value={question}
                        placeholder="Message Enigma"
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        className="flex-grow p-2 rounded-l-lg bg-transparent text-white focus:outline-none resize-none"
                        rows={rows}
                        style={{ maxHeight: "10rem", overflowY: "auto" }}
                    />
                    <button
                        type="submit"
                        onClick={generateAnswer}
                        className="p-2 bg-gray-700 rounded-r-lg ml-5"
                    >
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chatbot;
