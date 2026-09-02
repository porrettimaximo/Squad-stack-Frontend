import React from "react";
import { Paper, BottomNavigation, BottomNavigationAction } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

export function MobileBottomNav({ activeNav = 0, onChange }) {
  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: "block", md: "none" },
        borderTop: "1px solid #E2E8F0",
        zIndex: 1200,
      }}
      elevation={3}
    >
      <BottomNavigation
        value={activeNav}
        onChange={onChange}
        showLabels
        sx={{
          height: 64,
          "& .MuiBottomNavigationAction-root": {
            color: "#64748B",
            fontWeight: 500,
            fontSize: "0.75rem",
            "&.Mui-selected": {
              color: "#0056D2",
              fontWeight: 700,
            },
          },
        }}
      >
        <BottomNavigationAction label="Home" icon={<HomeOutlinedIcon />} />
        <BottomNavigationAction label="History" icon={<HistoryOutlinedIcon />} />
        <BottomNavigationAction label="Profile" icon={<PersonOutlineOutlinedIcon />} />
        <BottomNavigationAction label="Settings" icon={<SettingsOutlinedIcon />} />
      </BottomNavigation>
    </Paper>
  );
}

export default MobileBottomNav;
