import React from "react";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Tab,
  Tabs,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

export function DashboardNavbar({ currentTab = 0, onTabChange, userName = "Alejandro Silva" }) {
  return (
    <Box
      sx={{
        bgcolor: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        position: "sticky",
        top: 0,
        zIndex: 1100,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 70,
          }}
        >
          {/* Lado Izquierdo: Tabs de Navegación (Desktop) */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Tabs
              value={currentTab}
              onChange={onTabChange}
              textColor="primary"
              indicatorColor="primary"
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "1rem",
                  minWidth: "auto",
                  px: { xs: 1.5, sm: 2.5 },
                  color: "#64748B",
                  "&.Mui-selected": {
                    color: "#0056D2",
                  },
                },
                "& .MuiTabs-indicator": {
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                  bgcolor: "#0056D2",
                },
              }}
            >
              <Tab label="Resumen" />
              <Tab label="Inversiones" />
              <Tab label="Préstamos" />
            </Tabs>
          </Box>

          {/* Lado Derecho: Notificaciones + Perfil */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2.5 } }}>
            {/* Campana de Notificación con punto rojo */}
            <IconButton
              sx={{
                bgcolor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                width: 42,
                height: 42,
                "&:hover": { bgcolor: "#F1F5F9" },
              }}
            >
              <Badge
                color="error"
                variant="dot"
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: "#EF4444",
                    top: 2,
                    right: 2,
                  },
                }}
              >
                <NotificationsNoneOutlinedIcon sx={{ color: "#334155", fontSize: "1.3rem" }} />
              </Badge>
            </IconButton>

            {/* Separador vertical */}
            <Box
              sx={{
                width: "1px",
                height: 30,
                bgcolor: "#E2E8F0",
                display: { xs: "none", sm: "block" },
              }}
            />

            {/* Perfil del Usuario */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                cursor: "pointer",
                p: 0.5,
                borderRadius: "12px",
                "&:hover": { bgcolor: "#F8FAFC" },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "#EEF4FF",
                  color: "#0056D2",
                  width: 38,
                  height: 38,
                }}
              >
                <PersonOutlineOutlinedIcon fontSize="small" />
              </Avatar>

              <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "left" }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}
                >
                  {userName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#64748B", fontWeight: 500, fontSize: "0.75rem" }}
                >
                  Mi Perfil
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default DashboardNavbar;
