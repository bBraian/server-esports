import express from 'express';
import cors from 'cors';

import { PrismaClient } from '@prisma/client';
import { convertStringHourToMinutes } from './utils/convert-stringHourTo-minutes';
import { convertStringMinutesToHour } from './utils/convert-stringMinutesTo-hour';

const app = express();
app.use(express.json());
app.use(cors());

const prisma = new PrismaClient();

//Listagem de games
app.get('/games', async (req, res) => {
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true
                }
            }
        }
    })
    return res.json(games);
})

//Criar novo anúncio
app.post('/games/:id/ads', async (req, res) => {
    const gameIdvar =  req.params.id;
    const body = req.body;

    const ad = await prisma.ad.create({
        data: {
            gameId: gameIdvar,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hourStart: convertStringHourToMinutes(body.hourStart),
            hourEnd: convertStringHourToMinutes(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel
        }
    })

    return res.status(201).json([ad]);
})

//Listagem de anúncios por game
app.get('/games/:id/ads', async (req, res) => {
    const gameIdvar = req.params.id;

    const ads: any = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hourStart: true,
            hourEnd: true,
        },
        where: {
            gameId: gameIdvar
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return res.json(ads.map((ad: { weekDays: string; hourStart: number; hourEnd: number; }) => {
       return {
        ...ad,
        weekDays: ad.weekDays.split(','),
        hourStart: convertStringMinutesToHour(ad.hourStart),
        hourEnd: convertStringMinutesToHour(ad.hourEnd),
       } 
    }));
})

//Buscar discord pelo ID do anúncio 
app.get('/ads/:id/discord', async (req, res) => {
    const adId = req.params.id

    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true
        },
        where: {
            id: adId
        }
    })
    res.json({
        discord: ad.discord
    });
})

app.listen(3333);