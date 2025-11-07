import jwt from 'jsonwebtoken'
export const adminAuth=async(req,res,next)=>{
    try {
        const authHeader = req.headers.authorization; // Correctly access the authorization header
        
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return res.status(401).json({ success: false, message: 'Not authorized, login again' });
        }

    const adminToken = authHeader.split(' ')[1]; // Extract the token part after "Bearer"
    console.log(adminToken)
    const decoded_token=jwt.verify(adminToken, process.env.JWT_SECRET)
    if(decoded_token.email!==process.env.ADMIN_EMAIL){
        return res.json({success:false, message: 'Not authorized, login again' });
    }
    next()
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message});
        
    }
    
}