import {v2 as cloudianry} from 'cloudinary'
const cloudianryConnect=()=>{
    try {
        cloudianry.config({
            cloud_name:process.env.CLOUDINARY_NAME,
            api_key:process.env.CLOUDINARY_KEY,
            api_secret:process.env.CLOUDINARY_APIKEY
        })
    } catch (error) {
        console.log(error)
    }
    
}
export default cloudianryConnect

