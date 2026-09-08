import React from "react";
import { Box, Typography, Button } from "@mui/material";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { motion } from "framer-motion";

/**
 * EmptyState: Componente unificado para estados vacíos (HU-30).
 * Soporta icono personalizado, título, descripción y botón de acción opcional.
 */
export function EmptyState({
  icon: IconComponent = InboxOutlinedIcon,
  title = "No se encontraron resultados",
  description = "No hay elementos para mostrar en este momento.",
  actionLabel,
  onAction,
  sx = {},
}) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      sx={{
        py: { xs: 5, md: 7 },
        px: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        bgcolor: "background.paper",
        borderRadius: "16px",
        border: "1px dashed #CBD5E1",
        width: "100%",
        mx: "auto",
        ...sx,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          bgcolor: "action.hover",
          color: "text.secondary",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <IconComponent sx={{ fontSize: 32 }} />
      </Box>

      <Typography
        variant="h6"
        sx={{
          color: "text.primary",
          fontWeight: 700,
          fontSize: "1.1rem",
          mb: 0.5,
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          maxWidth: 400,
          mb: actionLabel && onAction ? 2.5 : 0,
        }}
      >
        {description}
      </Typography>

      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          sx={{
            borderRadius: "10px",
            px: 3,
            py: 1,
            fontWeight: 600,
            textTransform: "none",
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}

export default EmptyState;
