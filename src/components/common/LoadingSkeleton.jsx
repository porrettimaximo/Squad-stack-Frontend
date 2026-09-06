import React from "react";
import { Box, Skeleton, Card, CardContent, Grid, TableRow, TableCell } from "@mui/material";

/**
 * LoadingSkeleton: Componente con distintos esqueletos de carga preconfigurados (HU-30).
 */

export function DashboardBalanceSkeleton() {
  return (
    <Card sx={{ borderRadius: "20px", p: 1, bgcolor: "#02122c", mb: 3 }}>
      <CardContent>
        <Skeleton variant="text" width={140} height={24} sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 1 }} />
        <Skeleton variant="text" width={220} height={48} sx={{ bgcolor: "rgba(255,255,255,0.15)", mb: 2 }} />
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Skeleton variant="rounded" width={130} height={40} sx={{ bgcolor: "rgba(255,255,255,0.1)", borderRadius: "10px" }} />
          <Skeleton variant="rounded" width={130} height={40} sx={{ bgcolor: "rgba(255,255,255,0.1)", borderRadius: "10px" }} />
        </Box>
      </CardContent>
    </Card>
  );
}

export function TableRowsSkeleton({ columns = 5, rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <TableRow key={`skeleton-row-${rIdx}`}>
          {Array.from({ length: columns }).map((_, cIdx) => (
            <TableCell key={`skeleton-cell-${rIdx}-${cIdx}`}>
              <Skeleton
                variant="text"
                height={28}
                width={cIdx === 0 ? "70%" : cIdx === columns - 1 ? "50%" : "85%"}
                sx={{ borderRadius: "6px" }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function CardGridSkeleton({ count = 3, height = 160 }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2.5 }}>
      {Array.from({ length: count }).map((_, idx) => (
        <Card key={`skeleton-card-${idx}`} sx={{ borderRadius: "16px", p: 2.5 }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="90%" height={18} />
        </Card>
      ))}
    </Box>
  );
}

export default {
  DashboardBalanceSkeleton,
  TableRowsSkeleton,
  CardGridSkeleton,
};
