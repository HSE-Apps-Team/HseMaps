// src/modules/ScheduleManager.js
export const ScheduleManager = {
    saveSchedule(day, rooms) {
        localStorage.setItem(`schedule_${day}`, JSON.stringify(rooms));
    },

    getSchedule(day) {
        const schedule = localStorage.getItem(`schedule_${day}`);
        return schedule ? JSON.parse(schedule) : [];
    }
};