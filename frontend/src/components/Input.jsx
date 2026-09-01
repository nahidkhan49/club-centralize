import React from 'react';
import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
  margin: theme.spacing(0.8, 0),
  '& .MuiInputBase-root': {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    fontSize: '0.9rem',
    fontFamily: "'Inter', sans-serif",
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#E9E7F2',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#D4CCF7',
  },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#4F2BCB',
    borderWidth: '1.5px',
  },
}));

export default function Input(props) {
  return <StyledTextField variant="outlined" fullWidth {...props} />;
}
