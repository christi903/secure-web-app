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

// ✅ Moved outside to avoid useEffect dependency issues
const statusColors = {
    legitimate: "#4CAF50", // Green
    flagged: "#FDD835",    // Yellow
    blocked: "#F44336",    // Red
};

const LineChart = ({ isCustomLineColors = false, isDashboard = false }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [lineData, setLineData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data, error } = await supabase
                    .from("transactions")
                    .select("transaction_time, status");

                if (error) throw error;

                console.log("Fetched Data:", data); // Log fetched data

                // Initialize 12 months of data for each status
                const statusMap = {
                    legitimate: Array(12).fill(0),
                    flagged: Array(12).fill(0),
                    blocked: Array(12).fill(0),
                };

                data.forEach(({ transaction_time, status }) => {
                    const month = new Date(transaction_time).getMonth();
                    const key = status.toLowerCase();
                    if (statusMap[key] !== undefined) {
                        statusMap[key][month]++;
                    }
                });

                console.log("Status Map:", statusMap); // Log statusMap for debugging

                // Format for Nivo Line chart
                const formatted = Object.entries(statusMap).map(([key, values]) => ({
                    id: key,
                    color: statusColors[key],
                    data: values.map((val, i) => ({
                        x: new Date(0, i).toLocaleString("default", { month: "short" }),
                        y: val,
                    })),
                }));

                console.log("Formatted Data for Chart:", formatted); // Log formatted data

                setLineData(formatted);
            } catch (err) {
                console.error("Failed to load line chart data:", err.message);
                setLineData([]); // Set empty data in case of error
            }
        };

        fetchData();
    }, []);

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
                            color: "#fff",
                            fontSize: 12,
                        },
                    },
                }}
                colors={(d) =>
                    isCustomLineColors ? statusColors[d.id] : { scheme: "nivo" }
                }
                margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                xScale={{ type: "point" }}
                yScale={{
                    type: "linear",
                    min: "auto",
                    max: "auto",
                    stacked: false,
                    reverse: false,
                }}
                yFormat=" >-.2f"
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
                    tickSize: 3,
                    tickPadding: 5,
                    tickRotation: 0,
                    tickValues: 5,
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
