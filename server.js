const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const ytpl = require('ytpl');
const ffmpeg = require('fluent-ffmpeg');

const app = express();

app.use(cors());
app.use(express.json());

// Endpoint de teste simples para o Front-end verificar se o servidor está acordado
app.get('/api/ping', (req, res) => {
    res.json({ status: "online" });
});

// 1. ROTA PARA LER A PLAYLIST
app.get('/api/playlist', async (req, res) => {
    const playlistUrl = req.query.url;
    if (!playlistUrl) return res.status(400).json({ error: 'URL ausente' });

    try {
        const playlistId = await ytpl.getPlaylistID(playlistUrl);
        const playlist = await ytpl(playlistId, { limit: Infinity });
        
        const tracks = playlist.items.map(item => ({
            id: item.id,
            title: item.title,
            url: item.shortUrl
        }));

        res.json({ title: playlist.title, tracks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao processar a playlist no YouTube.' });
    }
});

// 2. ROTA DE DOWNLOAD ADAPTATIVA (MP3 320kbps ou MP4)
app.get('/api/download', async (req, res) => {
    const videoUrl = req.query.url;
    const format = req.query.format || 'mp3';
    const quality = req.query.quality || '320';

    if (!videoUrl) return res.status(400).send('URL ausente');

    try {
        const info = await ytdl.getInfo(videoUrl);
        const title = info.videoDetails.title.replace(/[\\/*?:"<>|]/g, ''); 

        if (format === 'mp3') {
            // Configuração rigorosa para Áudio MP3
            res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
            res.header('Content-Type', 'audio/mpeg');

            const audioStream = ytdl(videoUrl, {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 1 << 25
            });

            ffmpeg(audioStream)
                .toFormat('mp3')
                .audioBitrate(parseInt(quality)) // Força os 320, 256 ou 128 kbps escolhidos
                .on('error', (err) => console.error('Erro FFmpeg:', err.message))
                .pipe(res, { end: true });

        } else {
            // Configuração para Vídeo MP4
            res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
            res.header('Content-Type', 'video/mp4');

            // Mapeia qualidade visual simplificada para o ytdl
            const videoQuality = quality === '1080' ? 'highestvideo' : 'highest';

            ytdl(videoUrl, {
                quality: videoQuality,
                filter: format => format.container === 'mp4' && format.hasAudio && format.hasVideo
            }).pipe(res);
        }

    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).send('Erro na conversão.');
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Engine EXNA ativa na porta ${PORT}`));
