import AccordionSummary from "@mui/material/AccordionSummary"; // Accordion header
import AccordionDetails from "@mui/material/AccordionDetails"; // Accordion content
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"; // Expand icon
import Typography from "@mui/material/Typography"; // Text component
import Accordion from "@mui/material/Accordion"; // Accordion component
import { Box, useTheme } from "@mui/material"; // Layout components
import { tokens } from "../../theme"; // Theme colors
import Header from "../../components/Header"; // Custom header component

const FAQ = () => {
  const theme = useTheme(); // Access MUI theme
  const colors = tokens(theme.palette.mode); // Get theme colors

  // FAQ data with questions and answers
  const faqItems = [
    {
      question: "What types of fraud do you detect in mobile apps?",
      answer: "Our system detects various types of mobile fraud including fake account creation, credential stuffing, payment fraud, promo abuse, device spoofing, and SIM swapping attempts. We use behavioral biometrics and device fingerprinting to identify suspicious patterns."
    },
    {
      question: "How do you protect against account takeover attacks?",
      answer: "We employ multi-factor authentication, anomaly detection in login patterns, and real-time monitoring of account activity. Suspicious logins trigger additional verification steps or temporary account locks."
    },
    {
      question: "Why am I getting locked out of my account frequently?",
      answer: "Frequent lockouts may occur due to multiple failed login attempts, logging in from new devices/locations, or using VPNs. This is a security measure to prevent unauthorized access. Contact support if this happens unexpectedly."
    },
    {
      question: "What should I do if I suspect fraudulent activity on my account?",
      answer: "Immediately change your password, enable two-factor authentication, and contact our support team. Review recent activity in your account settings and revoke access to any unrecognized devices."
    },
    {
      question: "How does your fraud detection system work during login?",
      answer: "Our system analyzes hundreds of signals including device characteristics, network information, typing patterns, and location data to assess login risk. High-risk logins require additional verification."
    },
    {
      question: "What's the difference between fraud prevention and detection?",
      answer: "Prevention stops fraud before it happens (like strong authentication), while detection identifies and responds to ongoing fraudulent activity. We use both approaches for comprehensive protection."
    },
    {
      question: "Why does the app sometimes ask for additional verification?",
      answer: "Additional verification is triggered by unusual activity like logging in from a new country, using an emulator, or showing behavior patterns associated with bots. This helps protect your account from unauthorized access."
    },
    {
      question: "How can I make my account more secure?",
      answer: "Use a strong unique password, enable two-factor authentication, keep your app updated, avoid public Wi-Fi for sensitive actions, and regularly review your account activity."
    },
    {
      question: "What are the signs that my device might be compromised?",
      answer: "Warning signs include unexpected password reset emails, apps you didn't install, battery draining quickly, or your device running slowly. Run security scans and consider factory reset if suspicious."
    },
    {
      question: "How quickly do you respond to new fraud threats?",
      answer: "Our security team continuously monitors for emerging threats. New fraud patterns are typically identified and mitigated within hours, with updates pushed to our detection systems in real-time."
    }
  ];

  return (
    <Box m="20px">
      {/* Page header */}
      <Header title="FAQ" subtitle="Frequently Asked Questions Page" />

      {/* FAQ items as expandable accordions */}
      {faqItems.map((item, index) => (
        <Accordion key={index} defaultExpanded={index === 0}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            {/* Question with colored text */}
            <Typography color={colors.greenAccent[500]} variant="h5">
              {item.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* Answer text */}
            <Typography>
              {item.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default FAQ;