// src/pages/Navigation.js
import React, { useEffect, useRef } from 'react';
import { EventHandlingModule } from '../modules/EventHandlingModule';
import { NavigationController } from '../modules/NavigationController';

export const Navigation = () => {
    const scrollRef = useRef(null);
    const progbarRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (progbarRef.current && scrollRef.current) {
                progbarRef.current.value = scrollRef.current.scrollTop;
                NavigationController.updateAgentPosition();
            }
        };

        const handleInput = () => {
            if (scrollRef.current && progbarRef.current) {
                scrollRef.current.scrollTop = progbarRef.current.value;
                NavigationController.updateAgentPosition();
            }
        };

        const scrollElement = scrollRef.current;
        const progbarElement = progbarRef.current;

        if (scrollElement && progbarElement) {
            scrollElement.addEventListener('scroll', handleScroll);
            progbarElement.addEventListener('input', handleInput);
        }
        EventHandlingModule.displayNextClass();

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
                <button id="btn" onClick={() => EventHandlingModule.markShortestPath()}>Route</button>
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
                <select id="daySelect" onInput={EventHandlingModule.displayNextClass}>
                    <option value="royal">Royal Day</option>
                    <option value="gray">Gray Day</option>
                </select>
                
                <div style={{ margin: '10px 0', fontWeight: 'bold' }}>
                    <span id="nextDestination"></span>
                </div>
                
                <button onClick={EventHandlingModule.navigateSchedule}>Route From Schedule</button>
            </div>
        </div>
    );
};