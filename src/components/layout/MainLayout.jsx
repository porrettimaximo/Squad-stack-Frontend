import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

export const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
        <AppBar 
        position="static"
        elevation={0}
        sx={{
            backgroundColor: "#001639",
            borderBottom: "1px solid #E2E8F0"
        }}>
            <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 } }}>
                <Typography 
                variante="h6" 
                sx={{ 
                    fontWeight:800,
                    letterSpacing: "-0.03em",
                    color: "#FFFFFF",
                    cursor: "pointer" 
                    }}
                    onClick={() => navigate("/dashboard")}>
                    DigitalArs
                </Typography>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                    <Button 
                    color="inherit" 
                    onClick={() => navigate("/dashboard")}
                    sx={{ textTransform: "none", fontWeight: 600, color: "#94A3B8", "&:hover": { color: "#FFFFFF" } }}>
                        Inicio
                    </Button>
                    <Button 
                    color="inherit" 
                    onClick={() => navigate("/deposit")}
                    sx={{ textTransform: "none", fontWeight: 600, color: "#94A3B8", "&:hover": { color: "#FFFFFF" } }}>
                        Depositar
                    </Button>
                    <Button 
                    color="inherit" 
                    onClick={() => navigate("/transfer")}
                    sx={{ textTransform: "none", fontWeight: 600, color: "#94A3B8", "&:hover": { color: "#FFFFFF" } }}>
                        Transferir
                    </Button>

                    {/*Exclusivo para Admin */}
                    {user?.role === "Admin" && (
                        <Button 
                        color ="inherit" 
                        onClick={() => navigate("/admin")}
                        sx={{
                            textTransform:"none",
                            fontWeight: 600,
                            color: "#38BDF8",
                            "&:hover": { color: "#7DD3FC" }
                        }}>
                            Panel Admin
                        </Button>
                    )}

                    <Button 
                    variant="contained" 
                    onClick={handleLogout}
                    sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        backgroundColor: "#EF4444",
                        borderRadius: "10px",
                        ml: 1,
                        "&:hover": { backgroundColor: "#DC2626"}
                    }}>
                        Cerrar Sesión
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>

        <Box component="main" sx={{ p: { xs: 2, md: 4 } }}>
            <Outlet/>
        </Box>
    </Box>
  );
};

export default MainLayout;