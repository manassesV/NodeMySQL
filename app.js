const restify = require('restify');
const errs = require('restify-errors')
const jwt = require('jsonwebtoken')
const conecta = require("./src/models/conexao")

const server = restify.createServer({
    name: 'myapp',
    version: '1.0.0'
});

var knex = require('knex')({
    client: 'mysql',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'dados'
    }
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());



server.listen(5, function () {
    console.log('%s listening at %s', server.name, server.url);
});


//servidor post

server.post('/rest/create', verifyToken, (req, res, next) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.send(errs.ForbiddenError("Proibido o acesso"));
        } else {
            knex('rest').
                insert(req.body).
                then((dados) => {
                    res.send(dados);
                }, next);
        }

    });
});



//servidor get
server.get('/rest/:name', (req, res, next) => {

    const { name } = req.params

    knex('rest').
        where('name', name).
        first().
        then((dados) => {
            if (!dados) return res.send(new errs.BadRequestError('nada foi encontrado'))
            res.status(dados)

        }, next);
});


//servidor atualizando
server.put('/rest/:name', (req, res, next) => {

    const { name } = req.params

    knex('rest').
        where('name', name).
        update(req.body).
        then((dados) => {
            if (!dados) return res.send(new errs.BadRequestError('nada foi encontrado'))
            res.send('dados atualizados')

        }, next);
});


//servidor delete
server.del('/rest/:name', verifyToken, (req, res, next) => {

    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.send(errs.ForbiddenError("Proibido o acesso"));
        } else {

            const { name } = req.params

            knex('rest').
                where('name', name).
                delete().
                then((dados) => {
                    if (!dados) return res.send(new errs.BadRequestError('nada foi encontrado'))
                    res.send('dados removido')

                }, next);
        }

    });
});


server.post('/api/login', (req, res) => {
    //Moch user
    const user = {
        id: 1,
        username: "manasses",
        email: "manavitorino@gmail.com"
    };

    jwt.sign({ user }, 'secretkey', (err, token) => {
        res.json({
            token
        });
    });
});


// FORMAT OF TOKEN
// Authorization: Bearer <acess_token>

//Verify token
function verifyToken(req, res, next) {
    //get header authorization value
    const beareHeader = req.headers['authorization'];

    if (typeof beareHeader !== 'undefined') {


        const bearer = beareHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;

        next();

    } else {
        res.send(new errs.ForbiddenError('Proibido o acesso'))
    }
}


server.get('/rest/api/:name/:projeto', (req, res, next) =>{
    console.log(req.params.name+"/", req.params.projeto);
});