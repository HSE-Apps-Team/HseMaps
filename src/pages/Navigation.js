// src/pages/Navigation.js
import React, { useEffect, useRef } from 'react';

export const Navigation = () => {
    const scrollRef = useRef(null);
    const progbarRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (progbarRef.current && scrollRef.current) {
                progbarRef.current.value = scrollRef.current.scrollTop;
                window.updateAgent?.();
            }
        };

        const handleInput = () => {
            window.updateAgent?.();
        };

        const scrollElement = scrollRef.current;
        const progbarElement = progbarRef.current;

        if (scrollElement && progbarElement) {
            scrollElement.addEventListener('scroll', handleScroll);
            progbarElement.addEventListener('input', handleInput);
        }

        return () => {
            if (scrollElement) {
                scrollElement.removeEventListener('scroll', handleScroll);
            }
            if (progbarElement) {
                progbarElement.removeEventListener('input', handleInput);
            }
        };
    }, []);

    return (
        <div>
            <select name="Color Theme" id="theme-dropdown">
                <option value="light">Default</option>
                <option value="dark">Dark</option>
                <option value="secondary">Secondary</option>
                <option value="winter">Winter</option>
            </select>

            <h1>
                <div id="title">
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                        <img 
                            id="titleicon" 
                            style={{ width: '100px', height: 'auto' }} 
                            src={process.env.PUBLIC_URL + '/hseapps.0051872e.png'} 
                            alt="HseAPPS Logo" 
                            width="40" 
                            height="40"
                        />
                        <span>HSE Maps</span>
                    </div>
                </div>
            </h1>

            <div id="inputdiv">
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1em' }}>
                    <input className="textbox" type="text" id="start" placeholder="Start" />
                    <input className="textbox" type="text" id="end" placeholder="Destination" />
                </div>
                <button id="btn" onClick={() => window.markShortestPathFromInput()}>Route</button>
            </div>

            <div id="svgdiv">
                <div id="scroll" ref={scrollRef}><div></div></div>
                <svg 
                    id="svg" 
                    xmlns="http://www.w3.org/2000/svg" 
                    xmlnsXlink="http://www.w3.org/1999/xlink" 
                    version="1.1" 
                    viewBox="0 0 1308 2048"
                >
                    <g>
                        <g id="svgraph">
                            <g>
                                <image
                                    id="map"
                                    width="2048"
                                    height="1308"
                                    preserveAspectRatio="none"
                                    href="/elements/mainfloorcrunched.png"
                                />
                                <g id="graph"></g>
                            </g>
                        </g>
                    </g>
                </svg>
            </div>

            <div id="progbarcontainer">
                <input
                    ref={progbarRef}
                    title="Progress"
                    type="range"
                    min="0"
                    max="200"
                    defaultValue="0"
                    id="progbar"
                />
            </div>

            <div id="schedulecontainer">
                <input className="textbox" title="Schedule" type="text" id="sched" />
                <input
                    id="btn"
                    type="button"
                    onClick={() => window.navSchedule()}
                    value="Schedule"
                />
            </div>
        </div>
    );
};