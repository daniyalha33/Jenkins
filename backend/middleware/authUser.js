import jwt from 'jsonwebtoken'
export const authUser=async(req,res,next)=>{
    try {
        const authHeader = req.headers.authorization; // Correctly access the authorization header
        
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return res.status(401).json({ success: false, message: 'Not authorized, login again' });
        }

    const token = authHeader.split(' ')[1]; // Extract the token part after "Bearer"
    
    
    const decoded_token=jwt.verify(token, process.env.JWT_SECRET)
    
    console.log(decoded_token)
    req.body.userId=decoded_token.userId
    console.log(decoded_token.userId)
    next()
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message});
        
    }
    
}