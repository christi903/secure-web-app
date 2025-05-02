import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from "@fullcalendar/list";
import { Box, List, ListItem, ListItemText, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useState } from "react";

// Default color palette if theme tokens are not available
const defaultColors = {
  red: { 500: '#f44336', 800: '#d32f2f' },
  blue: { 500: '#2196f3' },
  green: { 500: '#4caf50' },
  yellow: { 500: '#ffeb3b' },
  purple: { 500: '#9c27b0' },
  primary: { 400: '#3e4396' }
};

const Calendars = () => {
  const theme = useTheme();
  // Safely get colors with fallback to defaults
  const colors = tokens(theme.palette.mode) || defaultColors;
  
  const [currentEvents, setCurrentEvents] = useState([]);

  const formatDate = (dateStr, options) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', options);
  };

  // Function to shorten event titles for calendar display
  const shortenTitle = (title) => {
    const maxLength = 15;
    if (title.length > maxLength) {
      return title.substring(0, maxLength) + '...';
    }
    return title;
  };

  const handleDateClick = (selected) => {
    const title = prompt("Please enter a new fraud detection event");
    const calendarApi = selected.view.calendar;
    calendarApi.unselect();

    if (title) {
      calendarApi.addEvent({
        id: `${selected.dateStr}-${title}`,
        title,
        start: selected.startStr,
        end: selected.endStr,
        allDay: selected.allDay,
        color: colors.red?.[500] || defaultColors.red[500],
        extendedProps: {
          description: title // Store full title as description
        }
      });
    }
  };

  const handleEventClick = (selected) => {
    if (window.confirm(`Are you sure you want to delete the fraud detection event '${selected.event.title}'`)) {
      selected.event.remove();
    }
  };

  // Safe color accessor function
  const getColor = (colorName, shade = 500) => {
    return colors[colorName]?.[shade] || defaultColors[colorName]?.[shade] || '#666';
  };

  // Fraud detection system events
  const fraudEvents = [
    // Month 1
    {
      id: "fraud-1",
      title: "Suspicious Transaction Spike",
      description: "Suspicious Transaction Spike Detected - Multiple high-value transactions from single source",
      date: "2025-01-05",
      color: getColor('red')
    },
    {
      id: "fraud-2",
      title: "Fraud Pattern Update",
      description: "System Update: New Fraud Patterns Added to Detection Algorithms",
      date: "2025-01-15",
      color: getColor('blue')
    },
    {
      id: "fraud-3",
      title: "Quarterly Review",
      description: "Quarterly Fraud Prevention Review Meeting with Security Team",
      date: "2025-02-22",
      color: getColor('green')
    },
    // Month 2
    {
      id: "fraud-4",
      title: "High-Risk Alert",
      description: "High-Risk Transaction Alert - Potential Account Takeover Attempt",
      date: "2025-03-03",
      color: getColor('red')
    },
    {
      id: "fraud-5",
      title: "Team Meeting",
      description: "Fraud Detection Team Monthly Strategy Meeting",
      date: "2025-04-12",
      color: getColor('blue')
    },
    {
      id: "fraud-6",
      title: "System Maintenance",
      description: "System Maintenance - Fraud Detection Algorithms Update",
      date: "2025-04-20",
      color: getColor('yellow')
    },
    // Month 3
    {
      id: "fraud-7",
      title: "New Fraud Pattern",
      description: "New Fraud Pattern Identified in E-commerce Transactions",
      date: "2025-05-07",
      color: getColor('red')
    },
    {
      id: "fraud-8",
      title: "Training Session",
      description: "Fraud Prevention Training Session for Customer Support",
      date: "2025-06-16",
      color: getColor('blue')
    },
    {
      id: "fraud-9",
      title: "Monitoring Report",
      description: "Monthly Transaction Monitoring Report Due to Compliance",
      date: "2025-07-25",
      color: getColor('green')
    },
    // Additional important events
    {
      id: "fraud-10",
      title: "Zero-Day Exploit",
      description: "Critical: Zero-Day Fraud Exploit Detected - Emergency Patch Required",
      date: "2025-08-30",
      color: getColor('red', 800),
      allDay: true
    },
    {
      id: "fraud-11",
      title: "AI Model Update",
      description: "AI Model Retraining (Fraud Detection) - Scheduled Maintenance",
      date: "2025-11-28",
      color: getColor('purple')
    }
  ];

  return (
    <Box m="20px">
      <Header title="Fraud Detection Calendar" subtitle="Critical events and monitoring schedule" />

      <Box display="flex" justifyContent="space-between">
        {/* CALENDAR SIDEBAR */}
        <Box
          p="15px"
          flex="1 1 20%"
          borderRadius="4px"
          backgroundColor={getColor('primary', 400)}
        >
          <Typography variant="h5">Fraud Events</Typography>
          <List>
            {currentEvents.map((event) => (
              <ListItem
                key={event.id}
                sx={{
                  margin: "10px 0",
                  borderRadius: "2px",
                  backgroundColor: event.color || getColor('green'),
                }}
              >
                <ListItemText
                  primary={event.title}
                  secondary={
                    <Box>
                      <Typography variant="body2">
                        {formatDate(event.start, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', marginTop: '5px' }}>
                        {event.extendedProps?.description || event.title}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* CALENDAR */}
        <Box flex="1 1 100%" ml="15px">
          <FullCalendar
            height="75vh"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateClick}
            initialView="dayGridMonth"
            eventClick={handleEventClick}
            eventsSet={(events) => setCurrentEvents(events)}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            initialEvents={fraudEvents}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
            }}
            eventContent={(eventInfo) => (
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: '0.85em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                <i className="fas fa-shield-alt" style={{ marginRight: '5px' }}></i>
                {shortenTitle(eventInfo.event.title)}
              </div>
            )}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Calendars;