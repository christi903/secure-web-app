import { ResponsiveBar } from "@nivo/bar";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";

const data = [
    { month: "1", legitimate: 120, flagged: 30, blocked: 10 },
    { month: "2", legitimate: 150, flagged: 25, blocked: 15 },
    { month: "3", legitimate: 180, flagged: 40, blocked: 20 },
    { month: "4", legitimate: 170, flagged: 35, blocked: 25 },
    { month: "5", legitimate: 160, flagged: 20, blocked: 30 },
    { month: "6", legitimate: 200, flagged: 50, blocked: 40 },
    { month: "7", legitimate: 190, flagged: 45, blocked: 35 },
    { month: "8", legitimate: 210, flagged: 60, blocked: 50 },
    { month: "9", legitimate: 220, flagged: 55, blocked: 45 },
    { month: "1O", legitimate: 230, flagged: 70, blocked: 60 },
    { month: "11", legitimate: 240, flagged: 65, blocked: 55 },
    { month: "12", legitimate: 250, flagged: 75, blocked: 65 }
];

const BarChart = ({ isDashboard = false }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <ResponsiveBar
            data={data}
            theme={{
                axis: {
                    domain: {
                        line: { stroke: colors.grey[100] }
                    },
                    legend: {
                        text: { fill: colors.grey[100] }
                    },
                    ticks: {
                        line: { stroke: colors.grey[100], strokeWidth: 1 },
                        text: { fill: colors.grey[100] }
                    }
                },
                legends: {
                    text: { fill: colors.grey[500] }
                }
            }}
            keys={["legitimate", "flagged", "blocked"]}
            indexBy="month"
            padding={0.3}
            colors={["#4caf50", "#ff9800", "#f44336"]}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
            borderColor={{ from: "color", modifiers: [["darker", "1.6"]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: isDashboard ? undefined : "Months",
                legendPosition: "middle",
                legendOffset: 32
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: isDashboard ? undefined : "Transactions",
                legendPosition: "middle",
                legendOffset: -40
            }}
            enableLabel={false}
            legends={[{
                dataFrom: "keys",
                anchor: "bottom-right",
                direction: "column",
                justify: false,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: "left-to-right",
                itemOpacity: 0.85,
                symbolSize: 20,
                effects: [{ on: "hover", style: { itemOpacity: 1 } }]
            }]}
            role="application"
            barAriaLabel={(e) => `${e.id}: ${e.formattedValue} in ${e.indexValue}`}
            title="Transactions Summary"
        />
    );
};

export default BarChart;
