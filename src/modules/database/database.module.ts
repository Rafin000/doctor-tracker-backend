import { Logger, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import env from 'src/config'

/**
 * Owns the single MongoDB connection for the whole app.
 * Connection string comes from config (never read from process.env directly).
 */
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => {
        const logger = new Logger('MongoDB')
        return {
          uri: env.db.uri,
          onConnectionCreate: (connection) => {
            connection.on('connected', () => logger.log('MongoDB connected'))
            connection.on('error', (err) =>
              logger.error('MongoDB connection error', err?.message),
            )
            return connection
          },
        }
      },
    }),
  ],
})
export class DatabaseModule {}
