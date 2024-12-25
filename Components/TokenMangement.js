import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to refresh the access token using the refresh token
export const refreshAccessToken = async () => {
    try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        if (!refreshToken) {
            throw new Error('No refresh token found');
        }

        const response = await fetch('https://api.example.com/refresh-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        const data = await response.json();

        if (response.ok) {
            // Store the new access token
            await AsyncStorage.setItem('accessToken', data.accessToken);
            return data.accessToken;
        } else {
            throw new Error('Failed to refresh token');
        }
    } catch (error) {
        throw new Error('Session expired. Please log in again.');
    }
};

// Function to make authenticated API requests
export const makeAuthenticatedRequest = async (url) => {
    try {
        let accessToken = await AsyncStorage.getItem('accessToken');

        if (!accessToken) {
            throw new Error('No access token found');
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        // If the response is unauthorized (token expired)
        if (response.status === 401) {
            accessToken = await refreshAccessToken(); // Get a new token if expired
            return makeAuthenticatedRequest(url); // Retry the request with the new token
        }

        return await response.json();
    } catch (error) {
        throw new Error('Error during request or session expired');
    }
};

