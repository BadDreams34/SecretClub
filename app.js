const express = require('express')
const session = require('express-session')
const bcrypt = require('bcryptjs')
const validator = require('express-validator')
const body = validator.body;
const passport = require('passport')
const localStrategy = require('passport-local').Strategy 
const validationResult = validator.validationResult;
const path = require('node:path')
const app = express()
let secretcode = 2343
const {Pool} = require('pg')
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

app.use(session({secret: 'honey', resave: false, saveUninitialized: false}))
app.use(passport.session())
app.use(express.urlencoded({extended:true}))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')


app.use((req, res, next)=>{
    res.locals.user = req.user
    next()
})

passport.use(

    new localStrategy(
        
        {usernameField: 'email', passwordField: 'password'},
        async (email, password, done) => {
        
        try {
            const {rows} = await pool.query('SELECT * FROM members WHERE email = $1', [email])
            
            const user = rows[0]
            const match = await bcrypt.compare(password, user.password)
            if (!user) {
                return done(null, false, {message :"incorrect email entered"})
            }
            if (!match) {
                return done(null, false, {message: 'Incorrect Password entered'})
            }
            return done(null, user)
        }
        catch(err) {
            return done(err)
        }
    }
)
)


passport.serializeUser((user, done)=> {
    return done(null, user.id)

})
passport.deserializeUser(async (id, done)=> {
    try {
        const {rows} = await pool.query('SELECT * FROM members WHERE id = $1', [id])
    const user = rows[0]
    return done(null, user)
    } catch(err) {
        return done(err)
    }
})

app.get('/signup', (req, res)=>{
    res.render('signup')
})
app.get('/welcome', (req, res)=>{
    res.render('welcome')
})


app.get('/login',(req, res)=> {res.render('login')})
app.post('/login', passport.authenticate('local', {successRedirect: '/welcome'}))

app.get('/', (req,res)=> {
    res.render('index')
})
app.get('/index', (req,res)=> {
    res.render('index')
})


app.get('/logout', (req, res, next)=>{
    req.logout((err) => {
        if (err) {
            return next(err)
        }
        res.redirect('/index')
    })
})
app.get('/membership', (req, res) => {
    if (res.locals.user.hasmembership == true) {
        return res.render('alr')
    }
    res.render('membership', { err: null });
});
app.post('/membership', [body('code').custom(value=>{if (Number(value) !== secretcode) throw new Error('incorrect Code access Denied'); return true;})], async (req, res)=> {
    const err = validationResult(req);
    if (!err.isEmpty()) {
       return res.status(400).render('membership', {err: err.array()})
    }
    await pool.query('UPDATE members SET hasmembership = true WHERE id = $1', [res.locals.user.id])
    res.redirect('/memsuccesful')
})
app.get('/memsuccesful', (req,res)=>{res.render('memsuccesful')})
app.get('/dashboard', (req, res)=> {
    if (!res.locals.user) {return res.redirect('/login')}
    if (res.locals.user.hasmembership==1) {
        return res.redirect('/dash1')
    } else {
        return res.redirect('/dash0')
    }
    
}
)

app.get('/new', (req, res)=>{
    res.render('new')
})
app.post('/new', async (req, res, next)=> {
    await pool.query('INSERT INTO message (id, message) VALUES ($1, $2)', [res.locals.user.id, req.body.ms])
    res.redirect('/dash1')
})

app.get('/dash1', async (req, res, next)=> {
    const {rows} = await pool.query('SELECT members.name , message.message FROM members INNER JOIN message ON members.id = message.id') 
    res.render('dash1', {messages: rows})
})
app.get('/dash0', async (req, res, next)=> {
    const {rows} = await pool.query('SELECT * FROM message')
    res.render('dash0', {messages: rows})
})

const loginadder =  
    [body('name').notEmpty().withMessage('Name cant be Empty'),
        body('password').notEmpty().withMessage('Password cant be Empty'),
        body('email').custom(async (value)=>{
            const {rows} = await pool.query('SELECT email FROM members WHERE email = $1', [value])
            if (rows.length >0) {
                throw new Error('Email already exists')
            } return true
        }),
        body('confirmpass').notEmpty().withMessage('Please confirm the password').custom((value, {req})=> {
            if (value !== req.body.password) {
                throw new Error('password doesnt match')
            }
            return true;
        }),
     async (req,res) => {
        const hashed = await bcrypt.hash(req.body.password, 10)
        const error = validationResult(req)
        if (!error.isEmpty()) {
            return res.status(400).render('signup', {error: error.array()})
         }
        await pool.query('INSERT INTO members (name, email, password, hasmembership) VALUES ($1, $2, $3, $4)', [req.body.name, req.body.email, hashed, 0])
        res.redirect('/index')
    }
]

app.post('/signup',loginadder)

app.listen(3000,()=> console.log('listening to 3000'))

















