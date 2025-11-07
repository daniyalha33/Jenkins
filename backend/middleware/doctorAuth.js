import jwt from 'jsonwebtoken'
export const doctorAuth=async(req,res,next)=>{
    try {
        const authHeader = req.headers.authorization; // Correctly access the authorization header
        
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return res.status(401).json({ success: false, message: 'Not authorized, login again' });
        }

    const dToken = authHeader.split(' ')[1]; // Extract the token part after "Bearer"
    
    const decoded_token=jwt.verify(dToken, process.env.JWT_SECRET)
    req.body.docId=decoded_token.id
    next()
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message});
        
    }
    
}
