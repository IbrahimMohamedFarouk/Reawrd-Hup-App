
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { jwtDecode } from 'jwt-decode'; // Install with `npm install jwt-decode`

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: "http://192.168.1.4:3000", // Your API base URL
});

// Add an interceptor to refresh the token
axiosInstance.interceptors.request.use(
    async (config) => {
                            
        const accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        if (!accessToken) {
            // No access token, redirect to login
            navigation.navigate('Login');
            return Promise.reject(new Error("No access token")); // Reject for clarity
        }

        const decodedToken = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;
        const expire = currentTime - decodedToken.exp;
        console.log("expires: ", expire);
        console.log(`decoded Token: ${decodedToken.exp}`);
        console.log(`current Time: ${currentTime}`);
        // If the access token is near expiration (e.g., 5 minutes before expiry), refresh it
        if (expire >= 0) { // Adjust threshold as needed
            try {
                const response = await axios.post(
                        "http://192.168.1.4:3000/admin/refresh-token",
                        { token: refreshToken }
                    );
                    console.log("REFRESH TOKEN RESPONSE", response.data);
                    const { accessToken: newAccessToken } = response.data;
                    await AsyncStorage.setItem("accessToken", newAccessToken);

                    // Update request headers with the new access token
                    config.headers["Authorization"] = `Bearer ${newAccessToken}`;
                } catch (error) {
                    console.error("Token refresh failed:", error);
                    await AsyncStorage.clear(); // Clear tokens on refresh failure
                    navigation.navigate('Login'); // Redirect to login
                }
         } else {
                // Token is still valid (or near expiration but not refreshed)
                config.headers["Authorization"] = `Bearer ${accessToken}`;
            }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;