import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

const port = process.env.PORT || 3000

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(port).then(
    () => console.log(`Server lives at ${port} port.` ),
    error => console.warn('Error occured: ', error),
  )
}
bootstrap()
