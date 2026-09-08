import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import slideDeposit from "../../assets/carousel/slide_deposit.jpg";
import slideHistory from "../../assets/carousel/slide_history.jpg";
import slideTransfer from "../../assets/carousel/slide_transfer.jpg";
import slideInvestments from "../../assets/carousel/slide_investments.png";

const INTERVAL = 5000;

export function ImageCarousel({ borderRadius = "20px", height = "100%", onTransfer, onInvestments }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const navigate = useNavigate();

  // Lista de slides configurables con su respectiva ruta / acción
  const SLIDES = React.useMemo(() => [
    {
      id: "deposit",
      src: slideDeposit,
      alt: "Dale Valor A Tu Esfuerzo - Depositar Fondos",
      path: "/deposit",
      label: "Explorar Depósitar",
    },
    {
      id: "transfer",
      src: slideTransfer,
      alt: "Enviá En Tiempo Real - Movés tu dinero",
      action: "transfer",
      label: "Explorar Transferir",
    },
    {
      id: "investments",
      src: slideInvestments,
      alt: "Hacé Crecer Tu Dinero - Inversiones",
      action: "investments",
      label: "Explorar Inversiones",
    },
    {
      id: "history",
      src: slideHistory,
      alt: "Mirá El Camino Recorrido - Historial de Transacciones",
      path: "/history",
      label: "Explorar Historial",
    },
  ], []);

  const next = useCallback(() => {
    if (SLIDES.length > 1) {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }
  }, [SLIDES.length]);

  useEffect(() => {
    if (paused || SLIDES.length <= 1) return;
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [paused, next, SLIDES.length]);

  const handleSlideClick = (slide) => {
    if (slide.action === "transfer") {
      if (onTransfer) onTransfer();
    } else if (slide.action === "investments") {
      if (onInvestments) onInvestments();
    } else if (slide.path) {
      navigate(slide.path);
    }
  };

  const activeSlide = SLIDES[current] || SLIDES[0];

  return (
    <Box
      component="button"
      type="button"
      onClick={() => handleSlideClick(activeSlide)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      sx={{
        border: "none",
        outline: "none",
        padding: 0,
        position: "relative",
        width: "100%",
        height,
        borderRadius,
        overflow: "hidden",
        bgcolor: "#02122C",
        cursor: "pointer",
        userSelect: "none",
        display: "block",
        textAlign: "left",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        boxShadow: "0 4px 18px rgba(0, 0, 0, 0.08)",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 8px 26px rgba(0, 0, 0, 0.16)",
          "& .explorer-badge": {
            transform: "translateX(6px)",
          }
        },
        "&:active": {
          transform: "translateY(0px)",
        },
        "@keyframes progressFill": {
          "0%": { width: "0%" },
          "100%": { width: "100%" }
        }
      }}
    >
      {/* Slides interactivos con transición de opacidad */}
      {SLIDES.map((slide, i) => (
        <Box
          key={slide.id || i}
          component="img"
          src={slide.src}
          alt={slide.alt}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            opacity: i === current ? 1 : 0,
            transition: "opacity 0.7s ease-in-out",
            borderRadius,
          }}
        />
      ))}

      {/* Badge "Explorar X" — esquina superior izquierda */}
      {SLIDES.map((slide, i) => (
        <Box
          key={`label-${slide.id}`}
          className="explorer-badge"
          sx={{
            position: "absolute",
            top: 14,
            left: 14,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 0.6,
            px: 1.4,
            py: 0.6,
            borderRadius: "20px",
            bgcolor: "rgba(2, 18, 44, 0.85)", // Mismo azul que la barra lateral (#02122C) pero con opacidad
            backdropFilter: "blur(6px)",
            color: "#FFFFFF",
            opacity: i === current ? 1 : 0,
            transition: "opacity 0.5s ease-in-out, transform 0.35s ease-out",
            pointerEvents: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.02em",
              lineHeight: 1,
              color: "#FFFFFF",
            }}
          >
            {slide.label}
          </Typography>
          <ArrowForwardIcon sx={{ fontSize: "0.85rem", color: "#FFFFFF" }} />
        </Box>
      ))}

      {/* Progress Bar (reemplaza los 3 puntitos) */}
      {SLIDES.length > 1 && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "5px",
            bgcolor: "rgba(255, 255, 255, 0.2)",
            zIndex: 10,
          }}
        >
          <Box
            key={current} // Fuerza a que la animación se reinicie cuando cambia el current
            sx={{
              height: "100%",
              bgcolor: "#FFFFFF",
              animation: `progressFill ${INTERVAL}ms linear forwards`,
              animationPlayState: paused ? "paused" : "running",
            }}
          />
        </Box>
      )}
    </Box>
  );
}

export default ImageCarousel;
