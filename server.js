const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const app = express();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(express.json());
app.use(express.static('.'));

// Отправка поздравления
app.post('/api/wish', async (req, res) => {
    const { name, text } = req.body;
    if (!name || !text) return res.status(400).send('Заполните поля');
    
    const { error } = await supabase.from('wishes').insert([{ name, text }]);
    if (error) return res.status(500).send(error.message);
    res.status(200).send('Sent');
});

// Получение одобренных
app.get('/api/wishes', async (req, res) => {
    const { data } = await supabase.from('wishes')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
    res.json(data);
});

// Админ-панель (скрытый роут)
app.get('/api/admin/pending', async (req, res) => {
    const { data } = await supabase.from('wishes').select('*').eq('is_approved', false);
    res.json(data);
});

app.post('/api/admin/action', async (req, res) => {
    const { id, action } = req.body;
    if (action === 'approve') {
        await supabase.from('wishes').update({ is_approved: true }).eq('id', id);
    } else {
        await supabase.from('wishes').delete().eq('id', id);
    }
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
