import { ResponsiveBar } from "@nivo/bar";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const BarChart = ({ isDashboard = false }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchTransactionData = async () => {
            try {
                const { data, error } = await supabase
                    .from("transactions")
                    .select("transaction_time, status");

                if (error) throw error;

                const monthlyData = Array.from({ length: 12 }, (_, i) => ({
                    month: (i + 1).toString(), // "1" to "12"
                    legitimate: 0,
                    flagged: 0,
                    blocked: 0,
                }));

                data.forEach((transaction) => {
                    const month = new Date(transaction.transaction_time).getMonth(); // 0–11
                    const status = transaction.status.toLowerCase();
                    if (["legitimate", "flagged", "blocked"].includes(status)) {
                        monthlyData[month][status]++;
                    }
                });

                setChartData(monthlyData);
            } catch (error) {
                console.error("Error fetching transaction data:", error);
                setChartData([]);
            }
        };

        fetchTransactionData();
    }, []);

    // Helper to convert month number to short name
    const getMonthName = (monthNumber) => {
        const monthIndex = parseInt(monthNumber, 10) - 1;
        return new Date(0, monthIndex).toLocaleString("default", { month: "short" });
    };

    return (
        <ResponsiveBar
            data={chartData}
            keys={["legitimate", "flagged", "blocked"]}
            indexBy="month"
            margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={({ id }) => {
                if (id === "legitimate") return "#4caf50"; // Green
                if (id === "flagged") return "#fdd835";    // Yellow
                if (id === "blocked") return "#f44336";    // Red
                return "#ccc";
            }}
            borderColor={{
                from: "color",
                modifiers: [["darker", 1.6]],
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: isDashboard ? undefined : "Month",
                legendPosition: "middle",
                legendOffset: 32,
                tickValues: chartData.map(d => d.month),
                tickFormat: (d) => getMonthName(d),
                tickColor: "#ccc", // Light gray for dark mode
                legendTextColor: "#ccc"
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: isDashboard ? undefined : "Transactions",
                legendPosition: "middle",
                legendOffset: -40,
                tickColor: "#ccc",
                legendTextColor: "#ccc"
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{
                from: "color",
                modifiers: [["darker", 1.6]],
            }}
            legends={[
                {
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
                    effects: [
                        {
                            on: "hover",
                            style: {
                                itemOpacity: 1,
                            },
                        },
                    ],
                    textColor: "#ccc", // Light text for dark mode
                },
            ]}
            tooltip={({ id, value, indexValue }) => (
                <div
                    style={{
                        padding: "6px 12px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "4px",
                        fontSize: "0.9rem",
                    }}
                >
                    <strong>{id.charAt(0).toUpperCase() + id.slice(1)}</strong> — {value} transactions in{" "}
                    <strong>{getMonthName(indexValue)}</strong>
                </div>
            )}
            theme={{
                axis: {
                    ticks: {
                        text: {
                            fill: "#ccc",
                        },
                    },
                    legend: {
                        text: {
                            fill: "#ccc",
                        },
                    },
                },
                legends: {
                    text: {
                        fill: "#ccc",
                    },
                },
            }}
            role="application"
            ariaLabel="Transaction status by month"
            barAriaLabel={(e) =>
                `${e.id}: ${e.formattedValue} in ${getMonthName(e.indexValue)}`
            }
        />
    );
};

export default BarChart;
