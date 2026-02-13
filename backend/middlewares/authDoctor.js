import jwt from 'jsonwebtoken'
import logger from '../config/logger.js'

// Doctor authentication middleware
const authDoctor = async (req, res, next) => {
    try {
        const { token } = req.headers || req.body // Sometimes sent in body or headers
        // Best practice to check authorization header first
        const authHeader = req.headers.authorization;
        let authToken = token;

        if (!authToken && authHeader && authHeader.startsWith('Bearer ')) {
            authToken = authHeader.split(' ')[1];
        }

        if (!authToken) {
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }

        const token_decode = jwt.verify(authToken, process.env.JWT_SECRET)

        // Ensure req.body is defined
        if (!req.body) req.body = {}

        req.body.docId = token_decode.id
        next()

    } catch (error) {
        logger.error(error)
        res.json({ success: false, message: error.message })
    }
}

export default authDoctor
