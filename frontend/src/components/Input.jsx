import React from 'react';
import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  '& .MuiInputBase-root': {
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#E2E8F0',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#A5B4FC',
  },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
}));

export default function Input(props) {
  return <StyledTextField variant="outlined" fullWidth {...props} />;
}
