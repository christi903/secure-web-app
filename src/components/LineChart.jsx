/**
 * LineChart Component - Transaction Status Visualization
 * 
 * @component
 * @param {boolean} [isCustomLineColors=false] - Enable custom line colors (Green/Yellow/Red for legit/flagged/blocked).
 * @param {boolean} [isDashboard=false] - Adjust styling for dashboard context.
 * @returns {JSX.Element} Nivo ResponsiveLine chart with transaction status colors.
 * 
 * @example
 * // Basic usage
 * <LineChart />
 * 
 * @example
 * // Dashboard usage with custom colors
 * <LineChart isCustomLineColors isDashboard />
 */

import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { tokens } from "../theme";

// Status colors and configuration
const statusConfig = {
    legitimate: {
        color: "#4CAF50", // Green
        label: "Legitimate"
    },
    flagged: {
        color: "#FDD835", // Yellow
        label: "Flagged"
    },
    blocked: {
        color: "#F44336", // Red
        label: "Blocked"
    }
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const LineChart = ({ isCustomLineColors = false, isDashboard = false }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [lineData, setLineData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                const currentYear = new Date().getFullYear();
                const startDate = new Date(currentYear, 0, 1).toISOString();
                const endDate = new Date(currentYear, 11, 31).toISOString();

                const { data, error: supabaseError } = await supabase
                    .from("transactions")
                    .select("transaction_time, status")
                    .gte("transaction_time", startDate)
                    .lte("transaction_time", endDate);

                if (supabaseError) throw supabaseError;

                console.log("Fetched transactions:", data);

                // Initialize data structure for all months
                const monthlyData = {};
                Object.keys(statusConfig).forEach(status => {
                    monthlyData[status] = Array(12).fill(0);
                });

                // Count transactions by status and month
                data.forEach(({ transaction_time, status }) => {
                    const date = new Date(transaction_time);
                    const month = date.getMonth();
                    const statusKey = status.toLowerCase();
                    
                    if (monthlyData[statusKey] !== undefined) {
                        monthlyData[statusKey][month]++;
                    }
                });

                // Format data for Nivo Line chart
                const formattedData = Object.entries(monthlyData).map(([status, counts]) => ({
                    id: statusConfig[status].label,
                    color: statusConfig[status].color,
                    data: counts.map((count, monthIndex) => ({
                        x: monthNames[monthIndex],
                        y: count
                    }))
                }));

                console.log("Formatted chart data:", formattedData);
                setLineData(formattedData);
            } catch (err) {
                console.error("Error fetching transaction data:", err);
                setError(err.message);
                setLineData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div style={{
                height: "100%",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: isDashboard ? "transparent" : colors.primary[400],
                borderRadius: "8px",
                color: colors.grey[100]
            }}>
                Loading transaction data...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                height: "100%",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: isDashboard ? "transparent" : colors.primary[400],
                borderRadius: "8px",
                color: colors.grey[100]
            }}>
                Error loading data: {error}
            </div>
        );
    }

    if (lineData.length === 0 || lineData.every(series => series.data.every(point => point.y === 0))) {
        return (
            <div style={{
                height: "100%",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: isDashboard ? "transparent" : colors.primary[400],
                borderRadius: "8px",
                color: colors.grey[100]
            }}>
                No transaction data available for the current year.
            </div>
        );
    }

    return (
        <div
            style={{
                height: "100%",
                width: "100%",
                padding: isDashboard ? "0" : "16px",
                backgroundColor: isDashboard ? "transparent" : colors.primary[400],
                borderRadius: "8px",
                boxShadow: isDashboard ? "none" : `0px 4px 10px ${colors.grey[900]}`,
            }}
        >
            <ResponsiveLine
                data={lineData}
                theme={{
                    axis: {
                        domain: { line: { stroke: colors.grey[100] } },
                        legend: { text: { fill: colors.grey[100] } },
                        ticks: {
                            line: { stroke: colors.grey[100], strokeWidth: 1 },
                            text: { fill: colors.grey[100] },
                        },
                    },
                    legends: { text: { fill: colors.grey[100] } },
                    tooltip: {
                        container: {
                            background: colors.primary[500],
                            color: colors.grey[100],
                            fontSize: 12,
                        },
                    },
                }}
                colors={(d) => isCustomLineColors ? statusConfig[d.id.toLowerCase()]?.color || d.color : d.color}
                margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                xScale={{ type: "point" }}
                yScale={{
                    type: "linear",
                    min: 0,
                    max: "auto",
                    stacked: false,
                    reverse: false,
                }}
                yFormat=" >-.0f"
                curve="catmullRom"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    orient: "bottom",
                    tickSize: 0,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: isDashboard ? undefined : "Month",
                    legendOffset: 36,
                    legendPosition: "middle",
                }}
                axisLeft={{
                    orient: "left",
                    tickValues: 5,
                    tickSize: 3,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: isDashboard ? undefined : "Transactions",
                    legendOffset: -40,
                    legendPosition: "middle",
                }}
                enableGridX={false}
                enableGridY={false}
                pointSize={8}
                pointColor={{ theme: "background" }}
                pointBorderWidth={2}
                pointBorderColor={{ from: "serieColor" }}
                pointLabelYOffset={-12}
                useMesh={true}
                legends={[
                    {
                        anchor: "bottom-right",
                        direction: "column",
                        justify: false,
                        translateX: 100,
                        translateY: 0,
                        itemsSpacing: 0,
                        itemDirection: "left-to-right",
                        itemWidth: 80,
                        itemHeight: 20,
                        itemOpacity: 0.75,
                        symbolSize: 12,
                        symbolShape: "circle",
                        symbolBorderColor: "rgba(0, 0, 0, .5)",
                        effects: [
                            {
                                on: "hover",
                                style: {
                                    itemBackground: "rgba(0, 0, 0, .03)",
                                    itemOpacity: 1,
                                },
                            },
                        ],
                    },
                ]}
            />
        </div>
    );
};

export default LineChart;