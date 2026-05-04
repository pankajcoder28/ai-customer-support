import jwt from 'jsonwebtoken'
import userModel from '../models/user.model.js'
import { config } from '../config/config.js'

/**
 * Authenticate Token - Validates JWT token from cookies or Authorization header
 * Supports any authenticated user (admin or customer)
 * 
 * Token can be provided in:
 * 1. Cookie: token=jwt_value
 * 2. Authorization header: Bearer jwt_value
 * 
 * Attaches to req.user:
 * - _id: user ID
 * - email: user email
 * - role: user role (admin/customer)
 * - tenantId: organization ID
 * - isActive: account status
 */
export const authenticateToken = async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        let token = req.cookies?.token;

        if (!token) {
            // Check Authorization header (Bearer token)
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.slice(7); // Remove 'Bearer ' prefix
            }
        }

        if (!token) {
            return res.status(401).json({ 
                message: "Unauthorized - No token provided",
                code: 401 
            });
        }

        try {
            // Verify JWT token
            const decoded = jwt.verify(token, config.JWT_SECRET);

            // Fetch user from database
            const user = await userModel.findById(decoded.id);

            if (!user) {
                return res.status(401).json({ 
                    message: "Unauthorized - User not found",
                    code: 401 
                });
            }

            if (!user.isActive) {
                return res.status(401).json({ 
                    message: "Unauthorized - Account is inactive",
                    code: 401 
                });
            }

            // Attach user info to request
            req.user = {
                _id: user._id,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
                isActive: user.isActive,
                username: user.username,
                avatar: user.avatar
            };

            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    message: "Unauthorized - Token expired",
                    code: 401 
                });
            } else if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    message: "Unauthorized - Invalid token",
                    code: 401 
                });
            }
            throw jwtError;
        }
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(500).json({ 
            message: "Internal server error during authentication",
            code: 500 
        });
    }
};

/**
 * Authenticate Admin - Validates JWT and ensures user has admin role
 * Supports both cookies and Authorization header
 */
export const authenticateAdmin = async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        let token = req.cookies?.token;

        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.slice(7);
            }
        }

        if (!token) {
            return res.status(401).json({ 
                message: "Unauthorized - No token provided",
                code: 401 
            });
        }

        try {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            const user = await userModel.findById(decoded.id);

            if (!user) {
                return res.status(401).json({ 
                    message: "Unauthorized - User not found",
                    code: 401 
                });
            }

            if (!user.isActive) {
                return res.status(401).json({ 
                    message: "Unauthorized - Account is inactive",
                    code: 401 
                });
            }

            if (user.role !== 'admin') {
                return res.status(403).json({ 
                    message: "Forbidden - Admin access required",
                    code: 403 
                });
            }

            req.user = {
                _id: user._id,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
                isActive: user.isActive,
                username: user.username,
                avatar: user.avatar
            };

            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    message: "Unauthorized - Token expired",
                    code: 401 
                });
            } else if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    message: "Unauthorized - Invalid token",
                    code: 401 
                });
            }
            throw jwtError;
        }
    } catch (error) {
        console.error('Admin Auth Middleware Error:', error);
        return res.status(500).json({ 
            message: "Internal server error during authentication",
            code: 500 
        });
    }
};
