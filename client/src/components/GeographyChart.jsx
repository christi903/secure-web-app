import { mockGeographyData as data } from "../data/mockData";
import { geoFeatures } from "../data/mockGeoFeatures";
import { ResponsiveChoropleth } from "@nivo/geo";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Typography } from "@mui/material";

const GeographyChart = ({ isDashboard = false }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    
    const modifiedData = data.map(item => {
        const highlightRegions = [
            'KEN', 'TZA', 'UGA', 'RWA', 'BDI', // East Africa
            'ZAF', 'NAM', 'BWA', 'ZWE',       // Southern Africa
            'NGA', 'GHA', 'SEN', 'CIV',        // West Africa
            'MEX',                             // Mexico
            'BRA',                             // Brazil
            'IND',                             // India
            'MDG'                              // Madagascar
        ];
        
        if (highlightRegions.includes(item.id)) {
            return {
                ...item,
                value: Math.floor(Math.random() * 500000) + 500000
            };
        }
        return {
            ...item,
            value: Math.floor(Math.random() * 100000)
        };
    });

    const customColors = [
        '#f0f9e8', '#bae4bc', '#7bccc4', '#43a2ca', '#0868ac',
        '#980043', '#dd1c77', '#fd8d3c', '#f03b20', '#bd0026'
    ];

    return (
        <div style={{ height: "100%", position: "relative" }}>
            {!isDashboard && (
                <Typography 
                    variant="h4" 
                    align="center" 
                    style={{ 
                        padding: "20px 0",
                        color: colors.grey[100],
                        fontWeight: "bold"
                    }}
                >
                    Fraud Detection System Heat Map
                </Typography>
            )}
            <ResponsiveChoropleth
                data={modifiedData}
                theme={{
                    axis: {
                        domain: {
                            line: {
                                stroke: colors.grey[100],
                            },
                        },
                        legend: {
                            text: {
                                fill: colors.grey[100],
                            },
                        },
                        ticks: {
                            line: {
                                stroke: colors.grey[100],
                                strokeWidth: 1,
                            },
                            text: {
                                fill: colors.grey[100],
                            },
                        },
                    },
                    legends: {
                        text: {
                            fill: colors.grey[100],
                        },
                    },
                }}
                features={geoFeatures.features}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                domain={[0, 1000000]}
                unknownColor="#666666"
                label="properties.name"
                valueFormat=".2s"
                projectionScale={isDashboard ? 40 : 120}
                projectionTranslation={isDashboard ? [0.5, 0.6] : [0.5, 0.55]}
                projectionRotation={[0, 0, 0]}
                borderWidth={1.5}
                borderColor="#ffffff"
                colors={customColors}
                // Removed enableGraticule and graticuleLineColor properties
                legends={
                    !isDashboard
                        ? [
                            {
                                anchor: "bottom-left",
                                direction: "column",
                                justify: true,
                                translateX: 20,
                                translateY: -100,
                                itemsSpacing: 0,
                                itemWidth: 94,
                                itemHeight: 18,
                                itemDirection: "left-to-right",
                                itemTextColor: colors.grey[100],
                                itemOpacity: 0.85,
                                symbolSize: 18,
                                effects: [
                                    {
                                        on: "hover",
                                        style: {
                                            itemTextColor: "#ffffff",
                                            itemOpacity: 1,
                                        },
                                    },
                                ],
                            },
                        ]
                        : undefined
                }
            />
        </div>
    );
};

export default GeographyChart;