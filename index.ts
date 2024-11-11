const http = require('http');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
import { Request } from 'express';
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
import cors from 'cors';
import { Server } from 'socket.io';
require('dotenv').config();

import globalExceptionsFilter from './filters/globalExceptionsFilter';

app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: true, // Permet toutes les origines
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  credentials: true, // Permet l'envoi de cookies
  maxAge: 86400, // Cache la requête préliminaire CORS pendant 24 heures
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true, // Permet toutes les origines
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
});

io.on('connection', socket => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

module.exports = { server, io };

// app.use(cors<Request>())
const routeAu = require('./routes/auth.routes');
const routeClub = require('./routes/club.routes');
const routeAdmin = require('./routes/admin.routes');
const routeClubManagement = require('./routes/clubManagment.routes');
const routeStaff = require('./routes/staff.routes');
const routeJoueur = require('./routes/joueur.routes');
const routeNews = require('./routes/news.routes');
const routePartner = require('./routes/partner.routes');
const routeRole = require('./routes/role.routes');
const routeMatch = require('./routes/match.routes');
const routeClient = require('./routes/client.routes');
const routeStadium = require('./routes/stadium.routes');
const routeMessage = require('./routes/message.route');
const routeLive = require('./routes/live.routes');
const routeRefreshToken = require('./routes/refreshToken.routes');
const routeAd = require('./routes/ad.route');
const routeNotif = require('./routes/notification');
const routeCarte = require('./routes/carte.route');
const routeClientSubscription = require('./routes/clientSubscription.route');
const routeAgent = require('./routes/agent.route');
const routeTicket = require('./routes/ticket.route');

const connectDB1 = require('./configuration/mongoose');

const swaggerOptions = {
  definition: {
    info: {
      title: 'API',
      description: 'Description',
      contact: {
        name: 'Farouk Boussaa',
      },
      server: ['http://localhost:4000'],
    },
  },
  apis: ['./routes/*.ts'],
};

const swaggerDoc = swaggerJsdoc(swaggerOptions);
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use('/api/auth', routeAu);
app.use('/api/club', routeClub);
app.use('/api/admin', routeAdmin);
app.use('/api/clubManagement', routeClubManagement);
app.use('/api/staff', routeStaff);
app.use('/api/joueur', routeJoueur);
app.use('/api/news', routeNews);
app.use('/api/partner', routePartner);
app.use('/api/role', routeRole);
app.use('/api/match', routeMatch);
app.use('/api/client', routeClient);
app.use('/api/stadium', routeStadium);
app.use('/api/message', routeMessage);
app.use('/api/live', routeLive);
app.use('/api/refresh', routeRefreshToken);
app.use('/api/notif', routeNotif);
app.use('/api/ads', routeAd);
app.use('/api/carte', routeCarte);
app.use('/api/clientSubscription', routeClientSubscription);
app.use('/api/agent', routeAgent);
app.use('/api/ticket', routeTicket);

app.use('/uploads', express.static('uploads'));

app.use(globalExceptionsFilter);

const start = async (port = process.env.PORT) => {
  try {
    await connectDB1();
    server.listen(port, () =>
      console.log(`Server is listening on port ${port} `)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
