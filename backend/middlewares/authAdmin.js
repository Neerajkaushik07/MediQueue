import jwt from 'jsonwebtoken'
import logger from '../config/logger.js'

// Admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {
        const { atoken, token } = req.headers
        const authHeader = req.headers.authorization;
        let authToken = atoken || token;

        if (!authToken && authHeader && authHeader.startsWith('Bearer ')) {
            authToken = authHeader.split(' ')[1];
        }

        if (!authToken) {
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }
        const token_decode = jwt.verify(authToken, process.env.JWT_SECRET)

        if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }
        next()

    } catch (error) {
        logger.error(error)
        res.json({ success: false, message: error.message })
    }
}

export default authAdmin
