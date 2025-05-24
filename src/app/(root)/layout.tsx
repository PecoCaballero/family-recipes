import React from "react";
import BottomNavigation from "../_components/BottomNavigation";
import { PpWC } from "../_types/types";
import { Box } from "@mui/material";

export default function RootLayout({
  children,
}: PpWC) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1, paddingBottom: '64px' }}>
        {children}
      </main>
      <BottomNavigation />
    </Box>
  );
}
