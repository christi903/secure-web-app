import { ResponsivePie } from "@nivo/pie";
import { tokens } from "../theme";
import { useTheme } from "@mui/material";
import { Box, Typography } from "@mui/material";

const PieChart = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // Directly included data for mobile transactions
    const data = [
        {
            id: "Legit",
            label: "Legit",
            value: 75,
            color: "#4CAF50" // Green
        },
        {
            id: "Flagged",
            label: "Flagged",
            value: 20,
            color: "#FFC107" // Amber/Yellow
        },
        {
            id: "Blocked",
            label: "Blocked",
            value: 5,
            color: "#F44336" // Red
        }
    ];

    return (
        <Box 
            sx={{ 
                height: "1200px", // 3x original 400px
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <Typography 
                variant="h3" // Upgraded from h6 to h3
                sx={{ 
                    color: colors.grey[100],
                    mb: 6, // 3x original mb: 2
                    fontWeight: "bold",
                    fontSize: "2.5rem" // Explicit large font size
                }}
            >
                Mobile Transaction Status
            </Typography>
            <Box sx={{ 
                height: "900px", // 3x original 300px
                width: "900px", // 3x original 300px
                margin: "0 auto"
            }}>
                <ResponsivePie
                    data={data}
                    colors={["#4CAF50", "#FFC107", "#F44336"]}
                    margin={{ top: 60, right: 60, bottom: 180, left: 60 }} // 3x original margins
                    innerRadius={0.6}
                    padAngle={1}
                    cornerRadius={4}
                    activeOuterRadiusOffset={4}
                    borderWidth={1}
                    borderColor={{
                        from: "color",
                        modifiers: [["darker", 0.2]],
                    }}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor={colors.grey[100]}
                    arcLinkLabelsThickness={6} // Thicker links
                    arcLinkLabelsColor={{ from: "color" }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor="#ffffff"
                    arcLabelsTextSize={36} // 3x default size
                    theme={{
                        tooltip: {
                            container: {
                                background: colors.primary[400],
                                color: colors.grey[100],
                                fontSize: '24px' // 3x original
                            }
                        },
                        labels: {
                            text: {
                                fontSize: '24px' // 3x original
                            }
                        }
                    }}
                    legends={[
                        {
                            anchor: "bottom",
                            direction: "row",
                            justify: false,
                            translateX: 0,
                            translateY: 120, // 3x original
                            itemsSpacing: 30, // 3x original
                            itemWidth: 240, // 3x original
                            itemHeight: 42, // 3x original
                            itemTextColor: colors.grey[100],
                            itemDirection: "left-to-right",
                            itemOpacity: 1,
                            symbolSize: 42, // 3x original
                            symbolShape: "circle",
                            effects: [
                                {
                                    on: "hover",
                                    style: {
                                        itemTextColor: "#fff",
                                    },
                                },
                            ],
                        },
                    ]}
                    motionConfig="default"
                />
            </Box>
        </Box>
    );
};

export default PieChart;