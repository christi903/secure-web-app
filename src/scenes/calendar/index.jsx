import FullCalendar from '@fullcalendar/react'; // Main calendar component
import dayGridPlugin from '@fullcalendar/daygrid'; // Month and day grid views
import timeGridPlugin from '@fullcalendar/timegrid'; // Week and day views
import interactionPlugin from '@fullcalendar/interaction'; // For click and drag interactions
import listPlugin from "@fullcalendar/list"; // List view plugin
import { Box, Grid, Card, CardContent, Typography, useTheme, Divider } from "@mui/material"; // Material UI components
import { tokens } from "../../theme"; // Theme colors
import Header from "../../components/Header"; // Custom header component
import { useState } from "react"; // React state hook

// Default color palette if theme tokens are not available
const defaultColors = {
  red: { 500: '#f44336', 800: '#d32f2f' }, // Red shades for high-priority events
  blue: { 500: '#2196f3' }, // Blue for informational events
  green: { 500: '#4caf50' }, // Green for positive events
  yellow: { 500: '#ffeb3b' }, // Yellow for warnings
  purple: { 500: '#9c27b0' }, // Purple for special events
  primary: { 400: '#3e4396' } // Primary color fallback
};

const Calendars = () => {
  const theme = useTheme(); // Access MUI theme
  // Safely get colors with fallback to defaults if theme tokens are missing
  const colors = tokens(theme.palette.mode) || defaultColors;
  
  // State to track current events in the calendar
  const [currentEvents, setCurrentEvents] = useState([]);

  // Helper function to format dates consistently
  const formatDate = (dateStr, options) => {
    const date = new Date(dateStr); // Create Date object from string
    return date.toLocaleDateString('en-US', options); // Format according to options
  };

  // Function to shorten long event titles for better display in calendar cells
  const shortenTitle = (title) => {
    const maxLength = 15; // Maximum characters to display
    return title.length > maxLength ? 
      `${title.substring(0, maxLength)}...` : // Truncate with ellipsis if too long
      title; // Return original if short enough
  };

  // Handler for when a date is clicked (to add new events)
  const handleDateClick = (selected) => {
    // Prompt user for event title
    const title = prompt("Please enter a new fraud detection event");
    const calendarApi = selected.view.calendar; // Get calendar API instance
    calendarApi.unselect(); // Clear the date selection visual

    if (title) {
      // Add new event to calendar
      calendarApi.addEvent({
        id: `${selected.dateStr}-${title}`, // Unique ID combining date and title
        title, // Event title
        start: selected.startStr, // Start time
        end: selected.endStr, // End time
        allDay: selected.allDay, // All-day event flag
        color: colors.red?.[500] || defaultColors.red[500], // Red color for fraud events
        extendedProps: {
          description: title // Store full title as description
        }
      });
    }
  };

  // Handler for when an event is clicked (to delete events)
  const handleEventClick = (selected) => {
    // Confirm before deleting event
    if (window.confirm(`Are you sure you want to delete the fraud detection event '${selected.event.title}'`)) {
      selected.event.remove(); // Remove event from calendar
    }
  };

  // Safe color accessor function with fallbacks
  const getColor = (colorName, shade = 500) => {
    return colors[colorName]?.[shade] || // Try theme colors first
      defaultColors[colorName]?.[shade] || // Then default colors
      '#666'; // Fallback gray
  };

  // Predefined fraud detection system events
  const fraudEvents = [
    // Month 1 events
    {
      id: "fraud-1",
      title: "Suspicious Transaction Spike",
      description: "Suspicious Transaction Spike Detected - Multiple high-value transactions from single source",
      date: "2025-01-05", // Event date
      color: getColor('red') // Red color for high severity
    },
    {
      id: "fraud-2",
      title: "Fraud Pattern Update",
      description: "System Update: New Fraud Patterns Added to Detection Algorithms",
      date: "2025-01-15",
      color: getColor('blue') // Blue for informational event
    },
    {
      id: "fraud-3",
      title: "Quarterly Review",
      description: "Quarterly Fraud Prevention Review Meeting with Security Team",
      date: "2025-02-22",
      color: getColor('green') // Green for positive event
    },
    // Month 2 events
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
      color: getColor('yellow') // Yellow for maintenance
    },
    // Month 3 events
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
      color: getColor('red', 800), // Darker red for critical
      allDay: true
    },
    {
      id: "fraud-11",
      title: "AI Model Update",
      description: "AI Model Retraining (Fraud Detection) - Scheduled Maintenance",
      date: "2025-11-28",
      color: getColor('purple') // Purple for special event
    }
  ];

  return (
    <Box m="20px">
      {/* Page header with title and subtitle */}
      <Header title="Fraud Detection Calendar" subtitle="Critical events and monitoring schedule" />

      {/* Main calendar component */}
      <Box mb="20px">
        <FullCalendar
          height="65vh" // Fixed height for calendar
          editable={true} // Allow events to be edited
          selectable={true} // Allow date selection
          selectMirror={true} // Show selection visual feedback
          dayMaxEvents={true} // Allow unlimited events per day
          select={handleDateClick} // Date selection handler
          initialView="dayGridMonth" // Default to month view
          eventClick={handleEventClick} // Event click handler
          eventsSet={(events) => setCurrentEvents(events)} // Sync events with state
          plugins={[ // Required plugins
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            listPlugin,
          ]}
          initialEvents={fraudEvents} // Preload with fraud events
          headerToolbar={{ // Toolbar configuration
            left: "prev,next today", // Navigation controls
            center: "title", // Month/year title
            right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth", // View options
          }}
          eventContent={(eventInfo) => ( // Custom event rendering
            <div style={{ 
              fontWeight: 'bold', // Bold text
              fontSize: '0.85em', // Slightly smaller font
              whiteSpace: 'nowrap', // Prevent wrapping
              overflow: 'hidden', // Hide overflow
              textOverflow: 'ellipsis' // Add ellipsis for long text
            }}>
              <i className="fas fa-shield-alt" style={{ marginRight: '5px' }}></i>
              {shortenTitle(eventInfo.event.title)}
            </div>
          )}
        />
      </Box>

      <Divider sx={{ my: 3 }} /> {/* Horizontal divider */}

      {/* List of fraud events below the calendar */}
      <Box>
        <Typography variant="h5" gutterBottom>Fraud Events</Typography>
        <Grid container spacing={2}>
          {currentEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={event.id}>
              <Card 
                sx={{ 
                  height: '100%', // Full height cards
                  borderLeft: `4px solid ${event.color || getColor('green')}`, // Color-coded border
                  '&:hover': { // Hover effects
                    boxShadow: 3, // Elevation on hover
                    transform: 'translateY(-2px)', // Lift effect
                    transition: 'all 0.3s ease' // Smooth transition
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {formatDate(event.start, { // Formatted date
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Typography>
                  <Typography variant="body2">
                    {event.extendedProps?.description || event.title}  
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Calendars;