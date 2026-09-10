import React from "react";
import { Paper, Box, Typography } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

export function MobileBottomNav({ activeNav = 0, onChange }) {
  const items = [
    { label: "Inicio", icon: <HomeOutlinedIcon /> },
    { label: "Historial", icon: <HistoryOutlinedIcon /> },
    { label: "Perfil", icon: <PersonOutlineOutlinedIcon /> },
    { label: "Ajustes", icon: <SettingsOutlinedIcon /> },
  ];

  return (
    <Paper
      component="nav"
      role="navigation"
      aria-label="Navegación móvil inferior"
      elevation={4}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: "block", md: "none" },
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
        zIndex: 1300,
        height: 68,
      }}
    >
      <Box
        role="tablist"
        aria-label="Pestañas principales"
        sx={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "space-around", px: 1 }}
      >
        {items.map((item, idx) => {
          const isActive = activeNav === idx;
          return (
            <Box
              key={item.label}
              role="tab"
              aria-selected={isActive}
              aria-label={item.label}
              tabIndex={0}
              onClick={() => onChange && onChange(null, idx)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange && onChange(null, idx);
                }
              }}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flex: 1,
                py: 0.5,
                borderRadius: "8px",
                "&:focus-visible": {
                  outline: "2px solid #38BDF8 !important",
                  outlineOffset: "1px",
                },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 32,
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: isActive ? "rgba(0, 86, 210, 0.15)" : "transparent",
                  color: isActive ? "primary.main" : "text.secondary",
                  border: isActive ? "1px solid rgba(0, 86, 210, 0.3)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                {item.icon}
              </Box>

              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "primary.main" : "text.secondary",
                  mt: 0.25,
                }}
              >
                {item.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}

export default MobileBottomNav;
