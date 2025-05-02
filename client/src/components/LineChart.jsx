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
import { mockLineData as data } from "../data/mockData";
import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";

const LineChart = ({ isCustomLineColors = false, isDashboard = false }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // Custom color scheme for transaction statuses
    const statusColors = {
        legit: "#4CAF50",    // Green
        flagged: "#FFEB3B",  // Yellow
        blocked: "#F44336"   // Red
    };

    return (
        <div style={{
            height: "100%",
            width: "100%",
            padding: isDashboard ? "0" : "16px",
            backgroundColor: isDashboard ? "transparent" : colors.primary[400],
            borderRadius: "8px",
            boxShadow: isDashboard ? "none" : `0px 4px 10px ${colors.grey[900]}`
        }}>
            <ResponsiveLine
                data={data}
                theme={{
                    axis: {
                        domain: { line: { stroke: colors.grey[100] } },
                        legend: { text: { fill: colors.grey[100] } },
                        ticks: {
                            line: { stroke: colors.grey[100], strokeWidth: 1 },
                            text: { fill: colors.grey[100] }
                        }
                    },
                    legends: { text: { fill: colors.grey[100] } },
                    tooltip: { container: { color: colors.primary[500] } }
                }}
                colors={isCustomLineColors 
                    ? (d) => statusColors[d.id]  // Use custom status colors
                    : isDashboard 
                        ? { datum: "color" } 
                        : { scheme: "nivo" }
                }
                margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                xScale={{ type: "point" }}
                yScale={{
                    type: "linear",
                    min: "auto",
                    max: "auto",
                    stacked: true,
                    reverse: false
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
                    legend: isDashboard ? undefined : "months",
                    legendOffset: 36,
                    legendPosition: "middle"
                }}
                axisLeft={{
                    orient: "left",
                    tickValues: 5,
                    tickSize: 3,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: isDashboard ? undefined : "transactions",
                    legendOffset: -40,
                    legendPosition: "middle"
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
                                    itemOpacity: 1
                                }
                            }
                        ]
                    }
                ]}
            />
        </div>
    );
};

export default LineChart;