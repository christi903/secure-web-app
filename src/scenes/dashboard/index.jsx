// Dashboard.jsx
import { useState, useEffect } from "react"; // React hooks for state and side effects
import LineChart from "../../components/LineChart"; // Component for line chart visualization
import BarChart from "../../components/BarChart"; // Component for bar chart visualization
import GeographyChart from "../../components/GeographyChart"; // Component for geographic map visualization
import StatBox from "../../components/StatBox"; // Component for displaying statistics
import ProgressCircle from "../../components/ProgressCircle"; // Component for circular progress indicator
import { Box, Button, IconButton, Typography, useTheme } from "@mui/material"; // Material UI components
import { tokens } from "../../theme"; // Theme colors configuration
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined"; // Download icon from Material Icons
import VerifiedIcon from '@mui/icons-material/Verified'; // Verified transaction icon
import FlagCircleIcon from '@mui/icons-material/FlagCircle'; // Flagged transaction icon
import BlockIcon from '@mui/icons-material/Block'; // Blocked transaction icon
import PaidIcon from '@mui/icons-material/Paid'; // Payment transaction icon
import Header from "../../components/Header"; // Custom header component
import { supabase } from "../../supabaseClient"; // Supabase client for database operations

const Dashboard = () => {
  const theme = useTheme(); // Access MUI theme for styling
  const colors = tokens(theme.palette.mode); // Get theme colors based on current mode (light/dark)

  // State for transaction statistics with initial values
  const [transactionStats, setTransactionStats] = useState({
    total: 0, // Total number of transactions
    legit: 0, // Number of legitimate transactions
    flagged: 0, // Number of flagged transactions
    blocked: 0, // Number of blocked transactions
    totalGrowth: "+0%", // Percentage growth of total transactions
    legitGrowth: "+0%", // Percentage growth of legitimate transactions
    flaggedGrowth: "+0%", // Percentage growth of flagged transactions
    blockedGrowth: "+0%" // Percentage growth of blocked transactions
  });

  // State for recent transactions data
  const [recentTransactions, setRecentTransactions] = useState([]);
  // State for yearly total transactions count
  const [yearlyTotal, setYearlyTotal] = useState(0);
  // State for monthly transaction data
  const [monthlyData, setMonthlyData] = useState([]);
  // State for geographic transaction data
  const [geoData, setGeoData] = useState([]);
  // State for loading status of different data sections
  const [loading, setLoading] = useState({
    stats: true, // Loading state for statistics
    recent: true, // Loading state for recent transactions
    charts: true // Loading state for charts data
  });

  /**
   * Calculates progress percentage for stat boxes
   * @param {number} value - Current value
   * @param {number} total - Total possible value
   * @returns {number} - Progress percentage between 0 and 1
   */
  const calculateProgress = (value, total) => {
    if (total === 0) return 0; // Prevent division by zero
    return Math.min(Math.max(value / total, 0), 1).toFixed(2); // Clamp between 0-1
  };

  // Fetch transaction statistics from Supabase database
  useEffect(() => {
    const fetchTransactionStats = async () => {
      try {
        setLoading(prev => ({ ...prev, stats: true })); // Set loading state to true
        
        // Get total count of all transactions
        const { count: totalCount, error: totalError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true });
          
        if (totalError) throw totalError;
        
        // Get count of legitimate transactions
        const { count: legitCount, error: legitError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'LEGITIMATE');
          
        if (legitError) throw legitError;
        
        // Get count of flagged transactions
        const { count: flaggedCount, error: flaggedError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'FLAGGED');
          
        if (flaggedError) throw flaggedError;
        
        // Get count of blocked transactions
        const { count: blockedCount, error: blockedError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'BLOCKED');
          
        if (blockedError) throw blockedError;

        // Calculate growth percentages by comparing with previous period
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        // Get count of transactions from previous period
        const { count: prevTotal, error: prevTotalError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .lt('created_at', oneMonthAgo.toISOString());
          
        if (prevTotalError) throw prevTotalError;
        
        /**
         * Calculates growth percentage between current and previous values
         * @param {number} current - Current period value
         * @param {number} previous - Previous period value
         * @returns {string} - Formatted growth percentage with +/-
         */
        const calculateGrowth = (current, previous) => {
          if (!previous) return "+0%";
          const growth = ((current - previous) / previous) * 100;
          return growth > 0 ? `+${growth.toFixed(0)}%` : `${growth.toFixed(0)}%`;
        };
        
        // Calculate growth percentages for different transaction types
        const totalGrowth = calculateGrowth(totalCount, prevTotal);
        const legitGrowth = calculateGrowth(legitCount, prevTotal * 0.9); // Estimated previous legit
        const flaggedGrowth = calculateGrowth(flaggedCount, prevTotal * 0.09); // Estimated previous flagged
        const blockedGrowth = calculateGrowth(blockedCount, prevTotal * 0.01); // Estimated previous blocked
        
        // Update state with fetched data
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
        
        // Also update yearly total for the line chart
        setYearlyTotal(totalCount || 0);
      } catch (error) {
        console.error("Error fetching transaction stats:", error);
      } finally {
        setLoading(prev => ({ ...prev, stats: false })); // Set loading state to false
      }
    };

    fetchTransactionStats();
  }, []); // Empty dependency array means this runs once on component mount

  // Fetch recent transactions from Supabase
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        setLoading(prev => ({ ...prev, recent: true }));
        
        // Debug: Check total transaction count
        const { count, error: countError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true });
          
        if (countError) throw countError;
        console.log(`Total transactions in database: ${count}`);
        
        // Fetch the 10 most recent transactions
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) throw error;
        console.log("Fetched transactions:", data);
        
        // Transform data to match expected format
        const formattedTransactions = data.map(tx => ({
          txId: tx.id || tx.transaction_id,
          user: tx.user_id || tx.user || "User",
          date: tx.created_at ? new Date(tx.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
          cost: tx.amount ? tx.amount.toFixed(2) : "0.00",
          status: tx.status
        }));
        
        console.log("Formatted transactions:", formattedTransactions);
        setRecentTransactions(formattedTransactions);
      } catch (error) {
        console.error("Error fetching recent transactions:", error);
        setRecentTransactions([]); // Set empty array on error
      } finally {
        setLoading(prev => ({ ...prev, recent: false }));
      }
    };

    fetchRecentTransactions();
  }, []);

  // Fetch data for charts from Supabase
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(prev => ({ ...prev, charts: true }));
        
        // Fetch monthly transaction data for current year
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1).toISOString();
        const endOfYear = new Date(currentYear, 11, 31).toISOString();
        
        const { data: monthlyData, error: monthlyError } = await supabase
          .from('transactions')
          .select('created_at, amount')
          .gte('created_at', startOfYear)
          .lte('created_at', endOfYear);
          
        if (monthlyError) throw monthlyError;
        
        // Process monthly data into totals per month
        const monthlyTotals = Array(12).fill(0); // Initialize array for 12 months
        monthlyData?.forEach(tx => {
          const month = new Date(tx.created_at).getMonth();
          monthlyTotals[month] += tx.amount || 0;
        });
        
        // Format monthly data for bar chart
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedMonthlyData = monthlyTotals.map((total, index) => ({
          month: monthNames[index],
          "Transaction Amount": total
        }));
        
        setMonthlyData(formattedMonthlyData);
        
        // Fetch geographic transaction data
        const { data: geoData, error: geoError } = await supabase
          .from('transactions')
          .select('location, amount')
          .not('location', 'is', null);
          
        if (geoError) throw geoError;
        
        // Process geographic data into counts by location
        const geoMap = {};
        geoData?.forEach(tx => {
          if (!tx.location) return;
          if (!geoMap[tx.location]) {
            geoMap[tx.location] = 0;
          }
          geoMap[tx.location] += 1;
        });
        
        // Format geographic data for map chart
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

  /**
   * Handles report download action
   */
  const handleDownloadReport = () => {
    console.log("Downloading report...");
    alert("Report download started!"); // Placeholder for actual download functionality
  };

  return (
    <Box m="20px">
      {/* HEADER SECTION */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
        <Box>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
            onClick={handleDownloadReport}
          >
            <DownloadOutlinedIcon sx={{ mr: "10px" }} />
            Download Reports
          </Button>
        </Box>
      </Box>

      {/* GRID & CHARTS SECTION */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1: STAT BOXES */}
        {/* Total Transactions Stat Box */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
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
          />
        </Box>

        {/* Legit Transactions Stat Box */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
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
          />
        </Box>

        {/* Flagged Transactions Stat Box */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
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
          />
        </Box>

        {/* Blocked Transactions Stat Box */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
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
          />
        </Box>

        {/* ROW 2: LINE CHART AND RECENT TRANSACTIONS */}
        {/* Line Chart showing yearly transactions */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex "
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Total Transactions Per Year
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                {loading.stats ? "Loading..." : yearlyTotal.toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <IconButton onClick={handleDownloadReport}>
                <DownloadOutlinedIcon
                  sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
                />
              </IconButton>
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart isDashboard={true} />
          </Box>
        </Box>

        {/* Recent Transactions List */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Recent Transactions
            </Typography>
          </Box>
          {/* Loading state for recent transactions */}
          {loading.recent ? (
            <Box p="15px">
              <Typography color={colors.grey[100]}>Loading recent transactions...</Typography>
            </Box>
          ) : recentTransactions.length === 0 ? (
            <Box p="15px">
              <Typography color={colors.grey[100]}>No recent transactions found.</Typography>
            </Box>
          ) : (
            // Display list of recent transactions
            recentTransactions.map((transaction, i) => (
              <Box
                key={`${transaction.txId}-${i}`}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                borderBottom={`4px solid ${colors.primary[500]}`}
                p="15px"
              >
                <Box>
                  <Typography
                    color={colors.greenAccent[500]}
                    variant="h5"
                    fontWeight="600"
                  >
                    {transaction.txId}
                  </Typography>
                  <Typography color={colors.grey[100]}>
                    {transaction.user}
                  </Typography>
                </Box>
                <Box color={colors.grey[100]}>{transaction.date}</Box>
                <Box
                  backgroundColor={colors.greenAccent[500]}
                  p="5px 10px"
                  borderRadius="4px"
                >
                  Tshs.{transaction.cost}
                </Box>
              </Box>
            ))
          )}
        </Box>

        {/* ROW 3: PROGRESS CIRCLE, BAR CHART AND GEOGRAPHY CHART */}
        {/* Transactions Summary with Progress Circle */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="30px"
        >
          <Typography variant="h5" fontWeight="600">
            Transactions Summary
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="25px"
          >
            <ProgressCircle 
              size="125" 
              progress={loading.stats ? 0 : transactionStats.legit / transactionStats.total} 
            />
            <Typography
              variant="h5"
              color={colors.greenAccent[500]}
              sx={{ mt: "15px" }}
            >
              {loading.stats 
                ? "Loading..." 
                : `${transactionStats.legit.toLocaleString()} Legit Transactions in a Year`}
            </Typography>
            <Typography>Includes Legit Transactions</Typography>
          </Box>
        </Box>

        {/* Monthly Transactions Bar Chart */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            Monthly Transactions
          </Typography>
          <Box height="250px" mt="-20px">
            <BarChart isDashboard={true} data={monthlyData} />
          </Box>
        </Box>

        {/* Geography Based Traffic Map */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="30px"
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ marginBottom: "15px" }}
          >
            Geography Based Traffic
          </Typography>
          <Box height="200px">
            <GeographyChart isDashboard={true} data={geoData} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;