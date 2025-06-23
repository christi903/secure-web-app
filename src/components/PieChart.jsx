import { ResponsivePie } from "@nivo/pie";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const PieChart = ({ isDashboard = false }) => {
    const [pieData, setPieData] = useState([]);
    const [totalTransactions, setTotalTransactions] = useState(0);

    useEffect(() => {
        const fetchTransactionData = async () => {
            try {
                const { data, error } = await supabase
                    .from("transactions")
                    .select("status");

                if (error) throw error;

                // Initialize counts
                const statusCounts = {
                    legitimate: 0,
                    flagged: 0,
                    blocked: 0
                };

                // Count transactions by status (case-insensitive)
                data.forEach((transaction) => {
                    const status = transaction.status.toLowerCase();
                    if (status === "legitimate") statusCounts.legitimate++;
                    else if (status === "flagged") statusCounts.flagged++;
                    else if (status === "blocked") statusCounts.blocked++;
                });

                // Format data for pie chart with enhanced colors
                const formattedData = [
                    {
                        id: "legitimate",
                        label: "Legitimate",
                        value: statusCounts.legitimate,
                        color: "#4CAF50" // Vibrant green
                    },
                    {
                        id: "flagged",
                        label: "Flagged",
                        value: statusCounts.flagged,
                        color: "#FFC107" // Bright yellow
                    },
                    {
                        id: "blocked",
                        label: "Blocked",
                        value: statusCounts.blocked,
                        color: "#F44336" // Strong red
                    }
                ].filter(item => item.value > 0);

                setPieData(formattedData);
                setTotalTransactions(data.length);
            } catch (error) {
                console.error("Error fetching transaction data:", error);
                setPieData([]);
                setTotalTransactions(0);
            }
        };

        fetchTransactionData();
    }, []);

    if (pieData.length === 0) {
        return (
            <div style={{
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#ccc",
                backgroundColor: isDashboard ? "transparent" : "#1e1e1e",
                borderRadius: "8px",
                padding: "20px"
            }}>
                {totalTransactions === 0 ? 
                    "No transactions found" : 
                    "No transactions matched the status criteria"}
            </div>
        );
    }

    return (
        <div style={{ 
            height: "100%",
            width: "100%",
            backgroundColor: isDashboard ? "transparent" : "#1e1e1e",
            borderRadius: "8px",
            position: "relative",
            padding: isDashboard ? "0" : "16px"
        }}>
            {/* Title */}
            <div style={{
                textAlign: "center",
                color: "#fff",
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "20px",
                paddingTop: "10px"
            }}>
                Transactions summary in pie-chart format
            </div>

            {/* Total transactions indicator */}
            <div style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                backgroundColor: "#333",
                color: "#fff",
                padding: "5px 10px",
                borderRadius: "4px",
                fontSize: "0.8rem",
                fontWeight: "bold"
            }}>
                Total: {totalTransactions} transactions
            </div>

            <ResponsivePie
    data={pieData}
    colors={{ datum: 'data.color' }} // <-- Correct color mapping
    margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
    innerRadius={isDashboard ? 0.5 : 0.6}
    padAngle={0.7}
    cornerRadius={3}
    activeOuterRadiusOffset={8}
    borderWidth={1}
    borderColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
    }}
    arcLinkLabelsSkipAngle={10}
    arcLinkLabelsTextColor="#ccc"
    arcLinkLabelsThickness={2}
    arcLinkLabelsColor={{ from: "color" }}
    arcLabelsSkipAngle={10}
    arcLabelsTextColor={{
        from: "color",
        modifiers: [["darker", 2]]
    }}
    theme={{
        tooltip: {
            container: {
                background: "#1e1e1e",
                color: "#fff",
                fontSize: '14px',
                border: "1px solid #444",
                borderRadius: "4px"
            }
        },
        labels: {
            text: {
                fontSize: '12px',
                fontWeight: 'bold'
            }
        }
    }}
    legends={[
        {
            anchor: "bottom",
            direction: isDashboard ? "column" : "row",
            justify: false,
            translateX: 0,
            translateY: isDashboard ? 56 : 50,
            itemsSpacing: isDashboard ? 5 : 10,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: "#ccc",
            itemDirection: "left-to-right",
            itemOpacity: 0.85,
            symbolSize: 18,
            symbolShape: "circle",
            effects: [
                {
                    on: "hover",
                    style: {
                        itemTextColor: "#fff",
                        itemOpacity: 1
                    },
                },
            ],
        },
    ]}
    tooltip={({ datum }) => (
        <div style={{
            padding: "6px 12px",
            background: "#1e1e1e",
            color: "#fff",
            border: "1px solid #444",
            borderRadius: "4px",
            fontSize: "0.9rem",
        }}>
            <strong>{datum.label}</strong>: {datum.value} transactions
            <br />
            ({((datum.value / totalTransactions) * 100).toFixed(1)}%)
        </div>
    )}
    motionConfig="gentle"
/>

        </div>
    );
};

export default PieChart;