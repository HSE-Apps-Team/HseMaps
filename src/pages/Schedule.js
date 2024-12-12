// src/pages/Schedule.js
import React, { useState } from 'react';
import { Container, Typography, Paper } from '@mui/material';
import { ScheduleManager } from '../modules/ScheduleManager';

export const Schedule = () => {
    const [royalRooms, setRoyalRooms] = useState(ScheduleManager.getSchedule('royal'));
    const [grayRooms, setGrayRooms] = useState(ScheduleManager.getSchedule('gray'));
    const [newRoom, setNewRoom] = useState('');
    const [selectedDay, setSelectedDay] = useState('royal');

    const addRoom = () => {
        if (!newRoom) return;
        const rooms = selectedDay === 'royal' ? royalRooms : grayRooms;
        const updatedRooms = [...rooms, newRoom.toUpperCase()];
        
        if (selectedDay === 'royal') {
            setRoyalRooms(updatedRooms);
        } else {
            setGrayRooms(updatedRooms);
        }
        
        ScheduleManager.saveSchedule(selectedDay, updatedRooms);
        setNewRoom('');
    };

    const deleteRoom = (index) => {
        const rooms = selectedDay === 'royal' ? royalRooms : grayRooms;
        const updatedRooms = rooms.filter((_, i) => i !== index);
        
        if (selectedDay === 'royal') {
            setRoyalRooms(updatedRooms);
        } else {
            setGrayRooms(updatedRooms);
        }
        
        ScheduleManager.saveSchedule(selectedDay, updatedRooms);
    };

    return (
        <Container>
            <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h4">Schedule</Typography>
                <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                    <option value="royal">Royal Day</option>
                    <option value="gray">Gray Day</option>
                </select>

                <div>
                    <input 
                        value={newRoom}
                        onChange={(e) => setNewRoom(e.target.value)}
                        placeholder="Enter room number"
                    />
                    <button onClick={addRoom}>Add Room</button>
                </div>

                <ul>
                    {(selectedDay === 'royal' ? royalRooms : grayRooms).map((room, index) => (
                        <li key={index}>
                            {room}
                            <button onClick={() => deleteRoom(index)}>Delete</button>
                        </li>
                    ))}
                </ul>
            </Paper>
        </Container>
    );
};