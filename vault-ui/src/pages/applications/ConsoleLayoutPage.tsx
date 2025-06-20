import React, { ReactNode } from 'react';
import { Box, Container, styled } from '@mui/material';

// Style the main container for console layout
const LayoutContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  padding: theme.spacing(2),
  backgroundColor: '#f5f5f5',
}));

// Content container
const ContentContainer = styled(Container)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
  backgroundColor: '#ffffff',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
  marginTop: theme.spacing(2),
}));

interface ConsoleLayoutPageProps {
  children: ReactNode;
}

/**
 * ConsoleLayoutPage - A layout wrapper for console pages
 * 
 * This component provides consistent layout structure for validator 
 * and expert console pages throughout the application
 */
const ConsoleLayoutPage: React.FC<ConsoleLayoutPageProps> = ({ children }) => {
  return (
    <LayoutContainer>
      <ContentContainer maxWidth="lg">
        {children}
      </ContentContainer>
    </LayoutContainer>
  );
};

export default ConsoleLayoutPage; 