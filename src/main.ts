import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/all-exception.filter'
import { PrismaService } from './connections/prisma.service'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)))
    const prismaService: PrismaService = app.get(PrismaService)
    await prismaService.enableShutdownHooks(app)
    await app.listen(3000)
}
bootstrap()
