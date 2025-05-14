import { useState, useEffect } from "react";
import LineChart from "../../components/LineChart";
import BarChart from "../../components/BarChart";
import GeographyChart from "../../components/GeographyChart";
import StatBox from "../../components/StatBox";
import ProgressCircle from "../../components/ProgressCircle";
import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import VerifiedIcon from '@mui/icons-material/Verified';
import FlagCircleIcon from '@mui/icons-material/FlagCircle';
import BlockIcon from '@mui/icons-material/Block';
import PaidIcon from '@mui/icons-material/Paid';
import Header from "../../components/Header";
import { supabase } from "../../supabaseClient";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // State for transaction statistics
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

  // State for recent transactions
  const [recentTransactions, setRecentTransactions] = useState([]);
  
  // State for yearly total (for the line chart)
  const [yearlyTotal, setYearlyTotal] = useState(0);
  
  // State for monthly data (for bar chart)
  const [monthlyData, setMonthlyData] = useState([]);
  
  // State for geographic data
  const [geoData, setGeoData] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState({
    stats: true,
    recent: true,
    charts: true
  });

  // Calculate progress values for the stat boxes
  const calculateProgress = (value, total) => {
    if (total === 0) return 0;
    return Math.min(Math.max(value / total, 0), 1).toFixed(2);
  };

  // Fetch transaction statistics
  useEffect(() => {
    const fetchTransactionStats = async () => {
      try {
        setLoading(prev => ({ ...prev, stats: true }));
        
        // Get total count of transactions
        const { count: totalCount, error: totalError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true });
          
        if (totalError) throw totalError;
        
        // Get count of legit transactions
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

        // Fetch previous period data for growth calculation
        // This is a simplified approach - you'd typically compare with last month/quarter
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        const { count: prevTotal, error: prevTotalError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .lt('created_at', oneMonthAgo.toISOString());
          
        if (prevTotalError) throw prevTotalError;
        
        // Calculate growth percentages
        const calculateGrowth = (current, previous) => {
          if (!previous) return "+0%";
          const growth = ((current - previous) / previous) * 100;
          return growth > 0 ? `+${growth.toFixed(0)}%` : `${growth.toFixed(0)}%`;
        };
        
        const totalGrowth = calculateGrowth(totalCount, prevTotal);
        
        // For simplicity, using the same growth calculation method for all stats
        // In a real app, you'd fetch previous period data for each category
        const legitGrowth = calculateGrowth(legitCount, prevTotal * 0.9); // Assuming 90% legitimate in previous period
        const flaggedGrowth = calculateGrowth(flaggedCount, prevTotal * 0.09); // Assuming 9% flagged in previous period
        const blockedGrowth = calculateGrowth(blockedCount, prevTotal * 0.01); // Assuming 1% blocked in previous period
        
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
        setLoading(prev => ({ ...prev, stats: false }));
      }
    };

    fetchTransactionStats();
  }, []);

  // Fetch recent transactions
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        setLoading(prev => ({ ...prev, recent: true }));
        
        // Debug: Check if we have any transactions
        const { count, error: countError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true });
          
        if (countError) throw countError;
        console.log(`Total transactions in database: ${count}`);
        
        // Fetch the transactions with all fields
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) throw error;
        console.log("Fetched transactions:", data);
        
        // Transform data to match the expected format
        const formattedTransactions = data.map(tx => ({
          txId: tx.id || tx.transaction_id, // Try both possible field names
          user: tx.user_id || tx.user || "User", // Try different possible field names or use default
          date: tx.created_at ? new Date(tx.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
          cost: tx.amount ? tx.amount.toFixed(2) : "0.00",
          status: tx.status
        }));
        
        console.log("Formatted transactions:", formattedTransactions);
        setRecentTransactions(formattedTransactions);
      } catch (error) {
        console.error("Error fetching recent transactions:", error);
        // Set empty array to avoid undefined errors
        setRecentTransactions([]);
      } finally {
        setLoading(prev => ({ ...prev, recent: false }));
      }
    };

    fetchRecentTransactions();
  }, []);

  // Fetch data for charts
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(prev => ({ ...prev, charts: true }));
        
        // Fetch monthly transaction data for bar chart
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1).toISOString();
        const endOfYear = new Date(currentYear, 11, 31).toISOString();
        
        const { data: monthlyData, error: monthlyError } = await supabase
          .from('transactions')
          .select('created_at, amount')
          .gte('created_at', startOfYear)
          .lte('created_at', endOfYear);
          
        if (monthlyError) throw monthlyError;
        
        // Process monthly data
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
        
        // Fetch geographic data
        const { data: geoData, error: geoError } = await supabase
          .from('transactions')
          .select('location, amount')
          .not('location', 'is', null);
          
        if (geoError) throw geoError;
        
        // Process geographic data
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

  // Handle report download
  const handleDownloadReport = () => {
    // Implement download functionality here
    console.log("Downloading report...");
    // This could be an API call to generate a report or a direct export function
    alert("Report download started!");
  };

  return (
    <Box m="20px">
      {/* HEADER */}
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

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* 🟨🟨🟨🟨🟨🟨 ROW 1 🟨🟨🟨🟨🟨🟨 */}
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

        {/* 🟨🟨🟨🟨🟨🟨 ROW 2 🟨🟨🟨🟨🟨🟨 */}
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
          {loading.recent ? (
            <Box p="15px">
              <Typography color={colors.grey[100]}>Loading recent transactions...</Typography>
            </Box>
          ) : recentTransactions.length === 0 ? (
            <Box p="15px">
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

        {/* 🟨🟨🟨🟨🟨🟨 ROW 3 🟨🟨🟨🟨🟨🟨 */}
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