import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setExperimenterInfo } from '../redux/actions'; // Define this action if not already defined
import axios from 'axios';
import { Button, TextField, Box, Typography, Card, CardContent, CardActions, CircularProgress } from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import { useNavigate } from 'react-router-dom'; // Import to use navigation

const Login = () => {
    const [experimenterID, setExperimenterID] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Initialize navigation

    const handleLogin = async () => {
        try {
            setLoading(true);
            const response = await axios.post('https://europe-central2-co-op-world-game.cloudfunctions.net/fetchExperimeter', { id: experimenterID });
            setLoading(false);
            if (response.status === 200) {
                // Dispatch the received data to the Redux store
                dispatch(setExperimenterInfo({
                    id: response.data._id,
                    names: response.data.experimenter_names,
                    description: response.data.description
                }));
                navigate('/users'); // Navigate to dashboard or another route on success
            } else {
                setError('Login failed. Please try again.');
            }
        } catch (err) {
            setLoading(false);
            setError(err.message || 'Network error');
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <Card sx={{ minWidth: 275, maxWidth: 400 }}>
                <CardContent>
                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                        Welcome Back
                    </Typography>
                    <Box display="flex" alignItems="flex-end" marginBottom={2}>
                        <KeyIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                        <TextField
                            fullWidth
                            label="Experimenter ID"
                            variant="outlined"
                            value={experimenterID}
                            onChange={(e) => setExperimenterID(e.target.value)}
                        />
                    </Box>
                </CardContent>
                <CardActions>
                    <Button fullWidth variant="contained" onClick={handleLogin} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Login'}
                    </Button>
                </CardActions>
                {error && (
                    <Typography color="error" sx={{ m: 2 }}>
                        {error}
                    </Typography>
                )}
            </Card>
        </Box>
    );
};

export default Login;
