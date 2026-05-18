const express = require('express');
const app = express();

app.get('/', (req, res) => {
	res.send('API działa!');
});

app.listen(3000, () => {
	console.log('Serwer na porcie 3000');
});
