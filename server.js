const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const ytpl = require('ytpl');
const ffmpeg = require('fluent-ffmpeg');

const app = express();

// Permite que qualquer site (inclusive o seu GitHub Pages) acesse essa API
app.use(cors());
app.use(express.json());

// Rota para ler e destrinchar os vídeos da playlist
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

// Rota que faz a conversão pesada e crava o arquivo em MP3 320 kbps
app.get('/api/download', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).send('URL ausente');

    try {
        const info = await ytdl.getInfo(videoUrl);
        const title = info.videoDetails.title.replace(/[\\/*?:"<>|]/g, ''); 

        res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
        res.header('Content-Type', 'audio/mpeg');

        const audioStream = ytdl(videoUrl, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25
        });

        // O FFmpeg vai rodar no servidor da nuvem convertendo para 320 kbps reais
        ffmpeg(audioStream)
            .toFormat('mp3')
            .audioBitrate(320)
            .on('error', (err) => {
                console.error('Erro no FFmpeg:', err.message);
            })
            .pipe(res, { end: true });

    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).send('Erro na conversão.');
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Motor ativo na porta ${PORT}`));
