import express from 'express';
import authRouter from './routes/auth.routes.js';
import messageRouter from './routes/message.routes.js';
import aiRouter from './routes/ai.routes.js';
import ticketRouter from './routes/ticket.routes.js';
import {Strategy as GoogleStrategy} from 'passport-google-oauth20'
import { config } from './config/config.js'
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import passport from 'passport';


const app = express();

app.use(express.json())
app.use(morgan("dev"))
app.use(cookieParser())
app.use(express.static('./public'))

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);
app.use("/api/ai", aiRouter);
app.use("/api/tickets", ticketRouter);

app.get('/', (req, res) => {
  res.send('server is running');
});

app.use(passport.initialize())

passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
},( accessToken,refreshToken,profile,done)=>{
    return done(null,profile);
    
}))

export default app;
