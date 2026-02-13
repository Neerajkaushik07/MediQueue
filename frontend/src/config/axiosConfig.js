import axios from 'axios'

/**
 * Setup axios interceptors to handle demo mode
 * This prevents JWT malformed errors by blocking API requests when using demo tokens
 */
export const setupAxiosInterceptors = () => {
    // Request interceptor - blocks requests in demo mode
    axios.interceptors.request.use(
        (config) => {
            // Check if in demo mode
            const isDemoMode = sessionStorage.getItem('isDemoMode') === 'true'
            const demoToken = sessionStorage.getItem('token')

            // If demo mode and has demo token, block the request
            if (isDemoMode && demoToken && demoToken.startsWith('demo-')) {
                // Return a mock response instead of making the actual request
                return Promise.reject({
                    config,
                    response: {
                        data: { success: true, message: 'Demo mode - no API call made' },
                        status: 200,
                        config,
                        isDemo: true
                    }
                })
            }

            return config
        },
        (error) => {
            return Promise.reject(error)
        }
    )

    // Response interceptor - handles demo mode rejections
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            // If it's a demo mode rejection, return the mock response
            if (error.response && error.response.isDemo) {
                return Promise.resolve(error.response)
            }
            return Promise.reject(error)
        }
    )
}
