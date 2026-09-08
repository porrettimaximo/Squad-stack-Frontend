import React from "react";
import { Box } from "@mui/material";

/**
 * ProviderLogo: Logos oficiales vectoriales de alta resolución
 * para Edenor, Edesur, AySA, Metrogas, Claro, Movistar, Personal Flow,
 * Telecentro, AFIP/ARCA, AGIP, ARBA, etc.
 */
export const ProviderLogo = ({ providerName = "", size = 48, rounded = true }) => {
  const name = (providerName || "").toLowerCase();
  const radius = rounded ? "14px" : "8px";

  // 1. Claro (Rojo oficial #DA291C)
  if (name.includes("claro")) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: radius,
          bgcolor: "#DA291C",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0.6,
          boxShadow: "0 2px 8px rgba(218,41,28,0.3)",
          overflow: "hidden",
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <circle cx="50" cy="50" r="46" fill="#DA291C" />
          <text
            x="50"
            y="60"
            fill="#FFFFFF"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="32"
            textAnchor="middle"
            letterSpacing="-1"
          >
            claro
          </text>
        </svg>
      </Box>
    );
  }

  // 2. Movistar (Azul #019DF4 y 'M' verde #5BC500)
  if (name.includes("movistar")) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: radius,
          bgcolor: "#019DF4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0.6,
          boxShadow: "0 2px 8px rgba(1,157,244,0.3)",
          overflow: "hidden",
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <path
            d="M 16 62 C 22 36, 32 26, 42 46 C 48 58, 54 58, 60 46 C 70 26, 80 36, 84 62 C 75 62, 70 48, 62 52 C 55 56, 47 56, 40 52 C 32 48, 25 62, 16 62 Z"
            fill="#5BC500"
          />
          <text
            x="50"
            y="84"
            fill="#FFFFFF"
            fontFamily="Arial, sans-serif"
            fontWeight="800"
            fontSize="14"
            textAnchor="middle"
          >
            movistar
          </text>
        </svg>
      </Box>
    );
  }

  // 3. Personal Flow (Azul marino #001D4A con celeste #00D2FF)
  if (name.includes("personal") || name.includes("flow")) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: radius,
          bgcolor: "#001D4A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0.6,
          boxShadow: "0 2px 8px rgba(0,29,74,0.3)",
          overflow: "hidden",
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <text
            x="50"
            y="42"
            fill="#00D2FF"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="18"
            textAnchor="middle"
          >
            Personal
          </text>
          <rect x="24" y="50" width="52" height="22" rx="6" fill="#00D2FF" />
          <text
            x="50"
            y="66"
            fill="#001D4A"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="15"
            textAnchor="middle"
          >
            flow
          </text>
        </svg>
      </Box>
    );
  }

  // 4. Edenor (Azul oscuro #004B87 con sol dorado)
  if (name.includes("edenor")) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: radius,
          bgcolor: "#004B87",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0.6,
          boxShadow: "0 2px 8px rgba(0,75,135,0.3)",
          overflow: "hidden",
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <circle cx="50" cy="50" r="44" fill="#004B87" />
          <text
            x="48"
            y="56"
            fill="#FFFFFF"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="22"
            textAnchor="middle"
          >
            edenor
          </text>
          <circle cx="78" cy="38" r="6" fill="#FFCC00" />
        </svg>
      </Box>
    );
  }

  // 5. Edesur (Rojo #E30613 con subrayado blanco)
  if (name.includes("edesur")) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: radius,
          bgcolor: "#E30613",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0.6,
          boxShadow: "0 2px 8px rgba(227,6,19,0.3)",
          overflow: "hidden",
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <rect width="100" height="100" rx="20" fill="#E30613" />
          <text
            x="50"
            y="56"
            fill="#FFFFFF"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="21"
            textAnchor="middle"
          >
            edesur
          </text>
          <path d="M 26 66 L 74 66" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </Box>
    );
  }

  // 6. Metrogas (Verde #007A3D con llama amarilla)
  if (name.includes("metrogas")) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: radius,
          bgcolor: "#007A3D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0.6,
          boxShadow: "0 2px 8px rgba(0,122,61,0.3)",
          overflow: "hidden",
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <path
            d="M50 16 C 38 34 34 50 38 64 C 42 76 58 76 62 64 C 66 50 62 34 50 16 Z"
            fill="#F4B400"
          />
          <text
            x="50"
            y="86"
            fill="#FFFFFF"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="14"
            textAnchor="middle"
          >
            metrogas
          </text>
        </svg>
      </Box>
    );
  }

  // 7. AySA (Celeste #00A9E0 con gota)
  if (name.includes("aysa")) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: radius,
          bgcolor: "#00A9E0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0.6,
          boxShadow: "0 2px 8px rgba(0,169,224,0.3)",
          overflow: "hidden",
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <circle cx="50" cy="36" r="14" fill="#FFFFFF" opacity="0.9" />
          <path d="M50 16 C 44 26 40 34 50 48 C 60 34 56 26 50 16 Z" fill="#003A70" />
          <text
            x="50"
            y="78"
            fill="#FFFFFF"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="24"
            textAnchor="middle"
            letterSpacing="1"
          >
            AySA
          </text>
        </svg>
      </Box>
    );
  }

  // 8. Naturgy (Naranja #FF7900)
  if (name.includes("naturgy")) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: radius,
          bgcolor: "#FF7900",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0.6,
          boxShadow: "0 2px 8px rgba(255,121,0,0.3)",
          overflow: "hidden",
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <path d="M30 40 Q 50 20 70 40 Q 50 60 30 40 Z" fill="#003B46" />
          <path d="M40 30 Q 60 50 40 70 Q 20 50 40 30 Z" fill="#FFFFFF" opacity="0.85" />
          <text
            x="50"
            y="86"
            fill="#003B46"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="15"
            textAnchor="middle"
          >
            naturgy
          </text>
        </svg>
      </Box>
    );
  }

  // 9. Camuzzi (Azul marino y celeste #003A70)
  if (name.includes("camuzzi")) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: radius,
          bgcolor: "#003A70",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0.6,
          boxShadow: "0 2px 8px rgba(0,58,112,0.3)",
          overflow: "hidden",
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <path
            d="M50 20 C 38 38 34 52 42 64 C 48 72 58 70 62 60 C 66 48 60 35 50 20 Z"
            fill="#00A9E0"
          />
          <text
            x="50"
            y="84"
            fill="#FFFFFF"
            fontFamily="Arial, sans-serif"
            fontWeight="800"
            fontSize="14"
            textAnchor="middle"
          >
            camuzzi
          </text>
        </svg>
      </Box>
    );
  }

  // 10. Telecentro (Rojo #EE2737)
  if (name.includes("telecentro")) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: radius,
          bgcolor: "#EE2737",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0.6,
          boxShadow: "0 2px 8px rgba(238,39,55,0.3)",
          overflow: "hidden",
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <circle cx="50" cy="42" r="22" fill="#FFFFFF" />
          <circle cx="50" cy="42" r="14" fill="#EE2737" />
          <circle cx="50" cy="42" r="6" fill="#FFFFFF" />
          <text
            x="50"
            y="82"
            fill="#FFFFFF"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="12"
            textAnchor="middle"
            letterSpacing="0.5"
          >
            TELECENTRO
          </text>
        </svg>
      </Box>
    );
  }

  // 11. AFIP / ARCA
  if (name.includes("afip") || name.includes("arca")) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: radius,
          bgcolor: "#004B87",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0.6,
          boxShadow: "0 2px 8px rgba(0,75,135,0.3)",
          overflow: "hidden",
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <rect x="15" y="24" width="70" height="34" rx="6" fill="#0072CE" />
          <text
            x="50"
            y="48"
            fill="#FFFFFF"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="18"
            textAnchor="middle"
            letterSpacing="1"
          >
            ARCA
          </text>
          <text
            x="50"
            y="78"
            fill="#F4B400"
            fontFamily="Arial, sans-serif"
            fontWeight="800"
            fontSize="13"
            textAnchor="middle"
          >
            ex-AFIP
          </text>
        </svg>
      </Box>
    );
  }

  // 12. AGIP Rentas CABA
  if (name.includes("agip")) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: radius,
          bgcolor: "#FFD100",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0.6,
          boxShadow: "0 2px 8px rgba(255,209,0,0.3)",
          overflow: "hidden",
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <text
            x="50"
            y="54"
            fill="#000000"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="28"
            textAnchor="middle"
            letterSpacing="1"
          >
            AGIP
          </text>
          <text
            x="50"
            y="74"
            fill="#333333"
            fontFamily="Arial, sans-serif"
            fontWeight="800"
            fontSize="12"
            textAnchor="middle"
          >
            Rentas CABA
          </text>
        </svg>
      </Box>
    );
  }

  // 13. ARBA Buenos Aires
  if (name.includes("arba")) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: radius,
          bgcolor: "#008852",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0.6,
          boxShadow: "0 2px 8px rgba(0,136,82,0.3)",
          overflow: "hidden",
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <text
            x="50"
            y="55"
            fill="#FFFFFF"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="26"
            textAnchor="middle"
            letterSpacing="1"
          >
            arba
          </text>
          <rect x="25" y="66" width="50" height="4" rx="2" fill="#F4B400" />
        </svg>
      </Box>
    );
  }

  // 14. EPEC Córdoba
  if (name.includes("epec")) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: radius,
          bgcolor: "#003366",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0.6,
          boxShadow: "0 2px 8px rgba(0,51,102,0.3)",
          overflow: "hidden",
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <circle cx="50" cy="50" r="44" fill="#003366" />
          <text
            x="50"
            y="55"
            fill="#FFFFFF"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="24"
            textAnchor="middle"
          >
            EPEC
          </text>
          <path d="M 32 64 L 68 64" stroke="#FFCC00" strokeWidth="4" />
        </svg>
      </Box>
    );
  }

  // 15. Aguas Cordobesas
  if (name.includes("aguas")) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: radius,
          bgcolor: "#0072CE",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0.6,
          boxShadow: "0 2px 8px rgba(0,114,206,0.3)",
          overflow: "hidden",
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <path
            d="M50 18 C 36 38 34 50 40 64 C 46 76 58 76 64 64 C 70 50 64 38 50 18 Z"
            fill="#FFFFFF"
          />
          <text
            x="50"
            y="86"
            fill="#FFFFFF"
            fontFamily="Arial, sans-serif"
            fontWeight="800"
            fontSize="10"
            textAnchor="middle"
          >
            AGUAS CORDOBESAS
          </text>
        </svg>
      </Box>
    );
  }

  // Fallback genérico elegante con inicial
  return (
    <Box
      sx={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: radius,
        bgcolor: "text.primary",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#FFFFFF",
        fontWeight: 900,
        fontSize: size * 0.4,
        boxShadow: "0 2px 8px rgba(15,23,42,0.2)",
      }}
    >
      {(providerName || "S").charAt(0).toUpperCase()}
    </Box>
  );
};

export default ProviderLogo;
