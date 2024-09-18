document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('timeForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const startTime = document.getElementById('startTime').value;
        const workedTime = document.getElementById('workedTime').value;
        const neededTime = document.getElementById('neededTime').value;

        // Validation for HH:MM format
        const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

        if (!startTime || !timePattern.test(workedTime) || !timePattern.test(neededTime)) {
            alert('Please enter valid times in HH:MM format.');
            return;
        }

        // Get the current date and time
        let currentDateTime = new Date();
        const currentDay = currentDateTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 4 = Thursday, 5 = Friday

        // Parse worked time (HH:MM)
        const [workedHours, workedMinutes] = workedTime.split(':').map(Number);
        const workedTotalMinutes = workedHours * 60 + workedMinutes;

        // Parse needed time (HH:MM)
        const [neededHours, neededMinutes] = neededTime.split(':').map(Number);
        const neededTotalMinutes = neededHours * 60 + neededMinutes;

        // Calculate remaining minutes
        let remainingMinutes = neededTotalMinutes - workedTotalMinutes;

        if (remainingMinutes <= 0) {
            document.getElementById('result').innerHTML = 'You have already worked enough hours for the week!';
            return;
        }

        // Parse start time
        const [startHour, startMinutes] = startTime.split(':').map(Number);
        let clockOutDateTime = new Date();
        clockOutDateTime.setHours(startHour, startMinutes, 0, 0);

        // Define work schedule constraints (7 AM to 12 PM)
        const workStartHour = 7; // 7 AM
        const workEndHour = 12; // 12 PM
        const workDayMinutes = (workEndHour - workStartHour) * 60; // Total work minutes per day

        // Calculate how many minutes are left in the current workday
        let hoursLeftToday = workEndHour * 60 - clockOutDateTime.getHours() * 60 - clockOutDateTime.getMinutes();
        if (hoursLeftToday < 0) hoursLeftToday = 0;

        // Adjust logic to always calculate future clock-out time
        // if it is after 1pm today, assume I have already clocked out, move forward to tomorrow
        if (currentDateTime.getHours() >= workEndHour + 1) {
            clockOutDateTime.setDate(clockOutDateTime.getDate() + 1);
        }
        
        remainingMinutes -= hoursLeftToday;
        clockOutDateTime.setHours(workEndHour, 0, 0, 0); // Set to the end of today (12 PM)

        // Move forward to the next working day if necessary
        while (remainingMinutes > 0) {
            clockOutDateTime.setDate(clockOutDateTime.getDate() + 1); // Move to the next day
            const nextDay = clockOutDateTime.getDay();
            if (nextDay === 0) clockOutDateTime.setDate(clockOutDateTime.getDate() + 1); // Skip Sunday
            if (remainingMinutes <= workDayMinutes) {
                clockOutDateTime.setHours(workStartHour, 0, 0, 0);
                clockOutDateTime.setMinutes(clockOutDateTime.getMinutes() + remainingMinutes);
                remainingMinutes = 0; // All minutes accounted for
            } else {
                remainingMinutes -= workDayMinutes;
                clockOutDateTime.setHours(workEndHour, 0, 0, 0); // End at 12 PM on the next day
            }
        }

        const formattedClockOutTime = clockOutDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const formattedClockOutDate = clockOutDateTime.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

        document.getElementById('result').innerHTML = `<div id="subResult">You will clock out at:</div> ${formattedClockOutTime} on ${formattedClockOutDate}`;
    });
});
