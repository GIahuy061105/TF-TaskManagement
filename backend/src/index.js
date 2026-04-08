 import Fastify from 'fastify'
 import dotenv from 'dotenv'
 import { registerPlugins } from './plugins/index.js'
 import { registerRoutes } from './routes/index.js'

 const app = Fastify({ logger: true })

 await registerPlugins(app)
 await registerRoutes(app)

 const start = async () => {
   try {
     await app.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' })
   } catch (err) {
     app.log.error(err)
     process.exit(1)
   }
 }

 start()
