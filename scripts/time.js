document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('timeForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const startTime = document.getElementById('startTime').value;
        const hoursWorked = parseFloat(document.getElementById('hoursWorked').value);
        const minutesWorked = parseFloat(document.getElementById('minutesWorked').value);
        const totalHoursNeeded = parseFloat(document.getElementById('totalHoursNeeded').value);
        const totalMinutesNeeded = 0;

        if (!startTime || isNaN(hoursWorked) || isNaN(minutesWorked) || isNaN(totalHoursNeeded) || isNaN(totalMinutesNeeded)) {
            alert('Please enter valid inputs.');
            return;
        }

        // Convert all time inputs to minutes
        const startTimeParts = startTime.split(':').map(Number);
        const startMinutes = startTimeParts[0] * 60 + startTimeParts[1];
        const hoursWorkedMinutes = hoursWorked * 60 + minutesWorked;
        const totalHoursNeededMinutes = totalHoursNeeded * 60 + totalMinutesNeeded;

        let remainingMinutes = totalHoursNeededMinutes - hoursWorkedMinutes;

        if (remainingMinutes <= 0) {
            document.getElementById('result').innerHTML = 'You have already worked enough hours for the week!';
            return;
        }

        // Define work schedule constraints (7 AM to 12 PM)
        const workStartHour = 7; // 7 AM
        const workEndHour = 12; // 12 PM
        const workDayMinutes = (workEndHour - workStartHour) * 60; // Total work minutes per day

        let clockOutDateTime = new Date();
        clockOutDateTime.setHours(startTimeParts[0], startTimeParts[1], 0, 0);

        // Calculate how many minutes are left in the current workday
        let hoursLeftToday = workEndHour * 60 - clockOutDateTime.getHours() * 60 - clockOutDateTime.getMinutes();
        if (hoursLeftToday < 0) hoursLeftToday = 0;

        // Scenario 1: If remaining minutes fit within today's available minutes
        if (remainingMinutes <= hoursLeftToday) {
            clockOutDateTime.setMinutes(clockOutDateTime.getMinutes() + remainingMinutes);
            const formattedClockOutTime = clockOutDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            document.getElementById('result').innerHTML = `You should clock out at: ${formattedClockOutTime}`;
        } else {
            // Scenario 2: Minutes spill over to the next day
            remainingMinutes -= hoursLeftToday;

            // Set clock-out time to 12 PM today (end of the current workday)
            clockOutDateTime.setHours(workEndHour, 0, 0, 0);

            // Continue to push remaining minutes into subsequent days
            while (remainingMinutes > 0) {
                clockOutDateTime.setDate(clockOutDateTime.getDate() + 1); // Move to the next day
                if (remainingMinutes <= workDayMinutes) {
                    // If remaining minutes fit in the next workday, set the clock-out time
                    clockOutDateTime.setHours(workStartHour, 0, 0, 0);
                    clockOutDateTime.setMinutes(clockOutDateTime.getMinutes() + remainingMinutes);
                    remainingMinutes = 0; // All minutes accounted for
                } else {
                    // Otherwise, subtract a full workday and push to the next day
                    remainingMinutes -= workDayMinutes;
                    clockOutDateTime.setHours(workEndHour, 0, 0, 0); // End at 12 PM on the next day
                }
            }

            const formattedClockOutTime = clockOutDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const formattedClockOutDate = clockOutDateTime.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

            document.getElementById('result').innerHTML = `You should clock out at: ${formattedClockOutTime} on ${formattedClockOutDate}`;
        }
    });
});



