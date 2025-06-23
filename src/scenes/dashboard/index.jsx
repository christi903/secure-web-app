// Dashboard.jsx
import { useState, useEffect } from "react"; // React hooks for state and side effects
import LineChart from "../../components/LineChart"; // Component for line chart visualization
import BarChart from "../../components/BarChart"; // Component for bar chart visualization
import GeographyChart from "../../components/GeographyChart"; // Component for geographic map visualization
import StatBox from "../../components/StatBox"; // Component for displaying statistics
import ProgressCircle from "../../components/ProgressCircle"; // Component for circular progress indicator
import { Box, IconButton, Typography, useTheme } from "@mui/material"; // Material UI components
import { tokens } from "../../theme"; // Theme colors configuration
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined"; // Download icon from Material Icons
import VerifiedIcon from '@mui/icons-material/Verified'; // Verified transaction icon
import FlagCircleIcon from '@mui/icons-material/FlagCircle'; // Flagged transaction icon
import BlockIcon from '@mui/icons-material/Block'; // Blocked transaction icon
import PaidIcon from '@mui/icons-material/Paid'; // Payment transaction icon
import Header from "../../components/Header"; // Custom header component
import { supabase } from "../../supabaseClient"; // Supabase client for database operations

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [transactionStats, setTransactionStats] = useState({
    total: 0,
    legit: 0,
    flagged: 0,
    blocked: 0,
    totalGrowth: "+0%",
    legitGrowth: "+0%",
    flaggedGrowth: "+0%",
    blockedGrowth: "+0%"
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [yearlyTotal, setYearlyTotal] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [geoData, setGeoData] = useState([]);
  const [loading, setLoading] = useState({
    stats: true,
    recent: true,
    charts: true
  });

  const calculateProgress = (value, total) => {
    if (total === 0) return 0;
    return Math.min(Math.max(value / total, 0), 1).toFixed(2);
  };

  useEffect(() => {
    const fetchTransactionStats = async () => {
      try {
        setLoading(prev => ({ ...prev, stats: true }));
        
        const { count: totalCount, error: totalError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true });
          
        if (totalError) throw totalError;
        
        const { count: legitCount, error: legitError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'LEGITIMATE');
          
        if (legitError) throw legitError;
        
        const { count: flaggedCount, error: flaggedError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'FLAGGED');
          
        if (flaggedError) throw flaggedError;
        
        const { count: blockedCount, error: blockedError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'BLOCKED');
          
        if (blockedError) throw blockedError;

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        const { count: prevTotal, error: prevTotalError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .lt('created_at', oneMonthAgo.toISOString());
          
        if (prevTotalError) throw prevTotalError;
        
        const calculateGrowth = (current, previous) => {
          if (!previous) return "+0%";
          const growth = ((current - previous) / previous) * 100;
          return growth > 0 ? `+${growth.toFixed(0)}%` : `${growth.toFixed(0)}%`;
        };
        
        const totalGrowth = calculateGrowth(totalCount, prevTotal);
        const legitGrowth = calculateGrowth(legitCount, prevTotal * 0.9);
        const flaggedGrowth = calculateGrowth(flaggedCount, prevTotal * 0.09);
        const blockedGrowth = calculateGrowth(blockedCount, prevTotal * 0.01);
        
        setTransactionStats({
          total: totalCount || 0,
          legit: legitCount || 0,
          flagged: flaggedCount || 0,
          blocked: blockedCount || 0,
          totalGrowth,
          legitGrowth,
          flaggedGrowth,
          blockedGrowth
        });
        
        setYearlyTotal(totalCount || 0);
      } catch (error) {
        console.error("Error fetching transaction stats:", error);
      } finally {
        setLoading(prev => ({ ...prev, stats: false }));
      }
    };

    fetchTransactionStats();
  }, []);

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        setLoading(prev => ({ ...prev, recent: true }));
        
        const { error: countError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true });
          
        if (countError) throw countError;
        
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) throw error;
        
        const formattedTransactions = data.map(tx => ({
          txId: tx.id || tx.transaction_id,
          user: tx.user_id || tx.user || "User",
          date: tx.created_at ? new Date(tx.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
          cost: tx.amount ? tx.amount.toFixed(2) : "0.00",
          status: tx.status
        }));
        
        setRecentTransactions(formattedTransactions);
      } catch (error) {
        console.error("Error fetching recent transactions:", error);
        setRecentTransactions([]);
      } finally {
        setLoading(prev => ({ ...prev, recent: false }));
      }
    };

    fetchRecentTransactions();
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(prev => ({ ...prev, charts: true }));
        
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1).toISOString();
        const endOfYear = new Date(currentYear, 11, 31).toISOString();
        
        const { data: monthlyData, error: monthlyError } = await supabase
          .from('transactions')
          .select('created_at, amount')
          .gte('created_at', startOfYear)
          .lte('created_at', endOfYear);
          
        if (monthlyError) throw monthlyError;
        
        const monthlyTotals = Array(12).fill(0);
        monthlyData?.forEach(tx => {
          const month = new Date(tx.created_at).getMonth();
          monthlyTotals[month] += tx.amount || 0;
        });
        
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedMonthlyData = monthlyTotals.map((total, index) => ({
          month: monthNames[index],
          "Transaction Amount": total
        }));
        
        setMonthlyData(formattedMonthlyData);
        
        const { data: geoData, error: geoError } = await supabase
          .from('transactions')
          .select('location, amount')
          .not('location', 'is', null);
          
        if (geoError) throw geoError;
        
        const geoMap = {};
        geoData?.forEach(tx => {
          if (!tx.location) return;
          if (!geoMap[tx.location]) {
            geoMap[tx.location] = 0;
          }
          geoMap[tx.location] += 1;
        });
        
        const formattedGeoData = Object.entries(geoMap).map(([id, value]) => ({
          id,
          value
        }));
        
        setGeoData(formattedGeoData);
        
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(prev => ({ ...prev, charts: false }));
      }
    };

    fetchChartData();
  }, []);

  return (
    <Box m={isSmallScreen ? "10px" : "20px"}>
      {/* HEADER SECTION */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title=" SECURE DASHBOARD" subtitle="Welcome to secure website application" />
      </Box>

      {/* GRID & CHARTS SECTION */}
      <Box
        display="grid"
        gridTemplateColumns={`repeat(${isSmallScreen ? 4 : 12}, 1fr)`}
        gridAutoRows={isSmallScreen ? "auto" : "140px"}
        gap={isSmallScreen ? "10px" : "20px"}
        sx={{
          '& > div': {
            minHeight: isSmallScreen ? 'auto' : '140px'
          }
        }}
      >
        {/* ROW 1: STAT BOXES */}
        <Box
          gridColumn={`span ${getGridColumnSpan(3, 4, 6)}`}
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={isSmallScreen ? "10px" : 0}
        >
          <StatBox
            title={loading.stats ? "Loading..." : transactionStats.total.toLocaleString()}
            subtitle="Total Transactions"
            progress={calculateProgress(transactionStats.total, transactionStats.total)}
            increase={transactionStats.totalGrowth}
            icon={
              <PaidIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
            isSmallScreen={isSmallScreen}
          />
        </Box>

        <Box
          gridColumn={`span ${getGridColumnSpan(3, 4, 6)}`}
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={isSmallScreen ? "10px" : 0}
        >
          <StatBox
            title={loading.stats ? "Loading..." : transactionStats.legit.toLocaleString()}
            subtitle="Legit Transactions"
            progress={calculateProgress(transactionStats.legit, transactionStats.total)}
            increase={transactionStats.legitGrowth}
            icon={
              <VerifiedIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
            isSmallScreen={isSmallScreen}
          />
        </Box>

        <Box
          gridColumn={`span ${getGridColumnSpan(3, 4, 6)}`}
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={isSmallScreen ? "10px" : 0}
        >
          <StatBox
            title={loading.stats ? "Loading..." : transactionStats.flagged.toLocaleString()}
            subtitle="Flagged Transactions"
            progress={calculateProgress(transactionStats.flagged, transactionStats.total)}
            increase={transactionStats.flaggedGrowth}
            icon={
              <FlagCircleIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
            isSmallScreen={isSmallScreen}
          />
        </Box>

        <Box
          gridColumn={`span ${getGridColumnSpan(3, 4, 6)}`}
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={isSmallScreen ? "10px" : 0}
        >
          <StatBox
            title={loading.stats ? "Loading..." : transactionStats.blocked.toLocaleString()}
            subtitle="Blocked Transactions"
            progress={calculateProgress(transactionStats.blocked, transactionStats.total)}
            increase={transactionStats.blockedGrowth}
            icon={
              <BlockIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
            isSmallScreen={isSmallScreen}
          />
        </Box>

        {/* ROW 2: LINE CHART AND RECENT TRANSACTIONS */}
        <Box
          gridColumn={`span ${getGridColumnSpan(8, 4, 8)}`}
          gridRow={`span ${isSmallScreen ? 1 : 2}`}
          backgroundColor={colors.primary[400]}
          p={isSmallScreen ? "10px" : 0}
        >
          <Box
            mt={isSmallScreen ? "10px" : "25px"}
            p={isSmallScreen ? "0 10px" : "0 30px"}
            display="flex"
            flexDirection={isSmallScreen ? "column" : "row"}
            justifyContent="space-between"
            alignItems={isSmallScreen ? "flex-start" : "center"}
            gap={isSmallScreen ? "10px" : 0}
          >
            <Box>
              <Typography
                variant={isSmallScreen ? "h6" : "h5"}
                fontWeight="600"
                color={colors.grey[100]}
              >
                Total Transactions Per Year
              </Typography>
              <Typography
                variant={isSmallScreen ? "h4" : "h3"}
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                {loading.stats ? "Loading..." : yearlyTotal.toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <IconButton>
                <DownloadOutlinedIcon
                  sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
                />
              </IconButton>
            </Box>
          </Box>
          <Box height={isSmallScreen ? "200px" : "250px"} m={isSmallScreen ? "0" : "-20px 0 0 0"}>
            <LineChart isDashboard={true} />
          </Box>
        </Box>

        <Box
          gridColumn={`span ${getGridColumnSpan(4, 4, 4)}`}
          gridRow={`span ${isSmallScreen ? 1 : 2}`}
          backgroundColor={colors.primary[400]}
          overflow="auto"
          p={isSmallScreen ? "10px" : 0}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p={isSmallScreen ? "10px" : "15px"}
          >
            <Typography color={colors.grey[100]} variant={isSmallScreen ? "h6" : "h5"} fontWeight="600">
              Recent Transactions
            </Typography>
          </Box>
          {loading.recent ? (
            <Box p={isSmallScreen ? "10px" : "15px"}>
              <Typography color={colors.grey[100]}>Loading recent transactions...</Typography>
            </Box>
          ) : recentTransactions.length === 0 ? (
            <Box p={isSmallScreen ? "10px" : "15px"}>
              <Typography color={colors.grey[100]}>No recent transactions found.</Typography>
            </Box>
          ) : (
            recentTransactions.map((transaction, i) => (
              <Box
                key={`${transaction.txId}-${i}`}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                borderBottom={`4px solid ${colors.primary[500]}`}
                p={isSmallScreen ? "10px" : "15px"}
                sx={{
                  flexDirection: isSmallScreen ? "column" : "row",
                  alignItems: isSmallScreen ? "flex-start" : "center",
                  gap: isSmallScreen ? "5px" : 0
                }}
              >
                <Box>
                  <Typography
                    color={colors.greenAccent[500]}
                    variant={isSmallScreen ? "body1" : "h5"}
                    fontWeight="600"
                  >
                    {transaction.txId}
                  </Typography>
                  <Typography color={colors.grey[100]} variant={isSmallScreen ? "body2" : "body1"}>
                    {transaction.user}
                  </Typography>
                </Box>
                <Box color={colors.grey[100]} variant={isSmallScreen ? "body2" : "body1"}>
                  {transaction.date}
                </Box>
                <Box
                  backgroundColor={colors.greenAccent[500]}
                  p="5px 10px"
                  borderRadius="4px"
                  sx={{
                    width: isSmallScreen ? "100%" : "auto",
                    textAlign: isSmallScreen ? "center" : "left",
                    mt: isSmallScreen ? "5px" : 0
                  }}
                >
                  Tshs.{transaction.cost}
                </Box>
              </Box>
            ))
          )}
        </Box>

        {/* ROW 3: PROGRESS CIRCLE, BAR CHART AND GEOGRAPHY CHART */}
        <Box
          gridColumn={`span ${getGridColumnSpan(4, 4, 6)}`}
          gridRow={`span ${isSmallScreen ? 1 : 2}`}
          backgroundColor={colors.primary[400]}
          p={isSmallScreen ? "10px" : "30px"}
        >
          <Typography variant={isSmallScreen ? "h6" : "h5"} fontWeight="600">
            Transactions Summary
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt={isSmallScreen ? "10px" : "25px"}
          >
            <ProgressCircle 
              size={isSmallScreen ? "80" : "125"} 
              progress={loading.stats ? 0 : transactionStats.legit / transactionStats.total} 
            />
            <Typography
              variant={isSmallScreen ? "body1" : "h5"}
              color={colors.greenAccent[500]}
              sx={{ mt: "15px", textAlign: "center" }}
            >
              {loading.stats 
                ? "Loading..." 
                : `${transactionStats.legit.toLocaleString()} Legit Transactions in a Year`}
            </Typography>
            <Typography variant={isSmallScreen ? "body2" : "body1"} align="center">
              Includes Legit Transactions
            </Typography>
          </Box>
        </Box>

        <Box
          gridColumn={`span ${getGridColumnSpan(4, 4, 6)}`}
          gridRow={`span ${isSmallScreen ? 1 : 2}`}
          backgroundColor={colors.primary[400]}
          p={isSmallScreen ? "10px" : 0}
        >
          <Typography
            variant={isSmallScreen ? "h6" : "h5"}
            fontWeight="600"
            sx={{ padding: isSmallScreen ? "10px 10px 0 10px" : "30px 30px 0 30px" }}
          >
            Monthly Transactions
          </Typography>
          <Box height={isSmallScreen ? "200px" : "250px"} mt={isSmallScreen ? "0" : "-20px"}>
            <BarChart isDashboard={true} data={monthlyData} />
          </Box>
        </Box>

        <Box
          gridColumn={`span ${getGridColumnSpan(4, 4, 12)}`}
          gridRow={`span ${isSmallScreen ? 1 : 2}`}
          backgroundColor={colors.primary[400]}
          p={isSmallScreen ? "10px" : "30px"}
        >
          <Typography
            variant={isSmallScreen ? "h6" : "h5"}
            fontWeight="600"
            sx={{ marginBottom: "15px" }}
          >
            Geography Based Traffic
          </Typography>
          <Box height={isSmallScreen ? "200px" : "200px"}>
            <GeographyChart isDashboard={true} data={geoData} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;