import {styled} from '@mui/material';

export const HeaderContainer = styled('div')({
    flex: 1,
    margin: 0,
    padding: 0,
});

export const WelcomeText = styled('h1')({
    fontSize: '55px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
    lineHeight: 1,
});

export const MiddleText = styled('h1')({
    fontSize: '25px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
    lineHeight: 1,
});

export const LoaderContainer = styled('div')({
    display: 'flex',
    width: '100%',
    position: 'fixed', // Keep the loader fixed over the page
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Slightly dim background
    zIndex: 1000, // Ensure it stays above other elements
    justifyContent: 'center', // Center loader horizontally
    alignItems: 'center', // Center loader vertically
});