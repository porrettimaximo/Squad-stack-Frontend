import fs from 'fs';

// 1. Resolve TransferReceiptModal.jsx
let trm = fs.readFileSync('src/components/common/TransferReceiptModal.jsx', 'utf8');
trm = trm.replace(/<<<<<<< HEAD[\s\S]*?=======[\s\S]*?>>>>>>> fix\/general-fixes/g, '    isDeposit = false,\n  } = payload;');
fs.writeFileSync('src/components/common/TransferReceiptModal.jsx', trm, 'utf8');

// 2. Resolve Sidebar.jsx
let sb = fs.readFileSync('src/components/layout/Sidebar.jsx', 'utf8');
sb = sb.replace(/<<<<<<< HEAD[\s\S]*?=======[\s\S]*?>>>>>>> fix\/general-fixes/g, (match, offset) => {
  if (sb.substring(0, offset).includes('flex:')) {
    return '          px: collapsed ? 0.8 : 1.5,\n          py: 0.4,\n          flex: isMobileDrawer ? "none" : 1,';
  } else {
    return '          px: collapsed ? 0.8 : 1.5,\n          pb: isMobileDrawer ? 5 : 2,\n          pt: 1,';
  }
});
fs.writeFileSync('src/components/layout/Sidebar.jsx', sb, 'utf8');

// 3. Resolve AppLayout.jsx
let al = fs.readFileSync('src/components/layout/AppLayout.jsx', 'utf8');
al = al.replace(/<<<<<<< HEAD\r?\nimport NotificationsNoneOutlinedIcon from "@mui\/icons-material\/NotificationsNoneOutlined";\r?\n=======\r?\nimport LogoutOutlinedIcon from "@mui\/icons-material\/LogoutOutlined";\r?\n>>>>>>> fix\/general-fixes/g, 
  'import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";\nimport LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";');

const appLayoutMobileHeaderConflict = /<<<<<<< HEAD[\s\S]*?>>>>>>> fix\/general-fixes/g;
// Replace remaining conflict in AppLayout
al = al.replace(appLayoutMobileHeaderConflict, `            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
              <IconButton
                onClick={(e) => setMobileNotificationsAnchor(e.currentTarget)}
                aria-label="Ver notificaciones"
                sx={{
                  color: "#FFFFFF",
                  p: 0.8,
                  bgcolor: Boolean(mobileNotificationsAnchor) ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.08)",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.15)" },
                }}
              >
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  max={9}
                  sx={{
                    "& .MuiBadge-badge": {
                      bgcolor: "#EF4444",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      height: 16,
                      minWidth: 16,
                      top: 1,
                      right: 1,
                    },
                  }}
                >
                  <NotificationsNoneOutlinedIcon sx={{ fontSize: "1.25rem" }} />
                </Badge>
              </IconButton>

              <NotificationPopover
                anchorEl={mobileNotificationsAnchor}
                open={Boolean(mobileNotificationsAnchor)}
                onClose={() => {
                  setMobileNotificationsAnchor(null);
                  fetchUnread();
                }}
                onNotificationsChange={fetchUnread}
              />

              <Box
                onClick={() => navigate("/profile")}
                sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "#D0D9E5",
                    fontWeight: 600,
                    maxWidth: 90,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {userName}
                </Typography>
              </Box>

              <IconButton
                onClick={handleLogout}
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                sx={{
                  color: "#EF4444",
                  p: 0.8,
                  bgcolor: "rgba(239, 68, 68, 0.1)",
                  "&:hover": { bgcolor: "rgba(239, 68, 68, 0.2)" },
                }}
              >
                <LogoutOutlinedIcon fontSize="small" />
              </IconButton>
            </Box>`);
fs.writeFileSync('src/components/layout/AppLayout.jsx', al, 'utf8');

// 4. Resolve DepositPage.jsx
let dp = fs.readFileSync('src/pages/Deposit/DepositPage.jsx', 'utf8');
dp = dp.replace(/<<<<<<< HEAD[\s\S]*?sx: \{ borderRadius: "16px", fontSize: "1.6rem", fontWeight: 800, color: "text.primary" \},[\s\S]*?>>>>>>> fix\/general-fixes/g,
`                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography sx={{ fontSize: "1.6rem", fontWeight: 800, color: "primary.main", mr: 0.5 }}>
                            $
                          </Typography>
                        </InputAdornment>
                      ),
                      sx: { borderRadius: "16px", fontSize: "1.6rem", fontWeight: 800, color: "text.primary" },`);

dp = dp.replace(/<<<<<<< HEAD[\s\S]*?sx=\{\{ borderRadius: "12px", bgcolor: "action.hover", fontSize: "0.9rem" \}\}[\s\S]*?>>>>>>> fix\/general-fixes/g,
`                      sx={{ borderRadius: "12px", bgcolor: "action.hover", fontSize: "0.9rem" }}
                      slotProps={{
                        paper: {
                          sx: {
                            maxHeight: 240,
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                          },
                        },
                      }}`);

dp = dp.replace(/<<<<<<< HEAD[\s\S]*?<Typography sx=\{\{ fontWeight: 700, color: "text.primary" \}\}>\s*\{formatCurrency\(Number\(amount\)\)\}[\s\S]*?>>>>>>> fix\/general-fixes/g,
`                    <Typography sx={{ color: "text.secondary" }}>Monto</Typography>
                    <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
                      {formatCurrency(numAmount)}
                    </Typography>`);
fs.writeFileSync('src/pages/Deposit/DepositPage.jsx', dp, 'utf8');

// 5. Resolve TransferPage.jsx
let tp = fs.readFileSync('src/pages/Transfer/TransferPage.jsx', 'utf8');
tp = tp.replace(/<<<<<<< HEAD[\s\S]*?=======[\s\S]*?>>>>>>> fix\/general-fixes/g, (match) => {
  if (match.includes('Monto a transferir')) {
    return `                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "text.primary" }}>
                    Monto a transferir
                  </Typography>
                  <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                    Disponible: <strong>{formatCurrency(availableSourceBalance || currentBalance)}</strong>
                  </Typography>
                </Box>`;
  }
  if (match.includes('startAdornment')) {
    return `                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color: "primary.main", mr: 0.5 }}>
                            $
                          </Typography>
                        </InputAdornment>
                      ),
                      sx: { borderRadius: "12px", fontSize: "1.4rem", fontWeight: 800, color: "text.primary", py: 0.2 },`;
  }
  if (match.includes('disabled={')) {
    return `                  disabled={!amount || parseAmount(amount) <= 0 || parseAmount(amount) > (availableSourceBalance || currentBalance)}`;
  }
  if (match.includes('Nº DE CUENTA') && match.includes('myProfile')) {
    return `                      <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 600 }}>Nº DE CUENTA</Typography>
                      <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "text.primary" }}>
                        Cuenta #{myProfile.accountId}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 600 }}>EMAIL</Typography>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "text.secondary", wordBreak: "break-all" }}>
                        {myProfile.email}
                      </Typography>`;
  }
  if (match.includes('CVU') && match.includes('myProfile')) {
    return `                    <Box sx={{ gridColumn: { xs: "span 1", sm: "span 2" } }}>
                      <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 600 }}>CVU</Typography>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "text.secondary", letterSpacing: "0.02em" }}>
                        {myProfile.cvu}`;
  }
  if (match.includes('✓ Verificado') || match.includes('recipientProfile.bank')) {
    return `                    <Typography sx={{ fontSize: "0.75rem", color: "#166534", fontWeight: 700 }}>
                      ✓ Verificado
                    </Typography>`;
  }
  if (match.includes('DESTINATARIO') && (match.includes('verifiedRecipient') || match.includes('recipientProfile'))) {
    return `                      <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 600 }}>DESTINATARIO</Typography>
                      <Typography sx={{ fontSize: "0.92rem", fontWeight: 800, color: "text.primary" }}>
                        {verifiedRecipient?.name || recipientProfile?.name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 600 }}>Nº DE CUENTA</Typography>
                      <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "text.primary" }}>
                        Cuenta #{verifiedRecipient?.accountId || recipientProfile?.accountId}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 600 }}>EMAIL</Typography>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "text.secondary", wordBreak: "break-all" }}>
                        {verifiedRecipient?.email || recipientProfile?.email}
                      </Typography>`;
  }
  if (match.includes('CVU') && (match.includes('verifiedRecipient') || match.includes('recipientProfile'))) {
    return `                    <Box sx={{ gridColumn: { xs: "span 1", sm: "span 2" } }}>
                      <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 600 }}>CVU</Typography>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "text.secondary", letterSpacing: "0.02em" }}>
                        {verifiedRecipient?.cvu || recipientProfile?.cvu}`;
  }
  if (match.includes('Monto a transferir') && match.includes('parseAmount')) {
    return `                    <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>Monto a transferir</Typography>
                    <Typography sx={{ fontSize: "1.05rem", fontWeight: 800, color: "text.primary" }}>
                      {formatCurrency(parseAmount(amount))}`;
  }
  return match;
});
fs.writeFileSync('src/pages/Transfer/TransferPage.jsx', tp, 'utf8');

console.log('All 5 files resolved successfully!');
