const fastify = require('fastify')({ logger: true })

const authenticate = {realm: 'massimo-dutti'}

fastify.register(require('fastify-auth'))

fastify.register(require('fastify-basic-auth'), { validate, authenticate })

fastify.register(require('fastify-cors'), {})

// Initialize users
let users = require('./assets/json/users.json');

async function validate (username, password, req, reply) {
  const userFound = users.find(user => user.username === username && user.password === password);

  if (!userFound) {
    return new Error('Invalid credentials')
  }

  req.user = {
    first_name: userFound.first_name,
    last_name: userFound.last_name,
    username: userFound.username,
    email: userFound.email
  };
}

fastify.after(() => {
  fastify.route({
    method: 'POST',
    url: '/login',
    // use onRequest to authenticate just this one
    onRequest: fastify.auth([fastify.basicAuth]),
    handler: async (req, reply) => {
      return req.user;
    }
  });

  fastify.route({
    method: 'POST',
    url: '/register',
    handler: async (req, reply) => {
      users.push(req.body)
      reply.code(201).send();
    }
  });
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen(8080)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()

